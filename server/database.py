from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Use the existing DATABASE_URL or default to a local sqlite instance
# Ensure the DATABASE_URL is correct for the user's environment
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./aerosense_db.sqlite")

# SQLAlchemy setup
# check_same_thread is needed for SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
