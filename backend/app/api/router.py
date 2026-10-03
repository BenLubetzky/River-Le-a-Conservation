from fastapi import APIRouter

from app.api.routes import health, reports, species

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(species.router)
api_router.include_router(reports.router)
