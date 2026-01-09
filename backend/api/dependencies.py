"""Shared dependencies for API endpoints."""

from src.storage.document_store import DocumentStore
from src.storage.vector_db import VectorDB

vector_db = VectorDB()
document_store = DocumentStore()


async def get_vector_db() -> VectorDB:
    """Dependency to get vector database instance."""
    return vector_db


async def get_document_store() -> DocumentStore:
    """Dependency to get document store instance."""
    return document_store

