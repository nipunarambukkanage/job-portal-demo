from fastapi import APIRouter, Depends
from app.core.authz import require_role, require_org_member

router = APIRouter()

# Any org member can see "me"
@router.get("/me", summary="My profile (from token)")
async def me(user=Depends(require_org_member)):
    return {"sub": user.get("sub"), "email": user.get("email_addresses", ["unknown"])}

# Admin can view any candidate profile
@router.get("/{candidate_id}", summary="Get candidate")
async def get_candidate(candidate_id: str, user=Depends(require_role("org:admin"))):
    return {"id": candidate_id, "skills": [], "experience": []}
