from fastapi.testclient import TestClient


def auth_headers(client: TestClient) -> dict[str, str]:
    payload = {"email": "security@example.com", "password": "correct-horse-battery"}
    client.post("/auth/register", json=payload)
    response = client.post("/auth/login", json=payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_security_reports_require_authentication(client: TestClient) -> None:
    response = client.get("/security/reports")

    assert response.status_code == 401


def test_security_reports_return_seeded_scan_data(client: TestClient) -> None:
    response = client.get("/security/reports", headers=auth_headers(client))

    assert response.status_code == 200
    reports = response.json()
    assert len(reports) >= 6
    assert {report["tool"] for report in reports} >= {"Semgrep SAST", "Trivy Container"}


def test_security_findings_return_seeded_findings(client: TestClient) -> None:
    response = client.get("/security/findings", headers=auth_headers(client))

    assert response.status_code == 200
    findings = response.json()
    assert len(findings) >= 3
    assert {finding["severity"] for finding in findings} >= {"low", "medium"}


def test_run_security_scan_creates_report(client: TestClient) -> None:
    headers = auth_headers(client)

    response = client.post("/security/scans/run", headers=headers)

    assert response.status_code == 201
    body = response.json()
    assert body["message"] == "Simulated security scan completed"
    assert body["report"]["tool"] == "Manual Security Scan"

    reports_response = client.get("/security/reports", headers=headers)
    assert any(report["tool"] == "Manual Security Scan" for report in reports_response.json())
