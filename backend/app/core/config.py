from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Read from environment variables, or from backend/.env."""

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    # Supabase → Connect → Session pooler connection string (includes the database password).
    database_url: str
    # Supabase → Project Settings → Data API → Project URL.
    supabase_url: str
    # Supabase → Project Settings → API Keys → Secret key. Server-side only: it bypasses all access rules.
    supabase_secret_key: str

    photo_bucket: str = "report-photos"
    max_photo_bytes: int = 10 * 1024 * 1024
    # How long a signed photo URL handed to the website stays valid.
    signed_url_ttl_seconds: int = 60 * 60
    # Websites allowed to call the API from a browser.
    cors_origins: list[str] = ["http://localhost:3000"]

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, v: str) -> str:
        # Supabase hands out postgresql:// URLs; SQLAlchemy needs to be told to use psycopg 3.
        for prefix in ("postgresql://", "postgres://"):
            if v.startswith(prefix):
                return "postgresql+psycopg://" + v.removeprefix(prefix)
        return v

    @field_validator("supabase_url")
    @classmethod
    def project_root_url(cls, v: str) -> str:
        # Accept the "API URL" Supabase also shows (…supabase.co/rest/v1/); we need the bare project URL.
        return v.rstrip("/").removesuffix("/rest/v1").rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
