from fastapi import APIRouter

from app.api.v1 import guardian, journey

router = APIRouter(prefix="/api/v1", tags=["v1"])
router.include_router(guardian.router, prefix="/guardian", tags=["guardian"])
router.include_router(journey.router, prefix="/journey", tags=["journey"])
