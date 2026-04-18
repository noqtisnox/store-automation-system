from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Product


initial_products = [
    Product(name="Matand Standard Rifle (1917 Pattern)", sku="WPN-M17", price=450.00, quantity=24),
    Product(name="Refined Ignition Crystal", sku="ENG-CRY-01", price=120.00, quantity=150),
    Product(name="Fortress Cog Lubricant", sku="ENG-LUB-05", price=15.50, quantity=80),
    Product(name="Steel Tribe Rations", sku="SUP-RAT-30", price=5.00, quantity=300),
    Product(name="Gunpowder Keg (Grade A)", sku="WPN-GP-01", price=45.00, quantity=60),
    Product(name="Wooden Horse", sku="TOY-WH-01", price=40.00, quantity=15),
]


def seed_data():
    create_db_and_tables()
    
    with Session(engine) as session:
        existing_item = session.exec(select(Product)).first()
        
        if not existing_item:
            print("📦 Empty database detected. Stocking the shelves...")
            for product in initial_products:
                session.add(product)
            
            session.commit()
            print("✅ Database successfully populated with initial inventory!")
        else:
            print("⚠️ Database already contains items. Skipping seed to protect existing data.")


if __name__ == "__main__":
    seed_data()
