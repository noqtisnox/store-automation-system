import os
from contextlib import asynccontextmanager

from db.database import create_db_and_tables
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, catalogue, pos
from routes.auth import User, get_password_hash
from sqlmodel import Session, select

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Seed a default manager if none exists
    from db.database import engine

    with Session(engine) as session:
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
    yield


app = FastAPI(lifespan=lifespan, title="Store POS API")

origins = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://0.0.0.0:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalogue.router, tags=["Catalogue"])
app.include_router(pos.router, tags=["Point of Sale"])
app.include_router(auth.router, tags=["Authentication"])
