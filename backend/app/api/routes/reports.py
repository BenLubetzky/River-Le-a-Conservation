import logging
from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DB, CurrentUser
from app.core.config import get_settings
from app.models import Abundance, CheckupOutcome, GrowthStage, Phenology, Report, ReportCheckup, Species, User
from app.schemas import CheckupIn, ReportOut
from app.services import storage

log = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/reports", tags=["reports"])

MAX_CHECKUP_PHOTOS = 6


def clean(s: str | None) -> str | None:
    s = (s or "").strip()
    return s or None


def sign_photos(paths: list[str]) -> dict[str, str]:
    """Signed URLs by path, for the photos and their thumbnails. If signing fails, reports are still
    returned, just without photos."""
    try:
        return storage.signed_urls([q for p in paths for q in (p, storage.thumb_path(p))])
    except Exception:
        log.exception("Could not sign photo URLs")
        return {}


def photo_paths(report: Report) -> list[str]:
    """Every photo a report shows: its own and its checkups'."""
    return [p for p in [report.photo_path, *(p for c in report.checkups for p in c.photo_paths)] if p]


def today() -> date:
    # Checkup dates are whole days; UTC is close enough to Portugal's time for that.
    return datetime.now(UTC).date()


def is_due(report: Report) -> bool:
    """Its checkup day has come, and it hasn't been closed."""
    return report.closed_at is None and report.checkup_due is not None and report.checkup_due <= today()


def check_next_checkup(day: date | None) -> date | None:
    if day is not None and day <= today():
        raise HTTPException(422, "A data de verificação tem de ser depois de hoje.")
    return day


def record_checkup(
    db: DB, report: Report, user: User, outcome: CheckupOutcome, notes: str | None = None, photos: list[str] | None = None,
) -> None:
    db.add(ReportCheckup(
        report_id=report.id, user_id=user.id, checked_by=user.username, outcome=outcome,
        notes=notes, photo_paths=photos or [],
    ))


def get_report(db: DB, report_id: int) -> Report:
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(404, "Esse registo não existe.")
    return report


@router.get("")
def list_reports(db: DB) -> list[ReportOut]:
    rows = db.scalars(select(Report).order_by(Report.observed_at.desc()).options(selectinload(Report.checkups))).all()
    urls = sign_photos([p for r in rows for p in photo_paths(r)])
    return [ReportOut.from_model(r, urls) for r in rows]


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
    checkup_due: Annotated[date | None, Form(description="Day to check the spot again; leave out for no checkup")] = None,
) -> dict:
    """The report form's fields, checked. Shared by create and edit; a field left out is saved as empty."""
    if db.get(Species, species_id) is None:
        raise HTTPException(422, "Espécie desconhecida.")
    if observed_at.tzinfo is None:
        raise HTTPException(422, "observed_at tem de incluir o fuso horário.")
    if observed_at > datetime.now(UTC) + timedelta(days=1):
        raise HTTPException(422, "A data da observação está no futuro.")
    if (latitude is None) != (longitude is None):
        raise HTTPException(422, "Envie a latitude e a longitude, ou nenhuma das duas.")
    return dict(
        species_id=species_id, observed_at=observed_at,
        abundance=abundance, stage=stage, phenology=phenology,
        latitude=latitude, longitude=longitude,
        location_text=clean(location_text), notes=clean(notes),
        checkup_due=check_next_checkup(checkup_due),
    )


ReportFields = Annotated[dict, Depends(report_fields)]


def read_thumb(thumb: UploadFile | None) -> bytes | None:
    """The thumbnail's bytes, checked. None if none was sent, or it's empty (the website sends an
    empty one for a photo it couldn't make a thumbnail of)."""
    if thumb is None or not thumb.filename:
        return None
    max_bytes = get_settings().max_thumb_bytes
    data = thumb.file.read(max_bytes + 1)
    if not data:
        return None
    if thumb.content_type != storage.THUMB_TYPE:
        raise HTTPException(422, "A miniatura tem de ser uma imagem JPEG.")
    if len(data) > max_bytes:
        raise HTTPException(413, f"A miniatura tem mais de {max_bytes // 1024} KB.")
    return data


def save_photo(photo: UploadFile | None, thumb: UploadFile | None = None) -> str | None:
    """Upload the photo, if one was sent, with its thumbnail, and return its path in the bucket."""
    if photo is None or not photo.filename:
        return None
    if photo.content_type not in storage.ALLOWED_TYPES:
        raise HTTPException(422, "A fotografia tem de ser uma imagem JPEG, PNG, WebP ou HEIC.")
    max_bytes = get_settings().max_photo_bytes
    data = photo.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(413, f"A fotografia tem mais de {max_bytes // (1024 * 1024)} MB.")
    thumb_data = read_thumb(thumb)
    try:
        return storage.upload_photo(data, photo.content_type, thumb_data)
    except Exception:
        log.exception("Photo upload failed")
        raise HTTPException(502, "Não foi possível guardar a fotografia. Tente novamente.")


def report_out(report: Report) -> ReportOut:
    return ReportOut.from_model(report, sign_photos(photo_paths(report)))


@router.post("", status_code=201)
def create_report(
    db: DB, user: CurrentUser, fields: ReportFields, photo: UploadFile | None = None, photo_thumb: UploadFile | None = None,
) -> ReportOut:
    report = Report(
        **fields,
        user_id=user.id,
        # Always the logged-in user's name. Kept on the report, so it still shows if the user is deleted.
        reporter_name=user.username,
        photo_path=save_photo(photo, photo_thumb),
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
    photo_thumb: UploadFile | None = None,
    remove_photo: Annotated[bool, Form(description="Remove the current photo (ignored if a new one is sent)")] = False,
) -> ReportOut:
    """Replace a report's details. Its author can always; anyone can once its checkup is due, and
    that counts as the checkup. Closed reports can't be edited. Deleting is done on the admin page."""
    report = get_report(db, report_id)
    if report.closed_at is not None:
        raise HTTPException(409, "Este registo está encerrado: as plantas já não existiam.")
    due = is_due(report)
    if report.user_id != user.id and not due:
        raise HTTPException(403, "Só pode editar os seus próprios registos, ou registos que precisem de verificação.")

    for key, value in fields.items():
        setattr(report, key, value)
    old_photo = report.photo_path
    if new_photo := save_photo(photo, photo_thumb):
        report.photo_path = new_photo
    elif remove_photo:
        report.photo_path = None
    if due:
        record_checkup(db, report, user, CheckupOutcome.updated)
    db.commit()
    db.refresh(report)
    if old_photo and old_photo != report.photo_path:
        storage.delete_photos_quietly([old_photo])
    return report_out(report)


@router.post("/{report_id}/checkup")
def check_report(db: DB, user: CurrentUser, report_id: int, body: CheckupIn) -> ReportOut:
    """Record a checkup that needed no edit: the plants are still there (optionally with another
    checkup date), or they're gone, which closes the report. Anyone can, once the report is due."""
    report = get_report(db, report_id)
    if not is_due(report):
        raise HTTPException(409, "Este registo não precisa de verificação neste momento.")
    if body.outcome == CheckupOutcome.gone:
        report.closed_at = datetime.now(UTC)
        report.checkup_due = None
    else:
        report.checkup_due = check_next_checkup(body.next_checkup)
    record_checkup(db, report, user, body.outcome)
    db.commit()
    db.refresh(report)
    return report_out(report)


@router.post("/{report_id}/postpone")
def postpone_checkup(
    db: DB,
    user: CurrentUser,
    report_id: int,
    next_checkup: Annotated[date, Form(description="The day to try the checkup again; must be after today")],
    notes: Annotated[str | None, Form(max_length=2000, description="Why it couldn't be checked")] = None,
    photos: list[UploadFile] | None = None,
    photo_thumbs: Annotated[
        list[UploadFile] | None, File(description="One per photo, in the same order; an empty file for none")
    ] = None,
) -> ReportOut:
    """Record that the spot couldn't be checked (no access, flooded…) and move the checkup to a later
    day, optionally with a note and photos. The report is otherwise unchanged. Anyone can, once the
    report is due, as many times as needed."""
    report = get_report(db, report_id)
    if not is_due(report):
        raise HTTPException(409, "Este registo não precisa de verificação neste momento.")
    report.checkup_due = check_next_checkup(next_checkup)
    photos = [f for f in photos or [] if f.filename]
    if len(photos) > MAX_CHECKUP_PHOTOS:
        raise HTTPException(422, f"Adicione no máximo {MAX_CHECKUP_PHOTOS} fotografias.")
    thumbs = photo_thumbs or []
    if thumbs and len(thumbs) != len(photos):
        raise HTTPException(422, "Envie uma miniatura por fotografia, ou nenhuma.")
    saved: list[str] = []
    try:
        for i, f in enumerate(photos):
            saved.append(save_photo(f, thumbs[i] if thumbs else None))
        record_checkup(db, report, user, CheckupOutcome.postponed, clean(notes), saved)
        db.commit()
    except Exception:
        # Don't leave the photos already uploaded behind if a later one, or the save, failed.
        storage.delete_photos_quietly(saved)
        raise
    db.refresh(report)
    return report_out(report)
