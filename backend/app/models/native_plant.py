from sqlalchemy import ARRAY, ForeignKey, Identity, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class NativePlant(Base):
    """A native plant that can be mistaken for one or more invasive species."""

    __tablename__ = "native_plants"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    latin_name: Mapped[str] = mapped_column(Text, unique=True)
    common_name: Mapped[str] = mapped_column(Text)

    photos: Mapped[list["NativePlantPhoto"]] = relationship(order_by="NativePlantPhoto.position", cascade="all, delete-orphan")


class NativePlantPhoto(Base):
    """A public photo URL. Position 0 is the plant's main photo."""

    __tablename__ = "native_plant_photos"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    native_plant_id: Mapped[str] = mapped_column(ForeignKey("native_plants.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]
    url: Mapped[str] = mapped_column(Text)


class LookAlike(Base):
    """Pairs an invasive species with a native plant it resembles, and how to tell them apart."""

    __tablename__ = "look_alikes"

    species_id: Mapped[str] = mapped_column(ForeignKey("species.id", ondelete="CASCADE"), primary_key=True)
    native_plant_id: Mapped[str] = mapped_column(ForeignKey("native_plants.id", ondelete="CASCADE"), primary_key=True)
    position: Mapped[int]
    shared_traits: Mapped[list[str]] = mapped_column(ARRAY(Text))  # "Looks similar"
    differences: Mapped[list[str]] = mapped_column(ARRAY(Text))  # "How to tell them apart"

    native_plant: Mapped[NativePlant] = relationship(lazy="joined")
