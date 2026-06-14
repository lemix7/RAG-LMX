
import threading
from functools import lru_cache

import jwt
import requests
from fastapi import Header, HTTPException

from .config import SUPABASE_URL, SUPABASE_JWT_SECRET

_jwks_lock = threading.Lock()
_jwks_client: jwt.PyJWKClient | None = None


def _get_jwks_client() -> jwt.PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        with _jwks_lock:
            if _jwks_client is None:
                _jwks_client = jwt.PyJWKClient(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")
    return _jwks_client


def get_current_user_id(authorization: str = Header(None)) -> str:
   
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or malformed Authorization header. Expected 'Bearer <token>'.",
        )

    token = authorization.split(" ", 1)[1].strip() # extract the Bearer token from the header

    # the try covers to verifying way the verifying via jwks (modern) and verfiying with a shared secret key 
    try:
        if SUPABASE_URL: # Asymmetric   
            # ES256 / RS256 — verify via JWKS
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
            )
        elif SUPABASE_JWT_SECRET: # Symmetric
            # Verify with a shared secret key
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Server auth is not configured. Set SUPABASE_URL in .env.",
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth error: {e}")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token is missing the user id (sub) claim.")

    return user_id
