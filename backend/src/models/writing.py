"""Writing request and response models."""

from dataclasses import dataclass, field
from typing import List, Literal, Optional, Union


# ============================================
# Writing Context Models
# ============================================
# Context models for different writing types


@dataclass
class CoverLetterContext:
    """Context for cover letter writing."""

    job_title: str
    company: str


@dataclass
class MotivationalLetterContext:
    """Context for motivational letter writing."""

    program_name: str
    scholarship_name: Optional[str] = None


@dataclass
class SocialResponseContext:
    """Context for social media response writing."""

    post_content: str
    reply_to: Optional[str] = None


@dataclass
class EmailContext:
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


@dataclass
class WritingRequirements:
    """Requirements for writing generation."""

    max_words: Optional[int] = None
    min_words: Optional[int] = None
    max_pages: Optional[int] = None
    format: Optional[str] = None
    tone: Optional[str] = None
    quality_threshold: float = 85.0
    mode: Literal["quality", "balanced", "fast"] = "balanced"


@dataclass
class WritingRequest:
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


@dataclass
class QualityMetrics:
    """Quality metrics for writing evaluation."""

    overall_score: float
    coherence: float
    naturalness: float
    grammar_accuracy: float
    completeness: float
    lexical_quality: float
    personalization: float


@dataclass
class TextStats:
    """Text statistics."""

    word_count: int
    character_count: int
    character_count_no_spaces: int
    paragraph_count: int
    line_count: int
    estimated_pages: float


@dataclass
class WritingResponse:
    """Response for writing generation."""

    request_id: str
    status: Literal["completed", "processing", "failed"]
    content: Optional[str] = None
    quality_metrics: Optional[QualityMetrics] = None
    text_stats: Optional[TextStats] = None
    suggestions: List[str] = field(default_factory=list)
    iterations: int = 0
    created_at: str = ""
    error: Optional[str] = None