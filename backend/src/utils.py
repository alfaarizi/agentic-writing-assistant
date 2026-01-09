"""Utility functions for the application."""

from uuid import uuid4


def generate_request_id() -> str:
    """
    Generate a unique request ID.

    Returns:
        UUID v4 string
    """
    return str(uuid4())