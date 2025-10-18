from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class FolderBase(BaseModel):
    """Базовая схема для папки с общими полями."""
    name: str
    icon: Optional[str] = None

class FolderCreate(FolderBase):
    """Схема для создания новой папки."""
    pass

class FolderUpdate(FolderBase):
    """Схема для обновления существующей папки."""
    pass

class FolderPublic(FolderBase):
    """Схема для публичного представления папки, включая ее ID."""
    id: UUID

    model_config = ConfigDict(from_attributes=True)