from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sku: str = Field(unique=True, index=True)
    name: str
    price: float
    quantity: int

    transaction_items: List["TransactionItem"] = Relationship(back_populates="product")
