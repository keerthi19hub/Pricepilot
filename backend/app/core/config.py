import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PricePilot"
    PROJECT_TAGLINE: str = "Shop Smart. Choose Better."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: Default to SQLite for easy local dev, or PostgreSQL when specified
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pricepilot.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pricepilot_development_secret_key_change_in_production_987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Demo and external data transparency flags
    DEMO_MODE: bool = True
    LIVE_SCRAPING_ENABLED: bool = False
    DATA_FRESHNESS_HOURS: int = 24

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
