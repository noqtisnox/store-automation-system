from sqlmodel import SQLModel, Field


class CheckoutItem(SQLModel):
    product_id: int = Field(gt=0)
    quantity_bought: int = Field(gt=0)
