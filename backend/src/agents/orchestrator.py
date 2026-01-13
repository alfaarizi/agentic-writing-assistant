"""Orchestrator agent for coordinating workflow using LangGraph."""

import asyncio
import json
import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional, List, TypedDict, Literal

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agents.base_agent import BaseAgent
from agents.research_agent import ResearchAgent
from agents.writing_agent import WritingAgent
from agents.refining_agent import RefinerAgent
from agents.personalization_agent import PersonalizationAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from models.writing import WritingRequest, WritingResponse
from models.user import WritingSample
from storage.database import Database
from tools.gap_analyzer import GapAnalyzer
from utils import generate_request_id


@dataclass
class StreamEvent:
    stage: str
    progress: int
    message: str
    timestamp: str
    data: Any = None


class WorkflowState(TypedDict):
    # Request metadata
    request: WritingRequest
    request_id: str
    created_at: str
    
    # Content pipeline
    research_data: Dict[str, Any]
    content: Optional[str]
    voice_reference: Optional[str] # snapshot of first personalized content
    needs_final_pass: bool
    
    # Quality metrics
    assessment: Optional[Any]
    suggestions: List[str]
    quality_score: float
    quality_score_history: List[float]
    requirements_met: bool
    
    # Gap analysis
    has_gaps: Optional[bool]
    gap_type: Optional[Literal["information", "personalization", "quality"]]
    gaps: Optional[Dict[str, List[str]]]

    # Workflow control
    phase: Literal["initial", "analyze_gaps", "refine", "done"]
    research_count: int
    write_count: int
    personalize_count: int
    refine_count: int
    assess_count: int
    gap_analyze_count: int


class OrchestratorAgent(BaseAgent):
    """Main coordinator using LangGraph for adaptive workflow orchestration."""

    def __init__(self, model: str = None, temperature: float = 0.5, database: Optional[Database] = None):
        super().__init__(model=model, temperature=temperature, tools=None)
        self.database = database
        self.research_agent = ResearchAgent(model=model)
        self.writing_agent = WritingAgent(model=model)
        self.personalization_agent = PersonalizationAgent(model=model, database=database)
        self.quality_assurance_agent = QualityAssuranceAgent(model=model)
        self.refining_agent = RefinerAgent(model=model)
        self.gap_analyzer = GapAnalyzer(model=model)
        # Workflow control
        self.event_queue: Optional[asyncio.Queue[str]] = None
        self.state_graph = self._build_state_graph()


    def get_system_prompt(self) -> str:
        return "Orchestrator for multi-agent writing generation system."


    def _build_state_graph(self) -> StateGraph:
        workflow = StateGraph(WorkflowState)
        workflow.add_node("research", self._research_node)
        workflow.add_node("write", self._write_node)
        workflow.add_node("personalize", self._personalize_node)
        workflow.add_node("assess", self._assess_node)
        workflow.add_node("refine", self._refine_node)
        workflow.add_node("analyze_gaps", self._analyze_gaps_node)
        workflow.add_node("personalize_final", self._personalize_final_node)
        workflow.add_node("complete", self._complete_node)

        workflow.set_entry_point("research")
        workflow.add_edge("research", "write")
        workflow.add_edge("write", "personalize")
        workflow.add_edge("personalize", "assess")
        workflow.add_conditional_edges(
            "assess",
            self._route,
            {
                "complete": "complete",
                "analyze_gaps": "analyze_gaps",
                "refine": "refine",
                "research": "research",
                "personalize": "personalize",
                "personalize_final": "personalize_final"
            }
        )
        workflow.add_conditional_edges(
            "analyze_gaps",
            self._route,
            {
                "complete": "complete",
                "research": "research",
                "personalize": "personalize",
                "refine": "refine"
            }
        )
        workflow.add_edge("refine", "assess")
        workflow.add_edge("personalize_final", "personalize")
        workflow.add_edge("complete", END)

        return workflow.compile(checkpointer=MemorySaver())


    def _emit(self, state: WorkflowState, stage: str, progress: int, message: str, data: Any = None) -> None:
        if not self.event_queue:
            return

        event = StreamEvent(stage, progress, message, datetime.now(timezone.utc).isoformat(), data)
        event_dict = asdict(event)
        if data is None:
            event_dict.pop("data", None)

        self.event_queue.put_nowait(json.dumps(event_dict))


    def _calc_progress(self, state: WorkflowState) -> int:
        phase = state.get("phase", "initial")
        
        if phase == "initial":
            if state.get("research_count", 0) > 0:
                return 20
            if state.get("write_count", 0) > 0:
                return 45
            if state.get("personalize_count", 0) > 0:
                return 60
            if state.get("assess_count", 0) > 0:
                return 70
            return 10
        elif phase == "analyze_gaps":
            return 75
        elif phase == "refine":
            refine_count = state.get("refine_count", 0)
            max_refines = self._calc_max_iterations(
                state["request"].type,
                state.get("quality_score", 0),
                state.get("requirements_met", False)
            )
            return min(80 + int((refine_count / max_refines) * 15), 95) if max_refines > 0 else 80
        elif phase == "done":
            return 100
        return 0


    def _calc_max_iterations(self, writing_type: str, quality: float, req_met: bool) -> int:
        base = {
            "cover_letter": 4,
            "motivational_letter": 6,
            "email": 2,
            "social_response": 2
        }.get(writing_type, 3)

        if quality < 70:
            base += 3
        elif quality < 80:
            base += 2
        elif quality < 85:
            base += 1

        if not req_met:
            base += 2

        return min(base, 10)
    

    # ============================================
    # LangGraph Nodes
    # ============================================

    async def _research_node(self, state: WorkflowState) -> WorkflowState:
        count = state.get("research_count", 0) + 1
        self._emit(state, "research", self._calc_progress(state), f"Research #{count}: Gathering information...")
        
        research_data = await self.research_agent.research(state["request"])
        existing_research_data = state.get("research_data", {})
        
        result = {
            "research_data": {**existing_research_data, **research_data},
            "research_count": count
        }
        
        if state.get("phase") == "analyze_gaps":
            result["phase"] = "refine"
        
        return result


    async def _write_node(self, state: WorkflowState) -> WorkflowState:
        count = state.get("write_count", 0) + 1
        self._emit(state, "write", self._calc_progress(state), f"Write #{count}: Composing content...")
        
        content = await self.writing_agent.write(state["request"], state.get("research_data", {}))
        
        return {
            "content": content,
            "write_count": count
        }


    async def _personalize_node(self, state: WorkflowState) -> WorkflowState:
        count = state.get("personalize_count", 0) + 1
        is_final = state.get("needs_final_pass", False)
        
        label = "Final touch" if is_final else f"#{count}"
        progress = 95 if is_final else self._calc_progress(state)
        self._emit(state, "personalize", progress, f"Personalize {label}: Adding your voice...")
        
        content = await self.personalization_agent.personalize(
            state.get("content", ""),
            state["request"].user_id,
            state["request"].type,
            state["request"].context.model_dump()
        )
        
        result = {
            "content": content,
            "personalize_count": count
        }
        
        if not is_final:
            if state.get("voice_reference") is None:
                result["voice_reference"] = content
            
            if state.get("phase") == "analyze_gaps":
                result["phase"] = "refine"
        
        return result


    async def _assess_node(self, state: WorkflowState) -> WorkflowState:
        count = state.get("assess_count", 0) + 1
        self._emit(state, "assess", self._calc_progress(state), f"Assess #{count}: Evaluating quality...")
        
        assessment, suggestions = await self.quality_assurance_agent.assess(
            state.get("content", ""),
            state["request"].requirements,
            state["request"].requirements.quality_threshold
        )
        
        quality_score = assessment.quality_metrics.overall_score
        requirements_met = QualityAssuranceAgent.check_requirements_met(assessment)
        
        history = state.get("quality_score_history", [])
        history.append(quality_score)
        
        self._emit(state, "assess", self._calc_progress(state), f"Quality: {quality_score:.1f}/100")
        
        return {
            # Quality metrics
            "assessment": assessment,
            "suggestions": suggestions,
            "quality_score": quality_score,
            "quality_score_history": history,
            "requirements_met": requirements_met,
            # Workflow control
            "assess_count": count
        }


    async def _refine_node(self, state: WorkflowState) -> WorkflowState:
        count = state.get("refine_count", 0) + 1
        
        if count == 1:
            self._emit(state, "refine", self._calc_progress(state), "Refining: Improving quality...")
        
        suggestions_list = state.get("suggestions", [])
        suggestions = None
        if suggestions_list:
            suggestions = "\n".join(f"- {s}" for s in suggestions_list)
        
        content = await self.refining_agent.refine(
            state.get("content", ""),
            suggestions=suggestions,
            preserve_voice=True,
            reference_content=state.get("voice_reference")
        )
        
        return {
            # Content pipeline
            "content": content,
            # Workflow control
            "phase": "refine",
            "refine_count": count
        }


    async def _analyze_gaps_node(self, state: WorkflowState) -> WorkflowState:
        count = state.get("gap_analyze_count", 0) + 1
        self._emit(state, "analyze", self._calc_progress(state), "Checking for gaps...")
        
        user_profile = None
        if self.database:
            user_profile = await self.database.get_user_profile(state["request"].user_id)
        
        result = await self.gap_analyzer.analyze(
            state.get("content", ""),
            state["request"].context.model_dump(),
            state["request"].type,
            user_profile=user_profile
        )
        
        has_gaps = result.get("has_gaps", False)
        gap_type = result.get("gap_type")
        gaps = result.get("gaps", {})
        
        if has_gaps:
            total = sum(len(g) for g in gaps.values())
            self._emit(state, "analyze", self._calc_progress(state), f"Found {total} {gap_type} gaps")
        
        return {
            # Gap analysis
            "has_gaps": has_gaps,
            "gap_type": gap_type,
            "gaps": gaps,
            # Workflow control
            "phase": "analyze_gaps",
            "gap_analyze_count": count
        }


    async def _personalize_final_node(self, state: WorkflowState) -> WorkflowState:
        return {"needs_final_pass": True}


    async def _complete_node(self, state: WorkflowState) -> WorkflowState:
        quality = state.get("quality_score", 0)
        
        if quality >= 80.0 and self.database:
            self._emit(state, "save", 98, "Saving writing sample...")
            now = datetime.now(timezone.utc)
            await self.database.save_writing_sample(WritingSample(
                sample_id=str(uuid.uuid4()),
                user_id=state["request"].user_id,
                content=state.get("content", ""),
                type=state["request"].type,
                context=state["request"].context.model_dump(),
                quality_score=quality,
                created_at=now,
                updated_at=now,
            ))
        
        self._emit(state, "complete", 100, f"Complete! Quality: {quality:.1f}/100")
        
        return {"phase": "done"}
    
    # ============================================
    # Main Orchestrator
    # ============================================

    def _route(self, state: WorkflowState) -> str:
        phase = state.get("phase", "initial")
        quality = state.get("quality_score", 0)
        threshold = state["request"].requirements.quality_threshold
        req_met = state.get("requirements_met", False)
        history = state.get("quality_score_history", [])
        
        refine_count = state.get("refine_count", 0)
        gap_analyze_count = state.get("gap_analyze_count", 0)
        writing_type = state["request"].type
        
        max_refines = self._calc_max_iterations(writing_type, quality, req_met)

        if phase == "initial":
            if quality >= threshold and req_met:
                return "complete"
            
            should_analyze_gaps = (
                writing_type not in ["email", "social_response"]
                and quality < 85
                and gap_analyze_count == 0
            )
            
            return "analyze_gaps" if should_analyze_gaps else "refine"

        elif phase == "analyze_gaps":
            has_gaps = state.get("has_gaps", False)
            gap_type = state.get("gap_type")
            
            if not has_gaps:
                return "complete" if (quality >= threshold and req_met) else "refine"
            
            if gap_analyze_count >= 2:
                return "refine"
            
            if gap_type == "information":
                return "research"
            elif gap_type == "personalization":
                return "personalize"
            elif gap_type == "quality":
                return "refine"
            else:
                return "research"

        elif phase == "refine":
            final_done = state.get("needs_final_pass", False)
            
            if quality >= threshold and req_met:
                return "complete" if final_done else "personalize_final"
            
            if refine_count >= max_refines:
                return "complete" if final_done else "personalize_final"
            
            if len(history) >= 3:
                recent = history[-3:]
                if max(recent) - min(recent) < 2.0:
                    return "complete" if final_done else "personalize_final"
            
            if len(history) >= 2:
                if history[-1] < history[-2] - 3.0:
                    return "complete" if final_done else "personalize_final"
            
            if len(history) >= 3:
                if history[-1] - history[-2] < 0.5 and history[-2] - history[-3] < 0.5:
                    return "complete" if final_done else "personalize_final"
            
            return "refine"

        return "complete"


    async def orchestrate(self, request: WritingRequest) -> WritingResponse:
        request_id = generate_request_id()
        created_at = datetime.now(timezone.utc).isoformat()

        initial_state: WorkflowState = {
            # Request metadata
            "request": request,
            "request_id": request_id,
            "created_at": created_at,
            # Content pipeline
            "research_data": {},
            "content": None,
            "voice_reference": None,
            "needs_final_pass": False,
            # Quality metrics
            "assessment": None,
            "suggestions": [],
            "quality_score": 0,
            "quality_score_history": [],
            "requirements_met": False,
            # Gap analysis
            "has_gaps": None,
            "gap_type": None,
            "gaps": None,
            # Workflow control
            "phase": "initial",
            "research_count": 0,
            "write_count": 0,
            "personalize_count": 0,
            "refine_count": 0,
            "assess_count": 0,
            "gap_analyze_count": 0,
        }

        try:
            config = {"configurable": {"thread_id": request_id}}
            current_state = initial_state

            async for node_output in self.state_graph.astream(initial_state, config):
                for node_state in node_output.values():
                    current_state.update(node_state)

            return WritingResponse(
                request_id=request_id,
                status="completed",
                content=current_state.get("content"),
                assessment=current_state.get("assessment"),
                suggestions=current_state.get("suggestions", []),
                iterations=current_state.get("refine_count", 0),
                created_at=created_at,
                updated_at=datetime.now(timezone.utc).isoformat(),
            )

        except Exception as e:
            error_msg = f"Generation failed: {str(e)}"
            self._emit(initial_state, "error", 100, error_msg)
            return WritingResponse(
                request_id=request_id,
                status="failed",
                created_at=created_at,
                updated_at=datetime.now(timezone.utc).isoformat(),
                error=str(e),
            )
