from __future__ import annotations

import json
import time
from typing import Any, Dict

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
import jwt
from jwt import InvalidTokenError

from app.core.config import get_settings

bearer = HTTPBearer(auto_error=True)

_JWKS_CACHE: Dict[str, Any] | None = None
_JWKS_EXP: float = 0.0
_JWKS_TTL_SECONDS = 3600  # 1 hour


async def _fetch_jwks(jwks_url: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(jwks_url)
        r.raise_for_status()
        return r.json()


async def get_jwks() -> Dict[str, Any]:
    global _JWKS_CACHE, _JWKS_EXP
    now = time.time()
    if _JWKS_CACHE and _JWKS_EXP > now:
        return _JWKS_CACHE
    settings = get_settings()
    data = await _fetch_jwks(settings.CLERK_JWKS_URL)
    _JWKS_CACHE = data
    _JWKS_EXP = now + _JWKS_TTL_SECONDS
    return data


async def get_current_user(credentials=Depends(bearer)) -> Dict[str, Any]:
    """
    Verify a Clerk-issued JWT (RS256) against JWKS, checking iss/aud.
    Returns the decoded claims (dict) or raises 401.
    """
    token = credentials.credentials
    settings = get_settings()

    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Missing kid in token header")

        jwks = await get_jwks()
        keys = jwks.get("keys", [])
        key_match = next((k for k in keys if k.get("kid") == kid), None)
        if not key_match:
            _ = await _fetch_jwks(settings.CLERK_JWKS_URL)
            for k in _.get("keys", []):
                if k.get("kid") == kid:
                    key_match = k
                    break
            if not key_match:
                raise HTTPException(status_code=401, detail="Signing key not found")

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key_match))
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.CLERK_AUDIENCE,
            issuer=str(settings.CLERK_ISSUER),
            options={"require": ["exp", "iat", "iss", "aud"]},
        )
        return claims  # type: ignore[return-value]

    except InvalidTokenError as ex:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from ex
    except HTTPException:
        raise
    except Exception as ex:  # pragma: no cover - unexpected
        raise HTTPException(status_code=401, detail="Auth failed") from ex
