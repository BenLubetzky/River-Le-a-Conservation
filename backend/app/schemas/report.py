from datetime import date, datetime

from typing import Literal

from pydantic import BaseModel

from app.models.enums import Abundance, CheckupOutcome, GrowthStage, Phenology
from app.models.report import Report


class CheckupOut(BaseModel):
    outcome: CheckupOutcome
    checked_by: str
    checked_at: datetime


class CheckupIn(BaseModel):
    """A checkup that didn't need the report edited."""

    outcome: Literal[CheckupOutcome.still_there, CheckupOutcome.gone]
    # Still there: when to check again, or None for no further checkups. Ignored for gone.
    next_checkup: date | None = None


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
    user_id: int | None  # who made it, and so who can edit it; None once that user is deleted
    notes: str | None
    photo_url: str | None  # signed URL, valid for a limited time
    created_at: datetime
    checkup_due: date | None
    closed_at: datetime | None  # set when a checkup found the plants gone
    checkups: list[CheckupOut]  # oldest first

    @classmethod
    def from_model(cls, r: Report, photo_url: str | None) -> "ReportOut":
        return cls(
            id=r.id, species_id=r.species_id, observed_at=r.observed_at,
            abundance=r.abundance, stage=r.stage, phenology=r.phenology,
            latitude=r.latitude, longitude=r.longitude, location_text=r.location_text,
            reporter_name=r.reporter_name, user_id=r.user_id, notes=r.notes,
            photo_url=photo_url,
            created_at=r.created_at,
            checkup_due=r.checkup_due, closed_at=r.closed_at,
            checkups=[CheckupOut(outcome=c.outcome, checked_by=c.checked_by, checked_at=c.checked_at) for c in r.checkups],
        )
