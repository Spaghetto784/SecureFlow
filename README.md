# SecureFlow

> DevSecOps CI/CD platform built as a portfolio project to demonstrate secure software delivery, automated security checks, containerized services, and a security-focused dashboard.

SecureFlow shows how a modern application can be developed, tested, scanned, and prepared for deployment with security controls integrated into the delivery workflow from the beginning.

The project is intentionally production-inspired: it includes an authenticated API, a React dashboard, PostgreSQL persistence, Docker Compose, database migrations, automated tests, and GitHub Actions security checks.

---

## What It Demonstrates

SecureFlow is designed to show practical skills in:

- DevSecOps engineering
- Secure backend development
- Authentication and authorization
- CI/CD automation
- Dockerized application delivery
- Security scanning automation
- Security report centralization
- PostgreSQL-backed API development
- Portfolio-ready dashboard design

---

## Current Features

### Application

- FastAPI REST API
- React + TypeScript dashboard
- PostgreSQL database
- Docker Compose environment
- User registration and login
- JWT-protected routes
- Security reports and findings API
- Simulated security scan trigger
- OpenAPI documentation with Swagger

### Security Controls

- Semgrep SAST workflow
- Gitleaks secret detection workflow
- Trivy filesystem scan
- Trivy backend image scan
- Trivy frontend image scan
- Password hashing with Argon2
- JWT authentication
- CORS configured for the dashboard

### Engineering Quality

- Pytest backend tests
- Ruff backend linting
- ESLint frontend linting
- TypeScript production build
- Alembic database migrations
- GitHub Actions CI pipeline

---

## Architecture

```text
Browser
  |
  v
React Dashboard
  |
  v
FastAPI Backend
  |
  v
PostgreSQL

GitHub Push
  |
  v
GitHub Actions CI
  |
  +-- Backend lint and tests
  +-- Frontend lint and build
  +-- Semgrep SAST
  +-- Gitleaks secret detection
  +-- Trivy dependency and container scans
```

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, CSS |
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT, Argon2 password hashing |
| Migrations | Alembic |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Security | Semgrep, Gitleaks, Trivy |
| Tests | Pytest, Ruff, ESLint |

---

## Local Setup

### Prerequisites

Install:

- Docker with Docker Compose
- Git
- Python 3.12, only if you want to run backend tests outside Docker
- Node.js, only if you want to run frontend checks outside Docker

### Start the full platform

From the project root:

```bash
cp .env.example .env
docker compose up -d --build
```

Check that all services are running:

```bash
docker compose ps
```

You should see:

- `secureflow-api-1`
- `secureflow-db-1`
- `secureflow-frontend-1`

### Open the application

- Dashboard: `http://localhost:5173`
- API health check: `http://localhost:8000/health`
- Swagger API docs: `http://localhost:8000/docs`

---

## How To Test The Project

### 1. Test the dashboard

Open:

```text
http://localhost:5173
```

Create an account with a valid email:

```text
demo@example.com
```

Use a password with at least 12 characters:

```text
correct-horse-battery
```

After login, the dashboard should show:

- Risk score
- CI/CD security scan cards
- Open security findings
- Pipeline activity
- Runtime inventory
- A `Run scan` button

Click `Run scan` to create a simulated security report through the backend API.

### 2. Test the API with Swagger

Open:

```text
http://localhost:8000/docs
```

Useful endpoints:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /security/reports`
- `GET /security/findings`
- `POST /security/scans/run`

Protected endpoints require a Bearer token from `/auth/login`.

### 3. Test with curl

Register:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"correct-horse-battery"}'
```

Login:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"correct-horse-battery"}'
```

Use the returned `access_token` as:

```text
Authorization: Bearer YOUR_TOKEN
```

Then test:

```text
GET /users/me
GET /security/reports
GET /security/findings
POST /security/scans/run
```

---

## Run Checks Locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install ".[dev]"
ruff check .
pytest
```

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
```

---

## Docker Commands

Start or rebuild everything:

```bash
docker compose up -d --build
```

View running services:

```bash
docker compose ps
```

View API logs:

```bash
docker compose logs api --tail 80
```

View frontend logs:

```bash
docker compose logs frontend --tail 80
```

Stop everything:

```bash
docker compose down
```

Reset the local database volume:

```bash
docker compose down -v
```

---

## GitHub Actions

The CI workflow is defined in:

```text
.github/workflows/ci.yml
```

It runs on:

- Pushes to `main`
- Pull requests

Current jobs:

- Backend quality and tests
- Frontend quality and build
- Semgrep SAST
- Gitleaks secret detection
- Trivy dependency and container scan

Semgrep and Trivy currently run in audit mode so the pipeline remains usable during early development. Later, these checks can be made blocking for critical vulnerabilities.

No custom GitHub secrets are required for the current CI setup.

---

## Project Structure

```text
SecureFlow
├── backend
│   ├── app
│   │   ├── auth
│   │   ├── core
│   │   ├── db
│   │   ├── security
│   │   └── users
│   ├── alembic
│   └── tests
├── frontend
│   └── src
├── .github
│   └── workflows
├── docker-compose.yml
└── README.md
```

---

## Roadmap

Planned improvements:

- Import real Semgrep, Gitleaks, and Trivy reports into the dashboard
- Add frontend tests
- Add role-based authorization
- Add AWS infrastructure with Terraform
- Add deployment pipeline
- Add monitoring and logging
- Add OWASP ZAP DAST automation
- Add Kubernetes deployment
- Add policy-as-code checks

---

## Project Goal

The goal of SecureFlow is to demonstrate that security can be integrated throughout the full software delivery lifecycle.

Instead of treating security as a final manual review, SecureFlow automates checks and centralizes security results in a dashboard that developers can use during delivery.
