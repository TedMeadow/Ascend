from sqlmodel import create_engine, Session

from src.core.config import settings

engine = create_engine(
    settings.DB_PATH, echo=settings.DEBUG, connect_args={"check_same_thread": False}
)


def get_db():
    with Session(engine) as session:
        yield session
