from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
import crud, models, schemas
from database import Base, get_db, get_user_db, get_admin_db, user_engine, admin_engine
import nasa_api

# Create tables for both databases
models.Base.metadata.create_all(bind=user_engine)
models.Base.metadata.create_all(bind=admin_engine)

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5000",
    "http://localhost:5173", # Vite dev server
    "http://0.0.0.0:5000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def read_root():
    return {"status": "ok", "message": "The system is online and healthy."}

# User Routes
@app.get("/api/users", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_user_db)):
    return crud.get_users(db)

@app.get("/api/users/{user_id}", response_model=schemas.User)
def read_user(user_id: str, db: Session = Depends(get_user_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/api/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_user_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        return db_user
    return crud.create_user(db=db, user=user)

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

# User Settings Routes
@app.get("/api/user-settings/{user_id}", response_model=schemas.UserSettings)
def read_user_settings(user_id: str, db: Session = Depends(get_user_db)):
    settings = crud.get_user_settings(db, user_id=user_id)
    if settings is None:
        # Return default settings if not found, or 404. 
        # For this app, let's return a default object to match expected behavior
        return schemas.UserSettings(
            id="default",
            user_id=user_id,
            selected_city="Coimbatore",
            latitude=11.0168,
            longitude=76.9558,
            updated_at=None # This might cause validation error if not nullable in pydantic
        )
    return settings

@app.post("/api/user-settings", response_model=schemas.UserSettings)
def update_user_settings(settings: schemas.UserSettingsCreate, db: Session = Depends(get_user_db)):
    return crud.update_user_settings(db=db, user_id=settings.user_id, settings=settings)

# Saved Simulations Routes
@app.get("/api/simulations/{user_id}", response_model=List[schemas.SavedSimulation])
def read_simulations(user_id: str, db: Session = Depends(get_user_db)):
    return crud.get_saved_simulations(db, user_id=user_id)

@app.post("/api/simulations", response_model=schemas.SavedSimulation)
def create_simulation(simulation: schemas.SavedSimulationCreate, db: Session = Depends(get_user_db)):
    return crud.create_saved_simulation(db=db, simulation=simulation)

@app.delete("/api/simulations/{id}/{user_id}")
def delete_simulation(id: str, user_id: str, db: Session = Depends(get_user_db)):
    crud.delete_saved_simulation(db=db, simulation_id=id, user_id=user_id)
    return {"status": "success"}

# Favorite Locations Routes
@app.get("/api/locations/{user_id}", response_model=List[schemas.FavoriteLocation])
def read_locations(user_id: str, db: Session = Depends(get_user_db)):
    return crud.get_favorite_locations(db, user_id=user_id)

@app.post("/api/locations", response_model=schemas.FavoriteLocation)
def create_location(location: schemas.FavoriteLocationCreate, db: Session = Depends(get_user_db)):
    return crud.create_favorite_location(db=db, location=location)

@app.delete("/api/locations/{id}/{user_id}")
def delete_location(id: str, user_id: str, db: Session = Depends(get_user_db)):
    crud.delete_favorite_location(db=db, location_id=id, user_id=user_id)
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
def log_user_action(data: dict, db: Session = Depends(get_user_db)):
    action_id = data.get("action_id")
    user_id = data.get("user_id", "default_user")
    
    # Check if already completed
    existing = db.query(models.UserAction).filter(
        models.UserAction.action_id == action_id,
        models.UserAction.user_id == user_id
    ).first()
    
    if existing:
         return {"status": "already_done", "message": "You've already completed this action!"}

    new_action = models.UserAction(
        user_id=user_id,
        action_id=action_id
    )
    db.add(new_action)
    db.commit()
    return {"status": "success", "message": "Great job! Your action has been recorded."}

@app.get("/api/eco-actions/history")
def read_user_actions(user_id: str = "default_user", db: Session = Depends(get_user_db)):
    return crud.get_user_actions(db, user_id=user_id)

@app.on_event("startup")
def create_initial_data():
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

if __name__ == "__main__":
    import uvicorn
    # Use port 5000 to match the previous Node server behavior
    uvicorn.run(app, host="0.0.0.0", port=5000)
