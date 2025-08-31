from __future__ import annotations
from fastapi import Depends, HTTPException
from typing import Dict, Any
from .config import get_settings
from app.routes.auth import get_current_user  # uses your existing verifier

def _require_org(claims: Dict[str, Any]) -> None:
    cfg = get_settings()
    required_org = cfg.__dict__.get("CLERK_ORG_ID") or None  # optionally set in .env
    org_id = claims.get("org_id")
    if not org_id:
        raise HTTPException(status_code=403, detail="Organization membership required")
    if required_org and str(org_id) != str(required_org):
        raise HTTPException(status_code=403, detail="Wrong organization")

def require_role(*allowed_roles: str):
    allowed = {r.lower() for r in allowed_roles}
    def _dep(user=Depends(get_current_user)):
        _require_org(user)
        role = str(user.get("org_role") or "").lower()
        if role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return user
    return _dep

def require_org_member(user=Depends(get_current_user)):
    _require_org(user)
    return user
