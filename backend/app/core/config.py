from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "Health Platform API"
    PORT: int = 8000

    DATABASE_URL: str

    JWT_SECRET: str
    JWT_EXPIRES_IN: str = "1h"
    JWT_ALGORITHM: str = "HS256"

    REFRESH_TOKEN_SECRET: str
    REFRESH_TOKEN_EXPIRES_IN: str = "7d"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    AWS_REGION: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    S3_BUCKET_NAME: str

    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    @property
    def redis_url(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}"

    @property
    def celery_broker(self) -> str:
        return self.CELERY_BROKER_URL or self.redis_url

    @property
    def celery_backend(self) -> str:
        return self.CELERY_RESULT_BACKEND or self.redis_url


settings = Settings()
