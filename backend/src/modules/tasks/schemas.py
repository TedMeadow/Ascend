from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from src.models.task import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM # Добавляем в базовую схему
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: TaskPriority = TaskPriority.MEDIUM # Добавляем в базовую схему
    due_date: Optional[datetime] = None


class TaskPublic(TaskBase):
    id: UUID
