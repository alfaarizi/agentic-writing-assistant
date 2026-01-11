"""User profile models for writing assistant personalization."""

from datetime import datetime
from enum import StrEnum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, HttpUrl, model_validator


# ============================================
# Enums for Standard Fields
# ============================================


class EmploymentType(StrEnum):
    """Employment type following LinkedIn standards."""

    FULL_TIME = "full_time"                # Standard full-time employment
    PART_TIME = "part_time"                # Part-time employment
    SELF_EMPLOYED = "self_employed"        # Self-employed, own business
    FREELANCE = "freelance"                # Freelance, independent contractor
    CONTRACT = "contract"                  # Contract-based employment
    INTERNSHIP = "internship"              # Internship position
    APPRENTICESHIP = "apprenticeship"      # Apprenticeship program
    SEASONAL = "seasonal"                  # Seasonal employment


class LocationType(StrEnum):
    """Work location type."""

    ON_SITE = "on_site"                    # In-person at office/location
    HYBRID = "hybrid"                      # Mix of remote and on-site
    REMOTE = "remote"                      # Fully remote work


class LanguageProficiency(StrEnum):
    """Language proficiency levels (CEFR-inspired)."""

    ELEMENTARY = "elementary"                          # A1-A2: Basic phrases, simple conversations
    LIMITED_WORKING = "limited_working"                # B1: Can handle routine work situations
    PROFESSIONAL_WORKING = "professional_working"      # B2: Effective in professional contexts
    FULL_PROFESSIONAL = "full_professional"            # C1: Fluent, articulate in all situations
    NATIVE = "native"                                  # C2: Native or bilingual proficiency


class SkillProficiency(StrEnum):
    """Skill proficiency levels."""

    BEGINNER = "beginner"                  # Learning, basic knowledge
    INTERMEDIATE = "intermediate"          # Can work independently
    ADVANCED = "advanced"                  # Strong expertise
    EXPERT = "expert"                      # Mastery, can teach others


class WritingTone(StrEnum):
    """Writing tone options for personalization."""

    FORMAL = "formal"                      # Official documents, formal applications
    PROFESSIONAL = "professional"          # Cover letters, business correspondence
    CONVERSATIONAL = "conversational"      # Personal essays, informal statements
    ACADEMIC = "academic"                  # Research proposals, scholarly writing
    ENTHUSIASTIC = "enthusiastic"          # Motivation letters showing passion


class WritingStyle(StrEnum):
    """Writing style options for personalization."""

    CONCISE = "concise"                    # Brief, to-the-point (word-limited essays)
    DESCRIPTIVE = "descriptive"            # Detailed, vivid (experience descriptions)
    NARRATIVE = "narrative"                # Storytelling (personal journey, background)
    PERSUASIVE = "persuasive"              # Argumentative (why you deserve scholarship)
    REFLECTIVE = "reflective"              # Introspective (what you learned, growth)
    ANALYTICAL = "analytical"              # Problem-solving, critical thinking
    TECHNICAL = "technical"                # Technical details, specifications


# ============================================
# Personal Information Models
# ============================================


class PersonalInfo(BaseModel):
    """Personal and contact information."""

    first_name: str
    last_name: str
    preferred_name: Optional[str] = None
    pronouns: Optional[str] = None
    date_of_birth: Optional[str] = None
    
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    city: Optional[str] = None
    country: Optional[str] = None
    citizenship: Optional[str] = None
    
    headline: Optional[str] = None
    summary: Optional[str] = None
    background: Optional[str] = None
    interests: List[str] = Field(default_factory=list)


class WritingPreferences(BaseModel):
    """Writing style preferences."""

    tone: Optional[WritingTone] = None
    style: Optional[WritingStyle] = None
    common_phrases: List[str] = Field(default_factory=list)
    writing_samples: List[str] = Field(default_factory=list)


# ============================================
# Professional Background Models
# ============================================


class Education(BaseModel):
    """Education history."""

    school: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    activities: Optional[str] = None
    description: Optional[str] = None
    skills: List[str] = Field(default_factory=list)


class Experience(BaseModel):
    """Work experience."""

    company: str
    position: str
    employment_type: Optional[EmploymentType] = None
    location: Optional[str] = None
    location_type: Optional[LocationType] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)


class Project(BaseModel):
    """Personal or professional project."""

    name: str
    description: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[HttpUrl] = None
    skills: List[str] = Field(default_factory=list)
    contributors: List[str] = Field(default_factory=list)
    associated_with: Optional[str] = None


# ============================================
# Credentials & Achievements Models
# ============================================


class Certification(BaseModel):
    """Professional certification."""

    name: str
    issuer: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[HttpUrl] = None
    skills: List[str] = Field(default_factory=list)


class Award(BaseModel):
    """Award or honor."""

    title: str
    issuer: str
    issue_date: Optional[str] = None
    description: Optional[str] = None
    associated_with: Optional[str] = None


class Publication(BaseModel):
    """Research publication or paper."""

    title: str
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    url: Optional[HttpUrl] = None
    description: Optional[str] = None
    authors: List[str] = Field(default_factory=list)


# ============================================
# Additional Experience Models
# ============================================


class Volunteering(BaseModel):
    """Volunteer experience."""

    organization: str
    role: str
    cause: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


# ============================================
# Skills & Languages Models
# ============================================


class Skill(BaseModel):
    """Professional or technical skill."""

    name: str
    proficiency: Optional[SkillProficiency] = None
    years_experience: Optional[int] = None


class Language(BaseModel):
    """Language proficiency."""

    name: str
    proficiency: Optional[LanguageProficiency] = None


# ============================================
# Social Presence & Proof Models
# ============================================


class Social(BaseModel):
    """Social media or website."""

    platform: str
    url: HttpUrl
    username: Optional[str] = None


class Recommendation(BaseModel):
    """Professional recommendation."""

    name: str
    position: Optional[str] = None
    relationship: Optional[str] = None
    message: str
    date: Optional[str] = None


# ============================================
# Main User Profile Model
# ============================================


class UserProfile(BaseModel):
    """Complete user profile for writing assistant personalization."""

    # Identity
    user_id: str
    
    # Personal Information
    personal_info: PersonalInfo
    writing_preferences: WritingPreferences = Field(default_factory=WritingPreferences)
    
    # Professional Background
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    
    # Credentials & Achievements
    certifications: List[Certification] = Field(default_factory=list)
    awards: List[Award] = Field(default_factory=list)
    publications: List[Publication] = Field(default_factory=list)
    
    # Additional Experience
    volunteering: List[Volunteering] = Field(default_factory=list)
    
    # Skills & Languages
    skills: List[Skill] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)
    
    # Social Presence & Proof
    socials: List[Social] = Field(default_factory=list)
    recommendations: List[Recommendation] = Field(default_factory=list)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @model_validator(mode="before")
    @classmethod
    def set_timestamps(cls, data):
        """Set created_at and updated_at timestamps."""
        if isinstance(data, dict):
            if "created_at" not in data:
                data["created_at"] = datetime.now()
            data["updated_at"] = datetime.now()
        return data

    def to_vectordb_chunks(self) -> List[dict]:
        """Convert profile to semantic chunks for VectorDB storage."""
        chunks = []
        base_meta = {"user_id": self.user_id}

        # ============================================
        # Personal Information
        # ============================================

        if self.personal_info.headline:
            chunks.append({
                "text": f"Headline: {self.personal_info.headline}",
                "metadata": {**base_meta, "type": "headline"},
                "id": f"{self.user_id}_headline",
            })

        if self.personal_info.summary:
            chunks.append({
                "text": f"Professional Summary: {self.personal_info.summary}",
                "metadata": {**base_meta, "type": "summary"},
                "id": f"{self.user_id}_summary",
            })

        if self.personal_info.background:
            chunks.append({
                "text": f"Background: {self.personal_info.background}",
                "metadata": {**base_meta, "type": "background"},
                "id": f"{self.user_id}_background",
            })

        if self.personal_info.interests:
            chunks.append({
                "text": f"Interests: {', '.join(self.personal_info.interests)}",
                "metadata": {**base_meta, "type": "interests"},
                "id": f"{self.user_id}_interests",
            })

        # ============================================
        # Professional Background
        # ============================================

        for idx, edu in enumerate(self.education):
            parts = [f"Education: {edu.degree} in {edu.field_of_study or 'N/A'} at {edu.school}"]
            parts.append(f"Duration: {edu.start_date or 'N/A'} to {edu.end_date or 'Present'}")
            if edu.grade:
                parts.append(f"Grade: {edu.grade}")
            if edu.description:
                parts.append(edu.description)
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "education", "school": edu.school},
                "id": f"{self.user_id}_education_{idx}",
            })

        for idx, exp in enumerate(self.experience):
            parts = [f"Experience: {exp.position} at {exp.company}"]
            parts.append(f"Duration: {exp.start_date or 'N/A'} to {exp.end_date or 'Present'}")
            if exp.description:
                parts.append(exp.description)
            if exp.achievements:
                parts.append(f"Achievements: {'; '.join(exp.achievements)}")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "experience", "company": exp.company},
                "id": f"{self.user_id}_experience_{idx}",
            })

        for idx, proj in enumerate(self.projects):
            parts = [f"Project: {proj.name}", proj.description]
            if proj.skills:
                parts.append(f"Technologies: {', '.join(proj.skills)}")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "project", "name": proj.name},
                "id": f"{self.user_id}_project_{idx}",
            })

        # ============================================
        # Credentials & Achievements
        # ============================================

        for idx, cert in enumerate(self.certifications):
            parts = [f"Certification: {cert.name} from {cert.issuer}"]
            if cert.skills:
                parts.append(f"Skills: {', '.join(cert.skills)}")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "certification"},
                "id": f"{self.user_id}_certification_{idx}",
            })

        for idx, award in enumerate(self.awards):
            parts = [f"Award: {award.title} from {award.issuer}"]
            if award.description:
                parts.append(award.description)
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "award"},
                "id": f"{self.user_id}_award_{idx}",
            })

        for idx, pub in enumerate(self.publications):
            parts = [f"Publication: {pub.title}"]
            if pub.description:
                parts.append(pub.description)
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "publication"},
                "id": f"{self.user_id}_publication_{idx}",
            })

        # ============================================
        # Additional Experience
        # ============================================

        for idx, vol in enumerate(self.volunteering):
            parts = [f"Volunteering: {vol.role} at {vol.organization}"]
            if vol.description:
                parts.append(vol.description)
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "volunteering"},
                "id": f"{self.user_id}_volunteering_{idx}",
            })

        # ============================================
        # Skills & Languages
        # ============================================

        for idx, skill in enumerate(self.skills):
            parts = [f"Skill: {skill.name}"]
            if skill.proficiency:
                parts.append(f"Proficiency: {skill.proficiency.value}")
            if skill.years_experience:
                parts.append(f"Experience: {skill.years_experience} years")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "skill", "name": skill.name},
                "id": f"{self.user_id}_skill_{idx}",
            })

        for idx, lang in enumerate(self.languages):
            parts = [f"Language: {lang.name}"]
            if lang.proficiency:
                parts.append(f"Proficiency: {lang.proficiency.value}")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "language"},
                "id": f"{self.user_id}_language_{idx}",
            })

        # ============================================
        # Social Presence & Proof
        # ============================================

        for idx, social in enumerate(self.socials):
            parts = [f"Social: {social.platform}"]
            parts.append(f"URL: {social.url}")
            if social.username:
                parts.append(f"Username: {social.username}")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "social", "platform": social.platform},
                "id": f"{self.user_id}_social_{idx}",
            })

        for idx, rec in enumerate(self.recommendations):
            parts = [f"Recommendation from {rec.name}"]
            if rec.position:
                parts.append(f"Position: {rec.position}")
            if rec.relationship:
                parts.append(f"Relationship: {rec.relationship}")
            parts.append(f"Message: {rec.message}")
            
            chunks.append({
                "text": ". ".join(parts),
                "metadata": {**base_meta, "type": "recommendation"},
                "id": f"{self.user_id}_recommendation_{idx}",
            })

        return chunks
