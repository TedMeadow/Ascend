from .admin.router import admin_router
from .auth.router import auth_router
from .user.router import user_router
from .tasks.router import task_router
from .calendar.router import calendar_router
from .idea_box import idea_box_router


routers = [
    auth_router,
    admin_router,
    user_router,
    task_router,
    calendar_router,
    idea_box_router
]