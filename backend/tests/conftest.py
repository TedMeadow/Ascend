# backend/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from src.main import app
from src.core.database import get_db
from src.core.config import settings

# Создаем тестовый движок БД, который будет использоваться только для тестов
engine = create_engine(
    settings.DB_PATH,
    connect_args={"check_same_thread": False},
    echo=False # Отключаем логирование SQL запросов в тестах
)

# Эта фикстура будет выполняться для КАЖДОГО теста.
# Она создает чистую БД перед тестом и удаляет ее после.
@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

# Эта фикстура создает экземпляр TestClient для отправки запросов к приложению.
@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Функция-заменитель для get_db. Вместо создания новой сессии,
    # она будет возвращать тестовую сессию из фикстуры 'session'.
    def get_session_override():
        yield session

    # "Горячая" замена зависимости get_db на нашу тестовую функцию
    app.dependency_overrides[get_db] = get_session_override
    
    client = TestClient(app)
    yield client
    
    # Очищаем замену после теста
    app.dependency_overrides.clear()