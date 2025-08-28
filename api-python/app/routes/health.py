from fastapi import APIRouter

router = APIRouter()

@router.get("", summary="Liveness")
async def liveness():
    return {"status": "ok"}

@router.get("/ready", summary="Readiness")
async def readiness():
    return {"status": "ready"}
