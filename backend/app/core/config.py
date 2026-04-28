from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Luxora Perfume API"
    ENVIRONMENT: str = "development"
    FRONTEND_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    LOCAL_STORE_PATH: str = "data/store.json"
    RATE_LIMIT_PER_MINUTE: int = 120

    USE_FIREBASE: bool = False
    FIREBASE_PROJECT_ID: str | None = None
    FIREBASE_STORAGE_BUCKET: str | None = None
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None
    FIREBASE_SERVICE_ACCOUNT_JSON: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def origins(self) -> list[str]:
        return [item.strip() for item in self.FRONTEND_ORIGINS.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
