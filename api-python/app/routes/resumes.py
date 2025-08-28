from fastapi import APIRouter, Depends
from .auth import get_current_user

router = APIRouter()

@router.post("/ingest", summary="Ingest a resume (async pipeline)")
async def ingest_resume(blob_url: str, user=Depends(get_current_user)):
    return {"message": "ingest accepted", "blob_url": blob_url, "requested_by": user.get("sub")}

@router.get("/{resume_id}/features", summary="Get normalized resume features")
async def get_features(resume_id: str, user=Depends(get_current_user)):
    return {"resume_id": resume_id, "features": {"skills": [], "education": [], "experience": []}}
