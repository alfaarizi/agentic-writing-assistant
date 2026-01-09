"""Coherence analysis tool using LLM-based semantic analysis."""

from typing import Dict

from agents.base_agent import BaseAgent
from utils import parse_json


class CoherenceAnalyzer:
    """Analyzes text coherence using LLM-based semantic analysis."""

    def __init__(self, agent: BaseAgent):
        """Initialize coherence analyzer with agent."""
        self.agent = agent


    async def analyze(self, text: str) -> Dict:
        """Analyze text coherence and flow."""
        system_prompt = \
f"""
You are an expert writing analyst specializing in text coherence and flow analysis.
"""

        user_prompt = \
f"""Analyze the coherence and flow of the following text. Consider:
1. Logical organization and structure
2. Smooth transitions between ideas
3. Paragraph structure and flow
4. Overall readability

Text to analyze:
{text}

Provide:
1. A coherence score from 0-100
2. Specific feedback on strengths and weaknesses
3. Suggestions for improvement

Format your response as JSON:
{{
    "score": <0-100>,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "suggestions": ["suggestion1", "suggestion2"]
}}
"""

        response = await self.agent._generate(
            system_prompt,
            user_prompt,
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        result = parse_json(response, {
            "score": 50,
            "strengths": [],
            "weaknesses": [],
            "suggestions": [],
        })

        return {
            "score": result.get("score", 50),
            "strengths": result.get("strengths", []),
            "weaknesses": result.get("weaknesses", []),
            "suggestions": result.get("suggestions", []),
        }
