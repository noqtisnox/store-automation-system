from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class TransactionItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quantity: int
    price_at_sale: float

    transaction_id: int = Field(foreign_key="transaction.id")
    transaction: "Transaction" = Relationship(back_populates="items")

    product_id: int = Field(foreign_key="product.id")
    product: "Product" = Relationship(back_populates="transaction_items")
