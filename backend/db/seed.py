import os

from dotenv import load_dotenv
from models import Product
from models.user import User
from routes.auth import get_password_hash
from sqlmodel import Session, select

from db.database import create_db_and_tables, get_engine

load_dotenv()

initial_products = [
    Product(
        name="Matand Standard Rifle (1917 Pattern)",
        sku="WPN-M17",
        price_cents=45000,
        quantity=24,
    ),
    Product(
        name="Refined Ignition Crystal", sku="ENG-CRY-01", price_cents=12000, quantity=150
    ),
    Product(name="Fortress Cog Lubricant", sku="ENG-LUB-05", price_cents=1550, quantity=80),
    Product(name="Steel Tribe Rations", sku="SUP-RAT-30", price_cents=500, quantity=300),
    Product(name="Gunpowder Keg (Grade A)", sku="WPN-GP-01", price_cents=4500, quantity=60),
    Product(name="Wooden Horse", sku="TOY-WH-01", price_cents=4000, quantity=15),
]


def seed_data():
    create_db_and_tables()

    engine = get_engine()

    with Session(engine) as session:
        existing_item = session.exec(select(Product)).first()

        if not existing_item:
            print("📦 Empty database detected. Stocking the shelves...")
            for product in initial_products:
                session.add(product)

            session.commit()
            print("✅ Database successfully populated with initial inventory!")
        else:
            print(
                "⚠️ Database already contains items. Skipping seed to protect existing data."
            )

        # Seed admin if not exists
        admin_password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD")
        if admin_password:
            if not session.exec(select(User)).first():
                admin = User(
                    username="admin",
                    password_hash=get_password_hash(admin_password),
                    role="manager",
                )
                session.add(admin)
                session.commit()
        else:
            pass


if __name__ == "__main__":
    seed_data()
