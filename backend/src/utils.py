"""Utility functions for the application."""

import json
from typing import Any, Dict
from uuid import uuid4


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid4())


def clean_json_response(response: str) -> str:
    """Remove markdown code blocks from JSON response.
    
    Args:
        response: Raw response string that may contain markdown code blocks
        
    Returns:
        Cleaned string ready for JSON parsing
    """
    cleaned = response.strip()
    
    # Remove opening markdown blocks
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    
    # Remove closing markdown blocks
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    
    return cleaned.strip()


def parse_json(text: str, default: Dict[str, Any]) -> Dict[str, Any]:
    """Parse JSON with automatic markdown cleaning and fallback to default value.
    
    Args:
        text: Raw JSON string (may contain markdown code blocks)
        default: Default value to return if parsing fails
        
    Returns:
        Parsed JSON dictionary or default value
    """
    try:
        cleaned = clean_json_response(text)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return default