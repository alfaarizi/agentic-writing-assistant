"""Health check endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from api.config import settings
from api.dependencies import get_database, get_vector_db
from models.common import HealthResponse
from storage.database import Database
from storage.vector_db import VectorDB

router = APIRouter()


async def _check_database(database: Database) -> str:
    """Check database connectivity."""
    try:
        async with database._get_connection() as conn:
            await conn.execute("SELECT 1")
        return "healthy"
    except Exception:
        return "unhealthy"


async def _check_vector_db(vector_db: VectorDB) -> str:
    """Check vector database connectivity."""
    try:
        vector_db.client.list_collections()
        return "healthy"
    except Exception:
        return "unhealthy"


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def get_health(
    database: Database = Depends(get_database),
    vector_db: VectorDB = Depends(get_vector_db),
) -> HealthResponse:
    """
    Get system health status.
    
    Returns the health status of the API and its dependencies.
    """
    db_status = await _check_database(database)
    vector_db_status = await _check_vector_db(vector_db)
    
    services = {
        "database": db_status,
        "vector_db": vector_db_status,
    }
    
    unhealthy_count = sum(1 for s in services.values() if s == "unhealthy")
    if unhealthy_count == 0:
        status = "healthy"
    elif unhealthy_count < len(services):
        status = "degraded"
    else:
        status = "unhealthy"

    return HealthResponse(
        status=status,
        version=settings.API_VERSION or "0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        services=services,
    )
