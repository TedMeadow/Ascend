from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

# Импортируем публичную схему задачи, чтобы вложить ее в ответ
from src.modules.tasks.schemas import TaskPublic

class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    task_id: Optional[UUID] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    task_id: Optional[UUID] = None

class CalendarEventPublic(CalendarEventBase):
    id: UUID

# Схема для главного ответа - "вида" календаря
class CalendarViewResponse(BaseModel):
    events: List[CalendarEventPublic]
    tasks: List[TaskPublic] # Задачи с дедлайнами в этом диапазоне