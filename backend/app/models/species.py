from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Species(Base):
    """The invasive plants. `id` matches the plant ids in frontend/src/data/plants.ts."""

    __tablename__ = "species"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    latin_name: Mapped[str] = mapped_column(Text, unique=True)
    common_name: Mapped[str] = mapped_column(Text)
