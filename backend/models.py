from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    sku: str = Field(index=True, unique=True)  # Stock Keeping Unit (Артикул)
    price: float
    quantity: int = Field(default=0)


class Transaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    total_amount: float
    items_summary: (
        str  # We'll just store a string like "2x Apple, 1x Milk" to keep it simple
    )
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CheckoutItem(SQLModel):
    product_id: int
    quantity_bought: int
