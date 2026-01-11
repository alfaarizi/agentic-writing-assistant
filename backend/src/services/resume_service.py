"""Resume service for text extraction and parsing."""

import io
from typing import Dict, Any
from datetime import datetime, timezone

import pdfplumber
from docx import Document

from models.user import (
    UserProfile, PersonalInfo, Education, Experience, Skill, Project,
    Certification, Award, Publication, Volunteering, Language, Social, Recommendation,
    WritingPreferences, EmploymentType, LocationType, LanguageProficiency, SkillProficiency
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
            first_name=personal_data.get("first_name") or "Unknown",
            last_name=personal_data.get("last_name") or "Unknown",
            preferred_name=personal_data.get("preferred_name"),
            pronouns=personal_data.get("pronouns"),
            date_of_birth=personal_data.get("date_of_birth"),
            email=personal_data.get("email"),
            phone=personal_data.get("phone"),
            city=personal_data.get("city"),
            country=personal_data.get("country"),
            citizenship=personal_data.get("citizenship"),
            headline=personal_data.get("headline"),
            summary=personal_data.get("summary"),
            background=personal_data.get("background"),
            interests=personal_data.get("interests") or [],
        )

        # Map education
        education = [
            Education(
                school=edu.get("school") or "Not specified",
                degree=edu.get("degree") or "Not specified",
                field_of_study=edu.get("field_of_study"),
                start_date=edu.get("start_date"),
                end_date=edu.get("end_date"),
                grade=edu.get("grade"),
                activities=edu.get("activities"),
                description=edu.get("description"),
                skills=edu.get("skills") or [],
            )
            for edu in data.get("education", [])
        ]

        # Map experience
        experience = [
            Experience(
                company=exp.get("company") or "Not specified",
                position=exp.get("position") or "Not specified",
                employment_type=self._parse_enum(exp.get("employment_type"), EmploymentType, None),
                location=exp.get("location"),
                location_type=self._parse_enum(exp.get("location_type"), LocationType, None),
                start_date=exp.get("start_date"),
                end_date=exp.get("end_date"),
                description=exp.get("description"),
                achievements=exp.get("achievements") or [],
                skills=exp.get("skills") or [],
            )
            for exp in data.get("experience", [])
        ]

        # Map skills
        skills = [
            Skill(
                name=skill.get("name") or "Unknown skill",
                proficiency=self._parse_enum(skill.get("proficiency"), SkillProficiency, None) if skill.get("proficiency") else None,
                years_experience=skill.get("years_experience"),
            )
            for skill in data.get("skills", [])
        ]

        # Map projects
        projects = [
            Project(
                name=proj.get("name") or "Unnamed project",
                description=proj.get("description") or "No description provided",
                start_date=proj.get("start_date"),
                end_date=proj.get("end_date"),
                url=proj.get("url"),
                skills=proj.get("skills") or [],
                contributors=proj.get("contributors") or [],
                associated_with=proj.get("associated_with"),
            )
            for proj in data.get("projects", [])
        ]

        # Map certifications
        certifications = [
            Certification(
                name=cert.get("name") or "Unnamed certification",
                issuer=cert.get("issuer") or "Unknown issuer",
                issue_date=cert.get("issue_date"),
                expiration_date=cert.get("expiration_date"),
                credential_id=cert.get("credential_id"),
                credential_url=cert.get("credential_url"),
                skills=cert.get("skills") or [],
            )
            for cert in data.get("certifications", [])
        ]

        # Map awards
        awards = [
            Award(
                title=award.get("title") or "Unnamed award",
                issuer=award.get("issuer") or "Unknown issuer",
                issue_date=award.get("issue_date"),
                description=award.get("description"),
                associated_with=award.get("associated_with"),
            )
            for award in data.get("awards", [])
        ]

        # Map publications
        publications = [
            Publication(
                title=pub.get("title") or "Untitled publication",
                publisher=pub.get("publisher"),
                publication_date=pub.get("publication_date"),
                url=pub.get("url"),
                description=pub.get("description"),
                authors=pub.get("authors") or [],
            )
            for pub in data.get("publications", [])
        ]

        # Map volunteering
        volunteering = [
            Volunteering(
                organization=vol.get("organization") or "Not specified",
                role=vol.get("role") or "Not specified",
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
                name=lang.get("name") or "Unknown language",
                proficiency=self._parse_enum(lang.get("proficiency"), LanguageProficiency, None),
            )
            for lang in data.get("languages", [])
        ]

        # Map socials
        socials = [
            Social(
                platform=social.get("platform") or "Unknown platform",
                url=social.get("url") or "https://example.com",
                username=social.get("username"),
            )
            for social in data.get("socials", [])
        ]

        # Map recommendations
        recommendations = [
            Recommendation(
                name=rec.get("name") or "Anonymous",
                position=rec.get("position"),
                relationship=rec.get("relationship"),
                message=rec.get("message") or "No message provided",
                date=rec.get("date"),
            )
            for rec in data.get("recommendations", [])
        ]

        return UserProfile(
            user_id=user_id,
            personal_info=personal_info,
            writing_preferences=WritingPreferences(),
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            awards=awards,
            publications=publications,
            volunteering=volunteering,
            skills=skills,
            languages=languages,
            socials=socials,
            recommendations=recommendations,
            created_at=now,
            updated_at=now,
        )

