from sqlmodel import create_engine, Session

from src.core.config import settings

_connect_args = {"check_same_thread": False} if settings.DB_PATH.startswith("sqlite") else {}

engine = create_engine(settings.DB_PATH, echo=settings.DEBUG, connect_args=_connect_args)


def get_db():
    with Session(engine) as session:
        yield session
