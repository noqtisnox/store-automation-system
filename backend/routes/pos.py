from db.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from models import CheckoutItem, Product, Transaction
from sqlmodel import Session, select
from sqlalchemy import update as sa_update

router = APIRouter()


@router.post("/checkout")
def process_checkout(
    items: list[CheckoutItem], session: Session = Depends(get_session)
):
    # Work in integer minor-units (cents)
    total_cents = 0
    summary_parts = []

    # 1. Loop through items and perform atomic conditional updates
    for item in items:
        # 1a. Ensure the product exists and read name/price for summary
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(
                status_code=404, detail=f"Product ID {item.product_id} not found"
            )

        # 1b. Attempt an atomic update that only succeeds if enough quantity remains
        stmt = (
            sa_update(Product)
            .where(Product.id == item.product_id, Product.quantity >= item.quantity_bought)
            .values(quantity=(Product.quantity - item.quantity_bought))
        )

        result = session.exec(stmt)
        # If no rows were updated, there wasn't enough stock
        if result.rowcount == 0:
            raise HTTPException(
                status_code=400, detail=f"Not enough stock for {product.name}"
            )

        # Calculate totals and build summary for history (use cents)
        total_cents += product.price_cents * item.quantity_bought
        summary_parts.append(f"{item.quantity_bought}x {product.name}")

    # 2. Save the transaction to history
    new_transaction = Transaction(
        total_amount_cents=total_cents, items_summary=", ".join(summary_parts)
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
