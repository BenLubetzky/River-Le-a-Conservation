# Importing every model here registers its table on Base.metadata (Alembic relies on this).
from app.models.enums import Abundance, GrowthStage, Phenology
from app.models.native_plant import LookAlike, NativePlant, NativePlantPhoto
from app.models.report import Report
from app.models.species import Characteristic, RemovalStep, Species, SpeciesPhoto
from app.models.user import User

__all__ = [
    "Abundance", "GrowthStage", "Phenology",
    "Characteristic", "LookAlike", "NativePlant", "NativePlantPhoto", "RemovalStep", "Report", "Species", "SpeciesPhoto", "User",
]
