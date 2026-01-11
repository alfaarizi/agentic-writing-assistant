"""User profile endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from api.config import settings
from api.dependencies import get_database, get_resume_service
from models.user import UserProfile
from services.resume_service import ResumeService
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


@router.post("/profile/{user_id}/resume", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    user_id: str,
    file: UploadFile = File(...),
    database: Database = Depends(get_database),
    resume_service: ResumeService = Depends(get_resume_service),
) -> UserProfile:
    """
    Upload and parse a resume to create or update a user profile.
    
    **Limits:**
    - Max {settings.MAX_RESUME_FILE_SIZE_MB}MB per file
    - Supported formats: PDF, DOCX
    """
    # Parse resume
    try:
        profile = await resume_service.parse_resume(user_id, file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}",
        )
    
    # Save profile
    existing = await database.get_user_profile(user_id)
    
    if existing:
        profile.created_at = existing.created_at
    else:
        profile.created_at = datetime.now(timezone.utc).isoformat()
    
    profile.updated_at = datetime.now(timezone.utc).isoformat()
    await database.save_user_profile(profile)
    
    return profile
