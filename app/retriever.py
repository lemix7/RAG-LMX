from langchain_core.vectorstores import VectorStoreRetriever

from .config import RETRIEVER_K
from .vector_store import get_vector_store

def get_retriever(k: int = RETRIEVER_K, search_type: str = "similarity") -> VectorStoreRetriever:
    if k < 1:
        raise ValueError(f"k must be at least 1, got {k}")
    if search_type not in ("similarity", "mmr"):
        raise ValueError(f"search_type must be 'similarity' or 'mmr', got '{search_type}'")

    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(
        search_type=search_type,
        search_kwargs={"k": k},
    )
    print(f"Retriever initialized with k={k}, search_type={search_type}")
    return retriever