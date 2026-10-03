from datetime import datetime

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Identity, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import Abundance, GrowthStage, Phenology, pg_enum
from app.models.species import Species


class Report(Base):
    """A sighting of an invasive plant. NULL in a choice column means "not recorded"."""

    __tablename__ = "reports"
    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90 AND 90", name="latitude_range"),
        CheckConstraint("longitude BETWEEN -180 AND 180", name="longitude_range"),
        CheckConstraint("(latitude IS NULL) = (longitude IS NULL)", name="lat_lng_together"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    species_id: Mapped[str] = mapped_column(ForeignKey("species.id"), index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    abundance: Mapped[Abundance | None] = mapped_column(pg_enum(Abundance, "abundance"))
    stage: Mapped[GrowthStage | None] = mapped_column(pg_enum(GrowthStage, "growth_stage"))
    phenology: Mapped[Phenology | None] = mapped_column(pg_enum(Phenology, "phenology"))
    latitude: Mapped[float | None]
    longitude: Mapped[float | None]
    location_text: Mapped[str | None] = mapped_column(String(200))
    reporter_name: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(String(2000))
    # Path of the photo inside the Supabase Storage bucket.
    photo_path: Mapped[str | None] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    species: Mapped[Species] = relationship()
