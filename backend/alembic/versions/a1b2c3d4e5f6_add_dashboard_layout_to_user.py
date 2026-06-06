"""Add dashboard_layout to user

Revision ID: a1b2c3d4e5f6
Revises: 0d74d702847b
Create Date: 2026-06-06 00:00:00.000000

"""

from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "68bcc793f7bd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user",
        sa.Column("dashboard_layout", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("user", "dashboard_layout")
