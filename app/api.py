from fastapi import FastAPI, HTTPException , UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager

from app.document_loader import load_documents
from app.text_splitter import split_documents
from app.vector_store import ingest_documents
from app.rag_chain import build_rag_chain, stream_ask
from app.config import DOCS_DIR

import json


chain = None
retriever = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global chain, retriever
    chain, retriever = build_rag_chain()
    yield  


app = FastAPI(title="RAG-LMX", lifespan=lifespan)


class QuestionRequest(BaseModel):
    question: str

@app.get("/health")
def health():
    return {"status": "ok"}


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
        result = stream_ask(body.question, chain, retriever)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


    sources = []

    for doc in result["source_docs"]:
        file_name = doc.metadata.get("source" , 'unknow')
        sources.append(file_name)

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