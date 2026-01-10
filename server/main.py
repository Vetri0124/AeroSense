import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from datetime import timedelta
import crud, models, schemas
from database import Base, get_db, get_user_db, get_admin_db, user_engine, admin_engine
import nasa_api
from auth import create_access_token, get_current_user, get_current_user_optional, ACCESS_TOKEN_EXPIRE_MINUTES

from contextlib import asynccontextmanager

# Create tables for both databases
models.Base.metadata.create_all(bind=user_engine)
models.Base.metadata.create_all(bind=admin_engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    from database import AdminSessionLocal, UserSessionLocal
    
    # 1. Create default admin in admin_db
    admin_db = AdminSessionLocal()
    try:
        admin = crud.get_admin_by_username(admin_db, username="admin")
        if not admin:
            crud.create_admin(admin_db, schemas.AdminCreate(username="admin", password="password123"))
            print("Default admin created in admin_db: admin / password123")
    finally:
        admin_db.close()

    # 2. Create default eco-actions in user_db
    user_db = UserSessionLocal()
    try:
        actions = crud.get_eco_actions(user_db)
        if not actions:
            initial_actions = [
                schemas.EcoActionCreate(title="Use Public Transport", description="Reduce your carbon footprint by taking the bus or train.", co2_saved_kg=2.5, category="Transport", difficulty="Easy"),
                schemas.EcoActionCreate(title="Switch Off Lights", description="Save energy by turning off lights when not in use.", co2_saved_kg=0.5, category="Energy", difficulty="Easy"),
                schemas.EcoActionCreate(title="Plant a Tree", description="Contribute to long-term carbon absorption and air purification.", co2_saved_kg=20.0, category="Nature", difficulty="Hard"),
                schemas.EcoActionCreate(title="Reduce Meat Intake", description="Lower methane emissions by choosing plant-based meals.", co2_saved_kg=1.8, category="Diet", difficulty="Medium"),
            ]
            for action in initial_actions:
                crud.create_eco_action(user_db, action)
            print("Initial eco-actions created in user_db.")
    finally:
        user_db.close()
    
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
def register(user: schemas.UserRegister, db: Session = Depends(get_user_db)):
    """Register a new user account"""
    # Check if username already exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    try:
        new_user = crud.create_user(db=db, user=user)
        print(f"Successfully registered new user: {new_user.username} ({new_user.id})")
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating account: {str(e)}"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_user_db)):
    """Login with email and password"""
    user = crud.get_user_by_email(db, email=user_credentials.email)
    
    if not user:
        print(f"Login failed: User with email {user_credentials.email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user_credentials.password, user.password_hash):
        print(f"Login failed: Incorrect password for {user_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user

# ============ PROTECTED USER ROUTES ============

@app.get("/api/users", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_user_db)):
    """Get all users (admin visualization)"""
    return crud.get_users(db)

@app.get("/api/users/me", response_model=schemas.User)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

# Admin Routes
@app.post("/api/admin/login")
def admin_login(admin: schemas.AdminCreate, db: Session = Depends(get_admin_db)):
    db_admin = crud.get_admin_by_username(db, username=admin.username)
    if not db_admin or db_admin.password != admin.password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"status": "success", "admin_id": db_admin.id, "username": db_admin.username}

@app.post("/api/admin/register")
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_admin_db)):
    # Simple check for existing
    existing = crud.get_admin_by_username(db, username=admin.username)
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    return crud.create_admin(db, admin)

@app.get("/api/admin/users-stats")
def get_admin_stats(db: Session = Depends(get_user_db)):
    users_count = db.query(models.User).count()
    actions_count = db.query(models.UserAction).count()
    
    # Calculate total impact
    total_impact = db.query(func.sum(models.EcoAction.co2_saved_kg)).join(models.UserAction, models.UserAction.action_id == models.EcoAction.id).scalar() or 0
    
    return {
        "total_users": users_count,
        "total_actions": actions_count,
        "total_impact": round(float(total_impact), 2)
    }

# ============ USER SETTINGS ROUTES (PROTECTED) ============

@app.get("/api/user-settings/{user_id}", response_model=schemas.UserSettings)
@app.get("/api/user-settings", response_model=schemas.UserSettings)
def read_user_settings(
    user_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Get current user's settings"""
    # Use authenticated user's ID
    settings = crud.get_user_settings(db, user_id=current_user.id)
    if settings is None:
        # Return default settings if not found
        return schemas.UserSettings(
            id="default",
            user_id=current_user.id,
            selected_city="Coimbatore",
            latitude=11.0168,
            longitude=76.9558,
            updated_at=None
        )
    return settings

@app.post("/api/user-settings", response_model=schemas.UserSettings)
def update_user_settings(
    settings: schemas.UserSettingsCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Update current user's settings"""
    # Override user_id with authenticated user's ID
    settings.user_id = current_user.id
    return crud.update_user_settings(db=db, user_id=current_user.id, settings=settings)

# ============ SAVED SIMULATIONS ROUTES (PROTECTED) ============

@app.get("/api/simulations", response_model=List[schemas.SavedSimulation])
def read_simulations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Get current user's saved simulations"""
    return crud.get_saved_simulations(db, user_id=current_user.id)

@app.post("/api/simulations", response_model=schemas.SavedSimulation)
def create_simulation(
    simulation: schemas.SavedSimulationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Create a new simulation for current user"""
    simulation.user_id = current_user.id
    return crud.create_saved_simulation(db=db, simulation=simulation)

@app.delete("/api/simulations/{id}")
def delete_simulation(
    id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Delete a simulation"""
    crud.delete_saved_simulation(db=db, simulation_id=id, user_id=current_user.id)
    return {"status": "success"}

# ============ FAVORITE LOCATIONS ROUTES (PROTECTED) ============

@app.get("/api/locations", response_model=List[schemas.FavoriteLocation])
def read_locations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Get current user's favorite locations"""
    return crud.get_favorite_locations(db, user_id=current_user.id)

@app.post("/api/locations", response_model=schemas.FavoriteLocation)
def create_location(
    location: schemas.FavoriteLocationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Add a favorite location for current user"""
    location.user_id = current_user.id
    return crud.create_favorite_location(db=db, location=location)

@app.delete("/api/locations/{id}")
def delete_location(
    id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Delete a favorite location"""
    crud.delete_favorite_location(db=db, location_id=id, user_id=current_user.id)
    return {"status": "success"}

# NASA Weather Routes
@app.get("/api/environment/current", response_model=schemas.NasaWeatherData)
def get_current_environment(latitude: float, longitude: float):
    return nasa_api.get_live_data(lat=latitude, lon=longitude)

# Eco Actions Routes
@app.get("/api/eco-actions", response_model=List[schemas.EcoAction])
def read_eco_actions(db: Session = Depends(get_user_db)):
    actions = crud.get_eco_actions(db)
    if not actions:
         # Seed initial data if empty
        seed_data = [
            {"title": "Switch to LED Bulbs", "description": "Replace all incandescent bulbs with energy-efficient LEDs.", "co2_saved_kg": 50.0, "category": "Energy", "difficulty": "Easy"},
            {"title": "Ride a Bike to Work", "description": "Commute by bicycle instead of driving a car.", "co2_saved_kg": 4.5, "category": "Transport", "difficulty": "Medium"},
            {"title": "Plant a Tree", "description": "Plant a native tree in your garden or community.", "co2_saved_kg": 20.0, "category": "Nature", "difficulty": "Medium"},
            {"title": "Start Composting", "description": "Compost organic kitchen waste to reduce landfill methane.", "co2_saved_kg": 150.0, "category": "Waste", "difficulty": "Medium"},
            {"title": "Use Reusable Bags", "description": "Bring your own bags when shopping.", "co2_saved_kg": 5.0, "category": "Waste", "difficulty": "Easy"},
            {"title": "Lower Thermostat in Winter", "description": "Lower your thermostat by 2 degrees.", "co2_saved_kg": 100.0, "category": "Energy", "difficulty": "Easy"},
             {"title": "Install Solar Panels", "description": "Generate your own clean electricity.", "co2_saved_kg": 1500.0, "category": "Energy", "difficulty": "Hard"}
        ]
        for action in seed_data:
            crud.create_eco_action(db, schemas.EcoActionCreate(**action))
        actions = crud.get_eco_actions(db)
    return actions

@app.post("/api/eco-actions/complete")
def log_user_action(
    data: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Complete an eco-action (protected)"""
    action_id = data.get("action_id")
    
    # Check if already completed
    existing = db.query(models.UserAction).filter(
        models.UserAction.action_id == action_id,
        models.UserAction.user_id == current_user.id
    ).first()
    
    if existing:
         return {"status": "already_done", "message": "You've already completed this action!"}

    new_action = models.UserAction(
        user_id=current_user.id,
        action_id=action_id
    )
    db.add(new_action)
    db.commit()
    return {"status": "success", "message": "Great job! Your action has been recorded."}

@app.get("/api/eco-actions/history")
def read_user_actions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_user_db)
):
    """Get current user's eco-action history (protected)"""
    return crud.get_user_actions(db, user_id=current_user.id)


if __name__ == "__main__":
    import uvicorn
    # Use PORT from environment for cloud deployments (Render/Vercel)
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
