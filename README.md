# Agentic Writing Assistant

An intelligent, multi-agent AI system for generating personalized writing content including cover letters, motivational letters, professional emails, and social responses.

## Overview

The Agentic Writing Assistant uses a sophisticated multi-agent architecture powered by LangGraph to orchestrate specialized AI agents. Each agent focuses on a specific aspect of writing generation—research, content creation, personalization, refinement, and quality assurance—ensuring high-quality, personalized output that reflects your unique voice and style.

## Features

- **Multi-Agent System**: Specialized agents for research, writing, personalization, refinement, and quality assurance
- **Adaptive Workflow**: LangGraph-based orchestration with intelligent routing and quality-driven iteration
- **Personalization**: Semantic search of user profiles and writing samples for authentic voice
- **Quality Assurance**: Comprehensive assessment across 7 dimensions (coherence, naturalness, grammar, completeness, lexical quality, personalization)
- **Gap Analysis**: Intelligent detection and classification of information, personalization, and quality gaps
- **Real-time Progress**: Server-Sent Events (SSE) streaming for live generation updates
- **User Profiles**: Comprehensive profile management with education, experience, skills, projects, and more
- **Writing Samples**: Automatic saving and retrieval of high-quality generated content
- **Vector Database**: ChromaDB for semantic search of user knowledge and writing samples

## Architecture

### Multi-Agent System

1. **ResearchAgent**: Gathers relevant information about companies, programs, or topics
2. **WritingAgent**: Creates initial content drafts with strong structure and messaging
3. **PersonalizationAgent**: Infuses user's authentic voice using semantic search of profiles and samples
4. **RefinerAgent**: Improves structure, clarity, and flow while preserving voice
5. **QualityAssuranceAgent**: Evaluates content across 7 quality dimensions
6. **GapAnalyzer**: Identifies and classifies gaps (information, personalization, quality)
7. **OrchestratorAgent**: Coordinates workflow using LangGraph state machine

### Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- LangChain & LangGraph - Agent orchestration and state management
- OpenRouter - Multi-model LLM access
- ChromaDB - Vector database for semantic search
- SQLite - Relational database for structured data
- Pydantic - Data validation and serialization

**Frontend:**
- React 19 - UI framework
- TypeScript - Type safety
- Vite - Fast build tool
- Tailwind CSS - Utility-first styling
- Radix UI - Accessible component primitives

## Quick Start

### Prerequisites

- **Python**: 3.11 or 3.12
- **Node.js**: 18+ (for frontend)
- **OpenRouter API Key**: Required for LLM access

### Backend Setup

1. **Create virtual environment:**
```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -e .
# or
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
# Create .env file in backend directory
OPENROUTER_API_KEY=your_key_here
DEFAULT_MODEL=google/gemini-2.5-flash
VECTOR_DB_PATH=./data/vector_db
SQLITE_DB_PATH=./data/writing_assistant.db
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
```

4. **Run the server:**
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open browser:**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:8000/api/v1/docs

## Project Structure

```
agentic-writing-assistant/
├── backend/
│   ├── api/                        # API layer
│   │   ├── v1/                     # API v1 endpoints
│   │   │   ├── health.py           # Health check
│   │   │   ├── profile.py          # User profiles
│   │   │   ├── writing.py          # Writing generation
│   │   │   └── writing_samples.py  # Writing samples
│   │   ├── config.py               # Settings
│   │   └── dependencies.py         # Shared dependencies
│   ├── src/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── agents/                 # AI agents
│   │   │   ├── base_agent.py
│   │   │   ├── orchestrator.py
│   │   │   ├── research_agent.py
│   │   │   ├── writing_agent.py
│   │   │   ├── personalization_agent.py
│   │   │   ├── refining_agent.py
│   │   │   └── quality_assurance_agent.py
│   │   ├── tools/                  # Agent tools
│   │   │   ├── gap_analyzer.py
│   │   │   ├── grammar_checker.py
│   │   │   ├── resume_parser.py
│   │   │   ├── search_tool.py
│   │   │   └── text_analyzer.py
│   │   ├── models/                 # Data models
│   │   │   ├── user.py
│   │   │   ├── writing.py
│   │   │   └── common.py
│   │   └── storage/                # Database
│   │       ├── database.py         # SQLite
│   │       └── vector_db.py        # ChromaDB
│   ├── fly.toml                    # Fly.io config
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── profile/            # Profile form components
│   │   │   ├── ui/                 # UI primitives
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── WritingForm.tsx
│   │   │   ├── WritingResult.tsx
│   │   │   └── StatusMonitor.tsx
│   │   ├── lib/
│   │   │   └── api.ts              # API client
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Health
- `GET /api/v1/health` - System health check

### User Profiles
- `GET /api/v1/users/{user_id}`     - Get user profile
- `POST /api/v1/users`              - Create user profile
- `PATCH /api/v1/users/{user_id}`   - Update user profile
- `DELETE /api/v1/users/{user_id}`  - Delete user profile

### Writing Samples
- `GET /api/v1/users/{user_id}/writing-samples`                 - List user's writing samples
- `GET /api/v1/users/{user_id}/writing-samples/{sample_id}`     - Get specific sample
- `POST /api/v1/users/{user_id}/writing-samples`                - Create writing sample
- `PATCH /api/v1/users/{user_id}/writing-samples/{sample_id}`   - Update sample
- `DELETE /api/v1/users/{user_id}/writing-samples/{sample_id}`  - Delete sample

### Writing Generation
- `POST /api/v1/users/{user_id}/writings`               - Generate writing (SSE stream)
- `GET /api/v1/users/{user_id}/writings/{request_id}`   - Get writing response

## Development

### Code Style

**Backend:**
- Formatter: Black (line length: 100)
- Import sorter: isort (Black profile)
- Python: 3.11, 3.12

**Frontend:**
- ESLint for linting
- TypeScript strict mode
- Prettier (via ESLint)

### Environment Variables

**Required:**
- `OPENROUTER_API_KEY` - OpenRouter API key for LLM access
- `TAVILY_API_KEY` - For web search

**Optional:**
- `DEFAULT_MODEL` - Default LLM model (default: `google/gemini-2.5-flash`)
- `SERPAPI_KEY` - For alternative search results
- `GRAMMARLY_API_KEY` - For grammar checking (optional, uses LanguageTool by default)
- `VECTOR_DB_PATH` - ChromaDB storage path (default: `./data/vector_db`)
- `SQLITE_DB_PATH` - SQLite database path (default: `./data/writing_assistant.db`)
- `ENVIRONMENT` - `development` or `production`
- `FRONTEND_URL` - Frontend URL for CORS

## Deployment

### Backend (Fly.io)

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login and create app:**
```bash
fly auth login
fly launch
```

3. **Set secrets:**
```bash
fly secrets set OPENROUTER_API_KEY=your_key_here
fly secrets set TAVILY_API_KEY=your_key_here
```

4. **Deploy:**
```bash
fly deploy
```

### Frontend (Vercel)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

### Database Reset (Production)

To reset the database on Fly.io:

1. **SSH into instance:**
```bash
fly ssh console -a agentic-writing-assistant
```

2. **Delete database files:**
```bash
rm -f /app/data/writing_assistant.db
rm -rf /app/data/vector_db
exit
```

3. **Restart app:**
```bash
fly apps restart agentic-writing-assistant
```

## Workflow

The orchestrator uses a LangGraph state machine with the following flow:

1. **Research**             → Gather relevant information
2. **Write**                → Create initial content
3. **Personalize**          → Add user's authentic voice
4. **Assess**               → Evaluate quality
5. **Route**                → Decide next step:
   - **Complete**               - If quality meets threshold
   - **Analyze Gaps**           - If quality < 85 and first pass
   - **Refine**                 - If quality needs improvement
   - **Research**               - If information gaps detected
   - **Personalize**            - If personalization gaps detected
6. **Refine**               → Improve structure and clarity (iterative)
7. **Final Personalize**    → Restore voice after refinement
8. **Complete**             → Return final content

## License

See [LICENSE](LICENSE) file for details.
