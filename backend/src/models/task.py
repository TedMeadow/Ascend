# src/models/task.py
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel
from .user import User

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class Task(SQLModel, table=True):
    id: Optional[UUID] = Field(primary_key=True, default_factory=uuid4)
    title: str = Field(index=True)
    description: Optional[str] = None
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: Optional[datetime] = None
    
    owner_id: UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="tasks")
    source_idea: Optional["Idea"] = Relationship(back_populates="generated_task")
