from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_products_are_paginated():
    response = client.get("/products")
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "total" in body


def test_demo_admin_login_and_analytics():
    login = client.post("/auth/login", json={"email": "admin@luxora.dev", "password": "admin12345"})
    assert login.status_code == 200
    token = login.json()["token"]

    response = client.get("/analytics/summary", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "revenue" in response.json()


def test_settings_readable():
    response = client.get("/settings")
    assert response.status_code == 200
    assert "shopName" in response.json()
