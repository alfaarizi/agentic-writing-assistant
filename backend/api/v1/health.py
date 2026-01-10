"""Health check endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request

from api.dependencies import get_database, get_vector_db
from models.common import HealthResponse
from storage.database import Database
from storage.vector_db import VectorDB

router = APIRouter()


async def check_db(database: Database) -> str:
    """Check database connectivity."""
    try:
        async with await database._get_connection() as conn:
            await conn.execute("SELECT 1")
            await conn.commit()
        return "healthy"
    except Exception:
        return "unhealthy"


async def check_vector_db(vector_db: VectorDB) -> str:
    """Check vector database connectivity."""
    try:
        # Simple check - try to get collection count
        collections = vector_db.client.list_collections()
        return "healthy"
    except Exception:
        return "unhealthy"


@router.get("/health", response_model=HealthResponse)
async def health_check(
    request: Request,
    database: Database = Depends(get_database),
    vector_db: VectorDB = Depends(get_vector_db),
) -> HealthResponse:
    """Health check endpoint with service status."""
    services = {}
    status = "healthy"

    # Check database
    db_status = await check_db(database)
    services["database"] = db_status
    if db_status != "healthy":
        status = "degraded" if status == "healthy" else "unhealthy"

    # Check vector database
    vector_db_status = await check_vector_db(vector_db)
    services["vector_db"] = vector_db_status
    if vector_db_status != "healthy":
        status = "degraded" if status == "healthy" else "unhealthy"

    # Get version from app
    version = request.app.version if hasattr(request.app, "version") else "0.1.0"

    return HealthResponse(
        status=status,
        version=version,
        timestamp=datetime.now(timezone.utc).isoformat(),
        services=services,
    )
