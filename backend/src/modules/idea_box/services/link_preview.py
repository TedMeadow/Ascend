import logging
from uuid import UUID
import httpx
from bs4 import BeautifulSoup
from sqlmodel import Session, select

from src.core.database import engine
from src.models import Idea, LinkMetadata

logger = logging.getLogger(__name__)


def fetch_and_save_metadata(idea_id: UUID, url: str):
    logger.info("Background task started: fetching metadata for URL: %s", url)

    # Создаем новую, независимую сессию БД специально для этой задачи
    with Session(engine) as session:
        try:
            # --- Шаг 1: Проверка кэша ---
            # Эффективность: если мы уже парсили этот URL, просто используем результат
            cached_metadata = session.exec(
                select(LinkMetadata).where(LinkMetadata.url == url)
            ).first()
            if cached_metadata:
                logger.debug("Found cached metadata for %s", url)
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
                logger.info("Fetched and saved new metadata for %s", url)
                metadata_to_link = new_metadata

            idea = session.get(Idea, idea_id)
            if idea:
                idea.link_metadata_id = metadata_to_link.id
                session.add(idea)
                session.commit()
                logger.debug("Linked metadata to Idea ID: %s", idea_id)
            else:
                logger.warning("Idea with ID %s not found after fetching metadata", idea_id)

        except httpx.RequestError as e:
            logger.error("HTTP request error for %s: %s", url, e)
        except Exception as e:
            logger.exception("Unexpected error while fetching metadata for %s: %s", url, e)
