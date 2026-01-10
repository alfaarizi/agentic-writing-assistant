"""Quality assurance agent for final validation."""

from typing import Dict, Any, List, Tuple, Union

from agents.base_agent import BaseAgent
from tools.text_analyzer import TextAnalyzer
from tools.grammar_checker import GrammarChecker
from models.writing import WritingAssessment, QualityMetrics, TextStats, WritingRequirements
from utils import parse_json


class QualityAssuranceAgent(BaseAgent):
    """Agent for final quality check and scoring."""

    def __init__(self, model: str = None, temperature: float = 0.3):
        """Initialize quality assurance agent."""
        super().__init__(model=model, temperature=temperature, tools=None)
        self.text_analyzer = TextAnalyzer()
        self.grammar_checker = GrammarChecker()


    def get_system_prompt(self) -> str:
        """Get system prompt for quality assurance agent.
        
        Incorporates:
        - Role-Based: QA specialist persona
        - Contextual: Final validation checkpoint
        - Instructional: Scoring directives
        - Few-Shot: Scoring examples
        - Meta: Objectivity guidelines
        """
        return \
"""You are a Quality Assurance Specialist with expertise in evaluating written communications against professional standards.

# YOUR EXPERTISE
- 15+ years in editorial quality assurance and content evaluation
- Expert in objective, data-driven assessment methodologies
- Specialized in business writing, academic applications, and professional correspondence
- Skilled at balancing technical correctness with authentic voice
- Known for consistent, reproducible scoring across diverse content

# YOUR ROLE IN THE SYSTEM
You are the FINAL CHECKPOINT before content reaches the user. You receive:
- Refined content (from EditingAgent)
- Text statistics (from TextAnalyzer)
- Grammar analysis (from GrammarChecker)
- Requirements to validate against

You deliver:
- Quality metrics (7 dimensions, 0-100 scale each)
- Revised text statistics (paragraph and page estimates)
- Overall assessment

**Your Decision Matters:** Your scores determine if content is ready for delivery or needs another iteration.

# SCORING FRAMEWORK

You evaluate content across 7 dimensions on a 0-100 scale:

## 1. Overall Score (0-100)
Weighted average reflecting total quality:
- 90-100: Exceptional, publication-ready
- 80-89: High quality, minor polish possible
- 70-79: Good, some improvements beneficial
- 60-69: Acceptable, notable improvements needed
- Below 60: Requires substantial revision

## 2. Coherence (0-100)
Logical flow, clear progression, effective transitions:

**90-100**: Ideas flow seamlessly, perfect transitions, clear narrative arc
**80-89**: Strong flow, good transitions, minor gaps possible
**70-79**: Generally coherent, some transitions could be stronger
**60-69**: Flow issues present, several weak transitions
**Below 60**: Disjointed, unclear connections, poor structure

Evaluate: Topic sentences, paragraph unity, transitions, logical progression, argument structure

## 3. Naturalness (0-100)
Authentic voice, human-like phrasing, readability:

**90-100**: Sounds completely human, natural rhythm, authentic voice
**80-89**: Very natural, minor stiffness possible
**70-79**: Generally natural, some awkward phrases
**60-69**: Several unnatural constructions
**Below 60**: Robotic, formulaic, stilted

Evaluate: Sentence variety/rhythm, conversational flow, absence of AI patterns, voice authenticity

## 4. Grammar Accuracy (0-100)
Correctness in grammar, mechanics, syntax:

**95-100**: Zero errors
**90-94**: 1-2 minor errors
**85-89**: 3-5 minor errors
**80-84**: 6-8 errors or 1-2 major errors
**Below 80**: Multiple errors impacting readability

Consider: Error count from GrammarChecker, error severity, impact on comprehension

## 5. Completeness (0-100)
Addresses all requirements and objectives:

**90-100**: Fully addresses all points with appropriate depth
**80-89**: Addresses all points, minor gaps in depth
**70-79**: Most points covered, some lacking detail
**60-69**: Several points missing or underdeveloped
**Below 60**: Major gaps in coverage

Evaluate: All objectives addressed, appropriate detail level, satisfies purpose

## 6. Lexical Quality (0-100)
Vocabulary richness, word choice, precision:

**90-100**: Varied, precise, sophisticated vocabulary
**80-89**: Strong vocabulary, minor repetition
**70-79**: Good vocabulary, some repetition or vagueness
**60-69**: Limited variety, frequent repetition
**Below 60**: Repetitive, vague, overly simple

Evaluate: Vocabulary diversity, precision, appropriate sophistication, avoidance of repetition

## 7. Personalization (0-100)
Reflects authentic user voice and background:

**90-100**: Clearly unique voice, seamless personal details
**80-89**: Strong personal voice, well-integrated details
**70-79**: Personalized, some generic phrases remain
**60-69**: Minimal personalization, mostly generic
**Below 60**: Generic, no distinct voice

Evaluate: Voice consistency, integration of personal details, distinctiveness

# SCORING CALIBRATION

**Be Objective and Consistent:**
- Base scores on observable qualities, not preferences
- Use the full 0-100 range appropriately
- Don't inflate scores for marginal quality
- Don't over-penalize for minor issues
- Scores of 95+ should be rare (truly exceptional)
- Scores below 60 should indicate serious issues

# TEXT STATISTICS REVISION

You will receive automated text statistics. The word count and character counts are accurate. However, paragraph count and page estimates may need revision based on actual content structure.

**Paragraph Count:**
- Count distinct paragraphs (separated by blank lines or clear breaks)
- Don't count single-line fragments as paragraphs
- Ensure count reflects actual structure

**Page Estimate:**
- Standard: 250-300 words per page
- Adjust based on paragraph density and structure
- Consider formatting (e.g., spacing, lists)

# SCORING EXAMPLES

**Example 1: High-Quality Cover Letter**
```
Content Characteristics:
- Clear structure, strong opening and closing
- Specific achievements with metrics
- Natural, confident voice
- 2-3 minor grammar issues (missing commas)
- Well-integrated research about company
- Authentic personal voice evident
- 380 words, 3 solid paragraphs

Appropriate Scores:
{
  "quality_metrics": {
    "overall_score": 88,
    "coherence": 92,
    "naturalness": 87,
    "grammar_accuracy": 93,
    "completeness": 90,
    "lexical_quality": 85,
    "personalization": 88
  },
  "text_stats_revisions": {
    "paragraph_count": 3,
    "estimated_pages": 1.3
  }
}
```

**Example 2: Mediocre Email**
```
Content Characteristics:
- Purpose clear but structure weak
- Several grammar errors (tense shifts, fragments)
- Some awkward phrasing ("as per your request")
- Generic language, no personal voice
- Covers main points but lacks detail
- 150 words, 2 paragraphs

Appropriate Scores:
{
  "quality_metrics": {
    "overall_score": 72,
    "coherence": 75,
    "naturalness": 68,
    "grammar_accuracy": 78,
    "completeness": 74,
    "lexical_quality": 70,
    "personalization": 65
  },
  "text_stats_revisions": {
    "paragraph_count": 2,
    "estimated_pages": 0.5
  }
}
```

# STRICT RULES

**DO:**
✅ Score based on actual content quality observed
✅ Use grammar analysis results to inform grammar_accuracy
✅ Consider text length for completeness assessment
✅ Revise paragraph/page estimates if automated counts are clearly wrong
✅ Be consistent across similar content
✅ Weight grammar errors by severity (typo vs. subject-verb disagreement)

**DON'T:**
❌ Inflate scores without justification
❌ Let personal preferences influence scoring
❌ Ignore grammar errors shown in analysis
❌ Score based on topic rather than quality
❌ Include explanations or commentary in output
❌ Return anything except the pure JSON object
❌ Add markdown code fences (```json) to output

# OUTPUT FORMAT

Return a valid JSON object with this exact structure:

```json
{
  "quality_metrics": {
    "overall_score": 87.5,
    "coherence": 90,
    "naturalness": 85,
    "grammar_accuracy": 95,
    "completeness": 88,
    "lexical_quality": 82,
    "personalization": 85
  },
  "text_stats_revisions": {
    "paragraph_count": 4,
    "estimated_pages": 1.2
  }
}
```

**Rules:**
- Return ONLY the JSON object
- No explanations, no meta-commentary
- No markdown code blocks around the JSON

# REMEMBER
Your scores directly impact workflow iteration. Be fair, objective, and consistent. High standards ensure quality, but perfection is unattainable—aim for professional excellence (85-92 range for good work).
"""


    async def assess(
        self,
        content: str,
        requirements: Union[WritingRequirements, Dict[str, Any]] = None,
        quality_threshold: float = 85.0,
    ) -> Tuple[WritingAssessment, List[str]]:
        """Assess writing quality using LLM evaluation.
        
        Returns:
            Tuple of (WritingAssessment, suggestions: List[str])
        """
        # Get text statistics (trust words/characters)
        stats = self.text_analyzer.get_all_stats(content)
        
        # Get grammar analysis
        grammar_result = await self.grammar_checker.check(content, use_grammarly=False)
        
        # Build user prompt for LLM evaluation
        user_prompt_parts = [
            "# TASK",
            "Evaluate the following content and provide quality scores across all dimensions.",
            "",
            "# CONTENT TO EVALUATE",
            "```",
            content,
            "```",
            "",
            "# TEXT STATISTICS",
            f"**Word Count:** {stats['words']} (accurate)",
            f"**Character Count:** {stats['characters']} (accurate)",
            f"**Characters (no spaces):** {stats['characters_no_spaces']} (accurate)",
            f"**Line Count:** {stats['lines']}",
            f"**Paragraph Count (auto):** {stats['paragraphs']} (please revise if incorrect)",
            f"**Page Estimate (auto):** {stats['pages']} (please revise if incorrect)",
            "",
            "# GRAMMAR ANALYSIS",
        ]
        
        # Format grammar errors
        if grammar_result and grammar_result.get('error_count', 0) > 0:
            user_prompt_parts.extend([
                f"**Total Errors Found:** {grammar_result['error_count']}",
                "",
                "**Issues:**"
            ])
            for match in grammar_result.get('matches', [])[:10]:  # Limit to 10
                message = match.get('message', 'Unknown error')
                context = match.get('context', {})
                text = context.get('text', '') if isinstance(context, dict) else ''
                user_prompt_parts.append(f"- {message}" + (f" (in: '{text[:50]}')" if text else ""))
        else:
            user_prompt_parts.append("**No grammar errors detected**")
        
        # Add requirements context if provided
        requirements_dict = (
            requirements.model_dump() if isinstance(requirements, WritingRequirements) else requirements or {}
        )
        
        if requirements_dict:
            user_prompt_parts.extend([
                "",
                "# REQUIREMENTS",
            ])
            for key, value in requirements_dict.items():
                if value is not None:
                    key_display = key.replace('_', ' ').title()
                    user_prompt_parts.append(f"- **{key_display}:** {value}")
        
        # Add evaluation instructions
        user_prompt_parts.extend([
            "",
            "# EVALUATION INSTRUCTIONS",
            "",
            "Assess the content across all 7 quality dimensions:",
            "1. **Overall Score**: Weighted average of all dimensions",
            "2. **Coherence**: Logical flow, transitions, structure",
            "3. **Naturalness**: Authentic voice, human-like phrasing",
            "4. **Grammar Accuracy**: Based on the grammar analysis above",
            "5. **Completeness**: Addresses objectives and requirements",
            "6. **Lexical Quality**: Vocabulary richness and precision",
            "7. **Personalization**: Authentic user voice and details",
            "",
            "Also revise the paragraph count and page estimate if the automated counts seem incorrect based on actual structure.",
            "",
            "# OUTPUT",
            "",
            "Return ONLY a JSON object (no markdown code blocks, no explanations):",
            "",
            '{',
            '  "quality_metrics": {',
            '    "overall_score": 87.5,',
            '    "coherence": 90,',
            '    "naturalness": 85,',
            '    "grammar_accuracy": 95,',
            '    "completeness": 88,',
            '    "lexical_quality": 82,',
            '    "personalization": 85',
            '  },',
            '  "text_stats_revisions": {',
            '    "paragraph_count": 4,',
            '    "estimated_pages": 1.2',
            '  }',
            '}'
        ])
        
        user_prompt = "\n".join(user_prompt_parts)
        
        # Get LLM evaluation
        response = await self._generate(
            self.get_system_prompt(),
            user_prompt,
            temperature=self.temperature,
        )
        
        # Default values for fallback
        error_count = grammar_result.get('error_count', 0) if grammar_result else 0
        grammar_score = max(60, 100 - (error_count * 3))
        
        default_evaluation = {
            "quality_metrics": {
                "overall_score": 75.0,
                "coherence": 75.0,
                "naturalness": 75.0,
                "grammar_accuracy": float(grammar_score),
                "completeness": 75.0,
                "lexical_quality": 75.0,
                "personalization": 70.0
            },
            "text_stats_revisions": {
                "paragraph_count": stats['paragraphs'],
                "estimated_pages": stats['pages']
            }
        }
        
        # Parse JSON response (parse_json handles markdown cleaning)
        evaluation = parse_json(response, default_evaluation)
        
        # Extract quality metrics
        metrics_dict = evaluation.get('quality_metrics', {})
        quality_metrics = QualityMetrics(
            overall_score=float(metrics_dict.get('overall_score', 75.0)),
            coherence=float(metrics_dict.get('coherence', 75.0)),
            naturalness=float(metrics_dict.get('naturalness', 75.0)),
            grammar_accuracy=float(metrics_dict.get('grammar_accuracy', grammar_score)),
            completeness=float(metrics_dict.get('completeness', 75.0)),
            lexical_quality=float(metrics_dict.get('lexical_quality', 75.0)),
            personalization=float(metrics_dict.get('personalization', 70.0)),
        )
        
        # Get revised text stats
        revisions = evaluation.get('text_stats_revisions', {})
        text_stats = TextStats(
            word_count=stats['words'],
            character_count=stats['characters'],
            character_count_no_spaces=stats['characters_no_spaces'],
            paragraph_count=revisions.get('paragraph_count', stats['paragraphs']),
            line_count=stats['lines'],
            estimated_pages=revisions.get('estimated_pages', stats['pages']),
        )
        
        # Check requirements compliance with updated text_stats
        requirements_checks = {}
        
        if max_words := requirements_dict.get("max_words"):
            requirements_checks["max_words"] = text_stats.word_count <= max_words
        
        if min_words := requirements_dict.get("min_words"):
            requirements_checks["min_words"] = text_stats.word_count >= min_words
        
        if max_pages := requirements_dict.get("max_pages"):
            requirements_checks["max_pages"] = text_stats.estimated_pages <= max_pages
        
        # Create assessment
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
        
        # Check requirement violations
        if assessment.requirements_checks and not all(assessment.requirements_checks.values()):
            failed_checks = [k for k, v in assessment.requirements_checks.items() if not v]
            suggestions.append(f"Requirements not met: {', '.join(failed_checks)}")
        
        # Check quality threshold
        if assessment.quality_metrics.overall_score < quality_threshold:
            suggestions.append(f"Quality score ({assessment.quality_metrics.overall_score:.1f}) below threshold ({quality_threshold})")
            
            # Add dimension-specific suggestions
            if assessment.quality_metrics.coherence < quality_threshold:
                suggestions.append("Improve coherence: strengthen transitions and logical flow")
            if assessment.quality_metrics.naturalness < quality_threshold:
                suggestions.append("Enhance naturalness: use more conversational phrasing")
            if assessment.quality_metrics.grammar_accuracy < 90:
                suggestions.append("Address grammar issues identified in analysis")
            if assessment.quality_metrics.completeness < quality_threshold:
                suggestions.append("Improve completeness: address all requirements more fully")
            if assessment.quality_metrics.lexical_quality < quality_threshold:
                suggestions.append("Enhance vocabulary: reduce repetition, use more precise words")
            if assessment.quality_metrics.personalization < quality_threshold:
                suggestions.append("Strengthen personalization: integrate more authentic voice")
        
        return suggestions
