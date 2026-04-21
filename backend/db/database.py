from sqlmodel import Session, SQLModel, create_engine

sqlite_file_name = "store.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# check_same_thread is needed for SQLite in FastAPI
connect_args = {"check_same_thread": False}
engine = None


def get_engine():
    """Return a (cached) SQLAlchemy engine instance."""
    global engine
    if engine is None:
        engine = create_engine(sqlite_url, connect_args=connect_args)
    return engine


def create_db_and_tables():
    """Ensure all SQLModel tables are created.

    Import model modules first so their SQLModel subclasses are registered
    with SQLModel.metadata, then create tables using the current engine.
    """
    # Import model modules to register SQLModel subclasses. Support both
    # package import styles depending on where this module is executed from.
    try:
        import models.user  # noqa: F401
        import models.product  # noqa: F401
        import models.transaction  # noqa: F401
        import models.checkout_item  # noqa: F401
    except ImportError as e:
        # Surface import errors so failures are visible; do not attempt a
        # secondary import that risks double-registration of SQLModel metadata.
        raise

    SQLModel.metadata.create_all(get_engine())


def get_session():
    """Yield a session bound to the current engine."""
    with Session(get_engine()) as session:
        yield session


def dispose_engine():
    """Dispose and clear the cached engine."""
    global engine
    if engine is not None:
        engine.dispose()
        engine = None
