from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_PATH: str
    DEBUG: bool
    ENCRYPTION_KEY: str
    SECRET_KEY: str
    TIMEZONE: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    LLM_BASE_URL: str = "http://localhost:11434/v1"
    LLM_MODEL: str = "llama3.2"
    LLM_API_KEY: str = "ollama"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
