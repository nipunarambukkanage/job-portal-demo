from fastapi import APIRouter, Depends
from app.core.authz import require_role

router = APIRouter()

@router.get("/employer/{employer_id}", summary="Employer analytics snapshot")
async def employer_analytics(employer_id: str, user=Depends(require_role("org:admin"))):
    return {"employer_id": employer_id, "metrics": {"views": 0, "applications": 0, "offers": 0}}
