"""Common models for API responses."""

from typing import Dict, Literal, Optional

from pydantic import BaseModel, Field


# ============================================
# API Response Models
# ============================================
# Common models for API responses


class ErrorResponse(BaseModel):
    """Error response model."""

    error: str
    error_code: str
    detail: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: str = ""


class HealthResponse(BaseModel):
    """Health check response model."""

    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    timestamp: str
    services: Dict[str, str] = Field(default_factory=dict)
