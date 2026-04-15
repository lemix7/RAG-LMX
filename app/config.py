import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent  # root folder of the project
DOCS_DIR = BASE_DIR / "docs"                       # folder where documents are stored
CHROMA_DIR = str(BASE_DIR / "chroma_db")           # folder where the vector database is saved
INGESTED_FILES_REGISTRY = BASE_DIR / "ingested_files.json"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set. Please add it to your .env file.")

EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

COLLECTION_NAME = "rag_documents"
RETRIEVER_K = 5
