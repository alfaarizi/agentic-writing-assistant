"""Configuration management for the application."""

from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # LLM Configuration
    OPENROUTER_API_KEY: str
    DEFAULT_MODEL: str = "google/gemini-2.5-flash"

    # Search APIs
    TAVILY_API_KEY: Optional[str] = None
    SERPAPI_KEY: Optional[str] = None
    SEMANTIC_SCHOLAR_API_KEY: Optional[str] = None
    NEWSAPI_KEY: Optional[str] = None

    # Grammar APIs
    GRAMMARLY_API_KEY: Optional[str] = None
    LANGUAGETOOL_API_URL: str = "https://api.languagetool.org"

    # Social Media APIs
    TWITTER_API_KEY: Optional[str] = None
    GMAIL_API_CREDENTIALS: Optional[str] = None

    # Database
    VECTOR_DB_PATH: str = "./data/vector_db"
    SQLITE_DB_PATH: str = "./data/writing_assistant.db"

    # Application
    API_VERSION: str = "0.1.0"
    API_BASE_URL: str = "/api/v1"
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    # Quality Configuration
    QUALITY_THRESHOLD: float = 85.0
    MAX_REFINEMENT_ITERATIONS: int = 5
    ENABLE_QUALITY_METRICS: bool = True
    
    # Resume Upload Configuration
    MAX_RESUME_FILE_SIZE_MB: int = 10

    def __init__(self, **kwargs):
        """Initialize settings and create data directories."""
        super().__init__(**kwargs)
        # Create data directories if they don't exist
        Path(self.VECTOR_DB_PATH).parent.mkdir(parents=True, exist_ok=True)
        Path(self.SQLITE_DB_PATH).parent.mkdir(parents=True, exist_ok=True)

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT.lower() == "development"

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """Get CORS allowed origins."""
        origin = self.FRONTEND_URL.rstrip("/")
        origins = [origin]
        if self.is_development:
            origins.append("http://localhost:5173")
        return origins


settings = Settings()
