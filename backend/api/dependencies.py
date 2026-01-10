"""Shared dependencies for API endpoints."""

from storage.database import Database
from storage.vector_db import VectorDB
from agents.orchestrator import OrchestratorAgent

vector_db = VectorDB()
database = Database()
orchestrator = OrchestratorAgent(database=database)


async def get_vector_db() -> VectorDB:
    """Dependency to get vector database instance."""
    return vector_db


async def get_database() -> Database:
    """Dependency to get database instance."""
    return database


async def get_orchestrator() -> OrchestratorAgent:
    """Dependency to get orchestrator agent instance."""
    return orchestrator
