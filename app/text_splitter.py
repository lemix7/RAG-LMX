from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from config import CHUNK_SIZE, CHUNK_OVERLAP


def split_documents(documents: list[Document]) -> list[Document]:

    if not documents:
        print("No documents to split.")
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    chunks = splitter.split_documents(documents)

    print(f"Split {len(documents)} documents into {len(chunks)} chunks")

    return chunks
