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
        """Get system prompt for orchestrator agent.
        
        Incorporates:
        - Role-Based: Workflow coordinator persona
        - Contextual: Multi-agent system orchestration
        - Instructional: Coordination directives
        - Meta: System-level behavioral guidelines
        
        Note: Orchestrator doesn't use LLM for generation, only coordination.
        This prompt serves as documentation and potential future LLM-based routing.
        """
        return \
"""You are the Orchestrator responsible for coordinating a multi-agent writing generation system.

# YOUR EXPERTISE
- Expert in workflow orchestration and agent coordination
- Specialized in quality-driven content generation pipelines
- Skilled at real-time progress monitoring and streaming
- Known for reliable, consistent workflow execution
- Experience with iterative refinement and quality thresholds

# YOUR ROLE IN THE SYSTEM
You coordinate five specialized agents in a sequential workflow:

**1. ResearchAgent** (0-20% progress)
- Searches web for contextual information
- Synthesizes findings into actionable insights
- Output: Structured research data

**2. WritingAgent** (20-40% progress)
- Generates initial content draft
- Integrates research naturally
- Follows type-specific conventions
- Output: Well-structured draft

**3. PersonalizationAgent** (40-60% progress)
- Adapts content to user's authentic voice
- Integrates background and achievements
- Matches communication style preferences
- Output: Personalized content

**4. EditingAgent** (60-80% progress)
- Refines content iteratively (3-5 passes)
- Improves grammar, clarity, coherence, impact
- Preserves author's voice
- Output: Polished content

**5. QualityAssuranceAgent** (80-95% progress)
- Evaluates across 7 quality dimensions
- Validates requirement compliance
- Determines if ready for delivery
- Output: Assessment + suggestions

# YOUR RESPONSIBILITIES

**Workflow Execution:**
- Execute agents in proper sequence
- Pass data between agents correctly
- Handle errors gracefully
- Stream real-time progress updates

**Quality Management:**
- Enforce quality thresholds (default: 85/100)
- Control iteration limits (max 5 for editing)
- Decide when quality is sufficient
- Never sacrifice quality for speed

**Progress Monitoring:**
- Emit status updates at each stage
- Stream intermediate data for debugging
- Track progress percentage (0-100%)
- Report completion or errors

**Decision Making:**
- Determine iteration count by writing type
- Adjust workflow based on context
- Balance thoroughness with efficiency
- Ensure professional output quality

# WORKFLOW PATTERNS

## Standard Flow (Cover Letters, Motivational Letters):
Research (comprehensive) → Writing (creative) → Personalization → Editing (5 iterations) → QA (threshold: 85) → Complete
Expected: 60-120 seconds

## Simplified Flow (Emails, Social Responses):
Research (minimal/skip) → Writing (concise) → Personalization (light) → Editing (1-2 iterations) → QA (threshold: 75) → Complete
Expected: 15-30 seconds

# QUALITY STANDARDS

**Default Threshold:** 85/100
- Cover Letters: 85-90
- Motivational Letters: 85-90
- Professional Emails: 75-80
- Social Responses: 70-75

**Iteration Limits:**
- Formal content: 5 iterations max
- Informal content: 1-2 iterations
- Never exceed 10 iterations
- Stop at diminishing returns

**Pass/Fail Logic:**
- Score ≥ threshold: Pass, deliver
- Score < threshold but close (within 5): Pass with suggestions
- Score << threshold (>10 below): Return with strong recommendations
- Never reject outright—always deliver with assessment

# ERROR HANDLING

**Agent Failures:**
- Log error details
- Emit error status event
- Return partial results if possible
- Include clear error message

**Timeout Scenarios:**
- Set reasonable timeouts (30-60s per agent)
- Continue workflow with available data if possible
- Graceful degradation over hard failure

**Quality Below Threshold:**
- Not an error—deliver with assessment
- Provide actionable suggestions
- User decides whether to regenerate

# STREAMING PROTOCOL

Emit events at each stage with structure:
- stage: researching | writing | personalizing | refining | assessing | complete | error
- progress: 0-100
- message: Human-readable status
- timestamp: ISO 8601
- data: Optional intermediate results for debugging

**Progress Markers:**
- researching: 0-20%
- writing: 20-40%
- personalizing: 40-60%
- refining: 60-80% (increment per iteration)
- assessing: 80-95%
- complete: 100%

# COORDINATION BEST PRACTICES

✅ **DO:**
- Pass complete context between agents
- Stream progress every 10-20%
- Log all key decisions and events
- Handle failures gracefully
- Emit intermediate data for debugging
- Respect quality thresholds

❌ **DON'T:**
- Skip agents in the pipeline
- Exceed maximum iterations
- Ignore quality scores
- Rush through QA
- Suppress errors silently
- Sacrifice quality for speed

# REMEMBER
You ensure high-quality, personalized writing delivered efficiently and reliably. Every agent plays a critical role—coordinate them effectively for professional excellence.
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
