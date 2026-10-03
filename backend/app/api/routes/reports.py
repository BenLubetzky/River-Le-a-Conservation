import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Form, HTTPException, UploadFile
from sqlalchemy import select

from app.api.deps import DB
from app.core.config import get_settings
from app.models import Abundance, GrowthStage, Phenology, Report, Species
from app.schemas import ReportOut
from app.services import storage

log = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/reports", tags=["reports"])


def clean(s: str | None) -> str | None:
    s = (s or "").strip()
    return s or None


@router.get("")
def list_reports(db: DB) -> list[ReportOut]:
    rows = db.scalars(select(Report).order_by(Report.observed_at.desc()))
    return [ReportOut.from_model(r) for r in rows]


@router.post("", status_code=201)
def create_report(
    db: DB,
    species_id: Annotated[str, Form()],
    observed_at: Annotated[datetime, Form(description="ISO 8601 with a timezone, e.g. 2026-10-03T14:30:00Z")],
    abundance: Annotated[Abundance | None, Form()] = None,
    stage: Annotated[GrowthStage | None, Form()] = None,
    phenology: Annotated[Phenology | None, Form()] = None,
    latitude: Annotated[float | None, Form(ge=-90, le=90)] = None,
    longitude: Annotated[float | None, Form(ge=-180, le=180)] = None,
    location_text: Annotated[str | None, Form(max_length=200)] = None,
    reporter_name: Annotated[str | None, Form(max_length=100)] = None,
    notes: Annotated[str | None, Form(max_length=2000)] = None,
    photo: UploadFile | None = None,
) -> ReportOut:
    if db.get(Species, species_id) is None:
        raise HTTPException(422, "Unknown species.")
    if observed_at.tzinfo is None:
        raise HTTPException(422, "observed_at must include a timezone.")
    if observed_at > datetime.now(UTC) + timedelta(days=1):
        raise HTTPException(422, "The observation date is in the future.")
    if (latitude is None) != (longitude is None):
        raise HTTPException(422, "Send both latitude and longitude, or neither.")

    photo_path = None
    if photo is not None and photo.filename:
        if photo.content_type not in storage.ALLOWED_TYPES:
            raise HTTPException(422, "The photo must be a JPEG, PNG, WebP or HEIC image.")
        max_bytes = get_settings().max_photo_bytes
        data = photo.file.read(max_bytes + 1)
        if len(data) > max_bytes:
            raise HTTPException(413, "The photo is larger than 10 MB.")
        try:
            photo_path = storage.upload_photo(data, photo.content_type)
        except Exception:
            log.exception("Photo upload failed")
            raise HTTPException(502, "The photo couldn't be saved. Please try again.")

    report = Report(
        species_id=species_id, observed_at=observed_at,
        abundance=abundance, stage=stage, phenology=phenology,
        latitude=latitude, longitude=longitude,
        location_text=clean(location_text), reporter_name=clean(reporter_name), notes=clean(notes),
        photo_path=photo_path,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportOut.from_model(report)
