"""postponed checkups

A due checkup can be postponed when the spot couldn't be checked: it moves to a later day, and the
checkup can carry a note and photos.

Revision ID: a4e7c2b19f53
Revises: 5d1f0a9c3b62
Create Date: 2026-10-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "a4e7c2b19f53"
down_revision: Union[str, Sequence[str], None] = "5d1f0a9c3b62"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE checkup_outcome ADD VALUE IF NOT EXISTS 'postponed'")
    op.add_column("report_checkups", sa.Column("notes", sa.String(2000), nullable=True))
    op.add_column("report_checkups", sa.Column("photo_paths", postgresql.ARRAY(sa.String(300)), server_default="{}", nullable=False))


def downgrade() -> None:
    # Their photos stay in the bucket; delete those by hand if needed.
    op.drop_column("report_checkups", "photo_paths")
    op.drop_column("report_checkups", "notes")
    # Postgres can't drop a value from an enum type, so the type is rebuilt without it.
    op.execute("DELETE FROM report_checkups WHERE outcome = 'postponed'")
    op.execute("ALTER TYPE checkup_outcome RENAME TO checkup_outcome_old")
    op.execute("CREATE TYPE checkup_outcome AS ENUM ('still_there', 'updated', 'gone')")
    op.execute("ALTER TABLE report_checkups ALTER COLUMN outcome TYPE checkup_outcome USING outcome::text::checkup_outcome")
    op.execute("DROP TYPE checkup_outcome_old")
