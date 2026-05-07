from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.docstore.document import Document
from langchain_openai import OpenAIEmbeddings

from .config import CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL

def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model=EMBEDDING_MODEL, timeout=30)

def get_vector_store() -> Chroma:
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_DIR,
    )

def list_ingested_sources() -> list[str]:
    """Returns a sorted list of unique source file basenames in the vector store."""
    collection = get_vector_store()._collection
    all_results = collection.get(include=["metadatas"])
    sources = {
        Path(meta.get("source", "")).name
        for meta in all_results["metadatas"]
        if meta.get("source")
    }
    return sorted(sources)


def delete_document(file_name: str) -> int:
    """
    Deletes all chunks whose source metadata basename matches file_name.
    Returns the number of chunks deleted.
    """
    collection = get_vector_store()._collection
    all_results = collection.get(include=["metadatas"])
    ids_to_delete = [
        doc_id
        for doc_id, meta in zip(all_results["ids"], all_results["metadatas"])
        if Path(meta.get("source", "")).name == file_name
    ]
    if ids_to_delete:
        collection.delete(ids=ids_to_delete)
    return len(ids_to_delete)


def ingest_documents(chunks: list[Document]) -> Chroma:
    """
    Ingests document chunks into the vector store using append behavior.

    Append was chosen over overwrite because documents are uploaded individually
    over time. Overwriting would delete all previously ingested documents each
    time a new one is added. With append, each upload accumulates in the store.

    Note: avoid ingesting the same document twice as it will create duplicate
    chunks and degrade search quality.
    """
    if not chunks:
        raise ValueError("No chunks provided for ingestion")

    try:
        vector_store = get_vector_store()
        vector_store.add_documents(chunks)
    except Exception as e:
        raise RuntimeError(f"Failed to ingest documents: {e}") from e

    print(f"Ingested {len(chunks)} chunks into vector store")
    return vector_store