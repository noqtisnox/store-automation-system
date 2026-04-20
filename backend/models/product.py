from typing import Optional
from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    sku: str = Field(index=True, unique=True)  # Stock Keeping Unit (Артикул)
    price: float
    quantity: int = Field(default=0)
