from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_PATH: str
    DEBUG: bool
    ENCRYPTION_KEY: str
    SECRET_KEY: str
    TIMEZONE: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
