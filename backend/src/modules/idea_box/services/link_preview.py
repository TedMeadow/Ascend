from uuid import UUID
import httpx
from bs4 import BeautifulSoup
from sqlmodel import Session, select

# Мы импортируем engine напрямую, чтобы создавать независимую сессию в фоновой задаче
from src.core.database import engine
from src.models import Idea, LinkMetadata


def fetch_and_save_metadata(idea_id: UUID, url: str):
    """
    Фоновая задача для получения метаданных по URL-адресу.

    Эта функция спроектирована для безопасного выполнения в фоновом потоке:
    1.  Она создает собственную сессию базы данных, чтобы быть независимой от
        контекста запроса.
    2.  Сначала проверяет, не были ли метаданные для этого URL уже
        закэшированы.
    3.  Выполняет безопасный HTTP-запрос с таймаутом и user-agent.
    4.  Парсит HTML для извлечения Open Graph (og:*) мета-тегов.
    5.  Сохраняет результат и связывает его с исходной Идеей.

    Args:
        idea_id: ID Идеи, к которой нужно привязать метаданные.
        url: URL-адрес для парсинга.
    """
    print(f"Background task started: Fetching metadata for URL: {url}")

    # Создаем новую, независимую сессию БД специально для этой задачи
    with Session(engine) as session:
        try:
            # --- Шаг 1: Проверка кэша ---
            # Эффективность: если мы уже парсили этот URL, просто используем результат
            cached_metadata = session.exec(
                select(LinkMetadata).where(LinkMetadata.url == url)
            ).first()
            if cached_metadata:
                print(f"Found cached metadata for {url}")
                metadata_to_link = cached_metadata
            else:
                # --- Шаг 2: Безопасный HTTP-запрос ---
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
                with httpx.Client(
                    headers=headers, follow_redirects=True, timeout=10.0
                ) as client:
                    response = client.get(url)
                    response.raise_for_status()  # Вызовет исключение для статусов 4xx/5xx

                # --- Шаг 3: Парсинг HTML ---
                soup = BeautifulSoup(response.text, "lxml")

                def _get_meta_property(prop):
                    tag = soup.find("meta", property=prop)
                    return tag["content"] if tag else None

                title = _get_meta_property("og:title") or (
                    soup.title.string if soup.title else None
                )
                description = _get_meta_property("og:description")
                image_url = _get_meta_property("og:image")

                # --- Шаг 4: Сохранение новых метаданных ---
                new_metadata = LinkMetadata(
                    url=url, title=title, description=description, image_url=image_url
                )
                session.add(new_metadata)
                session.commit()
                session.refresh(new_metadata)
                print(f"Successfully fetched and saved new metadata for {url}")
                metadata_to_link = new_metadata

            # --- Шаг 5: Связывание метаданных с Идеей ---
            idea = session.get(Idea, idea_id)
            if idea:
                idea.link_metadata_id = metadata_to_link.id
                session.add(idea)
                session.commit()
                print(f"Successfully linked metadata to Idea ID: {idea_id}")
            else:
                print(
                    f"Warning: Idea with ID {idea_id} not found after fetching metadata."
                )

        except httpx.RequestError as e:
            print(f"HTTP Request Error for {url}: {e}")
        except Exception as e:
            # Общий обработчик, чтобы фоновая задача не "упала" молча
            print(
                f"An unexpected error occurred while fetching metadata for {url}: {e}"
            )
