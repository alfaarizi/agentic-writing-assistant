"""Writing endpoints."""

import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from api.dependencies import get_database, get_orchestrator
from agents.orchestrator import OrchestratorAgent, StreamEvent
from models.writing import WritingRequest, WritingResponse, WritingAssessment
from storage.database import Database

router = APIRouter()


@router.post("/writing", status_code=status.HTTP_200_OK)
async def create_writing(
    request: WritingRequest,
    orchestrator: OrchestratorAgent = Depends(get_orchestrator),
    database: Database = Depends(get_database),
):
    """Create writing request and stream status updates in real-time."""
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
