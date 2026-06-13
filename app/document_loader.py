from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    CSVLoader
)
from pathlib import Path

from .config import DOCS_DIR
from .file_registry import is_already_ingested, mark_as_ingested


def docs_dir_for(user_id: str) -> Path:
    path = DOCS_DIR / user_id
    path.mkdir(parents=True, exist_ok=True)
    return path


# Supported document extensions, shared by the loaders below and the admin stats.
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".doc", ".md", ".csv"}


def aggregate_document_stats() -> dict:
    
    # used by the admin dashboard . returns the dashboard status
    total_count = 0
    total_bytes = 0
    by_type: dict[str, int] = {}

    if DOCS_DIR.exists():
        for user_dir in DOCS_DIR.iterdir():
            if not user_dir.is_dir():
                continue
            for f in user_dir.iterdir():
                if not f.is_file():
                    continue
                ext = f.suffix.lower()
                if ext not in ALLOWED_EXTENSIONS:
                    continue
                total_count += 1
                total_bytes += f.stat().st_size
                by_type[ext.lstrip(".")] = by_type.get(ext.lstrip("."), 0) + 1

    return {
        "total_documents": total_count,
        "total_bytes": total_bytes,
        "by_type": by_type,
    }


def load_documents(user_id: str, directory: Path | None = None) -> list[Document]:
    documents = []

    if directory is None:
        directory = docs_dir_for(user_id)

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
            if is_already_ingested(user_id, file_path):
                print(f"Skipping already-ingested file: {file_path.name}")
                continue

            #  isolate bad files so one failure doesn't crash everything
            try:
                loader = loaders[file_path.suffix.lower()](str(file_path))
                documents.extend(loader.load())
                mark_as_ingested(user_id, file_path)
                print(f"Loaded {file_path.name}")
            except Exception as e:
                print(f"Failed to load {file_path.name}: {e}")

    if not documents:
        print(f"No documents found in {directory}")
        return []

    return documents
            

