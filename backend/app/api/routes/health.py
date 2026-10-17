from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from app.api.deps import DB

router = APIRouter(tags=["health"])


@router.get("/health")
def health(db: DB) -> dict[str, str]:
    """The API is up and can reach the database. Pinged on a schedule (.github/workflows/keep-awake.yml)
    so neither the host nor the free-tier database goes to sleep."""
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(503, "database unreachable")
    return {"status": "ok"}
