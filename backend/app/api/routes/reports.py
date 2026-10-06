import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy import select

from app.api.deps import DB, CurrentUser
from app.core.config import get_settings
from app.models import Abundance, GrowthStage, Phenology, Report, Species
from app.schemas import ReportOut
from app.services import storage

log = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/reports", tags=["reports"])


def clean(s: str | None) -> str | None:
    s = (s or "").strip()
    return s or None


def sign_photos(paths: list[str | None]) -> dict[str, str]:
    """Signed URLs by photo path. If signing fails, reports are still returned, just without photos."""
    try:
        return storage.signed_urls([p for p in paths if p])
    except Exception:
        log.exception("Could not sign photo URLs")
        return {}


@router.get("")
def list_reports(db: DB) -> list[ReportOut]:
    rows = db.scalars(select(Report).order_by(Report.observed_at.desc())).all()
    urls = sign_photos([r.photo_path for r in rows])
    return [ReportOut.from_model(r, urls.get(r.photo_path or "")) for r in rows]


def report_fields(
    db: DB,
    species_id: Annotated[str, Form()],
    observed_at: Annotated[datetime, Form(description="ISO 8601 with a timezone, e.g. 2026-10-03T14:30:00Z")],
    abundance: Annotated[Abundance | None, Form()] = None,
    stage: Annotated[GrowthStage | None, Form()] = None,
    phenology: Annotated[Phenology | None, Form()] = None,
    latitude: Annotated[float | None, Form(ge=-90, le=90)] = None,
    longitude: Annotated[float | None, Form(ge=-180, le=180)] = None,
    location_text: Annotated[str | None, Form(max_length=200)] = None,
    notes: Annotated[str | None, Form(max_length=2000)] = None,
) -> dict:
    """The report form's fields, checked. Shared by create and edit; a field left out is saved as empty."""
    if db.get(Species, species_id) is None:
        raise HTTPException(422, "Unknown species.")
    if observed_at.tzinfo is None:
        raise HTTPException(422, "observed_at must include a timezone.")
    if observed_at > datetime.now(UTC) + timedelta(days=1):
        raise HTTPException(422, "The observation date is in the future.")
    if (latitude is None) != (longitude is None):
        raise HTTPException(422, "Send both latitude and longitude, or neither.")
    return dict(
        species_id=species_id, observed_at=observed_at,
        abundance=abundance, stage=stage, phenology=phenology,
        latitude=latitude, longitude=longitude,
        location_text=clean(location_text), notes=clean(notes),
    )


ReportFields = Annotated[dict, Depends(report_fields)]


def save_photo(photo: UploadFile | None) -> str | None:
    """Upload the photo, if one was sent, and return its path in the bucket."""
    if photo is None or not photo.filename:
        return None
    if photo.content_type not in storage.ALLOWED_TYPES:
        raise HTTPException(422, "The photo must be a JPEG, PNG, WebP or HEIC image.")
    max_bytes = get_settings().max_photo_bytes
    data = photo.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(413, "The photo is larger than 10 MB.")
    try:
        return storage.upload_photo(data, photo.content_type)
    except Exception:
        log.exception("Photo upload failed")
        raise HTTPException(502, "The photo couldn't be saved. Please try again.")


def report_out(report: Report) -> ReportOut:
    urls = sign_photos([report.photo_path] if report.photo_path else [])
    return ReportOut.from_model(report, urls.get(report.photo_path or ""))


@router.post("", status_code=201)
def create_report(db: DB, user: CurrentUser, fields: ReportFields, photo: UploadFile | None = None) -> ReportOut:
    report = Report(
        **fields,
        user_id=user.id,
        # Always the logged-in user's name. Kept on the report, so it still shows if the user is deleted.
        reporter_name=user.username,
        photo_path=save_photo(photo),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report_out(report)


@router.put("/{report_id}")
def update_report(
    db: DB,
    user: CurrentUser,
    report_id: int,
    fields: ReportFields,
    photo: UploadFile | None = None,
    remove_photo: Annotated[bool, Form(description="Remove the current photo (ignored if a new one is sent)")] = False,
) -> ReportOut:
    """Replace a report's details. Only the user who made it can. Deleting is done on the admin page."""
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(404, "That report doesn't exist.")
    if report.user_id != user.id:
        raise HTTPException(403, "You can only edit your own reports.")

    for key, value in fields.items():
        setattr(report, key, value)
    old_photo = report.photo_path
    if new_photo := save_photo(photo):
        report.photo_path = new_photo
    elif remove_photo:
        report.photo_path = None
    db.commit()
    db.refresh(report)
    if old_photo and old_photo != report.photo_path:
        storage.delete_photos_quietly([old_photo])
    return report_out(report)
