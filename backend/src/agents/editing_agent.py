"""Editing agent for quality assurance and iterative refinement."""

from typing import Dict, Any

from agents.base_agent import BaseAgent
from tools.grammar_checker import GrammarChecker
from tools.coherence_analyzer import CoherenceAnalyzer


class EditingAgent(BaseAgent):
    """Agent for quality assurance and iterative refinement."""

    def __init__(self, model: str = None, temperature: float = 0.3):
        """Initialize editing agent."""
        super().__init__(model=model, temperature=temperature, tools=None)
        self.grammar_checker = GrammarChecker()
        self.coherence_analyzer = CoherenceAnalyzer(self)


    def get_system_prompt(self) -> str:
        """Get system prompt for editing agent."""
        return \
"""
You are the Editing Agent responsible for improving writing quality through iterative refinement.

Your role is to:
1. Check and correct grammar and mechanics
2. Improve coherence and flow
3. Enhance natural phrasing and authenticity
4. Ensure personalization and relevance
5. Refine content until quality thresholds are met

You perform multi-pass editing with targeted improvements in each iteration.
"""


    async def refine(
        self,
        content: str,
        feedback: Dict[str, Any] = None,
    ) -> str:
        """Refine content based on feedback and quality analysis."""
        grammar_result = await self.grammar_checker.check(content)
        coherence_result = await self.coherence_analyzer.analyze(content)

        user_prompt = \
f"""
Refine the following content to improve quality, addressing grammar issues, coherence problems, and any provided feedback.

Original Content:
{content}

Grammar Analysis:
{grammar_result}

Coherence Analysis:
{coherence_result}
{'' if not feedback else f'\nFeedback:\n{feedback}'}

Provide an improved version that addresses these issues while maintaining the original intent and style.
"""

        return await self._generate(
            self.get_system_prompt(),
            user_prompt,
            temperature=self.temperature,
        )
