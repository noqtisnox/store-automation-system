from typing import List

from db.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from models import Product, Transaction, TransactionItem
from pydantic import BaseModel
from sqlmodel import Session, select

from routes.auth import User, get_current_user  # Assuming this is your auth import

router = APIRouter()


# Define what the Vue frontend is sending us
class CartItem(BaseModel):
    product_id: int
    quantity_bought: int


@router.post("/checkout")
def process_checkout(
    payload: List[CartItem],
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # 1. Create the empty Transaction first so we get an ID
    new_transaction = Transaction(user_id=current_user.id, total_amount=0.0)
    session.add(new_transaction)
    session.commit()
    session.refresh(new_transaction)

    total = 0.0

    # 2. Process each item in the cart
    for item in payload:
        product = session.get(Product, item.product_id)

        if not product or product.quantity < item.quantity_bought:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid stock for Product ID {item.product_id}",
            )

        # Deduct stock
        product.quantity -= item.quantity_bought
        session.add(product)

        # Create the Line Item
        line_item = TransactionItem(
            transaction_id=new_transaction.id,
            product_id=product.id,
            quantity=item.quantity_bought,
            price_at_sale=product.price,
        )
        session.add(line_item)

        # Add to total
        total += product.price * item.quantity_bought

    # 3. Update the final total and save everything
    new_transaction.total_amount = total
    session.add(new_transaction)
    session.commit()

    return {"transaction_id": new_transaction.id, "message": "Checkout successful"}


@router.get("/history", response_model=list[Transaction])
def get_transaction_history(session: Session = Depends(get_session)):
    # Fetch all history, newest first
    transactions = session.exec(
        select(Transaction).order_by(Transaction.timestamp.desc())
    ).all()
    return transactions
