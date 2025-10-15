from fastapi.testclient import TestClient

# Предполагается, что эта вспомогательная функция уже есть в ваших тестах
from .test_tasks import get_auth_headers

def test_create_idea_without_tags(client: TestClient):
    """Тест: можно создать идею без тегов."""
    headers = get_auth_headers(client)
    idea_data = {"title": "My first idea", "content": "This is a test."}
    
    response = client.post("/ideas/", json=idea_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == idea_data["title"]
    assert data["content"] == idea_data["content"]
    assert len(data["tags"]) == 0

def test_create_idea_with_new_tags(client: TestClient):
    """Тест: создание идеи с новыми тегами автоматически создает эти теги."""
    headers = get_auth_headers(client)
    idea_data = {
        "title": "Project Phoenix", 
        "content": "A new project idea.", 
        "tags": ["project", "work"]
    }
    
    response = client.post("/ideas/", json=idea_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert len(data["tags"]) == 2
    tag_names = {tag["name"] for tag in data["tags"]}
    assert tag_names == {"project", "work"}

    # Проверяем, что теги теперь существуют
    tags_response = client.get("/ideas/tags/", headers=headers)
    assert tags_response.status_code == 200
    assert len(tags_response.json()) == 2

def test_filter_ideas_by_tag(client: TestClient):
    """Тест: эндпоинт GET /ideas/ правильно фильтрует по тегам."""
    headers = get_auth_headers(client)
    
    # Создаем идеи с разными тегами
    client.post("/ideas/", json={"title": "Work idea", "tags": ["work"]}, headers=headers)
    client.post("/ideas/", json={"title": "Personal idea", "tags": ["personal"]}, headers=headers)
    client.post("/ideas/", json={"title": "Work/Personal idea", "tags": ["work", "personal"]}, headers=headers)

    # Фильтруем по 'work'
    response_work = client.get("/ideas/?tags=work", headers=headers)
    assert response_work.status_code == 200
    assert len(response_work.json()) == 2

    # Фильтруем по 'personal'
    response_personal = client.get("/ideas/?tags=personal", headers=headers)
    assert response_personal.status_code == 200
    assert len(response_personal.json()) == 2

    # Фильтруем по обоим тегам (должна найтись только одна идея)
    response_both = client.get("/ideas/?tags=work&tags=personal", headers=headers)
    assert response_both.status_code == 200
    assert len(response_both.json()) == 1
    assert response_both.json()[0]["title"] == "Work/Personal idea"

def test_update_idea_tags(client: TestClient):
    """Тест: можно обновить идею и изменить ее набор тегов."""
    headers = get_auth_headers(client)
    
    # 1. Создаем идею с начальными тегами
    create_res = client.post("/ideas/", json={"title": "Tag test", "tags": ["alpha", "beta"]}, headers=headers)
    idea_id = create_res.json()["id"]

    # 2. Обновляем, меняя набор тегов
    update_data = {"tags": ["beta", "gamma"]}
    update_res = client.put(f"/ideas/{idea_id}", json=update_data, headers=headers)
    assert update_res.status_code == 200
    updated_idea = update_res.json()
    tag_names = {tag["name"] for tag in updated_idea["tags"]}
    assert tag_names == {"beta", "gamma"}

    # 3. Проверяем общий список тегов пользователя
    tags_response = client.get("/ideas/tags/", headers=headers)
    all_tag_names = {tag["name"] for tag in tags_response.json()}
    assert all_tag_names == {"alpha", "beta", "gamma"}

def test_promote_idea_to_task(client: TestClient):
    """Тест: можно успешно превратить идею в задачу."""
    headers = get_auth_headers(client)

    # 1. Создаем идею
    idea_data = {"title": "Plan vacation", "content": "Research destinations and book flights."}
    create_res = client.post("/ideas/", json=idea_data, headers=headers)
    idea_id = create_res.json()["id"]

    # 2. "Продвигаем" ее в задачу
    promote_data = {"task_title": "Plan the big vacation"}
    promote_res = client.post(f"/ideas/{idea_id}/promote", json=promote_data, headers=headers)
    
    # 3. Проверяем, что вернулась задача
    assert promote_res.status_code == 201
    task_data = promote_res.json()
    assert "id" in task_data
    assert task_data["title"] == promote_data["task_title"]
    # Проверяем, что контент идеи скопировался в описание задачи
    assert task_data["description"] == idea_data["content"]

    # 4. Проверяем, что задача появилась в общем списке задач
    tasks_res = client.get("/tasks/", headers=headers)
    assert len(tasks_res.json()) == 1
    assert tasks_res.json()[0]["title"] == promote_data["task_title"]