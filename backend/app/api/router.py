from fastapi import APIRouter, Depends

from app.api.deps import current_user
from app.api.routes import auth, health, reports, species

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
# Everything else needs a logged-in user.
api_router.include_router(species.router, dependencies=[Depends(current_user)])
api_router.include_router(reports.router, dependencies=[Depends(current_user)])
