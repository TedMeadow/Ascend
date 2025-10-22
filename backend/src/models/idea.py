# Этот файл централизует все модели данных для модуля Idea Box.
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlalchemy import TEXT, Column
from sqlmodel import Field, Relationship, SQLModel
from src.core.utils import get_current_time

if TYPE_CHECKING:
    from .task import Task
    from .user import User


class IdeaFolder(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    icon: Optional[str] = None

    owner_id: UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="idea_folders")

    ideas: List["Idea"] = Relationship(back_populates="folder")


class IdeaType(str, Enum):
    TEXT = "text"
    LINK = "link"
    IMAGE = "image"


class LinkMetadata(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    url: str = Field(index=True, unique=True)
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    fetched_at: datetime = Field(default_factory=get_current_time)


class IdeaTagLink(SQLModel, table=True):
    idea_id: Optional[UUID] = Field(
        default=None, foreign_key="idea.id", primary_key=True
    )
    tag_id: Optional[UUID] = Field(default=None, foreign_key="tag.id", primary_key=True)


class Tag(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)

    owner_id: UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="tags")

    ideas: List["Idea"] = Relationship(back_populates="tags", link_model=IdeaTagLink)


class Idea(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    idea_type: IdeaType = Field(default=IdeaType.TEXT)
    title: Optional[str] = Field(default=None, index=True)
    content: Optional[str] = Field(default=None, sa_column=Column(TEXT))
    url: Optional[str] = Field(default=None)
    is_pinned: bool = Field(default=False, index=True)

    created_at: datetime = Field(default_factory=get_current_time)
    updated_at: datetime = Field(
        default_factory=get_current_time,
        sa_column_kwargs={"onupdate": get_current_time},
    )

    owner_id: UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="ideas")

    folder_id: UUID = Field(foreign_key="ideafolder.id")
    folder: "IdeaFolder" = Relationship(back_populates="ideas")

    link_metadata_id: Optional[UUID] = Field(
        default=None, foreign_key="linkmetadata.id"
    )
    link_metadata: Optional[LinkMetadata] = Relationship()

    generated_task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")
    generated_task: Optional["Task"] = Relationship(back_populates="source_idea")

    tags: List["Tag"] = Relationship(back_populates="ideas", link_model=IdeaTagLink)
