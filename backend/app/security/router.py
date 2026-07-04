from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.security.models import SecurityFinding, SecurityReport
from app.security.schemas import (
    SecurityFindingRead,
    SecurityReportRead,
    SecurityScanRunResponse,
)
from app.security.service import create_simulated_scan, seed_security_data
from app.users.models import User

router = APIRouter(prefix="/security", tags=["security"])


@router.get("/reports", response_model=list[SecurityReportRead])
def list_security_reports(
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> list[SecurityReport]:
    seed_security_data(db)
    return list(db.scalars(select(SecurityReport).order_by(SecurityReport.created_at.desc())))


@router.get("/findings", response_model=list[SecurityFindingRead])
def list_security_findings(
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> list[SecurityFinding]:
    seed_security_data(db)
    statement = select(SecurityFinding).order_by(SecurityFinding.severity, SecurityFinding.id)
    return list(db.scalars(statement))


@router.post(
    "/scans/run",
    response_model=SecurityScanRunResponse,
    status_code=status.HTTP_201_CREATED,
)
def run_security_scan(
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
) -> SecurityScanRunResponse:
    seed_security_data(db)
    report = create_simulated_scan(db)
    return SecurityScanRunResponse(message="Simulated security scan completed", report=report)
