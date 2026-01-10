"""Quality assurance agent for final validation."""

from typing import Dict, Any, List, Tuple, Union

from agents.base_agent import BaseAgent
from tools.text_analyzer import TextAnalyzer
from tools.coherence_analyzer import CoherenceAnalyzer
from models.writing import WritingAssessment, QualityMetrics, TextStats, WritingRequirements


class QualityAssuranceAgent(BaseAgent):
    """Agent for final quality check and scoring."""

    def __init__(self, model: str = None, temperature: float = 0.3):
        """Initialize quality assurance agent."""
        super().__init__(model=model, temperature=temperature, tools=None)
        self.text_analyzer = TextAnalyzer()
        self.coherence_analyzer = CoherenceAnalyzer(self)


    def get_system_prompt(self) -> str:
        """Get system prompt for quality assurance agent."""
        return \
"""
You are the Quality Assurance Agent responsible for final validation and quality scoring.

Your role is to:
1. Verify requirement compliance (word count, format, etc.)
2. Evaluate accuracy and completeness
3. Calculate comprehensive quality scores (0-100 scale)
4. Assess natural phrasing and coherence
5. Ensure all quality thresholds are met

You provide detailed quality metrics and determine if content meets the required standards.
"""


    async def assess(
        self,
        content: str,
        requirements: Union[WritingRequirements, Dict[str, Any]] = None,
        quality_threshold: float = 85.0,
    ) -> Tuple[WritingAssessment, List[str]]:
        """Assess writing quality and return assessment with suggestions.
        
        Returns:
            Tuple of (WritingAssessment, suggestions: List[str])
        """
        # Calculate quality metrics
        coherence_result = await self.coherence_analyzer.analyze(content)
        quality_metrics = QualityMetrics(
            overall_score=coherence_result.get("score", 50),
            coherence=coherence_result.get("score", 50),
            naturalness=75.0,
            grammar_accuracy=90.0,
            completeness=80.0,
            lexical_quality=85.0,
            personalization=70.0,
        )

        # Calculate text statistics
        stats = self.text_analyzer.get_all_stats(content)
        text_stats = TextStats(
            word_count=stats["words"],
            character_count=stats["characters"],
            character_count_no_spaces=stats["characters_no_spaces"],
            paragraph_count=stats["paragraphs"],
            line_count=stats["lines"],
            estimated_pages=stats["pages"],
        )

        # Check requirements compliance
        requirements_dict = (
            requirements.model_dump() if isinstance(requirements, WritingRequirements) else requirements or {}
        )
        requirements_checks = {}
        
        if max_words := requirements_dict.get("max_words"):
            requirements_checks["max_words"] = text_stats.word_count <= max_words
        
        if min_words := requirements_dict.get("min_words"):
            requirements_checks["min_words"] = text_stats.word_count >= min_words
        
        if max_pages := requirements_dict.get("max_pages"):
            requirements_checks["max_pages"] = text_stats.estimated_pages <= max_pages

        assessment = WritingAssessment(
            quality_metrics=quality_metrics,
            text_stats=text_stats,
            requirements_checks=requirements_checks,
        )

        # Generate suggestions
        suggestions = self._get_suggestions(assessment, quality_threshold)

        return assessment, suggestions


    def _get_suggestions(
        self,
        assessment: WritingAssessment,
        quality_threshold: float,
    ) -> List[str]:
        """Generate suggestions based on assessment results."""
        suggestions = []

        if assessment.requirements_checks and not all(assessment.requirements_checks.values()):
            failed_checks = [k for k, v in assessment.requirements_checks.items() if not v]
            suggestions.append(f"Requirements not met: {', '.join(failed_checks)}")

        if assessment.quality_metrics.overall_score < quality_threshold:
            suggestions.append("Quality threshold not fully met. Consider manual review.")

        return suggestions