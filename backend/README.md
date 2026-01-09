# Backend - Agentic Writing Assistant

FastAPI backend for the Agentic Writing Assistant application.

## Requirements

- **Python**: 3.11 or 3.12 (required for ChromaDB compatibility)
- **Virtual Environment**: Recommended (use `.venv` or similar)

## Setup

1. **Create and activate virtual environment** (if not already done):
```bash
# From project root
python3.11 -m venv .venv  # or python3.12
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies** (from `backend` directory):
```bash
cd backend

# Option 1: Install in editable mode (recommended)
pip install -e .

# Option 2: Install from requirements.txt
pip install -r requirements.txt
```

3. **Create a `.env` file** in the project root (copy from `.env.example`):
```bash
# From project root
cp .env.example .env
```

4. **Update `.env`** with your API keys, especially `OPENROUTER_API_KEY`.

## Running the Server

```bash
# From backend directory
cd backend

# Development mode
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python module
python -m uvicorn src.main:app --reload
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## Project Structure

```
backend/
├── api/                 # API layer (FastAPI application)
│   ├── v1/              # API version 1 endpoints
│   │   ├── health.py    # Health check endpoints
│   │   ├── writing.py   # Writing generation endpoints
│   │   └── profile.py   # User profile endpoints
│   ├── config.py        # Configuration (settings)
│   └── dependencies.py  # Shared dependencies
├── src/                 # Business logic (core)
│   ├── main.py          # FastAPI app entry point
│   ├── agents/          # Agent implementations
│   │   └── base_agent.py  # Base agent class with LangChain
│   ├── tools/           # Agent tools
│   ├── models/          # Data models
│   ├── storage/         # Database and storage
│   │   ├── vector_db.py      # ChromaDB vector database
│   │   └── document_store.py # SQLite document store
│   └── utils.py         # Utility functions
├── tests/               # Tests
├── requirements.txt     # Dependencies list
└── pyproject.toml       # Project configuration
```

## Technology Stack

- **Framework**: FastAPI
- **Agent Framework**: LangChain
- **LLM Provider**: OpenRouter (multi-model access)
- **Vector DB**: ChromaDB (local)
- **Document Store**: SQLite
- **Validation**: Pydantic

## Development

The project follows the architecture outlined in the main [OUTLINE.md](../OUTLINE.md).

### Code Style

- **Formatter**: Black (line length: 100)
- **Import Sorter**: isort (Black profile)
- **Python Versions**: 3.11, 3.12

### Environment Variables

Key environment variables (see `.env.example` for full list):
- `OPENROUTER_API_KEY` - Required for LLM access
- `VECTOR_DB_PATH` - Path for ChromaDB storage
- `SQLITE_DB_PATH` - Path for SQLite database
- `ENVIRONMENT` - `development` or `production`

## Next Steps

- Phase 1: Core Infrastructure ✅ (Complete)
- Phase 2: Basic Tools (text analyzer, search tool, grammar checker)
- Phase 3: Agent Implementation
- Phase 4: Quality & Performance Optimization
- Phase 5: Advanced Features
- Phase 6: Simple Frontend
- Phase 7: Polish & Optimization
