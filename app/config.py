import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent  # root folder of the project
# base folder; each user gets a subfolder docs/<user_id>
DOCS_DIR = BASE_DIR / "docs"
# shared persist dir; each user gets its own collection
CHROMA_DIR = str(BASE_DIR / "chroma_db")
# base folder; each user gets a registry JSON registries/<user_id>.json
REGISTRY_DIR = BASE_DIR / "registries"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError(
        "OPENAI_API_KEY is not set. Please add it to your .env file.")


SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
# only needed for legacy HS256 projects
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Shared secret for admin-only, system-wide endpoints
ADMIN_API_SECRET = os.getenv("ADMIN_API_SECRET")

# User id used by the CLI, which has no auth. Maps to the rag_documents_local collection.
CLI_USER_ID = "local"


ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
# The speaker voice used ("Rachel")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
# The model that turns answer into spoken audio
ELEVENLABS_TTS_MODEL = "eleven_multilingual_v2"
WHISPER_MODEL = "whisper-1"  # converts spoken voice into text


EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"


CHUNK_SIZE = 800
CHUNK_OVERLAP = 300

COLLECTION_NAME = "rag_documents"
RETRIEVER_K = 5  # Number of junks retrived from the vector DB

# --- Hybrid RAG settings ---

# Number of retrived chunks from the vector store and the BM25 retriever (COMBINED)
ENSEMBLE_K = 10

# This weight determines the importance of the vector retriever compared to the BM25 retriever on the final retriever
VECTOR_WEIGHT = 0.6
BM25_WEIGHT = 0.4

# Local cross encoder model for reranking
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
RERANKER_TOP_N = 8  # how many chunks survive reranking into the LLM context

# Minimum reranker score to include a chunk as a source.
# Chunks scoring below this are dropped even if they're in the top k.
RERANKER_SCORE_THRESHOLD = 0.0
