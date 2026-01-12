"""User profile endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from api.config import settings
from api.dependencies import get_database, get_resume_service
from models.user import UserProfile
from services.resume_service import ResumeService
from storage.database import Database

router = APIRouter()


@router.post("/users", response_model=UserProfile, status_code=status.HTTP_201_CREATED, tags=["Users"])
async def create_user(
    profile: UserProfile,
    database: Database = Depends(get_database),
) -> UserProfile:
    """
    Create a new user profile.
    
    Creates a new user with the provided profile information.
    """
    if await database.get_user_profile(profile.user_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {profile.user_id} already exists",
        )

    now = datetime.now(timezone.utc)
    profile.created_at = now
    profile.updated_at = now
    await database.save_user_profile(profile)
    return profile


@router.get("/users/{user_id}", response_model=UserProfile, tags=["Users"])
async def get_user(
    user_id: str,
    database: Database = Depends(get_database),
) -> UserProfile:
    """
    Get user profile by ID.
    
    Retrieves the complete profile information for a specific user.
    """
    if not (profile := await database.get_user_profile(user_id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    return profile


@router.put("/users/{user_id}", response_model=UserProfile, tags=["Users"])
async def update_user(
    user_id: str,
    profile: UserProfile,
    database: Database = Depends(get_database),
) -> UserProfile:
    """
    Update user profile.
    
    Updates the complete profile information for a specific user.
    """
    if user_id != profile.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID in path does not match request body",
        )

    if not (existing := await database.get_user_profile(user_id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )

    profile.created_at = existing.created_at
    profile.updated_at = datetime.now(timezone.utc)
    await database.save_user_profile(profile)
    return profile


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
async def delete_user(
    user_id: str,
    database: Database = Depends(get_database),
) -> None:
    """
    Delete user profile.
    
    Permanently deletes a user and all associated data.
    """
    if not await database.get_user_profile(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    await database.delete_user_profile(user_id)


@router.post("/users/{user_id}/resume", response_model=UserProfile, tags=["Users"])
async def upload_user_resume(
    user_id: str,
    file: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    database: Database = Depends(get_database),
    resume_service: ResumeService = Depends(get_resume_service),
) -> UserProfile:
    """
    Upload and parse resume.
    
    Uploads a resume file and automatically extracts profile information.
    Creates a new profile if the user doesn't exist, or updates the existing one.
    
    **Supported formats:** PDF, DOCX  
    **Max file size:** {settings.MAX_RESUME_FILE_SIZE_MB}MB
    """
    try:
        profile = await resume_service.parse_resume(user_id, file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}",
        )
    
    now = datetime.now(timezone.utc)
    if existing := await database.get_user_profile(user_id):
        profile.created_at = existing.created_at
    else:
        profile.created_at = now
    
    profile.updated_at = now
    await database.save_user_profile(profile)
    return profile
