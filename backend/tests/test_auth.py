# backend/tests/test_auth.py
from fastapi.testclient import TestClient

# Тестовые данные пользователя
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword"
}

def test_register_user_success(client: TestClient):
    response = client.post("/auth/register", json=TEST_USER)
    assert response.status_code == 200 # В вашем коде сейчас 200, можно поменять на 201
    data = response.json()
    assert data["username"] == TEST_USER["username"]

def test_register_user_duplicate(client: TestClient):
    # Сначала регистрируем пользователя
    client.post("/auth/register", json=TEST_USER)
    # Потом пытаемся зарегистрировать его еще раз
    response = client.post("/auth/register", json=TEST_USER)
    assert response.status_code == 409

def test_login_success(client: TestClient):
    # Сначала регистрируем пользователя, чтобы было кого логинить
    client.post("/auth/register", json=TEST_USER)
    
    login_data = {
        "username": TEST_USER["email"], # Логинимся по email
        "password": TEST_USER["password"]
    }
    response = client.post("/auth/token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_me_unauthorized(client: TestClient):
    response = client.get("/user/me")
    assert response.status_code == 401

def test_get_me_success(client: TestClient):
    # Регистрируемся
    client.post("/auth/register", json=TEST_USER)
    # Логинимся, чтобы получить токен
    login_data = {"username": TEST_USER["email"], "password": TEST_USER["password"]}
    token_response = client.post("/auth/token", data=login_data)
    token = token_response.json()["access_token"]
    
    # Делаем запрос к защищенному эндпоинту с токеном
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/user/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == TEST_USER["username"]
