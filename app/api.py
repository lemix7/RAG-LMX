from fastapi import FastAPI, HTTPException , UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.document_loader import load_documents
from app.text_splitter import split_documents
from app.vector_store import ingest_documents
from app.rag_chain import build_rag_chain, stream_ask
from app.config import DOCS_DIR
from app.file_registry import load_registry

import json


chain = None
retriever = None

def get_chain_and_retriever():
    global chain, retriever
    if chain is None or retriever is None:
        chain, retriever = build_rag_chain()
    return chain, retriever


app = FastAPI(title="RAG-LMX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get('/')
def home():
    return {'message': 'Server is running '}


@app.post("/ingest")
def ingest():
    try:
        documents = load_documents()
        if not documents:
            return {"message": "No new documents to ingest."}
        chunks = split_documents(documents)
        ingest_documents(chunks)
        return {"message": f"Ingested {len(chunks)} chunks from {len(documents)} documents."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat(body: QuestionRequest):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        _chain, _retriever = get_chain_and_retriever()
        result = stream_ask(body.question, _chain, _retriever)
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

    # for streaming the response currently now working in the fast api docs
    def token_generator():
        for chunk in result["stream"]:
            yield chunk
        yield f"\n\n__sources__:{json.dumps(sources)}"

    return StreamingResponse(token_generator(), media_type="text/plain")


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    allowed = {".txt", ".pdf", ".docx", ".doc", ".md", ".csv"}
    suffix = "." + file.filename.split(".")[-1].lower()
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

    dest = DOCS_DIR / file.filename
    content = await file.read()
    dest.write_bytes(content)
    return {"message": f"Uploaded {file.filename}. Run /ingest to process it."}


@app.get("/files")
def list_files():
    allowed = {".txt", ".pdf", ".docx", ".doc", ".md", ".csv"}
    registry = load_registry()
    files = []
    if DOCS_DIR.exists():
        for f in DOCS_DIR.iterdir():
            if f.is_file() and f.suffix.lower() in allowed:
                files.append({
                    "name": f.name,
                    "ingested": f.name in registry,
                    "size": f.stat().st_size,
                })
    return {"files": sorted(files, key=lambda x: x["name"])}
