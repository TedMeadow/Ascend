from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from typing import Optional, List



class User(SQLModel, table = True):
    id: Optional[UUID] = Field(primary_key=True, default_factory=uuid4)
    hashed_password: Optional[str]
    username: str = Field(index=True, unique=True)
    is_active: bool = True
    email: str = Field(unique=True, index=True)
    is_superuser: bool = Field(default=False)


    oauth_accounts: List['OAuthAccount'] = Relationship(back_populates='user')
    tasks: List["Task"] = Relationship(back_populates="owner")
    calendar_events: List["CalendarEvent"] = Relationship(back_populates="owner")
    idea_folders: List["IdeaFolder"] = Relationship(back_populates="owner")
    ideas: List["Idea"] = Relationship(back_populates="owner")
    tags: List["Tag"] = Relationship(back_populates="owner")


class OAuthAccount(SQLModel, table=True):
    id: Optional[UUID] = Field(primary_key=True, default=None)
    provider: str
    account_id: str
    user_id: UUID = Field(foreign_key="user.id")

    user: "User" = Relationship(back_populates='oauth_accounts')

