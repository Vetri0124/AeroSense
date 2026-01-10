from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Integer, default=1)  # 1 = active, 0 = inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Admin(Base):
    __tablename__ = "admins"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False) # Simple password for now
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, unique=True, nullable=False)
    selected_city = Column(String, nullable=False, default="Coimbatore")
    latitude = Column(Float, nullable=False, default=11.0168)
    longitude = Column(Float, nullable=False, default=76.9558)
    preferences = Column(JSON, default={})
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SavedSimulation(Base):
    __tablename__ = "saved_simulations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    wind_speed = Column(Float, nullable=False)
    rain_chance = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    traffic_density = Column(Float, nullable=False)
    industrial_activity = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FavoriteLocation(Base):
    __tablename__ = "favorite_locations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    city_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EcoAction(Base):
    __tablename__ = "eco_actions"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    co2_saved_kg = Column(Float, nullable=False) # Impact score
    category = Column(String, nullable=False) # e.g. "Energy", "Transport", "Waste"
    difficulty = Column(String, nullable=False) # "Easy", "Medium", "Hard"

class UserAction(Base):
    __tablename__ = "user_actions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    action_id = Column(String, ForeignKey("eco_actions.id"), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)
    
    # Relationship
    action = relationship("EcoAction")
