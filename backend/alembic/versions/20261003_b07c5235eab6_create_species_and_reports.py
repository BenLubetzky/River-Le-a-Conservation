"""create species and reports

Revision ID: b07c5235eab6
Revises: 
Create Date: 2026-10-03 22:36:10.047899

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b07c5235eab6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SPECIES = [
    ("acacia", "Acacia dealbata", "Mimosa"),
    ("arundo", "Arundo donax", "Giant reed"),
    ("tradescantia", "Tradescantia fluminensis", "Small-leaf spiderwort"),
    ("pontederia", "Pontederia crassipes", "Water hyacinth"),
    ("carpobrotus", "Carpobrotus edulis", "Hottentot fig"),
    ("cortaderia", "Cortaderia selloana", "Pampas grass"),
    ("ipomoea", "Ipomoea indica", "Blue morning glory"),
    ("ailanthus", "Ailanthus altissima", "Tree of heaven"),
    ("oxalis", "Oxalis pes-caprae", "Bermuda buttercup"),
]

# Tables that only the API may touch. Supabase also exposes the public schema through its own
# Data API to anyone holding the publishable key; row-level security with no policies, plus
# revoking the grants, shuts that door. The API connects as the table owner, so it isn't affected.
PRIVATE_TABLES = ["species", "reports", "alembic_version"]


def upgrade() -> None:
    species = op.create_table(
        "species",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("latin_name", sa.Text(), nullable=False),
        sa.Column("common_name", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_species"),
        sa.UniqueConstraint("latin_name", name="uq_species_latin_name"),
    )
    op.bulk_insert(species, [{"id": i, "latin_name": l, "common_name": c} for i, l, c in SPECIES])

    op.create_table(
        "reports",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
        sa.Column("species_id", sa.Text(), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("abundance", sa.Enum("single", "few", "patch", "dense", name="abundance"), nullable=True),
        sa.Column("stage", sa.Enum("seedling", "young", "mature", "dying", "treated", name="growth_stage"), nullable=True),
        sa.Column("phenology", sa.Enum("none", "flower", "fruit", "both", name="phenology"), nullable=True),
        sa.Column("latitude", sa.Double(), nullable=True),
        sa.Column("longitude", sa.Double(), nullable=True),
        sa.Column("location_text", sa.String(200), nullable=True),
        sa.Column("reporter_name", sa.String(100), nullable=True),
        sa.Column("notes", sa.String(2000), nullable=True),
        sa.Column("photo_path", sa.String(300), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("latitude BETWEEN -90 AND 90", name="latitude_range"),
        sa.CheckConstraint("longitude BETWEEN -180 AND 180", name="longitude_range"),
        sa.CheckConstraint("(latitude IS NULL) = (longitude IS NULL)", name="lat_lng_together"),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], name="fk_reports_species_id_species"),
        sa.PrimaryKeyConstraint("id", name="pk_reports"),
    )
    op.create_index("ix_reports_species_id", "reports", ["species_id"])
    op.create_index("ix_reports_observed_at", "reports", ["observed_at"])

    for table in PRIVATE_TABLES:
        op.execute(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"REVOKE ALL ON public.{table} FROM anon, authenticated")


def downgrade() -> None:
    op.drop_index("ix_reports_observed_at", table_name="reports")
    op.drop_index("ix_reports_species_id", table_name="reports")
    op.drop_table("reports")
    op.drop_table("species")
    for enum_type in ("abundance", "growth_stage", "phenology"):
        op.execute(f"DROP TYPE {enum_type}")
