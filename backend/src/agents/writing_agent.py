"""Writing agent for content generation."""

import json
from typing import Dict, Any

from agents.base_agent import BaseAgent
from models.writing import WritingRequest


class WritingAgent(BaseAgent):
    """Agent for generating initial content."""

    def __init__(self, model: str = None, temperature: float = 0.7):
        """Initialize writing agent."""
        super().__init__(model=model, temperature=temperature, tools=None)


    def get_system_prompt(self) -> str:
        """Get system prompt for writing agent."""
        return \
"""
You are the Writing Agent responsible for generating high-quality written content.

Your role is to:
1. Generate initial drafts based on research data and user profile
2. Adapt writing style to match requirements (formal, casual, professional)
3. Structure content logically and coherently
4. Integrate personalization elements naturally
5. Ensure content addresses all requirements

You create authentic, well-structured, and contextually appropriate writing.
"""


    async def write(
        self,
        request: WritingRequest,
        research_data: Dict[str, Any],
        user_profile: Dict[str, Any] = None,
    ) -> str:
        """Generate initial writing draft."""
        context_dict = request.context.model_dump()

        requirements_dict = request.requirements.model_dump()

        user_prompt = \
f"""
Generate a {request.type.replace('_', ' ')} based on the following information:

Writing Type: {request.type}

Context:
{json.dumps(context_dict, indent=2)}

Requirements:
{json.dumps(requirements_dict, indent=2)}
{'' if not research_data else f'{chr(10)}Research Data:{chr(10)}{json.dumps(research_data, indent=2)}'}
{'' if not user_profile else f'{chr(10)}User Profile:{chr(10)}{json.dumps(user_profile, indent=2)}'}
{'' if not request.additional_info else f'{chr(10)}Additional Info:{chr(10)}{request.additional_info}'}

Ensure the content is well-structured, coherent, and addresses all requirements.
"""

        return await self._generate(
            self.get_system_prompt(),
            user_prompt,
            temperature=self.temperature,
        )
