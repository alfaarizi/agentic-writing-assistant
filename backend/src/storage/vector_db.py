"""Vector database for user knowledge base using ChromaDB."""

from pathlib import Path
from typing import List, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from api.config import settings


class VectorDB:
    """ChromaDB wrapper for vector storage."""

    def __init__(self, collection_name: str = "user_knowledge"):
        """
        Initialize the vector database.

        Args:
            collection_name: Name of the ChromaDB collection
        """
        self.collection_name = collection_name
        self.client = chromadb.PersistentClient(
            path=settings.VECTOR_DB_PATH,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "User knowledge base for personalization"},
        )

    def add_documents(
        self,
        documents: List[str],
        metadatas: Optional[List[dict]] = None,
        ids: Optional[List[str]] = None,
    ) -> None:
        """
        Add documents to the vector database.

        Args:
            documents: List of document texts
            metadatas: Optional list of metadata dictionaries
            ids: Optional list of document IDs
        """
        self.collection.add(
            documents=documents,
            metadatas=metadatas or [{}] * len(documents),
            ids=ids or [f"doc_{i}" for i in range(len(documents))],
        )

    def query(
        self,
        query_texts: List[str],
        n_results: int = 5,
        where: Optional[dict] = None,
    ) -> dict:
        """
        Query the vector database.

        Args:
            query_texts: List of query texts
            n_results: Number of results to return
            where: Optional metadata filter

        Returns:
            Query results with documents, metadatas, and distances
        """
        return self.collection.query(
            query_texts=query_texts,
            n_results=n_results,
            where=where,
        )

    def delete(self, ids: Optional[List[str]] = None, where: Optional[dict] = None) -> None:
        """
        Delete documents from the vector database.

        Args:
            ids: Optional list of document IDs to delete
            where: Optional metadata filter for deletion
        """
        self.collection.delete(ids=ids, where=where)

    def get_all(self) -> dict:
        """
        Get all documents from the collection.

        Returns:
            All documents with their metadatas and IDs
        """
        return self.collection.get()

