"""
database.py
-----------
Sets up the connection to PostgreSQL.

Terms:
- Database = organized storage (like Excel, but for apps)
- Engine = the "phone line" from Python to Postgres
- Session = one temporary conversation with the database
- ORM (Object-Relational Mapper) = write Python classes instead of raw SQL
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

# SQLite is a beginner-friendly database stored in a single file.
# Postgres is what real products often use — we support both via DATABASE_URL.
connect_args = {}
if settings.database_url.startswith("sqlite"):
    # FastAPI can use the DB from different threads; SQLite needs this flag.
    connect_args = {"check_same_thread": False}

# create_engine opens the connection(s) to the database
engine = create_engine(settings.database_url, connect_args=connect_args)

# sessionmaker = factory that creates Session objects on demand
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All database table models will inherit from this Base class."""

    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI "dependency": gives each request its own DB session,
    then closes it when the request finishes.

    Think: borrow a library book (session), use it, return it.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
