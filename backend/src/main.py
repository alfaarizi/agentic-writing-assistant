"""FastAPI application main file."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.dependencies import database
from api.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    await database.initialize()
    yield
    # Shutdown (if needed)


app = FastAPI(
    title="Agentic Writing Assistant API",
    description="An intelligent, multi-agent AI system for generating personalized writing",
    version="0.1.0",
    docs_url=f"{settings.API_BASE_URL}/docs",
    redoc_url=f"{settings.API_BASE_URL}/redoc",
    lifespan=lifespan,
)

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Agentic Writing Assistant API", "version": "0.1.0"}


# Include API v1 routes
from api.v1 import health, profile, writing

app.include_router(health.router, prefix=settings.API_BASE_URL, tags=["health"])
app.include_router(writing.router, prefix=settings.API_BASE_URL, tags=["writing"])
app.include_router(profile.router, prefix=settings.API_BASE_URL, tags=["profile"])