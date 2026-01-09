"""Research agent for gathering information."""

from typing import Dict, Any, List

from agents.base_agent import BaseAgent
from tools.search_tool import SearchTool


class ResearchAgent(BaseAgent):
    """Agent for gathering relevant information."""

    def __init__(self, model: str = None, temperature: float = 0.3):
        """Initialize research agent."""
        self.search_tool = SearchTool()
        super().__init__(model=model, temperature=temperature, tools=None)


    def get_system_prompt(self) -> str:
        """Get system prompt for research agent."""
        return \
"""
You are the Research Agent responsible for gathering relevant information.

Your role is to:
1. Identify what information is needed based on the writing request
2. Use search tools to gather company, job, program, or context information
3. Synthesize and organize research findings
4. Provide structured research data for the writing process

You focus on finding accurate, relevant, and up-to-date information.
"""


    async def research(
        self, 
        query: str,
        max_results: int = 5,
    ) -> List[Dict[str, str]]:
        """Research information using search tools."""
        return await self.search_tool.search(
            query, 
            max_results=max_results
        )
