"""Writing generation endpoints."""

import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from api.dependencies import get_database, get_orchestrator
from agents.orchestrator import OrchestratorAgent
from models.writing import WritingRequest, WritingResponse
from storage.database import Database

router = APIRouter()


@router.post("/users/{user_id}/writings", status_code=status.HTTP_200_OK, tags=["Writing"])
async def generate_writing(
    user_id: str,
    request: WritingRequest,
    orchestrator: OrchestratorAgent = Depends(get_orchestrator),
    database: Database = Depends(get_database),
):
    """
    Generate personalized writing.
    
    Generates personalized content using the multi-agent system.
    Returns a Server-Sent Events (SSE) stream with real-time progress updates.
    
    **Stream Format:**
    - Progress events: `{"stage": "...", "progress": 0-100, "message": "..."}`
    - Completion: `{"type": "complete", "data": {...WritingResponse}}`
    """
    if user_id != request.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID in path does not match request body",
        )
    
    queue: asyncio.Queue[str] = asyncio.Queue()
    orchestrator.event_queue = queue

    async def stream():
        task = asyncio.create_task(orchestrator.orchestrate(request))

        while not task.done():
            try:
                yield f"data: {queue.get_nowait()}\n\n"
            except asyncio.QueueEmpty:
                await asyncio.sleep(0.01)

        while not queue.empty():
            yield f"data: {queue.get_nowait()}\n\n"

        response = await task
        yield f"data: {json.dumps({'type': 'complete', 'data': response.model_dump()})}\n\n"

        await database.save_writing_request(request, response.request_id)
        await database.save_writing_response(response)

    return StreamingResponse(stream(), media_type="text/event-stream")


@router.get("/users/{user_id}/writings/{request_id}", response_model=WritingResponse, tags=["Writing"])
async def get_writing(
    user_id: str,
    request_id: str,
    database: Database = Depends(get_database),
) -> WritingResponse:
    """
    Get writing result.
    
    Retrieves a previously generated writing by request ID.
    """
    if not (response := await database.get_writing_response(request_id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing {request_id} not found",
        )
    
    writing_request = await database.get_writing_request(request_id)
    if writing_request and writing_request.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing {request_id} not found",
        )
    
    return response
