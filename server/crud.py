from sqlalchemy.orm import Session
import models, schemas

# User Settings
def get_user_settings(db: Session, user_id: str):
    return db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()

def create_user_settings(db: Session, settings: schemas.UserSettingsCreate):
    db_settings = models.UserSettings(**settings.dict())
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_user_settings(db: Session, user_id: str, settings: schemas.UserSettingsCreate):
    db_settings = get_user_settings(db, user_id)
    if db_settings:
        for key, value in settings.dict().items():
            setattr(db_settings, key, value)
        db.commit()
        db.refresh(db_settings)
    else:
        # If not exists, create it (Upsert logic)
        db_settings = create_user_settings(db, settings)
    return db_settings

# Saved Simulations
def get_saved_simulations(db: Session, user_id: str):
    return db.query(models.SavedSimulation).filter(models.SavedSimulation.user_id == user_id).order_by(models.SavedSimulation.created_at).all()

def create_saved_simulation(db: Session, simulation: schemas.SavedSimulationCreate):
    db_simulation = models.SavedSimulation(**simulation.dict())
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    return db_simulation

def delete_saved_simulation(db: Session, simulation_id: str, user_id: str):
    db.query(models.SavedSimulation).filter(
        models.SavedSimulation.id == simulation_id,
        models.SavedSimulation.user_id == user_id
    ).delete()
    db.commit()

# Favorite Locations
def get_favorite_locations(db: Session, user_id: str):
    return db.query(models.FavoriteLocation).filter(models.FavoriteLocation.user_id == user_id).order_by(models.FavoriteLocation.created_at).all()

def create_favorite_location(db: Session, location: schemas.FavoriteLocationCreate):
    db_location = models.FavoriteLocation(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def delete_favorite_location(db: Session, location_id: str, user_id: str):
    db.query(models.FavoriteLocation).filter(
        models.FavoriteLocation.id == location_id,
    ).delete()
    db.commit()

# Eco Actions
def get_eco_actions(db: Session):
    return db.query(models.EcoAction).all()

def create_eco_action(db: Session, action: schemas.EcoActionCreate):
    db_action = models.EcoAction(**action.dict())
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

# User Actions
def get_user_actions(db: Session, user_id: str):
    return db.query(models.UserAction).filter(models.UserAction.user_id == user_id).order_by(models.UserAction.completed_at.desc()).all()

def create_user_action(db: Session, action: schemas.UserActionCreate):
    db_action = models.UserAction(**action.dict())
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action
