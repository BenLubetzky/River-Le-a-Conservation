from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import DB
from app.models import Species
from app.schemas import SpeciesOut

router = APIRouter(prefix="/species", tags=["species"])


@router.get("")
def list_species(db: DB) -> list[SpeciesOut]:
    rows = db.scalars(select(Species).order_by(Species.common_name))
    return [SpeciesOut.model_validate(s) for s in rows]
