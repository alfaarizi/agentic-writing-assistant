"""User profile endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import get_database
from models.user import UserProfile
from storage.database import Database

router = APIRouter()


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_profile(
    user_id: str,
    database: Database = Depends(get_database),
) -> UserProfile:
    """Get user profile by user ID."""
    profile = await database.get_user_profile(user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile for user {user_id} not found",
        )

    return profile


@router.post("/profile", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile: UserProfile,
    database: Database = Depends(get_database),
) -> UserProfile:
    """Create a new user profile."""
    existing = await database.get_user_profile(profile.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Profile for user {profile.user_id} already exists",
        )

    now = datetime.now(timezone.utc).isoformat()
    profile.created_at = now
    profile.updated_at = now

    await database.save_user_profile(profile)

    return profile


@router.put("/profile/{user_id}", response_model=UserProfile)
async def update_profile(
    user_id: str,
    profile: UserProfile,
    database: Database = Depends(get_database),
) -> UserProfile:
    """Update an existing user profile."""
    if user_id != profile.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID in path does not match user ID in profile",
        )

    existing = await database.get_user_profile(user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile for user {user_id} not found",
        )

    profile.updated_at = datetime.now(timezone.utc).isoformat()

    await database.save_user_profile(profile)

    return profile


@router.delete("/profile/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    user_id: str,
    database: Database = Depends(get_database),
) -> None:
    """Delete a user profile."""
    existing = await database.get_user_profile(user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile for user {user_id} not found",
        )

    await database.delete_user_profile(user_id)
