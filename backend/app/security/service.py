from sqlalchemy import select
from sqlalchemy.orm import Session

from app.security.models import SecurityFinding, SecurityReport

SEED_REPORTS = [
    {
        "tool": "Semgrep SAST",
        "category": "Static analysis",
        "status": "passed",
        "summary": "No blocking insecure code patterns detected.",
        "findings": [],
    },
    {
        "tool": "Gitleaks",
        "category": "Secret detection",
        "status": "passed",
        "summary": "No secrets found in repository history.",
        "findings": [],
    },
    {
        "tool": "Dependency Scan",
        "category": "Software composition analysis",
        "status": "attention",
        "summary": "One dependency hardening item should be reviewed.",
        "findings": [
            {
                "title": "Review frontend transitive dependency policy",
                "severity": "medium",
                "status": "open",
                "target": "frontend/package-lock.json",
                "description": "Dependency inventory should be reviewed before production release.",
                "recommendation": "Enable Dependabot and review dependency updates weekly.",
            }
        ],
    },
    {
        "tool": "Trivy Container",
        "category": "Container security",
        "status": "passed",
        "summary": "Container scans are configured in audit mode.",
        "findings": [],
    },
    {
        "tool": "OWASP ZAP",
        "category": "Dynamic testing",
        "status": "attention",
        "summary": "Security header hardening can be improved.",
        "findings": [
            {
                "title": "Missing strict transport security header",
                "severity": "low",
                "status": "triaged",
                "target": "http://localhost:8000",
                "description": "The local API does not emit HSTS headers in development.",
                "recommendation": "Add HSTS at the production reverse proxy or load balancer.",
            },
            {
                "title": "Content security policy not configured",
                "severity": "low",
                "status": "open",
                "target": "http://localhost:5173",
                "description": "The dashboard does not currently define a CSP policy.",
                "recommendation": "Add a Content-Security-Policy header before public deployment.",
            },
        ],
    },
    {
        "tool": "Terraform Checks",
        "category": "Infrastructure as code",
        "status": "running",
        "summary": "Infrastructure checks are planned for the AWS phase.",
        "findings": [],
    },
]


def seed_security_data(db: Session) -> None:
    existing_report = db.scalar(select(SecurityReport.id).limit(1))
    if existing_report is not None:
        return

    for item in SEED_REPORTS:
        findings = item["findings"]
        report = SecurityReport(
            tool=item["tool"],
            category=item["category"],
            status=item["status"],
            summary=item["summary"],
            findings_count=len(findings),
        )
        db.add(report)
        db.flush()

        for finding in findings:
            db.add(SecurityFinding(report_id=report.id, **finding))

    db.commit()


def create_simulated_scan(db: Session) -> SecurityReport:
    report = SecurityReport(
        tool="Manual Security Scan",
        category="On-demand validation",
        status="passed",
        summary="Manual scan completed successfully with no critical findings.",
        findings_count=1,
    )
    db.add(report)
    db.flush()
    db.add(
        SecurityFinding(
            report_id=report.id,
            title="Document production security headers",
            severity="info",
            status="open",
            target="deployment checklist",
            description="The application should document expected production security headers.",
            recommendation="Add a deployment checklist for HSTS, CSP, X-Frame-Options, and CORS.",
        )
    )
    db.commit()
    db.refresh(report)
    return report
