"""create security reports tables

Revision ID: 20260704_0002
Revises: 20260704_0001
Create Date: 2026-07-04 00:02:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260704_0002"
down_revision: str | None = "20260704_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "security_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tool", sa.String(length=80), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("summary", sa.String(length=255), nullable=False),
        sa.Column("findings_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_security_reports_id"), "security_reports", ["id"], unique=False)
    op.create_index(op.f("ix_security_reports_tool"), "security_reports", ["tool"], unique=False)

    op.create_table(
        "security_findings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("severity", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("target", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["security_reports.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_security_findings_id"), "security_findings", ["id"], unique=False)
    op.create_index(
        op.f("ix_security_findings_severity"),
        "security_findings",
        ["severity"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_security_findings_severity"), table_name="security_findings")
    op.drop_index(op.f("ix_security_findings_id"), table_name="security_findings")
    op.drop_table("security_findings")
    op.drop_index(op.f("ix_security_reports_tool"), table_name="security_reports")
    op.drop_index(op.f("ix_security_reports_id"), table_name="security_reports")
    op.drop_table("security_reports")
