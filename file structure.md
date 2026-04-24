# RAG-LMX — Complete Technical Breakdown

## What This Project Is

RAG-LMX is a **Retrieval-Augmented Generation (RAG)** application. The core idea: instead of relying purely on an LLM's training data, you feed it a private corpus of documents, and at query time you retrieve the most relevant chunks and inject them into the prompt as context. The LLM then answers based on that context, not its weights.

The project has two distinct entry points:
- A **CLI** (`app/main.py`) for local development/testing
- A **web app** — a Next.js frontend talking to a FastAPI backend — for production use

---

## Repository Layout

```
RAG-LMX/
├── app/                    ← Python backend (FastAPI + RAG pipeline)
│   ├── config.py           ← All shared constants
│   ├── main.py             ← CLI entrypoint
│   ├── api.py              ← FastAPI app + all HTTP endpoints
│   ├── document_loader.py  ← File → LangChain Document objects
│   ├── text_splitter.py    ← Document → chunks
│   ├── vector_store.py     ← Chunks → ChromaDB (embed + store)
│   ├── retriever.py        ← ChromaDB → top-k similarity search
│   ├── rag_chain.py        ← LCEL chain: retriever | prompt | LLM | parser
│   └── file_registry.py    ← MD5-based deduplication guard
├── docs/                   ← Drop zone for source documents
├── chroma_db/              ← Persisted ChromaDB vector store (on disk)
├── ingested_files.json     ← Registry of already-ingested files
├── pyproject.toml          ← Python deps (managed by uv)
└── frontend/               ← Next.js app
    └── src/
        ├── app/
        │   ├── page.tsx            ← Root page, composes everything
        │   └── api/                ← Next.js Route Handlers (proxy layer)
        │       ├── chat/route.ts
        │       ├── upload/route.ts
        │       ├── ingest/route.ts
        │       └── files/route.ts
        ├── components/             ← UI components
        │   ├── Sidebar.tsx
        │   ├── ChatArea.tsx
        │   ├── ChatInput.tsx
        │   ├── ChatMessage.tsx
        │   ├── MessageList.tsx
        │   ├── FileDropZone.tsx
        │   ├── FileList.tsx
        │   ├── SourceAttribution.tsx
        │   └── MobileHeader.tsx
        └── lib/                    ← Business logic / data layer
            ├── api.ts              ← fetch wrappers
            ├── useChat.ts          ← chat state machine
            ├── useFiles.ts         ← file upload/ingest state
            ├── parseStream.ts      ← streaming response parser
            └── types.ts            ← shared TypeScript types
```

---

## Part 1: The Python Backend

### `config.py` — The Single Source of Truth

Everything configurable lives here. All other modules import from it — nothing hardcodes values directly:

```python
EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL       = "gpt-4o-mini"
CHUNK_SIZE      = 800
CHUNK_OVERLAP   = 150
RETRIEVER_K     = 5
COLLECTION_NAME = "rag_documents"
DOCS_DIR        = BASE_DIR / "docs"
CHROMA_DIR      = str(BASE_DIR / "chroma_db")
INGESTED_FILES_REGISTRY = BASE_DIR / "ingested_files.json"
```

`BASE_DIR` is resolved at import time using `Path(__file__).resolve().parent.parent`, so it always points to the project root regardless of where the process is launched from. The `.env` file is loaded here too, and if `OPENAI_API_KEY` is missing the import fails immediately with a clear error — a good fail-fast pattern.

---

### The Ingest Pipeline

This is a one-time (or additive) operation: take raw documents, turn them into embedding vectors, and store them in ChromaDB.

#### Step 1 — `document_loader.py`

`load_documents()` iterates over `docs/` and dispatches each file to the appropriate LangChain loader based on extension:

| Extension | Loader |
|-----------|--------|
| `.pdf` | `PyPDFLoader` |
| `.docx` / `.doc` | `Docx2txtLoader` |
| `.txt` / `.md` | `TextLoader` |
| `.csv` | `CSVLoader` |

Guard conditions run before loading each file:
- **Subfolders are skipped** (with a printed warning) — the drop zone is flat
- **Empty files are skipped** — avoids passing zero-byte content downstream
- **Already-ingested files are skipped** — the deduplication check (see `file_registry.py`)
- Each file is wrapped in a **try/except** so one corrupt file doesn't abort the entire batch

Each loader returns a list of `Document` objects (LangChain's wrapper around text + metadata). The `source` key in metadata is set to the file path automatically, and PDF pages get a `page` key — both matter later when attributing sources to answers.

#### Step 2 — `text_splitter.py`

`split_documents()` uses `RecursiveCharacterTextSplitter` with `chunk_size=800` and `chunk_overlap=150`.

The `Recursive` part is important: it tries to split on `\n\n`, then `\n`, then spaces, then characters — in that priority order. This means it prefers splitting on paragraph boundaries and only falls back to mid-sentence splitting when absolutely necessary, preserving semantic coherence in each chunk.

The 150-character overlap ensures that context spanning a chunk boundary isn't lost — if a sentence starts near the end of chunk N, the beginning of chunk N+1 will repeat enough context that the retriever can still find it.

At 800 chars per chunk, a typical paragraph produces 1–2 chunks. A 10-page PDF might produce ~50–100 chunks.

#### Step 3 — `vector_store.py`

`ingest_documents()` takes the chunks and calls `vector_store.add_documents(chunks)`.

Under the hood:
1. Each chunk's text is sent to OpenAI's `text-embedding-3-small` API (batch call)
2. The returned 1536-dimensional vectors, along with the original text and metadata, are written to ChromaDB

The store is configured with `persist_directory=CHROMA_DIR`, so everything is written to `chroma_db/` on disk. Data survives process restarts.

> **Critical design decision — append mode.** `add_documents` appends, it never wipes the collection. This is deliberate: documents are uploaded one at a time over the lifetime of the app. Overwriting on each ingest would delete everything previously indexed. The tradeoff is that ingesting the same file twice creates duplicate vectors — that is exactly what the file registry prevents.

#### `file_registry.py` — The Dedup Guard

Maintains `ingested_files.json`, a map of `{ filename: md5_hash }`.

The check in `is_already_ingested()` looks up by **hash, not by filename**:

```python
def is_already_ingested(file_path: Path) -> bool:
    registry = load_registry()
    file_hash = compute_hash(file_path)
    return file_hash in registry.values()  # checks values, not keys
```

This means:
- Renaming a file and re-uploading it is still detected as a duplicate
- Modifying a file changes its hash, so re-ingesting a genuinely updated file works correctly

The hash is computed in 8KB chunks to handle large files without loading them fully into memory.

---

### The Chat Pipeline

This runs on every user query.

#### `retriever.py`

`get_retriever()` wraps the ChromaDB vector store as a LangChain `VectorStoreRetriever`:

- `search_type="similarity"` — cosine similarity between the query embedding and stored chunk embeddings
- `k=5` — returns the top 5 most similar chunks

When a question comes in, it gets embedded with `text-embedding-3-small` (the same model used during ingestion — this is essential; embedding spaces must match), and the 5 nearest vectors are returned with their original text and metadata.

The retriever also supports `search_type="mmr"` (Maximal Marginal Relevance), which trades off pure similarity for diversity to avoid returning 5 chunks from the same paragraph.

#### `rag_chain.py` — The LCEL Chain

The core of the RAG system. `build_rag_chain()` constructs a LangChain Expression Language (LCEL) chain:

```python
chain = (
    {'context': retriever | format_docs, 'question': RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

Walking through each step:

1. **`retriever | format_docs`** — the question is passed to the retriever, which returns 5 `Document` objects. `format_docs` joins their `.page_content` with double newlines into a single context string.

2. **`RunnablePassthrough()`** — the original question passes through unchanged, becoming the `question` key in the prompt dict.

3. **`prompt`** — a `ChatPromptTemplate` with:
   ```
   System: You are a helpful assistant that answers questions based on the provided context.
           Use only the context below to answer. If the context doesn't contain enough
           information, say so.
           Context: {context}
   User: {question}
   ```
   The strict "use only the context" instruction prevents the model from hallucinating answers from its training data when the documents don't contain the answer.

4. **`llm`** — `ChatOpenAI(model="gpt-4o-mini", temperature=0, timeout=30, max_retries=2)`. Temperature 0 makes responses deterministic and factual. 30s timeout and 2 retries give resilience against transient API failures.

5. **`StrOutputParser()`** — strips the `AIMessage` wrapper and returns a plain string.

There are two ask functions:
- `ask()` — runs the full chain synchronously and returns `{answer, source_docs}`
- `stream_ask()` — calls `chain.stream(question)` which returns a generator yielding tokens as they arrive from OpenAI. Used everywhere in the web app for the real-time streaming UX.

> **Note:** In both functions, `retriever.invoke(question)` is called **separately** from the chain invocation. The chain consumes the retrieved docs internally and doesn't expose them after the fact. Calling the retriever directly gives you `source_docs` for attribution.

---

### `api.py` — The FastAPI Layer

The HTTP interface over the RAG pipeline. The chain and retriever are **lazily initialized**:

```python
chain = None
retriever = None

def get_chain_and_retriever():
    global chain, retriever
    if chain is None or retriever is None:
        chain, retriever = build_rag_chain()
    return chain, retriever
```

`build_rag_chain()` connects to ChromaDB and initializes the OpenAI client — both are expensive. This happens only on the first `/chat` request, not at startup.

#### Endpoints

**`POST /ingest`**
Runs the full ingest pipeline: `load_documents()` → `split_documents()` → `ingest_documents()`. Returns a summary like `"Ingested 47 chunks from 3 documents."`. Idempotent because `file_registry.py` skips already-seen files.

**`POST /chat`**
Receives `{"question": "..."}`, runs `stream_ask()`, and returns a `StreamingResponse`. The response body is plain text — LLM tokens stream directly to the client as they arrive. After the last token, a special sentinel is appended:
```
\n\n__sources__:[{"path": "docs/report.pdf", "page": 3}, ...]
```
This sentinel-based approach delivers sources on the same streaming connection without a separate request or structured protocol like SSE.

**`POST /upload`**
Accepts a multipart file upload, validates the extension against the allowed set (`{".txt", ".pdf", ".docx", ".doc", ".md", ".csv"}`), writes the file to `docs/`, and responds with a message. Does not ingest automatically — the client (`useFiles.ts`) handles that sequencing.

**`GET /files`**
Returns all files in `docs/` with name, size in bytes, and whether they appear in `ingested_files.json`. Populates the file list in the sidebar.

**`GET /health`**
Simple liveness check. Returns `{"status": "ok"}`.

CORS is configured to allow `http://localhost:3000` only — Next.js's default dev port.

---

## Part 2: The Frontend (Next.js)

### The Proxy Architecture

The frontend never talks directly to FastAPI. Every API call goes through Next.js Route Handlers in `frontend/src/app/api/`:

```
Browser → Next.js /api/chat   → FastAPI /chat
Browser → Next.js /api/upload → FastAPI /upload
Browser → Next.js /api/ingest → FastAPI /ingest
Browser → Next.js /api/files  → FastAPI /files
```

`BACKEND_URL` is read from `process.env.BACKEND_URL` with a fallback to `http://localhost:8000`. In production you only need to set one environment variable on the Next.js server — the browser never needs to know FastAPI exists.

The `/api/chat` route is special — it forwards the `ReadableStream` body directly without buffering:

```typescript
return new Response(backendResponse.body, {
    headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",   // disables Nginx buffering
    },
});
```

`X-Accel-Buffering: no` is critical in Nginx-proxied deployments — without it, Nginx buffers the entire response before sending it to the browser, which kills the streaming UX.

---

### The Data Layer (`lib/`)

#### `lib/api.ts`

Four typed fetch wrappers — one per endpoint. All errors are re-thrown so the hooks can handle them.

#### `lib/types.ts`

The type contract between all layers:

- **`Message`** — a chat message with `role`, `content`, optional `sources`, and `isStreaming` / `error` state flags
- **`FileInfo`** — a file in the sidebar with a `status` field: `"uploading" | "uploaded" | "ingesting" | "ingested" | "error"` — drives the visual state machine in the file list
- **`StreamEvent`** — a discriminated union yielded by `parseStream`:
  ```typescript
  | { type: "token";   content: string  }
  | { type: "sources"; sources: Source[] }
  | { type: "error";   message: string  }
  ```

#### `lib/parseStream.ts` — The Stream Parser

An async generator that reads the raw byte stream from `/api/chat` and produces typed `StreamEvent` objects.

The challenge: the backend sends `tokens...tokens...\n\n__sources__:[{...}]` all in one stream. The parser must:
1. Yield each token chunk immediately as it arrives (for live typing effect)
2. Detect when the `__sources__:` sentinel appears, even if it's split across two network packets
3. Parse the JSON that follows the sentinel and emit a `sources` event

```typescript
const markerIndex = buffer.indexOf(SOURCES_MARKER);

if (markerIndex === -1) {
    yield { type: "token", content: chunk };  // no marker yet, pass through
} else {
    // yield any text that arrived before the marker
    const newText = textBefore.slice(previousLength);
    if (newText) yield { type: "token", content: newText };

    // parse and yield sources
    const sourcesJson = buffer.slice(markerIndex + SOURCES_MARKER.length);
    const sources = JSON.parse(sourcesJson).map(...);
    yield { type: "sources", sources };
    break;
}
```

A `buffer` string accumulates all received bytes to handle the split-chunk edge case. `reader.releaseLock()` in the `finally` block ensures the `ReadableStream` is properly released even if the component unmounts mid-stream.

#### `lib/useChat.ts` — The Chat State Machine

Manages the entire chat lifecycle. When `sendMessage(question)` is called:

1. **Optimistic UI** — immediately pushes a user message and an empty assistant placeholder (`isStreaming: true`) into state. The user sees their message appear instantly before any network round-trip.

2. **Stream consumption** — iterates over `parseStream(response)` with `for await`:
   - On `token` events: appends to `accumulatedContent` and updates the assistant message in state, producing the character-by-character typing animation
   - On `sources` event: saves the sources for attaching to the final message

3. **Finalization** — once the stream ends, updates the assistant message with `isStreaming: false` and the resolved sources

4. **Error handling** — if anything throws, updates the assistant message with `error: message`. The UI renders this as a warning bubble.

The `isStreaming` flag also disables `ChatInput` during a stream so the user can't send overlapping requests.

#### `lib/useFiles.ts` — The File Upload State Machine

`uploadFiles()` orchestrates a multi-step process:

1. **Optimistic add** — immediately adds each file to the list with `status: "uploading"` before any network call
2. **Sequential upload** — uploads files one at a time with `await uploadFile(file)` in a loop, updating each file's status on success or error
3. **Auto-ingest** — if at least one upload succeeded, automatically calls `triggerIngest()` and marks files as `"ingesting"`
4. **Refresh** — after ingest completes, calls `refreshFiles()` to get ground truth from the backend, reconciling optimistic state with reality

The hook also calls `refreshFiles()` on mount via `useEffect`, so the file list is populated from the backend on first render.

---

### The UI Components

Component tree from top to bottom:

```
page.tsx
├── MobileHeader          (hamburger + title, mobile only)
├── Sidebar
│   ├── FileDropZone      (drag & drop or click-to-upload)
│   └── FileList          (list of files with status badges)
└── ChatArea
    ├── MessageList
    │   └── ChatMessage (×N)
    │       └── SourceAttribution   (shown after streaming completes)
    └── ChatInput         (textarea + send button)
```

`page.tsx` instantiates `useChat()` and `useFiles()`, then passes their state and callbacks down as props. No state lives in the components themselves — they are purely presentational.

`ChatMessage` handles three visual states:
- `isStreaming: true, content: ""` → animated pulsing dots (thinking indicator)
- `isStreaming: true, content: "..."` → text with a blinking cursor appended
- `isStreaming: false` → final text + `SourceAttribution` rendered below

`Sidebar` is rendered twice in `page.tsx`: once as a persistent sidebar (hidden on mobile via `md:flex`) and once as a slide-in overlay for mobile with a dark backdrop. Both instances share the same state from `useFiles()`.

---

## Part 3: Data Flow End-to-End

### Upload + Ingest Flow

```
User drops file on FileDropZone
  → useFiles.uploadFiles() called
  → optimistic "uploading" status added to UI
  → POST /api/upload (Next.js route)
      → POST http://localhost:8000/upload (FastAPI)
          → file written to docs/report.pdf
  → status updated to "uploaded"
  → POST /api/ingest (Next.js route)
      → POST http://localhost:8000/ingest (FastAPI)
          → load_documents() — PyPDFLoader reads docs/report.pdf
          → file_registry check — MD5 in ingested_files.json? No → continue
          → split_documents() — chunks into N pieces of 800 chars
          → ingest_documents() — embed each chunk via text-embedding-3-small
                               → write vectors to chroma_db/
          → mark_as_ingested() — save MD5 hash to ingested_files.json
  → status updated to "ingested"
  → refreshFiles() called — GET /api/files to sync state from backend
```

### Chat Flow

```
User types question + hits send
  → useChat.sendMessage() called
  → user message + empty assistant placeholder added to state (optimistic)
  → POST /api/chat { question } (Next.js route)
      → POST http://localhost:8000/chat (FastAPI)
          → stream_ask() called
              → retriever.invoke(question)
                  → question embedded via text-embedding-3-small
                  → cosine similarity search against chroma_db/
                  → top 5 chunks returned with metadata
              → chain.stream(question) started
                  → context string built from 5 chunks
                  → prompt assembled: system (context) + user (question)
                  → tokens stream from gpt-4o-mini
          → token_generator() yields each token chunk
          → after last token: yields \n\n__sources__:[{path, page}...]
  → Next.js route forwards stream body directly (no buffering)
  → parseStream(response) in browser:
      → yields { type: "token", content } for each chunk
      → detects __sources__: sentinel
      → yields { type: "sources", sources: [...] }
  → useChat() for-await loop:
      → on token: appends to accumulatedContent, updates assistant message in state
          → React re-renders ChatMessage → typing animation visible
      → on sources: saves resolvedSources
  → stream ends: finalizes message with isStreaming: false + sources attached
  → SourceAttribution rendered below the completed message
```

---

## Key Design Decisions

**Why append mode for ChromaDB?**
Documents arrive over time. If ingest overwrote the collection, adding document #10 would delete documents 1–9. Append accumulates everything. The MD5 registry prevents duplicates from corrupting search quality.

**Why the `__sources__:` sentinel approach?**
A simpler alternative would be two separate requests — one for the answer stream and one for sources. But that either requires waiting for the full answer before fetching sources (bad UX) or managing two concurrent requests with synchronization logic. The sentinel approach delivers everything in one connection, in order, with zero coordination overhead.

**Why Next.js API routes as a proxy?**
The browser can't call `http://localhost:8000` in production due to CORS and different origins. The Next.js server acts as a same-origin proxy. It also means the backend URL is a server-side secret — it never leaks to the browser. In a containerized deploy, `BACKEND_URL` would point to the internal service name.

**Why lazy chain initialization?**
`build_rag_chain()` has startup cost — it creates the ChromaDB client and the OpenAI client. Doing it at import time would fail if ChromaDB doesn't exist yet (e.g., before first ingest). Lazy init means the server starts cleanly and the chain is built on first use.

**Why `python -m app.main` instead of `python app/main.py`?**
The modules use relative imports (`from .config import ...`). Relative imports only work inside a package context. Running with `-m` makes Python treat `app` as a package and sets up the import context correctly. Running `python app/main.py` directly raises `ImportError: attempted relative import with no known parent package`.

**Why `temperature=0` on the LLM?**
This is a Q&A system over factual documents. You want the model to extract and reproduce information faithfully, not generate creative variations. Temperature 0 makes the output maximally deterministic and grounded in the retrieved context.
