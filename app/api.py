from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel

from app.document_loader import load_documents, docs_dir_for, aggregate_document_stats
from app.text_splitter import split_documents
from app.vector_store import ingest_documents, delete_document
from app.rag_chain import build_rag_chain, stream_ask
from app.config import LLM_MODEL, OLLAMA_MODEL, ADMIN_API_SECRET
from app.file_registry import load_registry, remove_from_registry
from app.voice import transcribe, synthesize
from app.auth import get_current_user_id

import secrets

import json


# Chains are cached per (user_id, mode): "public" (OpenAI) and "local" (Ollama)
# use different embeddings and collections, so each needs its own chain.
_chains: dict[tuple[str, str], tuple] = {}

VALID_MODES = ("public", "local")


def normalize_mode(mode: str | None) -> str:
    """Coerces an incoming mode to a known value, defaulting to 'public'."""
    return mode if mode in VALID_MODES else "public"


def get_chain_and_retriever(user_id: str, mode: str = "public"):
    key = (user_id, mode)
    if key not in _chains:
        _chains[key] = build_rag_chain(user_id, mode)
    return _chains[key]


def invalidate_chain(user_id: str):
    # Drop every cached mode for this user so the next request rebuilds.
    for key in [k for k in _chains if k[0] == user_id]:
        _chains.pop(key, None)


app = FastAPI(title="RAG-LMX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_admin_secret(x_admin_secret: str = Header(None)):
    if not ADMIN_API_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Admin endpoints are not configured. Set ADMIN_API_SECRET in .env.",
        )
    if not x_admin_secret or not secrets.compare_digest(x_admin_secret, ADMIN_API_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden.")


class QuestionRequest(BaseModel):
    question: str
    mode: str = "public"


class IngestRequest(BaseModel):
    mode: str = "public"


class TTSRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/debug/retrieve")
def debug_retrieve(q: str, user_id: str = Depends(get_current_user_id)):
    """Returns the raw chunks the retriever finds for a query — for debugging only."""
    _, retriever, _ = get_chain_and_retriever(user_id)
    docs = retriever.invoke(q)
    return {
        "query": q,
        "num_chunks": len(docs),
        "chunks": [
            {
                "index": i,
                "score": doc.metadata.get("relevance_score"),
                "source": doc.metadata.get("source", "unknown"),
                "page": doc.metadata.get("page"),
                "content": doc.page_content[:300],
            }
            for i, doc in enumerate(docs)
        ],
    }


@app.get("/model")
def get_model():
    # Both editor models the UI can toggle between; "model" kept for back-compat.
    return {"model": LLM_MODEL, "public": LLM_MODEL, "local": OLLAMA_MODEL}


@app.get('/')
def home():
    return {'message': 'Server is running '}


@app.post("/ingest")
def ingest(body: IngestRequest = IngestRequest(), user_id: str = Depends(get_current_user_id)):
    mode = normalize_mode(body.mode)
    try:
        documents = load_documents(user_id, mode=mode)
        if not documents:
            return {"message": "No new documents to ingest."}
        chunks = split_documents(documents)
        ingest_documents(user_id, chunks, mode)
        invalidate_chain(user_id)
        return {"message": f"Ingested {len(chunks)} chunks from {len(documents)} documents."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat(body: QuestionRequest, user_id: str = Depends(get_current_user_id)):
    if not body.question.strip():
        raise HTTPException(
            status_code=400, detail="Question cannot be empty.")

    mode = normalize_mode(body.mode)
    try:
        _chain, _retriever, _llm = get_chain_and_retriever(user_id, mode)
        result = stream_ask(body.question, _chain, _retriever, _llm)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    sources = []

    for doc in result["source_docs"]:
        file_path = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", None)
        sources.append({
            "path": file_path,
            "page": page,
        })

    # streaming works via fetch; the FastAPI docs /chat endpoint won't show streamed output

    def token_generator():
        for chunk in result["stream"]:
            yield chunk
        yield f"\n\n__sources__:{json.dumps(sources)}"

    return StreamingResponse(token_generator(), media_type="text/plain")


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio data received.")
    try:
        text = transcribe(audio_bytes, file.filename or "audio.webm")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"text": text}


@app.post("/tts")
def tts(body: TTSRequest, user_id: str = Depends(get_current_user_id)):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        audio = synthesize(body.text)
    except RuntimeError as e:
        # Missing key or upstream failure — 503 so the client can degrade gracefully.
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(content=audio, media_type="audio/mpeg")


@app.post("/upload")
async def upload(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    allowed = {".txt", ".pdf", ".docx", ".doc", ".md"}
    suffix = "." + file.filename.split(".")[-1].lower()
    if suffix not in allowed:
        raise HTTPException(
            status_code=400, detail=f"Unsupported file type: {suffix}")

    dest = docs_dir_for(user_id) / file.filename
    content = await file.read()
    dest.write_bytes(content)
    return {"message": f"Uploaded {file.filename}. Run /ingest to process it."}


def _delete_file_all_modes(user_id: str, file_name: str) -> int:
    """Removes a file's chunks + registry entries from every mode's collection.

    The file is being removed from disk, so it must not linger in either the
    public or local vector store. Returns the total chunks removed.
    """
    chunks_removed = 0
    for mode in VALID_MODES:
        chunks_removed += delete_document(user_id, file_name, mode)
        remove_from_registry(user_id, file_name, mode)
    return chunks_removed


@app.delete("/files/{file_name}")
def delete_file(file_name: str, user_id: str = Depends(get_current_user_id)):
    file_path = docs_dir_for(user_id) / file_name
    if not file_path.exists():
        raise HTTPException(
            status_code=404, detail=f"File not found: {file_name}")
    try:
        chunks_removed = _delete_file_all_modes(user_id, file_name)
        file_path.unlink()
        invalidate_chain(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": f"Deleted '{file_name}' ({chunks_removed} chunks removed)"}


@app.get("/files")
def list_files(mode: str = "public", user_id: str = Depends(get_current_user_id)):
    # "ingested" is per-mode: a file embedded for public mode is not present in
    # the local collection until re-ingested there, so read the mode's registry.
    mode = normalize_mode(mode)
    allowed = {".txt", ".pdf", ".docx", ".doc", ".md", }
    registry = load_registry(user_id, mode)
    files = []
    for f in docs_dir_for(user_id).iterdir():
        if f.is_file() and f.suffix.lower() in allowed:
            files.append({
                "name": f.name,
                "ingested": f.name in registry,
                "size": f.stat().st_size,
            })
    return {"files": sorted(files, key=lambda x: x["name"])}


@app.get("/admin/document-stats", dependencies=[Depends(require_admin_secret)])
def admin_document_stats():
    return aggregate_document_stats()


@app.delete("/admin/files/{user_id}/{file_name}", dependencies=[Depends(require_admin_secret)])
def admin_delete_file(user_id: str, file_name: str):
    """Delete a specific file for a specific user (admin only)."""
    file_path = docs_dir_for(user_id) / file_name
    if not file_path.exists():
        raise HTTPException(
            status_code=404, detail=f"File not found: {file_name}")
    try:
        chunks_removed = _delete_file_all_modes(user_id, file_name)
        file_path.unlink()
        invalidate_chain(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": f"Deleted '{file_name}' ({chunks_removed} chunks removed)"}


@app.get("/admin/files", dependencies=[Depends(require_admin_secret)])
def admin_list_files():
    """Return all files across all users for the admin documents page."""
    from app.config import DOCS_DIR
    allowed = {".txt", ".pdf", ".docx", ".doc", ".md"}
    files = []
    if DOCS_DIR.exists():
        for user_dir in DOCS_DIR.iterdir():
            if not user_dir.is_dir():
                continue
            user_id = user_dir.name
            registry = load_registry(user_id)
            for f in user_dir.iterdir():
                if f.is_file() and f.suffix.lower() in allowed:
                    files.append({
                        "name": f.name,
                        "ingested": f.name in registry,
                        "size": f.stat().st_size,
                        "user_id": user_id,
                    })
    return {"files": sorted(files, key=lambda x: (x["user_id"], x["name"]))}
