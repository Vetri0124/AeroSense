from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

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

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    is_active: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Admin Schemas
class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# User Settings Schemas
class UserSettingsBase(BaseModel):
    selected_city: str = "Coimbatore"
    latitude: float = 11.0168
    longitude: float = 76.9558
    preferences: Optional[Dict[str, Any]] = {}

class UserSettingsCreate(UserSettingsBase):
    user_id: str

class UserSettings(UserSettingsBase):
    id: str
    user_id: str
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Saved Simulation Schemas
class SavedSimulationBase(BaseModel):
    name: str
    wind_speed: float
    rain_chance: float
    temperature: float
    humidity: float
    traffic_density: float
    industrial_activity: float

class SavedSimulationCreate(SavedSimulationBase):
    user_id: str

class SavedSimulation(SavedSimulationBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Favorite Location Schemas
class FavoriteLocationBase(BaseModel):
    city_name: str
    latitude: float
    longitude: float

class FavoriteLocationCreate(FavoriteLocationBase):
    user_id: str

class FavoriteLocation(FavoriteLocationBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Eco-Action Schemas
class EcoActionBase(BaseModel):
    title: str
    description: str
    co2_saved_kg: float
    category: str
    difficulty: str

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
