from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SecurityFindingRead(BaseModel):
    id: int
    report_id: int
    title: str
    severity: str
    status: str
    target: str
    description: str
    recommendation: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SecurityReportRead(BaseModel):
    id: int
    tool: str
    category: str
    status: str
    summary: str
    findings_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SecurityScanRunResponse(BaseModel):
    message: str
    report: SecurityReportRead
