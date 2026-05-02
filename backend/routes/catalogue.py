from db.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from models.product import Product
from sqlmodel import Session, select, SQLModel, Field
from typing import Optional

from routes.auth import User, get_current_user, require_manager


class ProductUpdate(SQLModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    quantity: Optional[int] = Field(default=None, ge=0)

router = APIRouter()


@router.get("/products", response_model=list[Product])
def get_products(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    products = session.exec(select(Product)).all()
    return products


@router.post("/products", response_model=Product)
def create_product(
    product: Product,
    session: Session = Depends(get_session),
    manager: User = Depends(require_manager),
):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=Product)
def patch_product(
    product_id: int,
    product_update: ProductUpdate,
    session: Session = Depends(get_session),
    manager: User = Depends(require_manager),
):
    # 1. Find the existing product in the DB
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Apply only the validated, provided updates
    updates = product_update.dict(exclude_unset=True)
    for key, value in updates.items():
        # Prevent id changes explicitly
        if key == "id":
            continue
        if hasattr(db_product, key):
            setattr(db_product, key, value)

    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session), manager: User = Depends(require_manager)):
    # 1. Find the product
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Delete it
    session.delete(db_product)
    session.commit()
    return {"message": "Product deleted successfully"}
