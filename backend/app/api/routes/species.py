from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DB
from app.models import LookAlike, NativePlant, Species
from app.schemas import SpeciesOut

router = APIRouter(prefix="/species", tags=["species"])


@router.get("")
def list_species(db: DB) -> list[SpeciesOut]:
    """Every invasive species with its full field-guide content, in display order."""
    rows = db.scalars(
        select(Species)
        .order_by(Species.display_order)
        .options(
            selectinload(Species.photos),
            selectinload(Species.characteristics),
            selectinload(Species.removal_steps),
            selectinload(Species.look_alikes).joinedload(LookAlike.native_plant).selectinload(NativePlant.photos),
        )
    )
    return [SpeciesOut.from_model(s) for s in rows]
