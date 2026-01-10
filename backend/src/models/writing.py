"""Writing request and response models."""

from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


# ============================================
# Writing Context Models
# ============================================
# Context models for different writing types


class CoverLetterContext(BaseModel):
    """Context for cover letter writing."""

    job_title: str
    company: str


class MotivationalLetterContext(BaseModel):
    """Context for motivational letter writing."""

    program_name: str
    scholarship_name: Optional[str] = None


class SocialResponseContext(BaseModel):
    """Context for social media response writing."""

    post_content: str
    reply_to: Optional[str] = None


class EmailContext(BaseModel):
    """Context for email writing."""

    reply_to: str
    subject: Optional[str] = None


WritingContext = Union[
    CoverLetterContext,
    MotivationalLetterContext,
    SocialResponseContext,
    EmailContext,
]


# ============================================
# Writing Request Models
# ============================================
# Models for writing generation requests


class WritingRequirements(BaseModel):
    """Requirements for writing generation."""

    max_words: Optional[int] = None
    min_words: Optional[int] = None
    max_pages: Optional[int] = None
    format: Optional[str] = None
    tone: Optional[str] = None
    quality_threshold: float = 85.0
    mode: Literal["quality", "balanced", "fast"] = "balanced"


class WritingRequest(BaseModel):
    """Request for writing generation."""

    user_id: str
    type: Literal["cover_letter", "motivational_letter", "social_response", "email"]
    context: WritingContext
    requirements: WritingRequirements
    additional_info: Optional[str] = None


# ============================================
# Writing Response Models
# ============================================
# Models for writing generation responses and metrics


class QualityMetrics(BaseModel):
    """Quality metrics for writing evaluation."""

    overall_score: float
    coherence: float
    naturalness: float
    grammar_accuracy: float
    completeness: float
    lexical_quality: float
    personalization: float


class TextStats(BaseModel):
    """Text statistics."""

    word_count: int
    character_count: int
    character_count_no_spaces: int
    paragraph_count: int
    line_count: int
    estimated_pages: float


class WritingAssessment(BaseModel):
    """Writing quality assessment including metrics, stats, and requirement checks."""

    quality_metrics: QualityMetrics
    text_stats: TextStats
    requirements_checks: Dict[str, bool] = Field(default_factory=dict)


class WritingResponse(BaseModel):
    """Response for writing generation."""

    request_id: str
    status: Literal["completed", "processing", "failed"]
    content: Optional[str] = None
    assessment: Optional[WritingAssessment] = None
    suggestions: List[str] = Field(default_factory=list)
    iterations: int = 0
    created_at: str = ""
    updated_at: str = ""
    error: Optional[str] = None