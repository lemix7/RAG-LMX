from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    CSVLoader
)
from pathlib import Path

from config import DOCS_DIR
from file_registry import  is_already_ingested , mark_as_ingested


def load_documents(directory: Path = DOCS_DIR) -> list[Document]:
    documents = []

    loaders = {
        ".pdf": PyPDFLoader,
        ".docx": Docx2txtLoader,
        ".doc": Docx2txtLoader,
        ".txt": TextLoader,
        ".md": TextLoader,
        ".csv": CSVLoader,
    }

    #  folder doesn't exist
    if not directory.exists():
        print(f"Directory '{directory}' does not exist.")
        return []

    for file_path in directory.iterdir():
        #  skip subfolders but warn the user
        if file_path.is_dir():
            print(f"Skipping subfolder: {file_path.name}")
            continue

        if file_path.suffix.lower() in loaders:
            #  skip empty files
            if file_path.stat().st_size == 0:
                print(f"Skipping empty file: {file_path.name}")
                continue

            #  skip prev ingested files
            if is_already_ingested(file_path):
                print(f"Skipping already-ingested file: {file_path.name}")
                continue

            #  isolate bad files so one failure doesn't crash everything
            try:
                loader = loaders[file_path.suffix.lower()](str(file_path))
                documents.extend(loader.load())
                mark_as_ingested(file_path)
                print(f"Loaded {file_path.name}")
            except Exception as e:
                print(f"Failed to load {file_path.name}: {e}")

    if not documents:
        print(f"No documents found in {directory}")
        return []

    return documents
            

