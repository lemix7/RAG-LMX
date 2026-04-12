# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Setup**
```bash
uv sync                        # install dependencies
cp .env.example .env           # then add OPENAI_API_KEY to .env
```

**Run the pipeline**
```bash
# Ingest documents from docs/ into ChromaDB
python -m app.main ingest

# Start the interactive chat
python -m app.main chat
```

**Run tests**
```bash
# Run all tests
python -m pytest tests/

# Run a single test file
python tests/test_document_loader.py
python tests/test_text_splitter.py
python tests/test_vector_store.py
```

> Tests are plain Python scripts runnable directly or via pytest. No test runner config exists yet.

## Architecture

The pipeline has two phases: **ingest** and **chat**, both driven through `app/main.py`.

**Ingest flow:**
```
docs/ (txt, pdf, docx, csv, md)
  → document_loader.py   (LangChain loaders per file type)
  → text_splitter.py     (RecursiveCharacterTextSplitter, 1000/200 chunk/overlap)
  → vector_store.py      (OpenAI embeddings → ChromaDB, append mode)
```

**Chat flow:**
```
user question
  → retriever.py         (similarity search, top-k=4 from ChromaDB)
  → rag_chain.py         (LangChain LCEL chain: retriever | prompt | gpt-4o-mini | parser)
  → answer + source docs
```

**Key design decisions:**
- Vector store uses **append** (not overwrite) on each ingest — avoid re-ingesting the same file or it will create duplicate chunks.
- All modules import from `config.py` for shared constants (models, paths, chunk params). Change values there, not in individual files.
- `chroma_db/` is persisted locally on disk. Delete it to reset the vector store.
- `app/` modules use bare imports (e.g. `from config import ...`) — always run with `python -m app.main` from the project root, not `python app/main.py`.
- The `docs/` directory is the drop zone for source documents. Subfolders inside `docs/` are skipped.
