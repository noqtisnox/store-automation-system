from database import get_session
from fastapi import APIRouter, Depends, HTTPException
from models import CheckoutItem, Product, Transaction
from sqlmodel import Session, select

router = APIRouter()


@router.post("/checkout")
def process_checkout(
    items: list[CheckoutItem], session: Session = Depends(get_session)
):
    total_amount = 0.0
    summary_parts = []

    # 1. Loop through items, check stock, and deduct
    for item in items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(
                status_code=404, detail=f"Product ID {item.product_id} not found"
            )

        if product.quantity < item.quantity_bought:
            raise HTTPException(
                status_code=400, detail=f"Not enough stock for {product.name}"
            )

        # Deduct inventory
        product.quantity -= item.quantity_bought
        session.add(product)

        # Calculate totals and build summary for history
        total_amount += product.price * item.quantity_bought
        summary_parts.append(f"{item.quantity_bought}x {product.name}")

    # 2. Save the transaction to history
    new_transaction = Transaction(
        total_amount=total_amount, items_summary=", ".join(summary_parts)
    )
    session.add(new_transaction)

    # 3. Commit everything to the database at once
    session.commit()

    return {"message": "Checkout successful", "transaction_id": new_transaction.id}


@router.get("/history", response_model=list[Transaction])
def get_transaction_history(session: Session = Depends(get_session)):
    # Fetch all history, newest first
    transactions = session.exec(
        select(Transaction).order_by(Transaction.timestamp.desc())
    ).all()
    return transactions
