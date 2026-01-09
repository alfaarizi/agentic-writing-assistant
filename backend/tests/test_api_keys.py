"""Minimal tests to verify API keys are working."""

import pytest

from tools.search_tool import SearchTool
from tools.grammar_checker import GrammarChecker
from agents.base_agent import BaseAgent


class TestAgent(BaseAgent):
    """Simple test agent for testing OpenRouter."""

    def get_system_prompt(self) -> str:
        """Get system prompt for test agent."""
        return "You are a helpful assistant."


@pytest.mark.asyncio
async def test_openrouter():
    """Test OpenRouter API key."""
    agent = TestAgent()
    response = await agent._generate(
        "You are a helpful assistant.",
        "Say 'Hello' in one word.",
        temperature=0.3,
    )
    assert response
    assert len(response) > 0


@pytest.mark.asyncio
async def test_tavily():
    """Test Tavily API key."""
    tool = SearchTool()
    results = await tool.search("Python programming", max_results=2, use_tavily=True)
    assert results
    assert len(results) > 0
    assert "title" in results[0]
    assert "url" in results[0]


@pytest.mark.asyncio
async def test_serpapi():
    """Test SerpAPI key."""
    tool = SearchTool()
    results = await tool.search("Python programming", max_results=2, use_tavily=False)
    assert results
    assert len(results) > 0
    assert "title" in results[0]
    assert "url" in results[0]


@pytest.mark.asyncio
async def test_languagetool():
    """Test LanguageTool API."""
    checker = GrammarChecker()
    result = await checker.check("This is a test sentence with a error.")
    assert "error_count" in result
    assert "language" in result
    assert isinstance(result["error_count"], int)