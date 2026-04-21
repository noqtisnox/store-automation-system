from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Store total in minor-units (cents)
    total_amount_cents: int = Field(ge=0)
    items_summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
