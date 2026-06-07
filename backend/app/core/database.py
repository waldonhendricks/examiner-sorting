from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


def _resolve_database_url() -> str:
    raw_url = settings.DATABASE_URL.strip()
    if not raw_url or "*" in raw_url:
        return "sqlite:///./examiner.db"

    try:
        make_url(raw_url)
    except ArgumentError:
        return "sqlite:///./examiner.db"

    return raw_url


DATABASE_URL = _resolve_database_url()
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
