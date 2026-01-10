"""Personalization agent for user profile integration."""

import json
from typing import Dict, Any, Optional

from agents.base_agent import BaseAgent
from storage.database import Database


class PersonalizationAgent(BaseAgent):
    """Agent for ensuring content reflects user's authentic voice."""

    def __init__(
        self,
        model: str = None,
        temperature: float = 0.5,
        database: Optional[Database] = None,
    ):
        """Initialize personalization agent.
        
        Args:
            model: LLM model name
            temperature: LLM temperature for generation
            database: Database instance (injected dependency)
        """
        super().__init__(model=model, temperature=temperature, tools=None)
        self.database = database


    def get_system_prompt(self) -> str:
        """Get system prompt for personalization agent."""
        return \
"""
You are the Personalization Agent responsible for ensuring content reflects the user's authentic voice.

Your role is to:
1. Access and analyze user profile information
2. Maintain consistent voice across documents
3. Personalize content based on user history, preferences, and achievements
4. Ensure authenticity and relevance
5. Integrate personal details naturally

You ensure the writing sounds genuine and reflects the user's unique style and background.
"""


    async def personalize(
        self,
        content: str,
        user_id: str,
        context: Dict[str, Any] = None,
    ) -> str:
        """Personalize content based on user profile."""
        profile = await self.database.get_user_profile(user_id)

        if not profile:
            return content

        user_prompt = \
f"""
Personalize the following content to reflect the user's authentic voice and background.

Content:
{content}

User Profile:
{json.dumps(profile.model_dump(), indent=2)}

Context:
{json.dumps(context or {}, indent=2)}

Provide a personalized version that naturally integrates the user's background, achievements, and writing style.
"""

        return await self._generate(
            self.get_system_prompt(),
            user_prompt,
            temperature=self.temperature,
        )
