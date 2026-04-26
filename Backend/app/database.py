from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # reads your .env file

DATABASE_URL = os.getenv("DATABASE_URL")

# SQLite needs this extra argument, PostgreSQL/MySQL don't
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite only
)

# Each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models inherit from this
Base = declarative_base()

# This function is used in every route to get DB access
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()