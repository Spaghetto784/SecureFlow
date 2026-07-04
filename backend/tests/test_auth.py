from fastapi.testclient import TestClient


def test_register_creates_user_without_returning_password(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={"email": "Ada@example.com", "password": "correct-horse-battery"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "ada@example.com"
    assert body["is_active"] is True
    assert body["role"] == "user"
    assert "hashed_password" not in body


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    payload = {"email": "ada@example.com", "password": "correct-horse-battery"}
    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_login_returns_bearer_token(client: TestClient) -> None:
    payload = {"email": "ada@example.com", "password": "correct-horse-battery"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_rejects_invalid_password(client: TestClient) -> None:
    client.post(
        "/auth/register",
        json={"email": "ada@example.com", "password": "correct-horse-battery"},
    )

    response = client.post(
        "/auth/login",
        json={"email": "ada@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_me_requires_token(client: TestClient) -> None:
    response = client.get("/users/me")

    assert response.status_code == 401


def test_me_returns_current_user_with_valid_token(client: TestClient) -> None:
    payload = {"email": "ada@example.com", "password": "correct-horse-battery"}
    client.post("/auth/register", json=payload)
    login_response = client.post("/auth/login", json=payload)
    token = login_response.json()["access_token"]

    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "ada@example.com"
