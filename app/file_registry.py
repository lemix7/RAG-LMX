import hashlib
import json
from pathlib import Path
from .config import REGISTRY_DIR


def registry_path_for(user_id: str, mode: str = "public") -> Path:
    """Path to a user's ingest registry JSON.

    Public mode keeps the original ``registries/<user_id>.json`` for
    back-compat. Local mode tracks ingestion separately (its own collection),
    so it gets ``registries/<user_id>__local.json``.
    """
    REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{user_id}__local.json" if mode == "local" else f"{user_id}.json"
    return REGISTRY_DIR / name


def load_registry(user_id: str, mode: str = "public") -> dict :
    path = registry_path_for(user_id, mode)
    if not path.exists():
        return {}
    with open(path , 'r') as f :
        return json.load(f)


def save_registry(user_id: str, registry: dict, mode: str = "public") :
    with open(registry_path_for(user_id, mode) , 'w') as f:
        json.dump(registry , f , indent=2)


def compute_hash(file_path: Path) -> str:
    h = hashlib.md5()
    with open(file_path , 'rb') as f:
        for chunk in iter(lambda: f.read(8192) , b''):
            h.update(chunk)
    return h.hexdigest()


def is_already_ingested(user_id: str, file_path : Path, mode: str = "public") -> bool :
    registry = load_registry(user_id, mode)
    file_hash = compute_hash(file_path)
    return file_hash in registry.values()


def mark_as_ingested(user_id: str, file_path: Path, mode: str = "public") :
    registry = load_registry(user_id, mode)
    file_hash = compute_hash(file_path)
    registry[file_path.name] = file_hash
    save_registry(user_id, registry, mode)


def remove_from_registry(user_id: str, file_name: str, mode: str = "public") -> bool:
    """Removes a file entry from the user's registry by name. Returns True if it was present."""
    registry = load_registry(user_id, mode)
    if file_name in registry:
        del registry[file_name]
        save_registry(user_id, registry, mode)
        return True
    return False
