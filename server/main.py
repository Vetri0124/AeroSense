import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import timedelta
import crud, models, schemas
from database import get_db
import nasa_api
from auth import create_access_token, verify_password, get_current_user, get_current_user_optional, ACCESS_TOKEN_EXPIRE_MINUTES

from contextlib import asynccontextmanager

# No table creation needed for MongoDB, but you could initialize indexes here

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    from database import get_db
    db = await get_db()
    
    # 1. Create default admin in users collection
    try:
        admin = await crud.get_admin_by_username(db, username="admin")
        if not admin:
            await crud.create_admin(db, schemas.AdminLogin(username="admin", password="password123"))
            print("Default admin created in MongoDB users collection: admin / password123")
    except Exception as e:
        print(f"Error creating default admin: {e}")

    # 2. Seed eco-actions (only if they don't exist by title)
    try:
        existing_actions = await crud.get_eco_actions(db)
        existing_titles = {a["title"] for a in existing_actions}
        
        initial_actions = [
            # DAILY GOALS (Small, repeatable habits)
            schemas.EcoActionCreate(title="Public Transport Commute", description="Use bus or train for your daily travel.", co2_saved_kg=2.5, category="Transport", difficulty="Easy", period="daily"),
            schemas.EcoActionCreate(title="Smart Lighting Mode", description="Ensure all non-essential lights are off for 4+ hours.", co2_saved_kg=0.4, category="Energy", difficulty="Easy", period="daily"),
            schemas.EcoActionCreate(title="Zero-Waste Hydration", description="Use reusable bottles exclusively today.", co2_saved_kg=0.2, category="Waste", difficulty="Easy", period="daily"),
            schemas.EcoActionCreate(title="Digital Cleanup", description="Delete 100 unneeded emails to reduce server energy.", co2_saved_kg=0.1, category="Energy", difficulty="Easy", period="daily"),
            
            # WEEKLY GOALS (Planned efforts or specific tasks)
            schemas.EcoActionCreate(title="Meat-Free Weekend", description="Switch to plant-based meals for the entire weekend.", co2_saved_kg=8.5, category="Diet", difficulty="Medium", period="weekly"),
            schemas.EcoActionCreate(title="Community Cleanup", description="Spend 30 minutes cleaning a local green space.", co2_saved_kg=5.0, category="Nature", difficulty="Medium", period="weekly"),
            schemas.EcoActionCreate(title="Laundry Optimization", description="Only wash full loads using cold water this week.", co2_saved_kg=4.2, category="Energy", difficulty="Easy", period="weekly"),
            schemas.EcoActionCreate(title="Farmers Market Visit", description="Buy your weekly produce from local sources.", co2_saved_kg=6.0, category="Diet", difficulty="Medium", period="weekly"),
            
            # MONTHLY GOALS (Significant impact or maintenance)
            schemas.EcoActionCreate(title="Plant a Carbon-Sink", description="Plant a tree or a large native shrub in your area.", co2_saved_kg=25.0, category="Nature", difficulty="Hard", period="monthly"),
            schemas.EcoActionCreate(title="Home Energy Audit", description="Identify and seal air leaks or upgrade a bulb to LED.", co2_saved_kg=45.0, category="Energy", difficulty="Medium", period="monthly"),
            schemas.EcoActionCreate(title="Solar Transition Plan", description="Research or install a small solar device/panel.", co2_saved_kg=120.0, category="Energy", difficulty="Hard", period="monthly"),
            schemas.EcoActionCreate(title="Zero-Waste Bulk Buy", description="Purchase monthly essentials in bulk without packaging.", co2_saved_kg=12.0, category="Waste", difficulty="Medium", period="monthly"),
        ]
        
        added_count = 0
        for action in initial_actions:
            if action.title not in existing_titles:
                await crud.create_eco_action(db, action)
                added_count += 1
        
        if added_count > 0:
            print(f"Seeded {added_count} new eco-actions into MongoDB.")
    except Exception as e:
        print(f"Error seeding eco-actions: {e}")
    
    yield
    # Shutdown logic (if any) could go here

app = FastAPI(lifespan=lifespan)

# CORS configuration
# In production, allow all for simpler deployment, or add specific Vercel/Render domains
if os.environ.get("VERCEL") or os.environ.get("RENDER") or os.environ.get("NODE_ENV") == "production":
    origins = ["*"]
    # When using wildcard origins, allow_credentials must be False
    allow_credentials = False
else:
    origins = [
        "http://localhost:5000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def read_root():
    return {"status": "ok", "message": "The system is online and healthy."}

# ============ AUTHENTICATION ROUTES ============

@app.post("/api/auth/register", response_model=schemas.Token)
async def register(user: schemas.UserRegister, db = Depends(get_db)):
    """Register a new user account"""
    # Check if username already exists
    db_user = await crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = await crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    try:
        new_user = await crud.create_user(db=db, user=user)
        print(f"Successfully registered new user: {new_user['username']} ({new_user['id']})")
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating account: {str(e)}"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user['id'])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/api/auth/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db = Depends(get_db)):
    """Login with email and password"""
    user = await crud.get_user_by_email(db, email=user_credentials.email)
    
    if not user:
        print(f"Login failed: User with email {user_credentials.email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user_credentials.password, user['password_hash']):
        print(f"Login failed: Incorrect password for {user_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user['id'])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=schemas.User)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user

# ============ PROTECTED USER ROUTES ============

@app.get("/api/users", response_model=List[schemas.User])
async def read_users(db = Depends(get_db)):
    """Get all users (admin visualization)"""
    return await crud.get_users(db)

@app.get("/api/users/me", response_model=schemas.User)
async def read_current_user(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

# Admin Routes
@app.post("/api/admin/login")
async def admin_login(admin: schemas.AdminLogin, db = Depends(get_db)):
    db_admin = await crud.get_admin_by_username(db, username=admin.username)
    if not db_admin or not verify_password(admin.password, db_admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"status": "success", "admin_id": db_admin['id'], "username": db_admin['username']}

@app.post("/api/admin/register")
async def register_admin(admin: schemas.AdminLogin, db = Depends(get_db)):
    # Simple check for existing
    existing = await crud.get_admin_by_username(db, username=admin.username)
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    return await crud.create_admin(db, admin)

@app.get("/api/admin/users-stats")
async def get_admin_stats(db = Depends(get_db)):
    users_count = await db["users"].count_documents({})
    actions_count = await db["user_actions"].count_documents({})
    
    # Calculate total impact
    pipeline = [
        {
            "$lookup": {
                "from": "eco_actions",
                "localField": "action_id",
                "foreignField": "id",
                "as": "action_info"
            }
        },
        {"$unwind": "$action_info"},
        {
            "$group": {
                "_id": None,
                "total_impact": {"$sum": "$action_info.co2_saved_kg"}
            }
        }
    ]
    result = await db["user_actions"].aggregate(pipeline).to_list(1)
    total_impact = result[0]["total_impact"] if result else 0
    
    return {
        "total_users": users_count,
        "total_actions": actions_count,
        "total_impact": round(float(total_impact), 2)
    }

# ============ USER SETTINGS ROUTES (PROTECTED) ============

@app.get("/api/user-settings/{user_id}", response_model=schemas.UserSettings)
@app.get("/api/user-settings", response_model=schemas.UserSettings)
async def read_user_settings(
    user_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's settings"""
    # Use authenticated user's ID
    settings = await crud.get_user_settings(db, user_id=current_user['id'])
    if settings is None:
        # Return default settings if not found
        return schemas.UserSettings(
            id="default",
            user_id=current_user['id'],
            selected_city="Coimbatore",
            latitude=11.0168,
            longitude=76.9558,
            updated_at=None
        )
    return settings

@app.post("/api/user-settings", response_model=schemas.UserSettings)
async def update_user_settings(
    settings: schemas.UserSettingsCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update current user's settings"""
    return await crud.update_user_settings(db = db, user_id=current_user['id'], settings=settings)

# ============ SAVED SIMULATIONS ROUTES (PROTECTED) ============

@app.get("/api/simulations", response_model=List[schemas.SavedSimulation])
async def read_simulations(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's saved simulations"""
    return await crud.get_saved_simulations(db, user_id=current_user['id'])

@app.post("/api/simulations", response_model=schemas.SavedSimulation)
async def create_simulation(
    simulation: schemas.SavedSimulationCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new simulation for current user"""
    return await crud.create_saved_simulation(db=db, simulation=simulation, user_id=current_user['id'])

@app.delete("/api/simulations/{id}")
async def delete_simulation(
    id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a simulation"""
    await crud.delete_saved_simulation(db=db, simulation_id=id, user_id=current_user['id'])
    return {"status": "success"}

# ============ FAVORITE LOCATIONS ROUTES (PROTECTED) ============

@app.get("/api/locations", response_model=List[schemas.FavoriteLocation])
async def read_locations(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's favorite locations"""
    return await crud.get_favorite_locations(db, user_id=current_user['id'])

@app.post("/api/locations", response_model=schemas.FavoriteLocation)
async def create_location(
    location: schemas.FavoriteLocationCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Add a favorite location for current user"""
    return await crud.create_favorite_location(db=db, location=location, user_id=current_user['id'])

@app.delete("/api/locations/{id}")
async def delete_location(
    id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a favorite location"""
    await crud.delete_favorite_location(db=db, location_id=id, user_id=current_user['id'])
    return {"status": "success"}

# NASA Weather Routes
@app.get("/api/environment/current", response_model=schemas.NasaWeatherData)
def get_current_environment(latitude: float, longitude: float):
    return nasa_api.get_live_data(lat=latitude, lon=longitude)

# Eco Actions Routes
@app.get("/api/eco-actions", response_model=List[schemas.EcoAction])
async def read_eco_actions(db = Depends(get_db)):
    actions = await crud.get_eco_actions(db)
    return actions

@app.post("/api/eco-actions/complete")
async def log_user_action(
    data: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Complete an eco-action (protected)"""
    action_id = data.get("action_id")
    if not action_id:
        raise HTTPException(status_code=400, detail="action_id is required")
        
    # Check if already completed
    existing = await db["user_actions"].find_one({
        "action_id": action_id,
        "user_id": current_user['id']
    })
    
    if existing:
         return {"status": "already_done", "message": "You've already completed this action!"}

    user_action = schemas.UserActionCreate(
        user_id=current_user['id'],
        action_id=action_id
    )
    
    await crud.create_user_action(db, user_action)
    print(f"User {current_user['username']} completed action {action_id}")
    return {"status": "success", "message": "Great job! Your action has been recorded."}

@app.get("/api/eco-actions/history", response_model=List[schemas.UserAction])
async def read_user_actions(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's eco-action history (protected)"""
    return await crud.get_user_actions(db, user_id=current_user['id'])


if __name__ == "__main__":
    import uvicorn
    # Use PORT from environment for cloud deployments (Render/Vercel)
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
