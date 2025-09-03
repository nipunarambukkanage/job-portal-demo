from fastapi import APIRouter, Depends
from app.core.authz import require_role

router = APIRouter()

# Members upload/ingest their resumes:
@router.post("/ingest", summary="Ingest a resume (async pipeline)")
async def ingest_resume(blob_url: str, user=Depends(require_role("org:member"))):
    return {"message": "ingest accepted", "blob_url": blob_url, "requested_by": user.get("sub")}

# Admin views normalized features for any resume:
@router.get("/{resume_id}/features", summary="Get normalized resume features")
async def get_features(resume_id: str, user=Depends(require_role("org:admin"))):
    return {"resume_id": resume_id, "features": {"skills": [], "education": [], "experience": []}}
