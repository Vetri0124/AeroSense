from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Use the existing DATABASE_URL or default to a local sqlite instance
# Ensure the DATABASE_URL is correct for the user's environment
# Database URLs
USER_DATABASE_URL = "sqlite:///./user_db.sqlite"
ADMIN_DATABASE_URL = "sqlite:///./admin_db.sqlite"

# Engines
user_engine = create_engine(USER_DATABASE_URL, connect_args={"check_same_thread": False})
admin_engine = create_engine(ADMIN_DATABASE_URL, connect_args={"check_same_thread": False})

# Sessions
UserSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)
AdminSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=admin_engine)

Base = declarative_base()

# Dependencies
def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_admin_db():
    db = AdminSessionLocal()
    try:
        yield db
    finally:
        db.close()

# For backwards compatibility with get_db
def get_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()
