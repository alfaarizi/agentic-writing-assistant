"""Data models for the application."""

from models.common import ErrorResponse, HealthResponse
from models.user import (
    Education,
    Experience,
    PersonalInfo,
    UserProfile,
    WritingPreferences,
)
from models.writing import (
    CoverLetterContext,
    EmailContext,
    MotivationalLetterContext,
    QualityMetrics,
    SocialResponseContext,
    TextStats,
    WritingContext,
    WritingRequest,
    WritingRequirements,
    WritingResponse,
)

__all__ = [
    # Writing models
    "WritingRequest",
    "WritingResponse",
    "WritingContext",
    "CoverLetterContext",
    "MotivationalLetterContext",
    "SocialResponseContext",
    "EmailContext",
    "WritingRequirements",
    "QualityMetrics",
    "TextStats",
    # User models
    "UserProfile",
    "PersonalInfo",
    "WritingPreferences",
    "Education",
    "Experience",
    # Common models
    "ErrorResponse",
    "HealthResponse",
]
