"""Data models for the application."""

from models.common import ErrorResponse, HealthResponse
from models.user import (
    Education,
    Experience,
    PersonalInfo,
    UserProfile,
    WritingPreferences,
    WritingSample,
)
from models.writing import (
    CoverLetterContext,
    EmailContext,
    MotivationalLetterContext,
    QualityMetrics,
    SocialResponseContext,
    TextStats,
    WritingAssessment,
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
    "WritingAssessment",
    # User models
    "UserProfile",
    "PersonalInfo",
    "WritingPreferences",
    "Education",
    "Experience",
    "WritingSample",
    # Common models
    "ErrorResponse",
    "HealthResponse",
]
