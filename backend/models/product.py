from typing import Optional

from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    sku: str = Field(index=True, unique=True)  # Stock Keeping Unit (Артикул)
    # Store price in integer minor-units (cents) to avoid floating point issues
    price_cents: int = Field(gt=0)
    quantity: int = Field(default=0, ge=0)
