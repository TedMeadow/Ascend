from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
# Предполагается, что эта вспомогательная функция уже есть в ваших тестах,
# например, в tests/test_tasks.py или в conftest.py
from .test_tasks import get_auth_headers

def test_create_event_unauthorized(client: TestClient):
    """Тест: нельзя создать событие без авторизации."""
    response = client.post("/calendar/events", json={
        "title": "Unauthorized Event",
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    })
    assert response.status_code == 401

def test_create_and_get_event(client: TestClient):
    """Тест: успешное создание и последующее получение события."""
    headers = get_auth_headers(client)
    event_data = {
        "title": "Team Meeting",
        "description": "Discuss project progress",
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    }
    
    # Создание
    create_response = client.post("/calendar/events", json=event_data, headers=headers)
    assert create_response.status_code == 201
    created_event = create_response.json()
    assert created_event["title"] == event_data["title"]
    assert "id" in created_event

    event_id = created_event["id"]

    # Получение
    get_response = client.get(f"/calendar/events/{event_id}", headers=headers)
    assert get_response.status_code == 200
    fetched_event = get_response.json()
    assert fetched_event["id"] == event_id
    assert fetched_event["description"] == event_data["description"]

def test_create_event_linked_to_task(client: TestClient):
    """Тест: можно создать событие, привязанное к существующей задаче."""
    headers = get_auth_headers(client)
    
    # 1. Создаем задачу
    task_res = client.post("/tasks/", json={"title": "Prepare presentation"}, headers=headers)
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 2. Создаем событие, связанное с этой задачей
    event_data = {
        "title": "Work on presentation",
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        "task_id": task_id
    }
    event_res = client.post("/calendar/events", json=event_data, headers=headers)
    assert event_res.status_code == 201
    assert event_res.json()["task_id"] == task_id

def test_update_and_delete_event(client: TestClient):
    """Тест: успешное обновление и удаление события."""
    headers = get_auth_headers(client)
    
    # 1. Создаем событие
    event_data = {"title": "Initial Title", "start_time": datetime.now(timezone.utc).isoformat(), "end_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()}
    create_response = client.post("/calendar/events", json=event_data, headers=headers)
    event_id = create_response.json()["id"]

    # 2. Обновляем
    update_data = {"title": "Updated Event Title"}
    update_response = client.put(f"/calendar/events/{event_id}", json=update_data, headers=headers)
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Event Title"

    # 3. Удаляем
    delete_response = client.delete(f"/calendar/events/{event_id}", headers=headers)
    assert delete_response.status_code == 204

    # 4. Проверяем, что удалено
    get_response = client.get(f"/calendar/events/{event_id}", headers=headers)
    assert get_response.status_code == 404

def test_get_calendar_view(client: TestClient):
    """Тест: главный эндпоинт /calendar/ возвращает правильные данные за период."""
    headers = get_auth_headers(client)
    now = datetime.now(timezone.utc)

    # 1. Создаем данные для теста
    # Событие внутри диапазона
    client.post("/calendar/events", headers=headers, json={
        "title": "Event inside range",
        "start_time": (now + timedelta(days=1)).isoformat(),
        "end_time": (now + timedelta(days=1, hours=1)).isoformat()
    })
    # Задача с дедлайном внутри диапазона
    client.post("/tasks/", headers=headers, json={
        "title": "Task inside range",
        "due_date": (now + timedelta(days=2)).isoformat()
    })
    # Событие за пределами диапазона
    client.post("/calendar/events", headers=headers, json={
        "title": "Event outside range",
        "start_time": (now + timedelta(days=10)).isoformat(),
        "end_time": (now + timedelta(days=10, hours=1)).isoformat()
    })
    # Задача с дедлайном за пределами диапазона
    client.post("/tasks/", headers=headers, json={
        "title": "Task outside range",
        "due_date": (now + timedelta(days=11)).isoformat()
    })

    # 2. Запрашиваем "вид" календаря на 5 дней вперед
    start_date = now.date().isoformat()
    end_date = (now + timedelta(days=5)).date().isoformat()
    
    response = client.get(f"/calendar/?start_date={start_date}&end_date={end_date}", headers=headers)
    
    # 3. Проверяем результат
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["events"]) == 1
    assert data["events"][0]["title"] == "Event inside range"
    
    assert len(data["tasks"]) == 1
    assert data["tasks"][0]["title"] == "Task inside range"