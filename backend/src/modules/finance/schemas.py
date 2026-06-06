from datetime import datetime
from typing import Dict, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel

from src.models.finance import TransactionType


class TransactionCreate(BaseModel):
    type: TransactionType
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionPublic(BaseModel):
    id: UUID
    type: TransactionType
    amount: float
    category: str
    description: Optional[str] = None
    date: datetime


class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    monthly_limit: Optional[float] = None


class BudgetPublic(BaseModel):
    id: UUID
    category: str
    monthly_limit: float


class FinanceSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    by_category: Dict[str, float]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    include_context: bool = True
