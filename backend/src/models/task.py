# src/models/task.py
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .idea import Idea
    from .user import User


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(SQLModel, table=True):
    id: Optional[UUID] = Field(primary_key=True, default_factory=uuid4)
    title: str = Field(index=True)
    description: Optional[str] = None
    status: TaskStatus = Field(default=TaskStatus.TODO)
    priority: TaskPriority = Field(
        default=TaskPriority.MEDIUM
    )  # По умолчанию - средний
    due_date: Optional[datetime] = None

    owner_id: UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="tasks")
    source_idea: Optional["Idea"] = Relationship(back_populates="generated_task")
