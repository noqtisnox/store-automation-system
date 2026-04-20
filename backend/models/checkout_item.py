from sqlmodel import SQLModel


class CheckoutItem(SQLModel):
    product_id: int
    quantity_bought: int
