from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import engine, get_db
import nasa_api

# Create database tables
models.Base.metadata.create_all(bind=engine)

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
    return {"status": "ok", "message": "Python backend is running"}

# User Settings Routes
@app.get("/api/user-settings/{user_id}", response_model=schemas.UserSettings)
def read_user_settings(user_id: str, db: Session = Depends(get_db)):
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
def update_user_settings(settings: schemas.UserSettingsCreate, db: Session = Depends(get_db)):
    return crud.update_user_settings(db=db, user_id=settings.user_id, settings=settings)

# Saved Simulations Routes
@app.get("/api/simulations/{user_id}", response_model=List[schemas.SavedSimulation])
def read_simulations(user_id: str, db: Session = Depends(get_db)):
    return crud.get_saved_simulations(db, user_id=user_id)

@app.post("/api/simulations", response_model=schemas.SavedSimulation)
def create_simulation(simulation: schemas.SavedSimulationCreate, db: Session = Depends(get_db)):
    return crud.create_saved_simulation(db=db, simulation=simulation)

@app.delete("/api/simulations/{id}/{user_id}")
def delete_simulation(id: str, user_id: str, db: Session = Depends(get_db)):
    crud.delete_saved_simulation(db=db, simulation_id=id, user_id=user_id)
    return {"status": "success"}

# Favorite Locations Routes
@app.get("/api/locations/{user_id}", response_model=List[schemas.FavoriteLocation])
def read_locations(user_id: str, db: Session = Depends(get_db)):
    return crud.get_favorite_locations(db, user_id=user_id)

@app.post("/api/locations", response_model=schemas.FavoriteLocation)
def create_location(location: schemas.FavoriteLocationCreate, db: Session = Depends(get_db)):
    return crud.create_favorite_location(db=db, location=location)

@app.delete("/api/locations/{id}/{user_id}")
def delete_location(id: str, user_id: str, db: Session = Depends(get_db)):
    crud.delete_favorite_location(db=db, location_id=id, user_id=user_id)
    return {"status": "success"}

# NASA Weather Routes
@app.get("/api/environment/current", response_model=schemas.NasaWeatherData)
def get_current_environment(latitude: float, longitude: float):
    return nasa_api.get_live_data(lat=latitude, lon=longitude)

# Eco Actions Routes
@app.get("/api/eco-actions", response_model=List[schemas.EcoAction])
def read_eco_actions(db: Session = Depends(get_db)):
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

@app.get("/api/user-actions/{user_id}", response_model=List[schemas.UserAction])
def read_user_actions(user_id: str, db: Session = Depends(get_db)):
    return crud.get_user_actions(db, user_id=user_id)

@app.post("/api/user-actions", response_model=schemas.UserAction)
def log_user_action(action: schemas.UserActionCreate, db: Session = Depends(get_db)):
    return crud.create_user_action(db=db, action=action)

if __name__ == "__main__":
    import uvicorn
    # Use port 5000 to match the previous Node server behavior
    uvicorn.run(app, host="0.0.0.0", port=5000)
