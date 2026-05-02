from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    total_amount: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    cashier: Optional["User"] = Relationship(back_populates="transactions")

    items: List["TransactionItem"] = Relationship(back_populates="transaction")
