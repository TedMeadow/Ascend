from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# Импортируем Enum из моделей, так как он используется в схемах
from src.models.idea import IdeaType

# Импортируем публичные схемы из соседних под-модулей для вложения
from ..tags.schemas import TagPublic

# --- Вспомогательные схемы ---

class LinkMetadataPublic(BaseModel):
    """Схема для отображения кэшированных метаданных ссылки."""
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Основные схемы для Идей ---

class IdeaBase(BaseModel):
    """Базовая схема с основными полями идеи."""
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None # Используется для идей типа LINK

class IdeaCreate(BaseModel):
    """Схема для создания новой идеи. Принимает простые типы от фронтенда."""
    folder_id: UUID
    idea_type: IdeaType = Field(default=IdeaType.TEXT)
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    # Фронтенд отправляет теги как список строк
    tags: List[str] = Field(default_factory=list)

class IdeaUpdate(BaseModel):
    """Схема для обновления идеи. Все поля опциональны."""
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    is_pinned: Optional[bool] = None
    # Позволяет переместить идею в другую папку
    folder_id: Optional[UUID] = None
    # Позволяет полностью заменить набор тегов
    tags: Optional[List[str]] = None

class IdeaPublic(IdeaBase):
    """
    Полная схема для публичного представления идеи.
    Возвращает вложенные объекты для связанных данных.
    """
    id: UUID
    owner_id: UUID
    folder_id: UUID
    idea_type: IdeaType
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    
    # В ответе теги будут представлены как полноценные объекты
    tags: List[TagPublic] = Field(default_factory=list)
    link_metadata: Optional[LinkMetadataPublic] = None

    model_config = ConfigDict(from_attributes=True)

# --- Схемы для специальных действий ---

class IdeaPromoteToTask(BaseModel):
    """Схема для данных, необходимых при "продвижении" идеи в задачу."""
    task_title: str
    task_description: Optional[str] = None