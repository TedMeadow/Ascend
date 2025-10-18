import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

# Импортируем тестового пользователя и вспомогательную функцию для авторизации
from .test_auth import TEST_USER
from .test_tasks import get_auth_headers


# --- Вспомогательные функции для тестов Idea Box ---

def create_folder(client: TestClient, headers: dict, name: str, icon: str = "📁") -> dict:
    """Вспомогательная функция для создания папки и возврата ее данных."""
    response = client.post("/idea-box/folders/", json={"name": name, "icon": icon}, headers=headers)
    assert response.status_code == 201
    return response.json()


# --- Тесты для Модуля Папок (/folders) ---

def test_folder_unauthorized_access(client: TestClient):
    """Тест: неавторизованный пользователь не может получить доступ к папкам."""
    response = client.get("/idea-box/folders/")
    assert response.status_code == 401

def test_folder_crud_workflow(client: TestClient):
    """Тест: полный жизненный цикл папки (CRUD)."""
    headers = get_auth_headers(client)

    # 1. Создание
    folder_data = create_folder(client, headers, "Project X")
    folder_id = folder_data["id"]
    assert folder_data["name"] == "Project X"

    # 2. Получение списка
    list_res = client.get("/idea-box/folders/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # 3. Обновление
    update_res = client.put(f"/idea-box/folders/{folder_id}", json={"name": "Project Y"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Project Y"
    
    # 4. Удаление
    delete_res = client.delete(f"/idea-box/folders/{folder_id}", headers=headers)
    assert delete_res.status_code == 204

    # 5. Проверка удаления
    list_res_after = client.get("/idea-box/folders/", headers=headers)
    assert len(list_res_after.json()) == 0


# --- Тесты для Модуля Идей (/ideas) ---

def test_create_idea_requires_folder(client: TestClient):
    """Тест: создание идеи без папки должно завершиться ошибкой (проверка логики)."""
    headers = get_auth_headers(client)
    # Попытка создать идею без folder_id (схема должна выдать ошибку валидации)
    response = client.post("/idea-box/ideas/", json={"title": "Test Idea"}, headers=headers)
    assert response.status_code == 422  # Unprocessable Entity

def test_create_idea_with_new_tags(client: TestClient):
    """Тест: создание идеи с новыми тегами автоматически создает эти теги."""
    headers = get_auth_headers(client)
    folder_id = create_folder(client, headers, "My Ideas")["id"]
    
    idea_data = {
        "folder_id": folder_id,
        "title": "A new feature",
        "tags": ["feature", "urgent"]
    }
    response = client.post("/idea-box/ideas/", json=idea_data, headers=headers)
    assert response.status_code == 201
    created_idea = response.json()
    tag_names = {tag["name"] for tag in created_idea["tags"]}
    assert tag_names == {"feature", "urgent"}

def test_create_link_idea_mocks_background_task(client: TestClient, mocker):
    """Тест: создание идеи-ссылки вызывает фоновую задачу (с моком)."""
    # Мокаем фоновую задачу, чтобы она не выполняла реальный HTTP-запрос
    mocked_fetch = mocker.patch("src.modules.idea_box.ideas.router.fetch_and_save_metadata", MagicMock())
    
    headers = get_auth_headers(client)
    folder_id = create_folder(client, headers, "Links")["id"]
    
    idea_data = {
        "folder_id": folder_id,
        "idea_type": "link",
        "url": "https://example.com"
    }
    client.post("/idea-box/ideas/", json=idea_data, headers=headers)
    
    # Проверяем, что наша фоновая задача была вызвана
    mocked_fetch.assert_called_once()

def test_master_idea_filtering(client: TestClient):
    """Тест: сложная фильтрация в главном эндпоинте GET /ideas."""
    headers = get_auth_headers(client)
    folder_a_id = create_folder(client, headers, "Folder A")["id"]
    folder_b_id = create_folder(client, headers, "Folder B")["id"]

    # Создаем тестовые данные
    client.post("/idea-box/ideas/", json={"folder_id": folder_a_id, "title": "Work task 1", "tags": ["work", "urgent"]}, headers=headers)
    client.post("/idea-box/ideas/", json={"folder_id": folder_a_id, "title": "Work task 2", "tags": ["work"]}, headers=headers)
    client.post("/idea-box/ideas/", json={"folder_id": folder_b_id, "title": "Personal project", "tags": ["personal"]}, headers=headers)

    # 1. Фильтр по папке
    response = client.get(f"/idea-box/ideas/?folder_id={folder_a_id}", headers=headers)
    assert len(response.json()) == 2

    # 2. Фильтр по тегу (по всем папкам)
    response = client.get("/idea-box/ideas/?tags=work", headers=headers)
    assert len(response.json()) == 2

    # 3. Фильтр по папке и тегу
    response = client.get(f"/idea-box/ideas/?folder_id={folder_a_id}&tags=urgent", headers=headers)
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Work task 1"

    # 4. Полнотекстовый поиск
    response = client.get("/idea-box/ideas/?q=personal", headers=headers)
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Personal project"


def test_promote_idea_to_task(client: TestClient):
    """Тест: успешное "продвижение" идеи в задачу."""
    headers = get_auth_headers(client)
    folder_id = create_folder(client, headers, "Actionable Ideas")["id"]
    
    # 1. Создаем идею
    idea_res = client.post("/idea-box/ideas/", json={"folder_id": folder_id, "title": "Plan trip"}, headers=headers)
    idea_id = idea_res.json()["id"]

    # 2. Продвигаем
    promote_res = client.post(f"/idea-box/ideas/{idea_id}/promote-to-task", json={"task_title": "Plan the big trip"}, headers=headers)
    assert promote_res.status_code == 201
    task_data = promote_res.json()
    assert task_data["title"] == "Plan the big trip"

    # 3. Проверяем, что задача создана
    tasks_res = client.get("/tasks/")
    assert len(tasks_res.json()) == 1

    # 4. Проверяем, что повторное продвижение запрещено
    failed_promote_res = client.post(f"/idea-box/ideas/{idea_id}/promote-to-task", json={"task_title": "Plan again"}, headers=headers)
    assert failed_promote_res.status_code == 409


# --- Тесты для Модуля Тегов (/tags и контекстные) ---

def test_get_global_tags(client: TestClient):
    """Тест: получение глобального словаря тегов пользователя."""
    headers = get_auth_headers(client)
    folder_id = create_folder(client, headers, "Global Tags Test")["id"]
    client.post("/idea-box/ideas/", json={"folder_id": folder_id, "title": "A", "tags": ["work", "urgent"]}, headers=headers)
    client.post("/idea-box/ideas/", json={"folder_id": folder_id, "title": "B", "tags": ["work"]}, headers=headers)

    response = client.get("/idea-box/tags/", headers=headers)
    assert response.status_code == 200
    tags_map = {tag["name"]: tag["idea_count"] for tag in response.json()}
    assert tags_map["work"] == 2
    assert tags_map["urgent"] == 1

def test_get_contextual_tags_in_folder(client: TestClient):
    """Тест: получение тегов, релевантных только для одной папки."""
    headers = get_auth_headers(client)
    folder_a_id = create_folder(client, headers, "Folder A")["id"]
    folder_b_id = create_folder(client, headers, "Folder B")["id"]

    # Идеи в папке А
    client.post("/idea-box/ideas/", json={"folder_id": folder_a_id, "title": "A1", "tags": ["work", "alpha"]}, headers=headers)
    # Идеи в папке Б
    client.post("/idea-box/ideas/", json={"folder_id": folder_b_id, "title": "B1", "tags": ["work", "beta"]}, headers=headers)

    # Запрашиваем теги только для папки А
    response = client.get(f"/idea-box/folders/{folder_a_id}/tags", headers=headers)
    assert response.status_code == 200
    
    tags_map = {tag["name"]: tag["idea_count"] for tag in response.json()}
    
    # Должны быть только теги 'work' и 'alpha', и 'beta' отсутствовать
    assert "work" in tags_map
    assert "alpha" in tags_map
    assert "beta" not in tags_map
    assert tags_map["work"] == 1 # Счетчик для 'work' должен быть 1, а не 2