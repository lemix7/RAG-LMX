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

# --- Sentence Transformer settings ---
EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"

# --- Chunking settings ---
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

COLLECTION_NAME = "rag_documents"
RETRIEVER_K = 5

# --- Hybrid RAG settings ---

# Number of retriived chunks from the vector store and the BM25 retriever
ENSEMBLE_K = 10

# This weight determines the importance of the vector retriever compared to the BM25 retriever on the final retriever
VECTOR_WEIGHT = 0.6
BM25_WEIGHT = 0.4

# Local cross encoder model for reranking
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

# Minimum reranker score to include a chunk as a source.
# Chunks scoring below this are dropped even if they're in the top k.
RERANKER_SCORE_THRESHOLD = 0.0



