from sqlalchemy import ForeignKey, Identity, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.native_plant import LookAlike


class Species(Base):
    """An invasive plant and the field-guide content shown about it."""

    __tablename__ = "species"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    latin_name: Mapped[str] = mapped_column(Text, unique=True)
    common_name: Mapped[str] = mapped_column(Text)
    local_name: Mapped[str] = mapped_column(Text)  # Portuguese name
    family: Mapped[str] = mapped_column(Text)
    native_range: Mapped[str] = mapped_column(Text)
    flowering: Mapped[str] = mapped_column(Text)
    habitat: Mapped[str] = mapped_column(Text)  # where it grows along the Leça
    legal_status: Mapped[str] = mapped_column(Text)
    caution: Mapped[str] = mapped_column(Text)  # warning shown above the removal steps
    display_order: Mapped[int] = mapped_column(Integer)

    photos: Mapped[list["SpeciesPhoto"]] = relationship(order_by="SpeciesPhoto.position", cascade="all, delete-orphan")
    characteristics: Mapped[list["Characteristic"]] = relationship(order_by="Characteristic.position", cascade="all, delete-orphan")
    removal_steps: Mapped[list["RemovalStep"]] = relationship(order_by="RemovalStep.position", cascade="all, delete-orphan")
    look_alikes: Mapped[list[LookAlike]] = relationship(order_by=LookAlike.position, cascade="all, delete-orphan")


class SpeciesPhoto(Base):
    """A public photo URL. Position 0 is the species' main photo."""

    __tablename__ = "species_photos"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    species_id: Mapped[str] = mapped_column(ForeignKey("species.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]
    url: Mapped[str] = mapped_column(Text)


class Characteristic(Base):
    """One row of a species' "Characteristics" list, e.g. Leaves → "Feathery, twice-divided…"."""

    __tablename__ = "species_characteristics"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    species_id: Mapped[str] = mapped_column(ForeignKey("species.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]
    label: Mapped[str] = mapped_column(Text)
    text: Mapped[str] = mapped_column(Text)


class RemovalStep(Base):
    """One step of a species' removal procedure."""

    __tablename__ = "removal_steps"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    species_id: Mapped[str] = mapped_column(ForeignKey("species.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]
    title: Mapped[str] = mapped_column(Text)
    text: Mapped[str] = mapped_column(Text)
