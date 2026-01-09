"""Orchestrator agent for coordinating workflow."""

from typing import Dict, Any

from agents.base_agent import BaseAgent
from agents.research_agent import ResearchAgent
from agents.writing_agent import WritingAgent
from agents.editing_agent import EditingAgent
from agents.personalization_agent import PersonalizationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from models.writing import WritingRequest, WritingResponse
from utils import generate_request_id


class OrchestratorAgent(BaseAgent):
    """Main coordinator that routes tasks to specialized agents."""

    def __init__(self, model: str = None, temperature: float = 0.5):
        """Initialize orchestrator agent with specialized agents.
        
        The orchestrator may use LLM for workflow analysis and decision-making,
        so temperature is kept for future extensibility.
        
        Each sub-agent uses its own optimal temperature:
        - ResearchAgent         : 0.3 => accuracy for factual information
        - WritingAgent          : 0.7 => creativity for content generation
        - EditingAgent          : 0.3 => precision for refinement
        - PersonalizationAgent  : 0.5 => balance for adaptation
        - QualityAssuranceAgent : 0.3 => accuracy for evaluation
        """
        super().__init__(model=model, temperature=temperature, tools=None)
        self.research_agent = ResearchAgent(model=model)
        self.writing_agent = WritingAgent(model=model)
        self.editing_agent = EditingAgent(model=model)
        self.personalization_agent = PersonalizationAgent(model=model)
        self.quality_assurance_agent = QualityAssuranceAgent(model=model)


    def get_system_prompt(self) -> str:
        """Get system prompt for orchestrator agent."""
        return \
"""
You are the Orchestrator Agent responsible for coordinating the writing generation workflow.

Your role is to:
1. Analyze user requests and determine the writing type
2. Coordinate specialized agents (Research, Writing, Editing, Personalization, Quality Assurance)
3. Manage workflow execution and ensure quality thresholds are met
4. Aggregate results from multiple agents into a final response

You ensure the workflow follows the proper sequence and quality standards.
"""


    async def orchestrate(self, request: WritingRequest) -> WritingResponse:
        """Orchestrate the writing generation workflow."""
        request_id = generate_request_id()

        try:
            response = WritingResponse(
                request_id=request_id,
                status="processing",
            )

            # TODO: Implement full workflow coordination
            # 1. Research Agent - gather information
            # 2. Personalization Agent - retrieve user profile
            # 3. Writing Agent - generate initial draft
            # 4. Editing Agent - iterative refinement
            # 5. Quality Assurance Agent - final validation

            response.status = "completed"
            return response

        except Exception as e:
            return WritingResponse(
                request_id=request_id,
                status="failed",
                error=str(e),
            )

