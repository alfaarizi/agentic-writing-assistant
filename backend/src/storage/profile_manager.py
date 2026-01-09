"""User profile management for CRUD operations."""

from typing import Dict, Optional

from storage.document_store import DocumentStore


class ProfileManager:
    """Manages user profile operations."""

    def __init__(self, document_store: Optional[DocumentStore] = None):
        """Initialize profile manager."""
        self.document_store = document_store or DocumentStore()


    async def get_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by ID."""
        return await self.document_store.get_user_profile(user_id)


    async def create_profile(self, user_id: str, profile_data: Dict) -> None:
        """Create a new user profile."""
        await self.document_store.save_user_profile(user_id, profile_data)


    async def update_profile(self, user_id: str, profile_data: Dict) -> None:
        """Update an existing user profile."""
        existing = await self.get_profile(user_id)
        if existing:
            updated = {**existing, **profile_data}
            await self.document_store.save_user_profile(user_id, updated)
        else:
            await self.document_store.save_user_profile(user_id, profile_data)


    async def delete_profile(self, user_id: str) -> None:
        """Delete a user profile."""
        pass

