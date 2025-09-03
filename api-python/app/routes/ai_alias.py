from fastapi import APIRouter, Depends
from app.core.authz import require_org_member
router = APIRouter()

@router.get("/recommendations", summary="AI recommendations (alias)")
async def recommend(user=Depends(require_org_member)):
    # delegate to v1 if needed
    return {"items": []}

@router.get("/analytics", summary="AI analytics (alias)")
async def analytics(user=Depends(require_org_member)):
    return {"metrics": {"matches": 0, "views": 0}}
