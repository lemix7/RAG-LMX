# RAG-LMX

A local Retrieval-Augmented Generation (RAG) chatbot that lets you ask questions about your own documents. Drop files into the `docs/` folder, ingest them into a vector store, then chat with an LLM that answers using only your content.

## How it works

1. **Ingest** — documents are loaded, split into chunks, embedded with OpenAI, and stored in a local ChromaDB vector database.
2. **Chat** — your question is embedded and matched against the vector store (semantic similarity) and a BM25 keyword index simultaneously. Results from both are merged by an ensemble retriever, then reranked by a local CrossEncoder model. The top chunks are passed to GPT-4o-mini, which generates an answer grounded in those chunks with source attribution.

## Supported file types

`.txt`, `.pdf`, `.docx`, `.doc`, `.md`, `.csv`

## Setup

**Requirements:** Python 3.13+, [uv](https://github.com/astral-sh/uv), Node.js 18+

```bash
git clone <repo-url>
cd RAG-LMX
uv sync
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-...
```

## Usage

### Web UI (recommended)

**1. Start the backend**

```bash
.venv/bin/uvicorn app.api:app --host 127.0.0.1 --port 8000
```

**2. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload documents via the sidebar, then start chatting.

### CLI

**1. Add documents** — place supported files into the `docs/` folder.

**2. Ingest**

```bash
python -m app.main ingest
```

**3. Chat**

```bash
python -m app.main chat
```

Type your question at the prompt. Type `quit` to exit.

## Features

- **Drag-and-drop upload** — drop files into the sidebar; ingestion runs automatically
- **Streaming responses** — answers appear token-by-token as they are generated
- **Source attribution** — each answer shows which document and page the answer came from
- **New Chat** — clear the conversation and start fresh without re-uploading documents
- **File status tracking** — sidebar shows uploading → processing → ready states per file

## Project structure

```
app/
  api.py             # FastAPI server (REST + streaming endpoints)
  config.py          # models, paths, chunk settings
  document_loader.py # loads files from docs/
  text_splitter.py   # splits documents into chunks
  vector_store.py    # ChromaDB ingestion and retrieval
  retriever.py       # hybrid retriever: vector + BM25 ensemble → CrossEncoder reranker
  rag_chain.py       # LangChain LCEL chain + ask()
  main.py            # CLI entrypoint (ingest | chat)
  file_registry.py   # tracks which files have been ingested
frontend/
  src/
    app/             # Next.js App Router pages and API proxy routes
    components/      # React UI components
    lib/             # hooks, API client, stream parser, types
docs/                # drop your documents here
chroma_db/           # persisted vector database (auto-created)
tests/               # unit tests
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload a document file |
| `POST` | `/ingest` | Ingest uploaded files into the vector store |
| `POST` | `/chat` | Stream a chat response (text/plain, newline-delimited) |
| `GET` | `/files` | List documents and their ingestion status |

## Configuration

All tunable parameters are in `app/config.py`:

| Setting | Default | Description |
|---|---|---|
| `EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI embedding model |
| `LLM_MODEL` | `gpt-4o-mini` | OpenAI chat model |
| `CHUNK_SIZE` | `800` | Max characters per chunk |
| `CHUNK_OVERLAP` | `150` | Overlap between chunks |
| `RETRIEVER_K` | `5` | Final number of chunks passed to the LLM after reranking |
| `ENSEMBLE_K` | `10` | Chunks fetched from each retriever before reranking |
| `VECTOR_WEIGHT` | `0.6` | Weight of vector retriever in the ensemble |
| `BM25_WEIGHT` | `0.4` | Weight of BM25 retriever in the ensemble |
| `RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Local CrossEncoder model for reranking |
| `RERANKER_SCORE_THRESHOLD` | `0.0` | Minimum reranker score to keep a chunk |

## Running tests

```bash
python -m pytest tests/
```
