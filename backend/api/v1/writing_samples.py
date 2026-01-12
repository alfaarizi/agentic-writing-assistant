"""Writing samples endpoints."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.dependencies import get_database
from models.user import WritingSample
from storage.database import Database

router = APIRouter()


@router.post("/users/{user_id}/writing-samples", response_model=WritingSample, status_code=status.HTTP_201_CREATED, tags=["Writing Samples"])
async def create_writing_sample(
    user_id: str,
    sample: WritingSample,
    database: Database = Depends(get_database),
) -> WritingSample:
    """
    Create writing sample.
    
    Saves a writing sample for future personalization reference.
    """
    if sample.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id in path does not match user_id in request body",
        )
    
    if not await database.get_user_profile(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    
    now = datetime.now(timezone.utc)
    sample.sample_id = sample.sample_id or str(uuid.uuid4())
    sample.created_at = sample.created_at or now
    sample.updated_at = sample.updated_at or now
    
    await database.save_writing_sample(sample)
    return sample


@router.get("/users/{user_id}/writing-samples", response_model=List[WritingSample], tags=["Writing Samples"])
async def list_writing_samples(
    user_id: str,
    type: Optional[str] = Query(None, description="Filter by type: cover_letter, motivational_letter, email, social_response"),
    database: Database = Depends(get_database),
) -> List[WritingSample]:
    """
    List writing samples.
    
    Retrieves all writing samples for a user, optionally filtered by type.
    """
    if not await database.get_user_profile(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    
    return await database.get_user_writing_samples(user_id, type=type)


@router.get("/users/{user_id}/writing-samples/{sample_id}", response_model=WritingSample, tags=["Writing Samples"])
async def get_writing_sample(
    user_id: str,
    sample_id: str,
    database: Database = Depends(get_database),
) -> WritingSample:
    """
    Get writing sample.
    
    Retrieves a specific writing sample by ID.
    """
    sample = await database.get_writing_sample(sample_id)
    if not sample or sample.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing sample {sample_id} not found",
        )
    return sample


@router.put("/users/{user_id}/writing-samples/{sample_id}", response_model=WritingSample, tags=["Writing Samples"])
async def update_writing_sample(
    user_id: str,
    sample_id: str,
    sample: WritingSample,
    database: Database = Depends(get_database),
) -> WritingSample:
    """
    Update writing sample.
    
    Replaces a writing sample with new content (full update).
    """
    if sample.sample_id != sample_id or sample.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IDs in path do not match request body",
        )
    
    if not (existing := await database.get_writing_sample(sample_id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing sample {sample_id} not found",
        )
    
    sample.updated_at = datetime.now(timezone.utc)
    sample.created_at = existing.created_at
    await database.save_writing_sample(sample)
    return sample


@router.patch("/users/{user_id}/writing-samples/{sample_id}", response_model=WritingSample, tags=["Writing Samples"])
async def patch_writing_sample(
    user_id: str,
    sample_id: str,
    sample: WritingSample,
    database: Database = Depends(get_database),
) -> WritingSample:
    """
    Partially update writing sample.
    
    Updates specific fields of a writing sample (partial update).
    """
    existing = await database.get_writing_sample(sample_id)

    if not existing or existing.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing sample {sample_id} not found",
        )
    
    update_dict = sample.model_dump(exclude_unset=True)
    update_dict.pop("sample_id", None)
    update_dict.pop("user_id", None)
    update_dict.pop("created_at", None)
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    updated_sample = existing.model_copy(update=update_dict)
    await database.save_writing_sample(updated_sample)
    return updated_sample


@router.delete("/users/{user_id}/writing-samples/{sample_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Writing Samples"])
async def delete_writing_sample(
    user_id: str,
    sample_id: str,
    database: Database = Depends(get_database),
) -> None:
    """
    Delete writing sample.
    
    Permanently deletes a writing sample.
    """
    sample = await database.get_writing_sample(sample_id)
    if not sample or sample.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Writing sample {sample_id} not found",
        )
    await database.delete_writing_sample(sample_id)

