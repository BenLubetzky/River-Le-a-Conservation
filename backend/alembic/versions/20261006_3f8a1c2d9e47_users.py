"""users

Adds user accounts (username and password hash) and links each report to the user who made it.

Revision ID: 3f8a1c2d9e47
Revises: 69ba0a4dab7c
Create Date: 2026-10-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3f8a1c2d9e47"
down_revision: Union[str, Sequence[str], None] = "69ba0a4dab7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
        sa.UniqueConstraint("username", name="uq_users_username"),
    )
    # Keep Supabase's public Data API out, as for the other tables (see the first migration).
    op.execute("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.users FROM anon, authenticated")

    op.add_column("reports", sa.Column("user_id", sa.BigInteger(), nullable=True))
    op.create_foreign_key("fk_reports_user_id_users", "reports", "users", ["user_id"], ["id"], ondelete="SET NULL")
    op.create_index("ix_reports_user_id", "reports", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_reports_user_id", table_name="reports")
    op.drop_constraint("fk_reports_user_id_users", "reports", type_="foreignkey")
    op.drop_column("reports", "user_id")
    op.drop_table("users")
