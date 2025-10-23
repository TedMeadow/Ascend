from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlmodel import Session, select
from sqlalchemy import or_, desc

from src.core.database import get_db
from src.core.security import get_current_user
from src.models import User, Idea, Tag, IdeaFolder, Task
from src.models.idea import IdeaType  # Импортируем Enum
from src.modules.tasks.schemas import TaskPublic  # Для ответа при продвижении
from ..services.link_preview import fetch_and_save_metadata

from .schemas import IdeaCreate, IdeaPublic, IdeaUpdate, IdeaPromoteToTask

ideas_router = APIRouter(
    prefix="/ideas", tags=["Idea Box"], dependencies=[Depends(get_current_user)]
)


@ideas_router.post("/", response_model=IdeaPublic, status_code=201)
async def create_idea(
    idea_in: IdeaCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    folder = db.get(IdeaFolder, idea_in.folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cannot create Idea in this folder",
        )
    tags_to_assign = []
    for tag_name in idea_in.tags:
        tag_statement = select(Tag).where(
            Tag.name == tag_name, Tag.owner_id == current_user.id
        )
        tag = db.exec(tag_statement).first()
        if not tag:
            tag = Tag(name=tag_name, owner_id=current_user.id)
            db.add(tag)
        tags_to_assign.append(tag)
    idea = Idea.model_validate(
        idea_in, update={"owner_id": current_user.id, "tags": tags_to_assign}
    )
    if idea.idea_type == IdeaType.LINK:
        background_tasks.add_task(
            fetch_and_save_metadata, idea_id=idea.id, url=idea.url
        )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@ideas_router.get("/", response_model=List[IdeaPublic])
def get_ideas(
    folder_id: Optional[UUID] = None,
    tags: Optional[List[str]] = Query(None),
    q: Optional[str] = None,
    pinned: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Получает список идей с мощной фильтрацией."""
    statement = select(Idea).where(Idea.owner_id == current_user.id)

    if folder_id:
        statement = statement.where(Idea.folder_id == folder_id)

    if tags:
        # Фильтр идей, которые содержат ЛЮБОЙ из перечисленных тегов
        statement = statement.join(Idea.tags).where(Tag.name.in_(tags))
        # ✅ ИСПРАВЛЕНИЕ: Применяем .distinct() после JOIN
        statement = statement.distinct()

    if q:
        # Поиск без учета регистра по названию и содержанию
        search_query = f"%{q}%"
        statement = statement.where(
            or_(Idea.title.ilike(search_query), Idea.content.ilike(search_query))
        )

    if pinned is not None:
        statement = statement.where(Idea.is_pinned == pinned)

    # Сортировка: сначала закрепленные, затем по дате обновления
    statement = statement.order_by(desc(Idea.is_pinned), desc(Idea.updated_at))

    results = db.exec(statement).all()
    return results


@ideas_router.get("/{idea_id}", response_model=IdeaPublic)
def get_idea(
    idea_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Получает одну идею по ID."""
    statement = select(Idea).where(Idea.id == idea_id, Idea.owner_id == current_user.id)
    idea = db.exec(statement).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
        )
    return idea


@ideas_router.put("/{idea_id}", response_model=IdeaPublic)
def update_idea(
    idea_id: UUID,
    idea_in: IdeaUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Обновляет идею, включая возможность перемещения и смены тегов."""
    db_idea = db.get(Idea, idea_id)
    if not db_idea or db_idea.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
        )

    update_data = idea_in.dict(exclude_unset=True)

    # Обрабатываем теги отдельно
    if "tags" in update_data:
        tag_names = update_data.pop("tags")
        tags_to_assign = []
        for tag_name in tag_names:
            tag = db.exec(
                select(Tag).where(Tag.name == tag_name, Tag.owner_id == current_user.id)
            ).first()
            if not tag:
                tag = Tag(name=tag_name, owner_id=current_user.id)
            tags_to_assign.append(tag)
        db_idea.tags = tags_to_assign

    # Обновляем остальные поля
    for key, value in update_data.items():
        setattr(db_idea, key, value)

    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea


@ideas_router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(
    idea_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Удаляет идею."""
    idea = db.get(Idea, idea_id)
    if idea and idea.owner_id == current_user.id:
        db.delete(idea)
        db.commit()
    else:
        # Возвращаем 404, даже если идея существует, но принадлежит другому пользователю
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
        )


@ideas_router.post(
    "/{idea_id}/promote-to-task",
    response_model=TaskPublic,
    status_code=status.HTTP_201_CREATED,
)
def promote_idea_to_task(
    idea_id: UUID,
    promote_in: IdeaPromoteToTask,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Создает новую Задачу на основе существующей Идеи."""
    idea = db.get(Idea, idea_id)
    if not idea or idea.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found"
        )

    if idea.generated_task_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This idea has already been promoted to a task",
        )

    new_task = Task(
        title=promote_in.task_title,
        description=promote_in.task_description or idea.content,
        owner_id=current_user.id,
    )

    # Связываем идею и задачу
    idea.generated_task = new_task

    db.add(new_task)
    db.add(idea)
    db.commit()
    db.refresh(new_task)
    return new_task
