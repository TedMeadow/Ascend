from fastapi import APIRouter, Depends
from src.core.security import get_current_superuser
from .oauth.router import oauth_router

admin_router = APIRouter(
    prefix='/admin',
    tags=['admin'],
    dependencies=[Depends(get_current_superuser)]
)

admin_router.include_router(oauth_router)