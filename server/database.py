import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional

# MongoDB Connection URL
# Use MONGODB_URL from environment or default to local mongodb
MONGODB_URL = os.environ.get("MONGODB_URL") or "mongodb://localhost:27017"
DATABASE_NAME = os.environ.get("DATABASE_NAME") or "aerosense"

# MongoDB Client
# Add certifi to fix SSL handshake issues with Atlas
client = AsyncIOMotorClient(
    MONGODB_URL, 
    tlsCAFile=certifi.where()
)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
eco_actions_collection = db["eco_actions"]
user_actions_collection = db["user_actions"]

# Dependency
async def get_db():
    return db
