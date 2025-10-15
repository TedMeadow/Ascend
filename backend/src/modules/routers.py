from .admin.router import admin_router
from .auth.router import auth_router
from .user.router import user_router


routers = [
    auth_router,
    admin_router,
    user_router
]