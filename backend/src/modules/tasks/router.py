from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlmodel import Session, select
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.task import Task
from .schemas import TaskBase, TaskCreate, TaskPublic, TaskStatus, TaskUpdate


task_router = APIRouter(
    prefix='/tasks',
    tags = ['tasks']
)


@task_router.post('/', response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate | None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print('im in tasks')
    if not task_data:
        raise HTTPException(400, 'There is no task info')
    task = Task.model_validate(task_data, update={'owner_id': current_user.id})
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@task_router.get('/' , response_model=List[TaskPublic])
async def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user.tasks

@task_router.get('/{task_id}')
async def get_task(task_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@task_router.put('/{task_id}', response_model=TaskPublic)
async def update_task(task_id: UUID, task_in: TaskUpdate,current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    task_data = task_in.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        if value:
            setattr(task, key, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@task_router.delete('/{task_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task or task.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()

    


