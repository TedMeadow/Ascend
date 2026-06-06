import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.core.config import settings
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.finance import Budget, Transaction, TransactionType
from src.models.user import User

from .schemas import (
    BudgetCreate,
    BudgetPublic,
    BudgetUpdate,
    ChatRequest,
    FinanceSummary,
    TransactionCreate,
    TransactionPublic,
    TransactionUpdate,
)

logger = logging.getLogger(__name__)

finance_router = APIRouter(prefix="/finance", tags=["finance"])

# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------


@finance_router.post(
    "/transactions",
    response_model=TransactionPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = transaction_data.model_dump(exclude_unset=True)
    transaction = Transaction(**data, owner_id=current_user.id)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@finance_router.get("/transactions", response_model=List[TransactionPublic])
def list_transactions(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = select(Transaction).where(Transaction.owner_id == current_user.id)

    if month is not None and year is not None:
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        query = query.where(Transaction.date >= start).where(Transaction.date < end)
    elif month is not None or year is not None:
        now = datetime.now(timezone.utc)
        resolved_year = year if year is not None else now.year
        resolved_month = month if month is not None else now.month
        start = datetime(resolved_year, resolved_month, 1, tzinfo=timezone.utc)
        if resolved_month == 12:
            end = datetime(resolved_year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(resolved_year, resolved_month + 1, 1, tzinfo=timezone.utc)
        query = query.where(Transaction.date >= start).where(Transaction.date < end)

    return db.exec(query).all()


@finance_router.get("/transactions/{transaction_id}", response_model=TransactionPublic)
def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction or transaction.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    return transaction


@finance_router.put("/transactions/{transaction_id}", response_model=TransactionPublic)
def update_transaction(
    transaction_id: UUID,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction or transaction.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    data = transaction_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(transaction, key, value)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@finance_router.delete(
    "/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction or transaction.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    db.delete(transaction)
    db.commit()


# ---------------------------------------------------------------------------
# Budgets
# ---------------------------------------------------------------------------


@finance_router.post(
    "/budgets", response_model=BudgetPublic, status_code=status.HTTP_201_CREATED
)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = Budget(**budget_data.model_dump(), owner_id=current_user.id)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@finance_router.get("/budgets", response_model=List[BudgetPublic])
def list_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.exec(select(Budget).where(Budget.owner_id == current_user.id)).all()


@finance_router.put("/budgets/{budget_id}", response_model=BudgetPublic)
def update_budget(
    budget_id: UUID,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.get(Budget, budget_id)
    if not budget or budget.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
        )
    data = budget_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(budget, key, value)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@finance_router.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.get(Budget, budget_id)
    if not budget or budget.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found"
        )
    db.delete(budget)
    db.commit()


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------


@finance_router.get("/summary", response_model=FinanceSummary)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    if now.month == 12:
        end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)

    transactions = db.exec(
        select(Transaction)
        .where(Transaction.owner_id == current_user.id)
        .where(Transaction.date >= start)
        .where(Transaction.date < end)
    ).all()

    total_income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
    total_expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
    balance = total_income - total_expenses

    by_category: dict[str, float] = {}
    for t in transactions:
        if t.type == TransactionType.EXPENSE:
            by_category[t.category] = by_category.get(t.category, 0.0) + t.amount

    return FinanceSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=balance,
        by_category=by_category,
    )


# ---------------------------------------------------------------------------
# AI Chat
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "You are a personal financial assistant for Ascend app. "
    "Help users analyze spending, create budgets, and improve financial health. "
    "Be concise and practical. When financial data is provided, reference it specifically."
)


@finance_router.post("/ai/chat")
def ai_chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = [{"role": "system", "content": _SYSTEM_PROMPT}]

    if chat_request.include_context:
        now = datetime.now(timezone.utc)
        start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        if now.month == 12:
            end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)

        transactions = db.exec(
            select(Transaction)
            .where(Transaction.owner_id == current_user.id)
            .where(Transaction.date >= start)
            .where(Transaction.date < end)
        ).all()

        if transactions:
            total_income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
            total_expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
            by_category: dict[str, float] = {}
            for t in transactions:
                if t.type == TransactionType.EXPENSE:
                    by_category[t.category] = by_category.get(t.category, 0.0) + t.amount

            category_lines = "\n".join(
                f"  - {cat}: ${amt:.2f}" for cat, amt in by_category.items()
            )
            context = (
                f"User's current month financial summary:\n"
                f"  Total income: ${total_income:.2f}\n"
                f"  Total expenses: ${total_expenses:.2f}\n"
                f"  Balance: ${total_income - total_expenses:.2f}\n"
                f"  Expenses by category:\n{category_lines}"
            )
            messages.append({"role": "system", "content": context})

    for msg in chat_request.messages:
        messages.append({"role": msg.role, "content": msg.content})

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{settings.LLM_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
                json={"model": settings.LLM_MODEL, "messages": messages},
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        logger.warning("LLM service unavailable: %s", exc)
        content = (
            "I'm unable to connect to the AI service right now. "
            "Please ensure the local LLM is running and try again."
        )
    except Exception as exc:
        logger.warning("LLM request failed: %s", exc)
        content = (
            "Something went wrong while processing your request. "
            "Please try again later."
        )

    return {"role": "assistant", "content": content}
