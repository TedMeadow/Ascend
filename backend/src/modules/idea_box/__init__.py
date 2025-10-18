from fastapi import APIRouter
from .folders.router import folders_router
from .ideas.router import ideas_router
from .tags.router import tags_router

# Главный роутер для всего функционала "Idea Box"
idea_box_router = APIRouter(
    prefix="/idea-box",
    tags=["Idea Box"],
    
)

# Подключаем к нему роутеры из под-модулей.
# Их префиксы будут добавлены к /idea-box.
# Например, /idea-box/folders/
idea_box_router.include_router(folders_router)
idea_box_router.include_router(ideas_router)
idea_box_router.include_router(tags_router)