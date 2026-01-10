"""Writing endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import get_database, get_orchestrator
from agents.orchestrator import OrchestratorAgent
from models.writing import WritingRequest, WritingResponse, WritingAssessment
from storage.database import Database

router = APIRouter()


@router.post("/writing", response_model=WritingResponse, status_code=status.HTTP_201_CREATED)
async def create_writing(
    request: WritingRequest,
    orchestrator: OrchestratorAgent = Depends(get_orchestrator),
    database: Database = Depends(get_database),
) -> WritingResponse:
    """Create a writing request and generate content."""
    try:
        response = await orchestrator.orchestrate(request)

        # Save request and response separately
        await database.save_writing_request(request, response.request_id)
        await database.save_writing_response(response)

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate writing: {str(e)}",
        )


@router.get("/writing/{request_id}", response_model=WritingResponse)
async def get_writing(
    request_id: str,
    database: Database = Depends(get_database),
) -> WritingResponse:
    """Get writing response by request ID."""
    response = await database.get_writing_response(request_id)

    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing response {request_id} not found",
        )

    return response
