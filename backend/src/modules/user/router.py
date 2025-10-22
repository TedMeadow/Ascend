from fastapi import APIRouter, Depends
from src.core.security import get_current_user
from src.models.user import User
from .schemas import UserPublic

user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.get("/me", response_model=UserPublic)
async def user_info(user: User = Depends(get_current_user)):
    return user
