# RAG-LMX

A multi-user Retrieval-Augmented Generation (RAG) web application. Users sign up, upload their own documents, and chat with an LLM that answers questions using only their content. Each user's data is fully isolated.

## How it works

1. **Ingest** — documents are loaded, split into chunks, embedded with OpenAI, and stored in a ChromaDB vector database scoped to the user.
2. **Chat** — the question is matched against the vector store (semantic similarity) and a BM25 keyword index simultaneously. Results are merged by an ensemble retriever, reranked by a local CrossEncoder model, then passed to GPT-4o-mini which answers using only those chunks.
3. **Conversations** — chat history is persisted in Supabase and restored across sessions.

## Features

- **Authentication** — sign up / log in via Supabase Auth; each user's documents and conversations are private
- **Persistent conversations** — chat history saved to Supabase, accessible from the sidebar across sessions
- **Hybrid retrieval** — vector search + BM25 keyword search combined and reranked by a CrossEncoder model
- **Streaming responses** — answers stream token-by-token as they are generated
- **Voice input** — record a question by microphone; transcribed via Whisper
- **Voice replies** — answers read aloud via ElevenLabs TTS
- **Source attribution** — each answer shows which document and page it came from
- **File management** — upload, view, and delete documents from the sidebar
- **Admin panel** — system-wide document stats and user management at `/admin`

## Supported file types

`.txt`, `.pdf`, `.docx`, `.doc`, `.md`, `.csv`

## Setup

**Requirements:** Python 3.13+, [uv](https://github.com/astral-sh/uv), Node.js 18+

```bash
git clone <repo-url>
cd RAG-LMX
uv sync
```

Create a `.env` file in the project root (see `.env.example`):

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
ADMIN_API_SECRET=your-admin-secret
ELEVENLABS_API_KEY=your-elevenlabs-key      # optional, for TTS
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM   # optional, defaults to Rachel
```

## Usage

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

Open [http://localhost:3000](http://localhost:3000), sign up, upload documents via the sidebar, and start chatting.

## Project structure

```
app/
  api.py             # FastAPI server (REST + streaming endpoints)
  auth.py            # JWT validation, extracts user_id from Supabase token
  config.py          # models, paths, chunk settings
  document_loader.py # loads files from the user's docs folder
  text_splitter.py   # splits documents into chunks
  vector_store.py    # per-user ChromaDB collections
  retriever.py       # hybrid retriever: vector + BM25 → CrossEncoder reranker
  rag_chain.py       # LangChain LCEL chain
  voice.py           # Whisper transcription + ElevenLabs TTS
  file_registry.py   # tracks which files have been ingested per user
  main.py            # CLI entrypoint (ingest | chat)
frontend/
  src/
    app/             # Next.js App Router pages and API proxy routes
    components/      # React UI components (chat, sidebar, voice)
    lib/             # hooks, API client, stream parser, Supabase client, types
supabase/
  schema.sql         # profiles, conversations, messages tables + RLS policies
docs/                # per-user document storage (docs/<user_id>/)
chroma_db/           # persisted vector database (auto-created)
tests/               # unit tests
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload a document file |
| `POST` | `/ingest` | Ingest uploaded files into the vector store |
| `POST` | `/chat` | Stream a chat response |
| `GET` | `/files` | List documents and ingestion status |
| `DELETE` | `/files/{file_name}` | Delete a document and its chunks |
| `POST` | `/transcribe` | Transcribe audio to text (Whisper) |
| `POST` | `/tts` | Convert text to speech (ElevenLabs) |
| `GET` | `/admin/document-stats` | System-wide stats (admin only) |

## Configuration

All tunable parameters are in `app/config.py`:

| Setting | Default | Description |
|---|---|---|
| `EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI embedding model |
| `LLM_MODEL` | `gpt-4o-mini` | OpenAI chat model |
| `CHUNK_SIZE` | `800` | Max characters per chunk |
| `CHUNK_OVERLAP` | `300` | Overlap between chunks |
| `RETRIEVER_K` | `5` | Final chunks passed to the LLM after reranking |
| `ENSEMBLE_K` | `10` | Chunks fetched from each retriever before reranking |
| `VECTOR_WEIGHT` | `0.6` | Weight of vector retriever in the ensemble |
| `BM25_WEIGHT` | `0.4` | Weight of BM25 retriever in the ensemble |
| `RERANKER_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Local CrossEncoder for reranking |
| `RERANKER_TOP_N` | `8` | Chunks that survive reranking into LLM context |

## Running tests

```bash
python -m pytest tests/
```
