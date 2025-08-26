from fastapi import APIRouter, Depends
from .auth import get_current_user

router = APIRouter()

@router.get("/me", summary="My profile (from token)")
async def me(user=Depends(get_current_user)):
    return {"sub": user.get("sub"), "email": user.get("email_addresses", ["unknown"])}

@router.get("/{candidate_id}", summary="Get candidate")
async def get_candidate(candidate_id: str, user=Depends(get_current_user)):
    return {"id": candidate_id, "skills": [], "experience": []}
