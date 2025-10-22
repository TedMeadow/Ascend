# backend/tests/test_tasks.py
from fastapi.testclient import TestClient

# Импортируем тестового пользователя из другого файла
from .test_auth import TEST_USER


def get_auth_headers(client: TestClient) -> dict:
    """Вспомогательная функция для регистрации, логина и получения заголовков."""
    client.post("/auth/register", json=TEST_USER)
    login_data = {"username": TEST_USER["email"], "password": TEST_USER["password"]}
    token_response = client.post("/auth/token", data=login_data)
    token = token_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_task_unauthorized(client: TestClient):
    response = client.post("/tasks/", json={"title": "test task"})
    assert response.status_code == 401


def test_create_and_get_task(client: TestClient):
    headers = get_auth_headers(client)
    task_data = {"title": "Buy milk", "description": "From the store"}

    # Создаем задачу
    create_response = client.post("/tasks/", json=task_data, headers=headers)
    assert create_response.status_code == 201
    created_task = create_response.json()
    assert created_task["title"] == task_data["title"]

    task_id = created_task["id"]

    # Получаем эту же задачу по ID
    get_response = client.get(f"/tasks/{task_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["description"] == task_data["description"]


def test_get_all_my_tasks(client: TestClient):
    headers = get_auth_headers(client)
    client.post("/tasks/", json={"title": "Task 1"}, headers=headers)
    client.post("/tasks/", json={"title": "Task 2"}, headers=headers)

    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_update_task(client: TestClient):
    headers = get_auth_headers(client)
    create_response = client.post(
        "/tasks/", json={"title": "Initial Title"}, headers=headers
    )
    task_id = create_response.json()["id"]

    update_data = {"title": "Updated Title", "status": "done"}
    response = client.put(f"/tasks/{task_id}", json=update_data, headers=headers)

    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["title"] == "Updated Title"
    assert updated_task["status"] == "done"


def test_delete_task(client: TestClient):
    headers = get_auth_headers(client)
    create_response = client.post(
        "/tasks/", json={"title": "To be deleted"}, headers=headers
    )
    task_id = create_response.json()["id"]

    # Удаляем задачу
    delete_response = client.delete(f"/tasks/{task_id}", headers=headers)
    assert delete_response.status_code == 204

    # Проверяем, что она действительно удалена
    get_response = client.get(f"/tasks/{task_id}", headers=headers)
    assert get_response.status_code == 404
