"""checkups

Reports can ask to be checked again from a given day. Anyone logged in can then do the checkup:
still there, updated, or gone (which closes the report). Each species suggests how many days
until the checkup.

Revision ID: 5d1f0a9c3b62
Revises: 8c2e5b71d4a0
Create Date: 2026-10-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5d1f0a9c3b62"
down_revision: Union[str, Sequence[str], None] = "8c2e5b71d4a0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The same starting suggestion for every species; change it per species on the admin page.
    op.add_column("species", sa.Column("checkup_days", sa.Integer(), server_default="90", nullable=False))

    op.add_column("reports", sa.Column("checkup_due", sa.Date(), nullable=True))
    op.add_column("reports", sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_reports_checkup_due", "reports", ["checkup_due"])

    op.create_table(
        "report_checkups",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
        sa.Column("report_id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=True),
        sa.Column("checked_by", sa.String(50), nullable=False),
        sa.Column("outcome", sa.Enum("still_there", "updated", "gone", name="checkup_outcome"), nullable=False),
        sa.Column("checked_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"], name="fk_report_checkups_report_id_reports", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_report_checkups_user_id_users", ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_report_checkups"),
    )
    op.create_index("ix_report_checkups_report_id", "report_checkups", ["report_id"])
    # Keep Supabase's public Data API out, as for the other tables (see the first migration).
    op.execute("ALTER TABLE public.report_checkups ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.report_checkups FROM anon, authenticated")


def downgrade() -> None:
    op.drop_index("ix_report_checkups_report_id", table_name="report_checkups")
    op.drop_table("report_checkups")
    op.execute("DROP TYPE checkup_outcome")
    op.drop_index("ix_reports_checkup_due", table_name="reports")
    op.drop_column("reports", "closed_at")
    op.drop_column("reports", "checkup_due")
    op.drop_column("species", "checkup_days")
