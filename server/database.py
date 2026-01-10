from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Use the existing DATABASE_URL or default to a local sqlite instance
# Ensure the DATABASE_URL is correct for the user's environment
# Database URLs
# In production (e.g. Vercel), we should use a real database via DATABASE_URL
USER_DATABASE_URL = os.environ.get("DATABASE_URL") or "sqlite:///./user_db.sqlite"
ADMIN_DATABASE_URL = os.environ.get("ADMIN_DATABASE_URL") or "sqlite:///./admin_db.sqlite"

# Handle Vercel's read-only filesystem by moving SQLite to /tmp if needed
if os.environ.get("VERCEL") and USER_DATABASE_URL.startswith("sqlite"):
    USER_DATABASE_URL = "sqlite:////tmp/user_db.sqlite"
    ADMIN_DATABASE_URL = "sqlite:////tmp/admin_db.sqlite"

# Engines
# PostgreSQL doesn't need check_same_thread
connect_args = {"check_same_thread": False} if USER_DATABASE_URL.startswith("sqlite") else {}

user_engine = create_engine(USER_DATABASE_URL, connect_args=connect_args)
admin_engine = create_engine(ADMIN_DATABASE_URL, connect_args=connect_args)

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
