from fastapi import APIRouter, Depends, HTTPException, status
from src.core.security import get_current_user
from src.core.database import get_db
from src.models import User, Task, CalendarEvent
from sqlmodel import Session, select, or_, and_
from datetime import date
from .schemas import CalendarViewResponse, CalendarEventCreate, CalendarEventPublic, CalendarEventUpdate
from uuid import UUID

calendar_router = APIRouter(
    prefix='/calendar',
    tags=['calendar','events'],
    dependencies=[Depends(get_current_user)]
)


@calendar_router.get('/', response_model=CalendarViewResponse)
def get_calendar_view(start_date: date, end_date: date, 
                      current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.exec(select(Task).where(
        and_(
            Task.owner_id == current_user.id,
            Task.due_date >= start_date,
            Task.due_date <= end_date
            )
        )
    ).all()
    events = db.exec(select(CalendarEvent).where(
        and_(
            CalendarEvent.owner_id == current_user.id,
            CalendarEvent.start_time >=start_date,
            CalendarEvent.end_time <= end_date
        )
    )).all()
    return {
        'events': events,
        'tasks': tasks
    }


@calendar_router.post('/events', response_model=CalendarEventPublic, status_code=201)
def create_event(event_data: CalendarEventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = CalendarEvent.model_validate(event_data, update={'owner_id': current_user.id})
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@calendar_router.get('/events/{event_id}', response_model=CalendarEventPublic)
def get_event(event_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if not event or event.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event

@calendar_router.put('/events/{event_id}', response_model=CalendarEventPublic)
def update_event(event_id: UUID, event_in: CalendarEventUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if not event or event.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    event_data = event_in.model_dump()
    for key, value in event_data.items():
        if value:
            setattr(event, key, value)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@calendar_router.delete('/events/{event_id}', status_code=204)
def delete_event(event_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if not event or event.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    db.delete(event)
    db.commit()