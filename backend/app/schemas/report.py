from datetime import datetime

from pydantic import BaseModel

from app.models.enums import Abundance, GrowthStage, Phenology
from app.models.report import Report


class ReportOut(BaseModel):
    id: int
    species_id: str
    observed_at: datetime
    abundance: Abundance | None
    stage: GrowthStage | None
    phenology: Phenology | None
    latitude: float | None
    longitude: float | None
    location_text: str | None
    reporter_name: str | None
    notes: str | None
    photo_url: str | None  # signed URL, valid for a limited time
    created_at: datetime

    @classmethod
    def from_model(cls, r: Report, photo_url: str | None) -> "ReportOut":
        return cls(
            id=r.id, species_id=r.species_id, observed_at=r.observed_at,
            abundance=r.abundance, stage=r.stage, phenology=r.phenology,
            latitude=r.latitude, longitude=r.longitude, location_text=r.location_text,
            reporter_name=r.reporter_name, notes=r.notes,
            photo_url=photo_url,
            created_at=r.created_at,
        )
