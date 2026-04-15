import hashlib
import json
from pathlib import Path
from .config import INGESTED_FILES_REGISTRY

def load_registry() -> dict :
    if not INGESTED_FILES_REGISTRY.exists():
        return {}
    with open(INGESTED_FILES_REGISTRY , 'r') as f :
        return json.load(f)


def save_registry(registry: dict) :
    with open(INGESTED_FILES_REGISTRY , 'w') as f:
        json.dump(registry , f , indent=2)


def compute_hash(file_path: Path) -> str:
    h = hashlib.md5()
    with open(file_path , 'rb') as f:
        for chunk in iter(lambda: f.read(8192) , b''):
            h.update(chunk)
    return h.hexdigest() 


def is_already_ingested(file_path : Path) -> bool :
    registry = load_registry()
    file_hash = compute_hash(file_path)
    return file_hash in registry.values()


def mark_as_ingested(file_path: Path) :
    registry = load_registry()
    file_hash = compute_hash(file_path)
    registry[file_path.name] = file_hash
    save_registry(registry)

