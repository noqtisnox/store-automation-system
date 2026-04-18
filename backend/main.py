from contextlib import asynccontextmanager

from database import create_db_and_tables
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import catalogue, pos


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
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
