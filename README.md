# 🛡️ SecureFlow — DevSecOps CI/CD Platform

> **A production-inspired DevSecOps platform demonstrating how modern applications can be built, tested, secured and deployed through a fully automated CI/CD pipeline.**

---

## 📖 Overview

SecureFlow is a personal project designed to demonstrate modern DevSecOps practices by combining software development, cloud infrastructure, automation and application security into a single end-to-end platform.

The project reproduces the complete software delivery lifecycle used in modern companies, where every code change is automatically tested, analyzed, secured and deployed.

Rather than focusing only on application development, SecureFlow emphasizes **Security by Design**, integrating security controls directly into the CI/CD workflow.

---

## 🎯 Objectives

- Demonstrate DevSecOps best practices
- Automate software delivery
- Secure the Software Development Life Cycle (SDLC)
- Implement Infrastructure as Code
- Deploy applications securely on AWS
- Build a portfolio project inspired by real enterprise environments

---

## 🚀 Features

- REST API
- User authentication & authorization
- Dockerized application
- PostgreSQL database
- GitHub Actions CI/CD pipeline
- Automated testing
- Infrastructure as Code (Terraform)
- AWS deployment
- Security reports
- Monitoring & logging

---

## 🔐 Integrated Security Controls

The CI/CD pipeline automatically performs security checks on every commit.

### Static Security

- Semgrep (SAST)
- Secret Detection (Gitleaks)
- Dependency Vulnerability Scanning

### Container Security

- Docker Image Scanning (Trivy)

### Dynamic Security

- OWASP ZAP (DAST)

### Cloud Security

- Secure IAM configuration
- Least Privilege Principle
- Infrastructure validation
- Terraform security checks

---

## ⚙️ DevSecOps Pipeline

```text
Developer
     │
     ▼
GitHub Repository
     │
     ▼
GitHub Actions
     │
     ├── Code Quality
     ├── Unit Tests
     ├── Semgrep (SAST)
     ├── Gitleaks
     ├── Dependency Scan
     ├── Trivy Scan
     ├── Build Docker Image
     ├── OWASP ZAP (DAST)
     └── Terraform Deployment
                 │
                 ▼
                AWS
```

---

## 🏗️ Architecture

```text
                +----------------------+
                |      Developer       |
                +----------+-----------+
                           |
                           v
                    GitHub Repository
                           |
                           v
                  GitHub Actions CI/CD
                           |
      +--------------------+--------------------+
      |                    |                    |
      v                    v                    v
   Security            Build & Test        Infrastructure
     Scans                                   as Code
      |                    |                    |
      +--------------------+--------------------+
                           |
                           v
                    Docker Container
                           |
                           v
                     AWS Cloud Platform
                           |
                           v
                 Monitoring & Logging
```

---

## 🛠️ Technologies

### Backend

- FastAPI
- PostgreSQL

### Frontend

- React
- Vite
- TypeScript

### DevOps

- Docker
- GitHub Actions
- Terraform

### Cloud

- AWS

### Security

- Semgrep
- Gitleaks
- Trivy
- OWASP ZAP

---

## 📚 Skills Demonstrated

- DevSecOps
- Cloud Security
- CI/CD Automation
- Infrastructure as Code
- Secure Software Development
- Docker
- AWS
- Application Security
- Security Automation
- Infrastructure Deployment

---

## 📈 Future Improvements

- Kubernetes deployment
- GitOps with ArgoCD
- SIEM integration
- OpenID Connect authentication
- Security Dashboard
- Policy as Code
- Multi-cloud deployment
- Threat Modeling module
- AI-powered vulnerability prioritization

---

## 🎯 Project Goal

SecureFlow aims to demonstrate how security can be integrated throughout the entire software development lifecycle.

Instead of treating security as a final verification step, this project automates security validation from source code to production deployment, following modern DevSecOps principles adopted by leading technology companies.

---

## 👨‍💻 Author

Developed as a personal portfolio project to demonstrate practical skills in:

- DevSecOps Engineering
- Cloud Security
- Secure Software Engineering
- AWS Infrastructure
- CI/CD Automation
- Application Security

---

## 🚦 Local Setup

### Prerequisites

- Docker Desktop
- Python 3.12
- Git

### Start the application

```bash
cp .env.example .env
docker compose up --build
```

The API is available at:

- API: `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- OpenAPI docs: `http://localhost:8000/docs`
- Dashboard: `http://localhost:5173`

### Try authentication

Create a user:

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

Use the returned `access_token` as a Bearer token for:

```text
GET /users/me
```

### Run backend tests locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install ".[dev]"
ruff check .
pytest
```

### Run frontend locally

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

The dashboard expects the API at `http://localhost:8000` by default. Override it with:

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

---

## 🧱 Current Implementation Status

- FastAPI backend scaffold
- `/health` endpoint
- React security dashboard
- Frontend login and registration flow
- DevSecOps scan overview UI
- User registration and login
- JWT-protected `/users/me` endpoint
- SQLAlchemy user model
- Alembic database migrations
- PostgreSQL service via Docker Compose
- Dockerized API
- Dockerized frontend
- GitHub Actions CI
- Ruff linting
- Pytest test suite
- Frontend ESLint and production build
- Semgrep SAST
- Gitleaks secret detection
- Trivy filesystem, API image, and dashboard image scanning

---

## ✅ GitHub Actions Setup

The workflow in `.github/workflows/ci.yml` runs automatically on:

- Pull requests
- Pushes to `main`

It currently checks:

- Backend lint and tests
- Frontend lint and build
- Semgrep SAST
- Gitleaks secret detection
- Trivy filesystem scan
- Trivy API image scan
- Trivy dashboard image scan

Semgrep and Trivy currently run in audit mode so the CI remains usable during early development.
Once the project is stable, these scans can be switched to blocking release gates.

In GitHub, open the repository, go to `Actions`, and confirm that workflows are enabled. No custom secrets are required for the current CI setup.
