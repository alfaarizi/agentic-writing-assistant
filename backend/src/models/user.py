"""User profile models."""

from dataclasses import dataclass, field
from typing import List, Optional


# ============================================
# User Profile Component Models
# ============================================
# Sub-models that compose the user profile


@dataclass
class Education:
    """Education information."""

    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


@dataclass
class Experience:
    """Work experience information."""

    company: str
    position: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    achievements: List[str] = field(default_factory=list)


@dataclass
class PersonalInfo:
    """Personal information."""

    name: str
    background: Optional[str] = None
    education: List[Education] = field(default_factory=list)
    experience: List[Experience] = field(default_factory=list)
    achievements: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)


@dataclass
class WritingPreferences:
    """Writing preferences."""

    tone: Optional[str] = None
    style: Optional[str] = None
    common_phrases: List[str] = field(default_factory=list)


# ============================================
# User Profile Models
# ============================================
# Main user profile model


@dataclass
class UserProfile:
    """User profile."""

    user_id: str
    personal_info: PersonalInfo
    writing_preferences: WritingPreferences
    created_at: str = ""
    updated_at: str = ""