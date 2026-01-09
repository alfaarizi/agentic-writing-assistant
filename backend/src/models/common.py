"""Common models for API responses."""

from dataclasses import dataclass, field
from typing import Dict, Literal, Optional


# ============================================
# API Response Models
# ============================================
# Common models for API responses


@dataclass
class ErrorResponse:
    """Error response model."""

    error: str
    error_code: str
    detail: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: str = ""


@dataclass
class HealthResponse:
    """Health check response model."""

    status: Literal["healthy", "degraded", "unhealthy"]
    version: str
    timestamp: str
    services: Dict[str, str] = field(default_factory=dict)

