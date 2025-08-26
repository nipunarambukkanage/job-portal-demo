from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import httpx


class ClerkError(RuntimeError):
    pass


def get_clerk_secret_key() -> str:
    """
    Returns the Clerk secret key from env. Required for backend API calls.
    """
    key = os.getenv("CLERK_SECRET_KEY")
    if not key:
        raise ClerkError("CLERK_SECRET_KEY is not set in environment")
    return key


async def _clerk_get(path: str, *, params: Optional[dict] = None) -> dict:
    base = os.getenv("CLERK_API_BASE", "https://api.clerk.com/v1")
    key = get_clerk_secret_key()
    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "User-Agent": "job-portal-python-api/1.0",
    }
    url = f"{base.rstrip('/')}/{path.lstrip('/')}"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, headers=headers, params=params or {})
        if r.status_code >= 400:
            raise ClerkError(f"Clerk API error {r.status_code}: {r.text}")
        return r.json()


async def fetch_clerk_user(user_id: str) -> Dict[str, Any]:
    """
    Fetch a Clerk user record by id using Backend API.
    https://clerk.com/docs/reference/backend-api/tag/Users
    """
    return await _clerk_get(f"users/{user_id}")


async def fetch_clerk_organization_memberships(user_id: str) -> List[Dict[str, Any]]:
    """
    List organization memberships for a user (if you use Clerk orgs).
    https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships
    """
    data = await _clerk_get("organization_memberships", params={"user_id": user_id})
    items = data.get("data") or data.get("organization_memberships") or []
    if isinstance(items, list):
        return items
    return []
