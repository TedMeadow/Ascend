from fastapi import APIRouter, Depends, HTTPException, status
from src.core.security import get_current_user
from src.core.database import get_db
from src.models import User, Tag, Idea, IdeaTagLink
from sqlmodel import Session, select, desc, func
from typing import List
from uuid import UUID
from .schemas import TagPublic, TagUpdate, TagWithCount

tags_router = APIRouter(
    prefix="/tags", tags=["Idea Box"], dependencies=[Depends(get_current_user)]
)


@tags_router.get("/", response_model=List[TagWithCount])
async def get_tags(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    statement = (
        select(Tag, func.count(Idea.id).label("idea_count"))
        .join(IdeaTagLink, Tag.id == IdeaTagLink.tag_id)
        .join(Idea, IdeaTagLink.idea_id == Idea.id)
        .where(Idea.owner_id == current_user.id)
        .group_by(Tag.id)
        .order_by(desc("idea_count"), Tag.name)
    )
    results = db.exec(statement).all()
    tags_with_counts = []
    for tag, count in results:
        update_data = tag.model_dump()
        update_data["idea_count"] = count
        tag_data = TagWithCount.model_validate(update_data)
        tags_with_counts.append(tag_data)

    return tags_with_counts


@tags_router.put("/{tag_id}", response_model=TagPublic)
async def rename_tag(
    tag_id: UUID,
    tag_in: TagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tag = db.get(Tag, tag_id)
    if not tag or tag.owner_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )
    tag.name = tag_in.name
    db.add(tag)
    db.commit()
    db.refresh()
    return tag


@tags_router.delete("/{tag_id}", status_code=204)
async def delete_tag(
    tag_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tag = db.get(Tag, tag_id)
    if not tag or tag.owner_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )
    db.delete(tag)
    db.commit()
