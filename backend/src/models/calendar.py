from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

from .user import User
from .task import Task

class CalendarEvent(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = None
    
    start_time: datetime = Field(index=True)
    end_time: datetime = Field(index=True)
    
    owner_id: UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="calendar_events")
    
    # Не каждое событие - это задача, поэтому task_id может быть NULL
    task_id: Optional[UUID] = Field(default=None, foreign_key="task.id")
    task: Optional[Task] = Relationship()