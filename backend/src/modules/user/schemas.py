from typing import Any, List, Optional
from pydantic import BaseModel


class UserPublic(BaseModel):
    username: str
    email: str
    dashboard_layout: Optional[List[Any]] = None


class DashboardLayoutUpdate(BaseModel):
    layout: List[Any]
