"""Document store using SQLite for structured data."""

import aiosqlite
from pathlib import Path
from typing import Any, Dict, List, Optional

from api.config import settings


class DocumentStore:
    """SQLite-based document store for structured data."""

    def __init__(self):
        """Initialize the document store."""
        self.db_path = Path(settings.SQLITE_DB_PATH)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    async def _get_connection(self) -> aiosqlite.Connection:
        """Get a database connection."""
        return await aiosqlite.connect(self.db_path)

    async def initialize(self) -> None:
        """Initialize database tables."""
        async with await self._get_connection() as conn:
            # Writing requests table
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS writing_requests (
                    request_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    writing_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    content TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )

            # User profiles table
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS user_profiles (
                    user_id TEXT PRIMARY KEY,
                    profile_data TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )

            await conn.commit()

    async def save_writing_request(self, request_data: Dict[str, Any]) -> None:
        """
        Save a writing request to the database.

        Args:
            request_data: Writing request data dictionary
        """
        async with await self._get_connection() as conn:
            await conn.execute(
                """
                INSERT OR REPLACE INTO writing_requests
                (request_id, user_id, writing_type, status, content, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    request_data.get("request_id"),
                    request_data.get("user_id"),
                    request_data.get("writing_type"),
                    request_data.get("status", "pending"),
                    request_data.get("content"),
                    request_data.get("created_at"),
                    request_data.get("updated_at"),
                ),
            )
            await conn.commit()

    async def get_writing_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a writing request by ID.

        Args:
            request_id: Request ID

        Returns:
            Writing request data or None if not found
        """
        async with await self._get_connection() as conn:
            conn.row_factory = aiosqlite.Row
            async with conn.execute(
                "SELECT * FROM writing_requests WHERE request_id = ?", (request_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return dict(row)
                return None

    async def save_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> None:
        """
        Save a user profile to the database.

        Args:
            user_id: User ID
            profile_data: Profile data dictionary
        """
        import json

        async with await self._get_connection() as conn:
            from datetime import datetime, timezone

            now = datetime.now(timezone.utc).isoformat()
            await conn.execute(
                """
                INSERT OR REPLACE INTO user_profiles
                (user_id, profile_data, created_at, updated_at)
                VALUES (?, ?, COALESCE((SELECT created_at FROM user_profiles WHERE user_id = ?), ?), ?)
                """,
                (user_id, json.dumps(profile_data), user_id, now, now),
            )
            await conn.commit()

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a user profile by ID.

        Args:
            user_id: User ID

        Returns:
            Profile data or None if not found
        """
        import json

        async with await self._get_connection() as conn:
            async with conn.execute(
                "SELECT profile_data FROM user_profiles WHERE user_id = ?", (user_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row[0])
                return None

