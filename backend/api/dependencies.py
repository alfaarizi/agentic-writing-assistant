"""Shared dependencies for API endpoints."""

from storage.database import Database
from storage.vector_db import VectorDB
from agents.orchestrator import OrchestratorAgent
from services.resume_service import ResumeService

vector_db = VectorDB()
database = Database()
orchestrator = OrchestratorAgent(database=database)
resume_service = ResumeService()


async def get_vector_db() -> VectorDB:
    """Dependency to get vector database instance."""
    return vector_db


async def get_database() -> Database:
    """Dependency to get database instance."""
    return database


async def get_orchestrator() -> OrchestratorAgent:
    """Dependency to get orchestrator agent instance."""
    return orchestrator


def get_resume_service() -> ResumeService:
    """Dependency to get resume service instance."""
    return resume_service
