"""User profile models."""

from typing import List, Optional

from pydantic import BaseModel, Field


# ============================================
# User Profile Component Models
# ============================================
# Sub-models that compose the user profile


class Education(BaseModel):
    """Education information."""

    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class Experience(BaseModel):
    """Work experience information."""

    company: str
    position: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)


class PersonalInfo(BaseModel):
    """Personal information."""

    name: str
    background: Optional[str] = None
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)


class WritingPreferences(BaseModel):
    """Writing preferences."""

    tone: Optional[str] = None
    style: Optional[str] = None
    common_phrases: List[str] = Field(default_factory=list)


# ============================================
# User Profile Models
# ============================================
# Main user profile model


class UserProfile(BaseModel):
    """User profile."""

    user_id: str
    personal_info: PersonalInfo
    writing_preferences: WritingPreferences
    created_at: str = ""
    updated_at: str = ""
