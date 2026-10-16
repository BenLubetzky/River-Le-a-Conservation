from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, String, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.enums import CheckupOutcome, pg_enum


class ReportCheckup(Base):
    """Someone went back to a reported spot after its checkup date and recorded what they found."""

    __tablename__ = "report_checkups"

    id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    # The checker's username, kept so it still shows if the user is deleted.
    checked_by: Mapped[str] = mapped_column(String(50))
    outcome: Mapped[CheckupOutcome] = mapped_column(pg_enum(CheckupOutcome, "checkup_outcome"))
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # What they wrote and photographed, if anything (so far only for postponed checkups).
    notes: Mapped[str | None] = mapped_column(String(2000))
    # Paths of the photos inside the Supabase Storage bucket.
    photo_paths: Mapped[list[str]] = mapped_column(ARRAY(String(300)), server_default="{}", default=list)
