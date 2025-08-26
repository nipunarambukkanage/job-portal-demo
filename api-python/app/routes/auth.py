import os, time, asyncio
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
import httpx
from jose import jwt

router = APIRouter()
bearer = HTTPBearer(auto_error=True)

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://trusted-swan-44.clerk.accounts.dev/.well-known/jwks.json")
CLERK_ISSUER   = os.getenv("CLERK_ISSUER",   "https://trusted-swan-44.clerk.accounts.dev")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE", "jobportal-api")

_JWKS: Dict[str, Any] | None = None
_JWKS_EXP: float = 0.0
_JWKS_TTL = 3600  # seconds

async def get_jwks() -> Dict[str, Any]:
    global _JWKS, _JWKS_EXP
    now = time.time()
    if _JWKS and _JWKS_EXP > now:
        return _JWKS
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(CLERK_JWKS_URL)
        r.raise_for_status()
        _JWKS = r.json()
        _JWKS_EXP = now + _JWKS_TTL
        return _JWKS

async def get_current_user(credentials=Depends(bearer)) -> Dict[str, Any]:
    token = credentials.credentials
    jwks = await get_jwks()
    try:
        claims = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=CLERK_AUDIENCE,
            issuer=CLERK_ISSUER,
            options={"verify_at_hash": False},
        )
        return claims
    except Exception as ex:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from ex

@router.get("/verify", summary="Verify the current token")
async def verify(user=Depends(get_current_user)):
    return {"sub": user.get("sub"), "exp": user.get("exp"), "issuer": user.get("iss"), "aud": user.get("aud")}
