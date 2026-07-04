from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SecureFlow API"
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    database_url: str = Field(default="postgresql+psycopg://secureflow:secureflow@localhost:5432/secureflow")
    secret_key: str = Field(default="replace-this-with-a-long-random-local-value")
    access_token_expire_minutes: int = Field(default=30)
    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def allowed_cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
