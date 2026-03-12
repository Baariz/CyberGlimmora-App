from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./cyberglimmora.db"
    # Optional: for future JWT auth
    SECRET_KEY: str = "dev-secret-change-in-production"
    # Geo: deviation threshold in metres; beyond this = route deviation
    ROUTE_DEVIATION_THRESHOLD_METRES: float = 100.0

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()