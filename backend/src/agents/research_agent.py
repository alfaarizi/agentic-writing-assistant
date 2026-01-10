"""Research agent for gathering information."""

import asyncio
from typing import Dict, Any

from agents.base_agent import BaseAgent
from models.writing import (
    WritingRequest,
    CoverLetterContext,
    MotivationalLetterContext,
    SocialResponseContext,
    EmailContext,
)
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


    async def research(self, request: WritingRequest) -> Dict[str, Any]:
        """Research information based on writing request type."""
        context = request.context

        if isinstance(context, CoverLetterContext):
            company_info, job_info = await asyncio.gather(
                self.search_tool.search(f"{context.company} company information", max_results=5),
                self.search_tool.search(f"{context.job_title} position requirements", max_results=5),
            )
            return {"company_info": company_info, "job_info": job_info}

        if isinstance(context, MotivationalLetterContext):
            program_info = await self.search_tool.search(
                f"{context.program_name} program information", max_results=5
            )
            return {"program_info": program_info}

        if isinstance(context, (SocialResponseContext, EmailContext)):
            return {}

        return {}
