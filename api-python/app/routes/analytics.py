from fastapi import APIRouter, Depends
from .auth import get_current_user

router = APIRouter()

@router.get("/employer/{employer_id}", summary="Employer analytics snapshot")
async def employer_analytics(employer_id: str, user=Depends(get_current_user)):
    return {"employer_id": employer_id, "metrics": {"views": 0, "applications": 0, "offers": 0}}
