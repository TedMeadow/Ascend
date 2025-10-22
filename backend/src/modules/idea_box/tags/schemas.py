from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TagBase(BaseModel):
    """Базовая схема для тега."""

    name: str


class TagUpdate(BaseModel):
    """Схема для обновления (переименования) тега."""

    name: str


class TagPublic(TagBase):
    """Схема для публичного представления тега."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)


class TagWithCount(TagPublic):
    """
    Расширенная схема для тега, включающая количество идей,
    в которых он используется (в определенном контексте, например, в папке).
    """

    idea_count: int
