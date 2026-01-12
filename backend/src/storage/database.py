"""Database for structured data using SQLite with normalized schema."""

import json
import logging
import aiosqlite
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from api.config import settings

from models.writing import WritingRequest, WritingResponse, WritingAssessment
from models.user import UserProfile, WritingSample
from storage.vector_db import VectorDB


class Database:
    """SQLite-based database with normalized relational schema."""

    def __init__(self):
        """Initialize the database."""
        self.db_path = Path(settings.SQLITE_DB_PATH)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.vector_db = VectorDB()


    def _get_connection(self):
        """Get a database connection context manager."""
        return aiosqlite.connect(self.db_path)


    async def initialize(self) -> None:
        """Initialize database tables with proper normalization and constraints."""
        async with self._get_connection() as conn:
            # Enable foreign keys
            await conn.execute("PRAGMA foreign_keys = ON")

            # User profiles table
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS user_profiles (
                    user_id TEXT PRIMARY KEY,
                    personal_info TEXT NOT NULL,
                    education TEXT,
                    experience TEXT,
                    skills TEXT,
                    projects TEXT,
                    certifications TEXT,
                    awards TEXT,
                    publications TEXT,
                    volunteering TEXT,
                    languages TEXT,
                    socials TEXT,
                    recommendations TEXT,
                    writing_preferences TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )

            # Writing requests table
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS writing_requests (
                    request_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    context TEXT NOT NULL,
                    requirements TEXT NOT NULL,
                    additional_info TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
                )
                """
            )

            # Writing responses table
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS writing_responses (
                    request_id TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    content TEXT,
                    assessment TEXT,
                    suggestions TEXT,
                    iterations INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    error TEXT,
                    FOREIGN KEY (request_id) REFERENCES writing_requests(request_id) ON DELETE CASCADE
                )
                """
            )

            # Writing samples table
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS writing_samples (
                    sample_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    content TEXT NOT NULL,
                    type TEXT NOT NULL,
                    context TEXT NOT NULL,
                    quality_score REAL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
                )
                """
            )

            # Create indexes for query performance
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_requests_user_id ON writing_requests(user_id)")
            
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_requests_created_at ON writing_requests(created_at)")
            
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_responses_created_at ON writing_responses(created_at)")
            
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_samples_user_id ON writing_samples(user_id)")
            
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_samples_type ON writing_samples(type)")
            
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_samples_created_at ON writing_samples(created_at)")
            
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_responses_created_at ON writing_responses(created_at)")

            await conn.commit()


    # ============================================
    # User Profile Operations
    # ============================================

    async def _sync_profile_to_vectordb(self, profile: UserProfile) -> None:
        """Sync user profile chunks to VectorDB for semantic search."""
        try:
            self.vector_db.delete(where={"user_id": profile.user_id})
            
            chunks = profile.to_vectordb_chunks()
            
            if chunks:
                self.vector_db.add_documents(
                    documents=[chunk["text"] for chunk in chunks],
                    metadatas=[chunk["metadata"] for chunk in chunks],
                    ids=[chunk["id"] for chunk in chunks]
                )
        except Exception as e:
            logging.warning(f"Failed to sync profile to VectorDB for user {profile.user_id}: {e}")


    async def save_user_profile(self, profile: UserProfile) -> None:
        """Save or update a user profile and sync with VectorDB."""
        # Convert datetime objects to ISO strings for storage
        to_iso = lambda dt: dt.isoformat() if isinstance(dt, datetime) else dt

        async with self._get_connection() as conn:
            await conn.execute("PRAGMA foreign_keys = ON")
            
            await conn.execute(
                """
                INSERT OR REPLACE INTO user_profiles
                (user_id, personal_info, education, experience, skills, projects,
                 certifications, awards, publications, volunteering, languages,
                 socials, recommendations, writing_preferences, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile.user_id,
                    json.dumps(profile.personal_info.model_dump(mode='json')),
                    json.dumps([e.model_dump(mode='json') for e in (profile.education or [])]),
                    json.dumps([e.model_dump(mode='json') for e in (profile.experience or [])]),
                    json.dumps([s.model_dump(mode='json') for s in (profile.skills or [])]),
                    json.dumps([p.model_dump(mode='json') for p in (profile.projects or [])]),
                    json.dumps([c.model_dump(mode='json') for c in (profile.certifications or [])]),
                    json.dumps([a.model_dump(mode='json') for a in (profile.awards or [])]),
                    json.dumps([p.model_dump(mode='json') for p in (profile.publications or [])]),
                    json.dumps([v.model_dump(mode='json') for v in (profile.volunteering or [])]),
                    json.dumps([l.model_dump(mode='json') for l in (profile.languages or [])]),
                    json.dumps([s.model_dump(mode='json') for s in (profile.socials or [])]),
                    json.dumps([r.model_dump(mode='json') for r in (profile.recommendations or [])]),
                    json.dumps(profile.writing_preferences.model_dump(mode='json')),
                    to_iso(profile.created_at),
                    to_iso(profile.updated_at),
                ),
            )
            await conn.commit()

        # Sync profile chunks to VectorDB
        await self._sync_profile_to_vectordb(profile)


    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get a user profile by ID."""
        async with self._get_connection() as conn:
            async with conn.execute(
                "SELECT * FROM user_profiles WHERE user_id = ?", (user_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return UserProfile(
                        user_id=row[0],
                        personal_info=json.loads(row[1]),
                        education=json.loads(row[2]) if row[2] else [],
                        experience=json.loads(row[3]) if row[3] else [],
                        skills=json.loads(row[4]) if row[4] else [],
                        projects=json.loads(row[5]) if row[5] else [],
                        certifications=json.loads(row[6]) if row[6] else [],
                        awards=json.loads(row[7]) if row[7] else [],
                        publications=json.loads(row[8]) if row[8] else [],
                        volunteering=json.loads(row[9]) if row[9] else [],
                        languages=json.loads(row[10]) if row[10] else [],
                        socials=json.loads(row[11]) if row[11] else [],
                        recommendations=json.loads(row[12]) if row[12] else [],
                        writing_preferences=json.loads(row[13]),
                        created_at=datetime.fromisoformat(row[14]),
                        updated_at=datetime.fromisoformat(row[15]),
                    )
                return None


    async def delete_user_profile(self, user_id: str) -> None:
        """Delete a user profile by ID and clean up VectorDB."""
        async with self._get_connection() as conn:
            await conn.execute("PRAGMA foreign_keys = ON")
            
            await conn.execute("DELETE FROM user_profiles WHERE user_id = ?", (user_id,))
            
            await conn.commit()
        try:
            self.vector_db.delete(where={"user_id": user_id})
        except Exception as e:
            logging.warning(f"Failed to delete profile from VectorDB for user {user_id}: {e}")


    # ============================================
    # Writing Request Operations
    # ============================================

    async def save_writing_request(self, request: WritingRequest, request_id: str) -> None:
        """Save or update a writing request."""
        now = datetime.now(timezone.utc).isoformat()

        async with self._get_connection() as conn:
            await conn.execute("PRAGMA foreign_keys = ON")
            
            await conn.execute(
                """
                INSERT OR REPLACE INTO writing_requests
                (request_id, user_id, type, context, requirements, additional_info, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    request_id,
                    request.user_id,
                    request.type,
                    json.dumps(request.context.model_dump()),
                    json.dumps(request.requirements.model_dump()),
                    request.additional_info,
                    now,
                    now,
                ),
            )
            await conn.commit()


    async def get_writing_request(self, request_id: str) -> Optional[WritingRequest]:
        """Get a writing request by ID."""
        async with self._get_connection() as conn:
            async with conn.execute(
                "SELECT * FROM writing_requests WHERE request_id = ?", (request_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return WritingRequest(
                        user_id=row[1],
                        type=row[2],
                        context=json.loads(row[3]),
                        requirements=json.loads(row[4]),
                        additional_info=row[5],
                    )
                return None


    async def get_user_writing_requests(self, user_id: str) -> List[WritingRequest]:
        """Get all writing requests for a user."""
        async with self._get_connection() as conn:
            async with conn.execute(
                "SELECT * FROM writing_requests WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,),
            ) as cursor:
                rows = await cursor.fetchall()
                return [
                    WritingRequest(
                        user_id=row[1],
                        type=row[2],
                        context=json.loads(row[3]),
                        requirements=json.loads(row[4]),
                        additional_info=row[5],
                    )
                    for row in rows
                ]


    # ============================================
    # Writing Response Operations
    # ============================================

    async def save_writing_response(self, response: WritingResponse) -> None:
        """Save or update a writing response."""
        async with self._get_connection() as conn:
            await conn.execute("PRAGMA foreign_keys = ON")
            await conn.execute(
                """
                INSERT OR REPLACE INTO writing_responses
                (request_id, status, content, assessment, suggestions, iterations, created_at, updated_at, error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    response.request_id,
                    response.status,
                    response.content,
                    json.dumps(response.assessment.model_dump()) if response.assessment else None,
                    json.dumps(response.suggestions),
                    response.iterations,
                    response.created_at,
                    response.updated_at,
                    response.error,
                ),
            )
            await conn.commit()


    async def get_writing_response(self, request_id: str) -> Optional[WritingResponse]:
        """Get a writing response by request ID."""
        async with self._get_connection() as conn:
            async with conn.execute(
                "SELECT * FROM writing_responses WHERE request_id = ?", (request_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return WritingResponse(
                        request_id=row[0],
                        status=row[1],
                        content=row[2],
                        assessment=WritingAssessment(**json.loads(row[3])) if row[3] else None,
                        suggestions=json.loads(row[4]),
                        iterations=row[5],
                        created_at=row[6],
                        updated_at=row[7],
                        error=row[8],
                    )
                return None


    # ============================================
    # Writing Sample Operations
    # ============================================


    async def _sync_sample_to_vectordb(self, sample: WritingSample) -> None:
        """Sync writing sample to VectorDB for semantic search."""
        try:
            chunk = sample.to_vectordb_chunk()
            self.vector_db.upsert_documents(
                documents=[chunk["text"]],
                metadatas=[chunk["metadata"]],
                ids=[chunk["id"]]
            )
        except Exception as e:
            logging.warning(f"Failed to sync sample to VectorDB for user {sample.user_id}, sample {sample.sample_id}: {e}")


    async def save_writing_sample(self, sample: WritingSample) -> None:
        """Save or update a writing sample."""
        to_iso = lambda dt: dt.isoformat() if isinstance(dt, datetime) else dt
        
        async with self._get_connection() as conn:
            await conn.execute(
                """
                INSERT OR REPLACE INTO writing_samples
                (sample_id, user_id, content, type, context, quality_score, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    sample.sample_id,
                    sample.user_id,
                    sample.content,
                    sample.type,
                    json.dumps(sample.context),
                    sample.quality_score,
                    to_iso(sample.created_at),
                    to_iso(sample.updated_at),
                ),
            )
            await conn.commit()
        
        await self._sync_sample_to_vectordb(sample)


    async def get_writing_sample(self, sample_id: str) -> Optional[WritingSample]:
        """Get a writing sample by ID."""
        async with self._get_connection() as conn:
            async with conn.execute(
                "SELECT * FROM writing_samples WHERE sample_id = ?", (sample_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return WritingSample(
                        sample_id=row[0],
                        user_id=row[1],
                        content=row[2],
                        type=row[3],
                        context=json.loads(row[4]),
                        quality_score=row[5],
                        created_at=datetime.fromisoformat(row[6]) if isinstance(row[6], str) else row[6],
                        updated_at=datetime.fromisoformat(row[7]) if isinstance(row[7], str) else row[7],
                    )
                return None


    async def get_user_writing_samples(
        self, user_id: str, type: Optional[str] = None
    ) -> List[WritingSample]:
        """Get all writing samples for a user, optionally filtered by type."""
        query = "SELECT * FROM writing_samples WHERE user_id = ?"
        params = [user_id]
        if type:
            query += " AND type = ?"
            params.append(type)
        query += " ORDER BY created_at DESC"
        
        async with self._get_connection() as conn:
            async with conn.execute(query, params) as cursor:
                rows = await cursor.fetchall()
            
            from_iso = lambda s: datetime.fromisoformat(s) if isinstance(s, str) else s
            return [
                WritingSample(
                    sample_id=row[0],
                    user_id=row[1],
                    content=row[2],
                    type=row[3],
                    context=json.loads(row[4]),
                    quality_score=row[5],
                    created_at=from_iso(row[6]),
                    updated_at=from_iso(row[7]),
                )
                for row in rows
            ]


    async def delete_writing_sample(self, sample_id: str) -> None:
        """Delete a writing sample."""
        if sample := await self.get_writing_sample(sample_id):
            try:
                self.vector_db.delete(ids=[f"{sample.user_id}_sample_{sample_id}"])
            except Exception as e:
                logging.warning(f"Failed to delete sample from VectorDB for user {sample.user_id}, sample {sample_id}: {e}")

        async with self._get_connection() as conn:
            await conn.execute("DELETE FROM writing_samples WHERE sample_id = ?", (sample_id,))
            await conn.commit()