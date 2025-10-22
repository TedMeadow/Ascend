from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.core.security import get_current_user
from src.core.database import get_db
from src.models import User, IdeaFolder, Tag, IdeaTagLink, Idea
from sqlmodel import Session, select, desc, func
from uuid import UUID
from .schemas import FolderCreate, FolderPublic, FolderUpdate
from ..tags.schemas import TagWithCount

folders_router = APIRouter(
    prefix="/folders", tags=["Idea Box"], dependencies=[Depends(get_current_user)]
)


@folders_router.post("/", response_model=FolderPublic, status_code=201)
async def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    folder = IdeaFolder.model_validate(
        folder_data, update={"owner_id": current_user.id}
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@folders_router.get("/", response_model=List[FolderPublic])
async def get_user_folders(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    folders = current_user.idea_folders
    return folders


@folders_router.put("/{folder_id}", response_model=FolderPublic)
async def update_folder(
    folder_id: UUID,
    folder_in: FolderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    folder = db.get(IdeaFolder, folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="IdeaFolder not found"
        )
    folder_data = folder_in.model_dump()
    for key, value in folder_data.items():
        if value:
            setattr(folder, key, value)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


@folders_router.delete("/{folder_id}", status_code=204)
def delete_event(
    folder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    folder = db.get(IdeaFolder, folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="IdeaFolder not found"
        )
    db.delete(folder)
    db.commit()


@folders_router.get("/{folder_id}/tags", response_model=List[TagWithCount])
def get_tags_in_folder(
    folder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    folder = db.get(IdeaFolder, folder_id)
    if not folder or folder.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found"
        )

    statement = (
        select(Tag, func.count(Idea.id).label("idea_count"))
        .join(IdeaTagLink, Tag.id == IdeaTagLink.tag_id)
        .join(Idea, IdeaTagLink.idea_id == Idea.id)
        .where(Idea.folder_id == folder_id)
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
