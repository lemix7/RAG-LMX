import re
from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.docstore.document import Document
from langchain_openai import OpenAIEmbeddings

from .config import CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL


def _safe_user_suffix(user_id: str) -> str:
   # Replaces any character Chroma doesn't allow in collection names with an underscore.
    suffix = re.sub(r"[^a-zA-Z0-9._-]", "_", str(user_id))
    if not suffix:
        raise ValueError(f"Invalid user_id for collection name: {user_id!r}")
    return suffix


def collection_name_for(user_id: str) -> str:
    return f"{COLLECTION_NAME}_{_safe_user_suffix(user_id)}"


def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model=EMBEDDING_MODEL, timeout=30) # Return openAI ebedding client

def get_vector_store(user_id: str) -> Chroma:
    return Chroma(
        collection_name=collection_name_for(user_id),
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_DIR,
    )

def list_ingested_sources(user_id: str) -> list[str]:
    collection = get_vector_store(user_id)._collection
    all_results = collection.get(include=["metadatas"])
    sources = {
        Path(meta.get("source", "")).name
        for meta in all_results["metadatas"]
        if meta.get("source")
    }
    return sorted(sources)


def delete_document(user_id: str, file_name: str) -> int:

    collection = get_vector_store(user_id)._collection
    all_results = collection.get(include=["metadatas"])
    ids_to_delete = [ # pair chunks ID's with their metadata
        doc_id
        for doc_id, meta in zip(all_results["ids"], all_results["metadatas"])
        if Path(meta.get("source", "")).name == file_name
    ]
    if ids_to_delete:
        collection.delete(ids=ids_to_delete) # loop throuh the IDs and their metadata and deletes them
    return len(ids_to_delete)


def ingest_documents(user_id: str, chunks: list[Document]) -> Chroma:

    if not chunks:
        raise ValueError("No chunks provided for ingestion")

    try:
        vector_store = get_vector_store(user_id)
        vector_store.add_documents(chunks)
    except Exception as e:
        raise RuntimeError(f"Failed to ingest documents: {e}") from e

    print(f"Ingested {len(chunks)} chunks into vector store for user {user_id}")
    return vector_store
