from fastapi import APIRouter, Depends
from sqlmodel import Session
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from .schemas import UserPublic, DashboardLayoutUpdate

user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.get("/me", response_model=UserPublic)
def user_info(user: User = Depends(get_current_user)):
    return user


@user_router.patch("/me/dashboard-layout", response_model=UserPublic)
def update_dashboard_layout(
    body: DashboardLayoutUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.dashboard_layout = body.layout
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
