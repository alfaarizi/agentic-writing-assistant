"""Pytest configuration for test path setup."""

import sys
from pathlib import Path

# Add backend directory to Python path for api imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Add src directory to Python path for src imports
src_path = backend_path / "src"
sys.path.insert(0, str(src_path))
