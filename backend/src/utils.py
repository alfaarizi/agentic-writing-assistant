"""Utility functions for the application."""

import json
from typing import Any, Dict
from uuid import uuid4


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid4())


def parse_json(text: str, default: Dict[str, Any]) -> Dict[str, Any]:
    """Parse JSON with fallback to default value."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return default