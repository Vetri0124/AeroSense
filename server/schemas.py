from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# User Settings Schemas (Nested)
class UserSettingsBase(BaseModel):
    selected_city: str = "Coimbatore"
    latitude: float = 11.0168
    longitude: float = 76.9558
    preferences: Optional[Dict[str, Any]] = {}

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    updated_at: Optional[datetime] = None

# Saved Simulation Schemas (Nested)
class SavedSimulationBase(BaseModel):
    name: str
    wind_speed: float
    rain_chance: float
    temperature: float
    humidity: float
    traffic_density: float
    industrial_activity: float

class SavedSimulationCreate(SavedSimulationBase):
    pass

class SavedSimulation(SavedSimulationBase):
    id: str
    created_at: datetime

# Favorite Location Schemas (Nested)
class FavoriteLocationBase(BaseModel):
    city_name: str
    latitude: float
    longitude: float

class FavoriteLocationCreate(FavoriteLocationBase):
    pass

class FavoriteLocation(FavoriteLocationBase):
    id: str
    created_at: datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    city: str
    latitude: float
    longitude: float

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    is_active: int
    role: str = "user"  # "user" or "admin"
    created_at: datetime
    settings: UserSettings = Field(default_factory=UserSettings)
    favorite_locations: List[FavoriteLocation] = []
    simulations: List[SavedSimulation] = []

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Admin Login Schema (Simple)
class AdminLogin(BaseModel):
    username: str
    password: str

# Eco-Action Schemas
class EcoActionBase(BaseModel):
    title: str
    description: str
    co2_saved_kg: float
    category: str
    difficulty: str
    period: str = "daily" # daily, weekly, monthly

class EcoActionCreate(EcoActionBase):
    pass

class EcoAction(EcoActionBase):
    id: str

    class Config:
        from_attributes = True

# User Action Schemas
class UserActionBase(BaseModel):
    action_id: str
    notes: Optional[str] = None

class UserActionCreate(UserActionBase):
    user_id: str

class UserAction(UserActionBase):
    id: str
    user_id: str
    completed_at: datetime
    action: Optional[EcoAction] = None

    class Config:
        from_attributes = True

# NASA API Response
class NasaWeatherData(BaseModel):
    temperature: float
    humidity: float
    solar_irradiance: float
    uv_index: float
    aqi: int
