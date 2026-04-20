from sqlmodel import Session, SQLModel, create_engine

sqlite_file_name = "store.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# check_same_thread is needed for SQLite in FastAPI
connect_args = {"check_same_thread": False}
engine = None


def get_engine():
    global engine
    if engine is None:
        engine = create_engine(sqlite_url, connect_args=connect_args)
    return engine


def create_db_and_tables():
    SQLModel.metadata.create_all(get_engine())


def get_session():
    with Session(get_engine()) as session:
        yield session


def dispose_engine():
    global engine
    if engine is not None:
        engine.dispose()
        engine = None
def create_db_and_tables():
    SQLModel.metadata.create_all(get_engine())


def get_session():
    with Session(get_engine()) as session:
        yield session


def dispose_engine():
    global engine
    if engine is not None:
        engine.dispose()
        engine = None
