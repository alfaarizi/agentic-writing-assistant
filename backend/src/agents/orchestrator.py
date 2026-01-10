"""Orchestrator agent for coordinating workflow."""

import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass, asdict

from agents.base_agent import BaseAgent
from agents.research_agent import ResearchAgent
from agents.writing_agent import WritingAgent
from agents.editing_agent import EditingAgent
from agents.personalization_agent import PersonalizationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from models.writing import WritingRequest, WritingResponse
from storage.database import Database
from utils import generate_request_id


@dataclass
class StreamEvent:
    """Event emitted during workflow execution for real-time streaming."""
    stage: str
    progress: int
    message: str
    timestamp: str


class OrchestratorAgent(BaseAgent):
    """Main coordinator that routes tasks to specialized agents."""

    def __init__(
        self,
        model: str = None,
        temperature: float = 0.5,
        database: Optional[Database] = None,
    ):
        """Initialize orchestrator agent with specialized agents.
        
        The orchestrator may use LLM for workflow analysis and decision-making,
        so temperature is kept for future extensibility.
        
        Each sub-agent uses its own optimal temperature:
        - ResearchAgent         : 0.3 => accuracy for factual information
        - WritingAgent          : 0.7 => creativity for content generation
        - EditingAgent          : 0.3 => precision for refinement
        - PersonalizationAgent  : 0.5 => balance for adaptation
        - QualityAssuranceAgent : 0.3 => accuracy for evaluation
        
        Args:
            model: LLM model name
            temperature: LLM temperature
            database: Database instance (injected dependency)
        """
        super().__init__(model=model, temperature=temperature, tools=None)
        self.research_agent = ResearchAgent(model=model)
        self.writing_agent = WritingAgent(model=model)
        self.editing_agent = EditingAgent(model=model)
        self.personalization_agent = PersonalizationAgent(model=model, database=database)
        self.quality_assurance_agent = QualityAssuranceAgent(model=model)
        self.event_queue: Optional[asyncio.Queue[str]] = None


    def _emit(
        self, 
        stage: str, 
        progress: int,
        message: str, 
        data: Any = None
    ) -> None:
        """Emit event to queue if configured."""
        if not self.event_queue:
            return
        
        stream_event = StreamEvent(
            stage=stage,
            progress=progress,
            message=message,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        stream_event_dict = asdict(stream_event)
        if data is not None:
            stream_event_dict['data'] = data
        
        self.event_queue.put_nowait(json.dumps(stream_event_dict))


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
        created_at = datetime.now(timezone.utc).isoformat()

        try:
            # Step 1: Research
            self._emit('researching', 15, 'Gathering relevant information and context...')
            research_data = await self.research_agent.research(request)
            self._emit('researching', 20, 'Research complete', data=research_data)


            # Step 2: Writing
            self._emit('writing', 30, 'Composing your content...')
            draft = await self.writing_agent.write(
                request,
                research_data,
                user_profile=None,
            )
            self._emit('writing', 40, 'Draft created', data=draft)


            # Step 3: Personalization
            self._emit('personalizing', 50, 'Adding personal touches...')
            personalized_content = await self.personalization_agent.personalize(
                draft,
                request.user_id,
                request.context.model_dump(),
            )
            self._emit('personalizing', 60, 'Personalization complete', data=personalized_content)


            # Step 4: Editing
            self._emit('refining', 65, 'Optimizing and refining content...')
            refined_content = personalized_content
            max_iterations = 5

            for iteration in range(max_iterations):
                refined_content = await self.editing_agent.refine(
                    refined_content,
                    feedback=None,
                )
                progress = 65 + ((iteration + 1) / max_iterations) * 15
                self._emit('refining', int(progress), f'Refinement iteration {iteration + 1}/{max_iterations}', data=refined_content)

            self._emit('refining', 80, 'Refinement complete', data=refined_content)


            # Step 5: Quality Assurance
            self._emit('assessing', 85, 'Evaluating quality metrics...')
            assessment, suggestions = await self.quality_assurance_agent.assess(
                refined_content,
                request.requirements,
                request.requirements.quality_threshold,
            )
            self._emit('assessing', 95, 'Assessment complete', data={'assessment': assessment.model_dump() if hasattr(assessment, 'model_dump') else assessment, 'suggestions': suggestions})


            # Step 6: Complete
            self._emit('complete', 100, 'Writing generation complete!')

            return WritingResponse(
                request_id=request_id,
                status="completed",
                content=refined_content,
                assessment=assessment,
                suggestions=suggestions,
                iterations=iteration + 1,
                created_at=created_at,
                updated_at=created_at,
            )

        except Exception as e:
            self._emit('error', 0, f'Generation failed: {str(e)}')
            return WritingResponse(
                request_id=request_id,
                status="failed",
                created_at=created_at,
                updated_at=created_at,
                error=str(e),
            )