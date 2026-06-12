from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.docstore.document import Document
from langchain_openai import OpenAIEmbeddings

from .config import CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL

def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model=EMBEDDING_MODEL, timeout=30) # Return openAI embedding client

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
   
    collection = get_vector_store()._collection
    all_results = collection.get(include=["metadatas"])
    ids_to_delete = [ # Pair chunks ID's with their metadata 
        doc_id
        for doc_id, meta in zip(all_results["ids"], all_results["metadatas"])
        if Path(meta.get("source", "")).name == file_name
    ]
    if ids_to_delete:
        collection.delete(ids=ids_to_delete) # loop through the IDs and their metadata and deletes them
    return len(ids_to_delete)


def ingest_documents(chunks: list[Document]) -> Chroma:
    
    if not chunks:
        raise ValueError("No chunks provided for ingestion")

    try:
        vector_store = get_vector_store()
        vector_store.add_documents(chunks)
    except Exception as e:
        raise RuntimeError(f"Failed to ingest documents: {e}") from e

    print(f"Ingested {len(chunks)} chunks into vector store")
    return vector_store