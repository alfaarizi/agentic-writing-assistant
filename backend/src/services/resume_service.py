"""Resume service for text extraction and parsing."""

import io
from typing import Dict, Any
from datetime import datetime, timezone

import pdfplumber
from docx import Document

from models.user import (
    UserProfile, PersonalInfo, Education, Experience, Skill, Project,
    Certification, Award, Publication, Volunteering, Language, Social, Recommendation,
    EmploymentType, LocationType, LanguageProficiency, SkillProficiency
)
from tools.resume_parser import ResumeParserTool


class ResumeService:
    """Service for parsing resume files into user profiles."""

    def __init__(self):
        """Initialize resume service."""
        self.parser = ResumeParserTool()


    async def parse_resume(self, user_id: str, file: Any) -> UserProfile:
        """
        Parse resume file into UserProfile.
        
        Args:
            user_id: User ID for the profile
            file: UploadFile object with resume
            
        Returns:
            Parsed UserProfile
        """
        content = await file.read()
        ext = file.filename.lower().split('.')[-1]
        
        extractors = {'pdf': self._extract_pdf, 'docx': self._extract_docx}
        if ext not in extractors:
            raise ValueError(f"Unsupported format: .{ext}. Use PDF or DOCX.")
        text = extractors[ext](content)
        
        if len(text.strip()) < 50:
            raise ValueError("Resume appears to be empty or too short")
        
        parsed_data = await self.parser.parse(text)
        return self._map_to_user_profile(parsed_data, user_id)


    def _extract_pdf(self, content: bytes) -> str:
        """Extract text from PDF."""
        try:
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                return "\n\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        except Exception as e:
            raise ValueError(f"PDF extraction failed: {e}")


    def _extract_docx(self, content: bytes) -> str:
        """Extract text from DOCX."""
        try:
            doc = Document(io.BytesIO(content))
            return "\n\n".join(
                p.text for p in doc.paragraphs if p.text.strip()
            )
        except Exception as e:
            raise ValueError(f"DOCX extraction failed: {e}")


    def _parse_enum(self, value: str, enum_class, default):
        """Parse string to enum with fallback."""
        if not value:
            return default
        try:
            return enum_class[value.upper().replace("-", "_").replace(" ", "_")]
        except KeyError:
            return default


    def _map_to_user_profile(self, data: Dict[str, Any], user_id: str) -> UserProfile:
        """Map parsed data to UserProfile model."""
        now = datetime.now(timezone.utc)
        personal_data = data.get("personal_info", {})
        
        personal_info = PersonalInfo(
            first_name=personal_data.get("first_name", ""),
            last_name=personal_data.get("last_name", ""),
            preferred_name=personal_data.get("preferred_name"),
            email=personal_data.get("email"),
            phone=personal_data.get("phone"),
            city=personal_data.get("city"),
            address=personal_data.get("address"),
            headline=personal_data.get("headline"),
            background=personal_data.get("background"),
            date_of_birth=personal_data.get("date_of_birth"),
            citizenship=personal_data.get("citizenship"),
            pronouns=personal_data.get("pronouns"),
        )

        # Map education
        education = [
            Education(
                school=edu.get("school", ""),
                degree=edu.get("degree", ""),
                field_of_study=edu.get("field_of_study"),
                start_date=edu.get("start_date"),
                end_date=edu.get("end_date"),
                grade=edu.get("grade"),
                achievements=edu.get("achievements", []),
            )
            for edu in data.get("education", [])
        ]

        # Map experience
        experience = [
            Experience(
                company=exp.get("company", ""),
                position=exp.get("position", ""),
                employment_type=self._parse_enum(exp.get("employment_type"), EmploymentType, EmploymentType.FULL_TIME),
                location=exp.get("location"),
                location_type=self._parse_enum(exp.get("location_type"), LocationType, LocationType.ON_SITE),
                start_date=exp.get("start_date"),
                end_date=exp.get("end_date"),
                current=exp.get("current", False),
                description=exp.get("description"),
                achievements=exp.get("achievements", []),
            )
            for exp in data.get("experience", [])
        ]

        # Map skills
        skills = [
            Skill(
                name=skill.get("name", ""),
                proficiency=self._parse_enum(skill.get("proficiency"), SkillProficiency, None) if skill.get("proficiency") else None,
                years_experience=skill.get("years_experience"),
            )
            for skill in data.get("skills", [])
        ]

        # Map projects
        projects = [
            Project(
                name=proj.get("name", ""),
                description=proj.get("description"),
                start_date=proj.get("start_date"),
                end_date=proj.get("end_date"),
                url=proj.get("url"),
            )
            for proj in data.get("projects", [])
        ]

        # Map certifications
        certifications = [
            Certification(
                name=cert.get("name", ""),
                issuer=cert.get("issuer", ""),
                issue_date=cert.get("issue_date"),
                expiration_date=cert.get("expiration_date"),
                credential_id=cert.get("credential_id"),
                credential_url=cert.get("credential_url"),
            )
            for cert in data.get("certifications", [])
        ]

        # Map awards
        awards = [
            Award(
                title=award.get("title", ""),
                issuer=award.get("issuer"),
                issue_date=award.get("issue_date"),
                description=award.get("description"),
            )
            for award in data.get("awards", [])
        ]

        # Map publications
        publications = [
            Publication(
                title=pub.get("title", ""),
                publisher=pub.get("publisher"),
                publish_date=pub.get("publish_date"),
                url=pub.get("url"),
                description=pub.get("description"),
            )
            for pub in data.get("publications", [])
        ]

        # Map volunteering
        volunteering = [
            Volunteering(
                organization=vol.get("organization", ""),
                role=vol.get("role", ""),
                cause=vol.get("cause"),
                start_date=vol.get("start_date"),
                end_date=vol.get("end_date"),
                description=vol.get("description"),
            )
            for vol in data.get("volunteering", [])
        ]

        # Map languages
        languages = [
            Language(
                language=lang.get("language", ""),
                proficiency=self._parse_enum(lang.get("proficiency"), LanguageProficiency, LanguageProficiency.PROFESSIONAL),
            )
            for lang in data.get("languages", [])
        ]

        # Map socials
        socials = [
            Social(
                platform=social.get("platform", ""),
                url=social.get("url", ""),
                username=social.get("username"),
            )
            for social in data.get("socials", [])
        ]

        # Map recommendations
        recommendations = [
            Recommendation(
                name=rec.get("name", ""),
                title=rec.get("title"),
                relationship=rec.get("relationship"),
                text=rec.get("text"),
            )
            for rec in data.get("recommendations", [])
        ]

        return UserProfile(
            user_id=user_id,
            personal_info=personal_info,
            education=education,
            experience=experience,
            skills=skills,
            projects=projects,
            certifications=certifications,
            awards=awards,
            publications=publications,
            volunteering=volunteering,
            languages=languages,
            interests=data.get("interests", []),
            socials=socials,
            recommendations=recommendations,
            writing_preferences=None,
            created_at=now,
            updated_at=now,
        )

