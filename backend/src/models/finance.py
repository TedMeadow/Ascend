from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

from src.core.utils import get_current_time

if TYPE_CHECKING:
    from .user import User


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Transaction(SQLModel, table=True):
    id: Optional[UUID] = Field(primary_key=True, default_factory=uuid4)
    type: TransactionType
    amount: float
    category: str
    description: Optional[str] = None
    date: datetime = Field(default_factory=get_current_time)

    owner_id: UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="transactions")


class Budget(SQLModel, table=True):
    id: Optional[UUID] = Field(primary_key=True, default_factory=uuid4)
    category: str = Field(index=True)
    monthly_limit: float

    owner_id: UUID = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="budgets")
