from motor.motor_asyncio import AsyncIOMotorDatabase
import models, schemas
from auth import get_password_hash, verify_password
from datetime import datetime
import uuid

# Helper to convert MongoDB document to Pydantic-friendly dict
def fix_id(doc):
    if doc and "_id" in doc:
        pass 
    return doc

# Users
async def get_user(db: AsyncIOMotorDatabase, user_id: str):
    return await db["users"].find_one({"id": user_id})

async def get_user_by_username(db: AsyncIOMotorDatabase, username: str):
    return await db["users"].find_one({"username": username})

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str):
    return await db["users"].find_one({"email": email})

async def create_user(db: AsyncIOMotorDatabase, user: schemas.UserRegister, role: str = "user"):
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "id": models.generate_uuid(),
        "username": user.username,
        "email": user.email,
        "password_hash": hashed_password,
        "full_name": user.full_name,
        "avatar_url": None,
        "is_active": 1,
        "role": role,
        "created_at": datetime.utcnow(),
        "settings": {
            "selected_city": user.city,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "preferences": {},
            "updated_at": datetime.utcnow()
        },
        "favorite_locations": [],
        "simulations": []
    }
    await db["users"].insert_one(user_dict)
    return user_dict

async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    if user.get("is_active") != 1:
        return None
    return user

async def get_users(db: AsyncIOMotorDatabase):
    cursor = db["users"].find({})
    return await cursor.to_list(length=100)

# Unified Admin Helpers (Now just filters on users)
async def get_admin_by_username(db: AsyncIOMotorDatabase, username: str):
    return await db["users"].find_one({"username": username, "role": "admin"})

async def create_admin(db: AsyncIOMotorDatabase, admin: schemas.AdminLogin):
    # Admins are created using registration logic but with admin role
    hashed_password = get_password_hash(admin.password)
    admin_dict = {
        "id": models.generate_uuid(),
        "username": admin.username,
        "email": f"{admin.username}@aerosense.admin", # Internal placeholder
        "password_hash": hashed_password,
        "role": "admin",
        "is_active": 1,
        "created_at": datetime.utcnow()
    }
    await db["users"].insert_one(admin_dict)
    return admin_dict

# User Settings (NOW NESTED)
async def get_user_settings(db: AsyncIOMotorDatabase, user_id: str):
    user = await get_user(db, user_id)
    return user.get("settings") if user else None

async def update_user_settings(db: AsyncIOMotorDatabase, user_id: str, settings: schemas.UserSettingsCreate):
    settings_dict = settings.dict()
    settings_dict["updated_at"] = datetime.utcnow()
    
    await db["users"].update_one(
        {"id": user_id},
        {"$set": {"settings": settings_dict}}
    )
    return settings_dict

# Saved Simulations (NOW NESTED)
async def get_saved_simulations(db: AsyncIOMotorDatabase, user_id: str):
    user = await get_user(db, user_id)
    return user.get("simulations", []) if user else []

async def create_saved_simulation(db: AsyncIOMotorDatabase, simulation: schemas.SavedSimulationCreate, user_id: str):
    sim_dict = simulation.dict()
    sim_dict["id"] = models.generate_uuid()
    sim_dict["created_at"] = datetime.utcnow()
    
    await db["users"].update_one(
        {"id": user_id},
        {"$push": {"simulations": sim_dict}}
    )
    return sim_dict

async def delete_saved_simulation(db: AsyncIOMotorDatabase, simulation_id: str, user_id: str):
    await db["users"].update_one(
        {"id": user_id},
        {"$pull": {"simulations": {"id": simulation_id}}}
    )

# Favorite Locations (NOW NESTED)
async def get_favorite_locations(db: AsyncIOMotorDatabase, user_id: str):
    user = await get_user(db, user_id)
    return user.get("favorite_locations", []) if user else []

async def create_favorite_location(db: AsyncIOMotorDatabase, location: schemas.FavoriteLocationCreate, user_id: str):
    loc_dict = location.dict()
    loc_dict["id"] = models.generate_uuid()
    loc_dict["created_at"] = datetime.utcnow()
    
    await db["users"].update_one(
        {"id": user_id},
        {"$push": {"favorite_locations": loc_dict}}
    )
    return loc_dict

async def delete_favorite_location(db: AsyncIOMotorDatabase, location_id: str, user_id: str):
    await db["users"].update_one(
        {"id": user_id},
        {"$pull": {"favorite_locations": {"id": location_id}}}
    )

# Eco Actions
async def get_eco_actions(db: AsyncIOMotorDatabase):
    cursor = db["eco_actions"].find({})
    return await cursor.to_list(length=100)

async def create_eco_action(db: AsyncIOMotorDatabase, action: schemas.EcoActionCreate):
    action_dict = action.dict()
    action_dict["id"] = models.generate_uuid()
    await db["eco_actions"].insert_one(action_dict)
    return action_dict

# User Actions (History remains separate for scalability)
async def get_user_actions(db: AsyncIOMotorDatabase, user_id: str):
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"completed_at": -1}},
        {
            "$lookup": {
                "from": "eco_actions",
                "localField": "action_id",
                "foreignField": "id",
                "as": "action"
            }
        },
        {"$unwind": {"path": "$action", "preserveNullAndEmptyArrays": True}}
    ]
    cursor = db["user_actions"].aggregate(pipeline)
    return await cursor.to_list(length=100)

async def create_user_action(db: AsyncIOMotorDatabase, action: schemas.UserActionCreate):
    action_dict = action.dict()
    action_dict["id"] = models.generate_uuid()
    action_dict["completed_at"] = datetime.utcnow()
    await db["user_actions"].insert_one(action_dict)
    return action_dict
