from langchain_chroma import Chroma
from langchain_community.docstore.document import Document
from langchain_openai import OpenAIEmbeddings

from config import CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL

def get_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model=EMBEDDING_MODEL, timeout=30)

def get_vector_store() -> Chroma:
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_DIR,
    )

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