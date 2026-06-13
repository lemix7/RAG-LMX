import hashlib
import json
from pathlib import Path
from .config import REGISTRY_DIR


def registry_path_for(user_id: str) -> Path:
    """Path to a user's ingest registry JSON (registries/<user_id>.json)."""
    REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
    return REGISTRY_DIR / f"{user_id}.json"


def load_registry(user_id: str) -> dict :
    path = registry_path_for(user_id)
    if not path.exists():
        return {}
    with open(path , 'r') as f :
        return json.load(f)


def save_registry(user_id: str, registry: dict) :
    with open(registry_path_for(user_id) , 'w') as f:
        json.dump(registry , f , indent=2)


def compute_hash(file_path: Path) -> str:
    h = hashlib.md5()
    with open(file_path , 'rb') as f:
        for chunk in iter(lambda: f.read(8192) , b''):
            h.update(chunk)
    return h.hexdigest()


def is_already_ingested(user_id: str, file_path : Path) -> bool :
    registry = load_registry(user_id)
    file_hash = compute_hash(file_path)
    return file_hash in registry.values()


def mark_as_ingested(user_id: str, file_path: Path) :
    registry = load_registry(user_id)
    file_hash = compute_hash(file_path)
    registry[file_path.name] = file_hash
    save_registry(user_id, registry)


def remove_from_registry(user_id: str, file_name: str) -> bool:
    """Removes a file entry from the user's registry by name. Returns True if it was present."""
    registry = load_registry(user_id)
    if file_name in registry:
        del registry[file_name]
        save_registry(user_id, registry)
        return True
    return False
