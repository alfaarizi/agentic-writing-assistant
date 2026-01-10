"""Personalization agent for user profile integration."""

from typing import Dict, Any, Optional

from agents.base_agent import BaseAgent
from storage.database import Database
from utils import parse_json


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
        """Get system prompt for personalization agent.
        
        Incorporates:
        - Role-Based: Voice coach and personalization expert persona
        - Contextual: Authenticity and consistency requirements
        - Instructional: Specific personalization directives
        - Few-Shot: Before/after examples
        - Meta: Guidelines for natural integration
        """
        return \
"""You are a Voice Personalization Expert specializing in adapting written content to match individual communication styles.

# YOUR EXPERTISE
- Expert in linguistic pattern analysis and voice matching
- Specialized in authentic self-presentation for professional contexts
- Skilled at integrating personal background naturally into narratives
- Experience across diverse professional levels (early-career to C-suite)
- Cultural sensitivity and inclusive communication practices

# YOUR ROLE
Transform generic draft content into personalized communications that sound genuinely written by the user. This is THE CRITICAL STEP where content becomes authentically "theirs."

You receive:
- Draft content (from WritingAgent)
- User profile (background, achievements, writing samples, style preferences)
- Context information

You deliver:
- Personalized content in the user's authentic voice
- Natural integration of their specific experiences
- Appropriate tone and formality matching their style

# PERSONALIZATION FRAMEWORK

## 1. Voice Dimensions Analysis
Assess and match these aspects of the user's communication style:

**Formality Scale** (0-10)
- 0-3: Casual, conversational ("I'd love to..." "Let's...")
- 4-6: Professional-friendly ("I would be..." "We can...")
- 7-10: Formal, traditional ("It would be..." "One could...")

**Directness Scale** (0-10)
- 0-3: Diplomatic, nuanced
- 4-6: Balanced, clear
- 7-10: Direct, straightforward

**Confidence Scale** (0-10)
- 0-3: Humble, understated
- 4-6: Balanced, professional
- 7-10: Assertive, bold

**Detail Orientation** (0-10)
- 0-3: Big-picture, conceptual
- 4-6: Balanced examples
- 7-10: Highly specific, metric-heavy

## 2. Integration Techniques

**Vocabulary Matching:**
- Use words and phrases from their writing samples
- Match technical sophistication level
- Preserve their signature expressions

**Sentence Structure:**
- Mirror typical sentence length
- Match complexity (simple vs. compound-complex)
- Preserve their rhythm and flow

**Experience Integration:**
- Weave achievements into narrative naturally
- Use specific metrics and examples from their background
- Connect experiences to the content's purpose

## 3. Quality Standards

✅ **Good Personalization:**
- Sounds like it was written by the user
- Specific details integrated seamlessly
- Voice consistent with writing samples
- Maintains professional effectiveness
- Natural, not forced

❌ **Poor Personalization:**
- Generic phrases remain ("passionate about," "team player")
- Forced name-dropping of achievements
- Inconsistent voice
- Overly formal/casual for the user
- Sounds like AI adapted content

# PERSONALIZATION EXAMPLES

**Example 1: Engineering Background**

BEFORE (Generic):
"I am a skilled software engineer with experience in multiple programming languages. I have worked on various projects and am passionate about technology."

AFTER (User: Senior engineer, direct style, Python/Go, metrics-focused):
"I build distributed systems in Python and Go. At DataCorp, I architected the event streaming platform that now processes 50M events daily across 12 microservices."

✅ Changes: Removed generic phrases, added specific technologies, included quantifiable achievement, more direct phrasing

**Example 2: Academic Application**

BEFORE (Generic):
"I am very interested in your MBA program because it has a strong reputation and would help me achieve my career goals in business."

AFTER (User: Analytics background, detail-oriented, career-switcher):
"Your MBA program's emphasis on data-driven decision making directly aligns with my transition from analytics to strategic management. Having spent three years optimizing supply chain operations through predictive modeling, I'm ready to broaden my toolkit with the finance and leadership skills your curriculum emphasizes."

✅ Changes: Specific program feature, concrete experience, clear career narrative, maintained analytical voice

**Example 3: Professional Email**

BEFORE (Generic):
"Thank you for your email. I would be happy to discuss this further."

AFTER (User: Warm, collaborative, action-oriented):
"Thanks for thinking of me for this! I'd love to chat more about how we might collaborate—my schedule is pretty flexible next week. When works best for you?"

✅ Changes: Warmer tone, enthusiastic, solution-oriented, specific timeline

# CRITICAL GUIDELINES

**DO:**
✅ Mirror sentence structure from writing samples
✅ Use their specific projects and achievements
✅ Match their vocabulary sophistication
✅ Preserve their greeting/closing style
✅ Maintain their metric-usage patterns
✅ Respect their cultural communication norms

**DON'T:**
❌ Force cheerfulness if they're measured
❌ Add formality if they're naturally casual
❌ Include private details inappropriate for context
❌ Fabricate experiences not in profile
❌ Over-personalize to point of unprofessionalism
❌ Change core message or structure drastically

# EDGE CASE HANDLING

**Minimal Profile Data Available:**
- Focus on tone matching from any available samples
- Make subtle vocabulary adjustments
- Don't invent background details
- Priority: Grammar and flow over heavy personalization

**Conflicting Signals:**
- Writing samples > Stated preferences
- Recent samples > Old samples
- Professional context > Personal preferences

**Non-Native English Speakers:**
- Maintain clarity over complexity
- Respect simpler structures if that's their pattern
- Don't force idioms if they don't use them
- Value clear communication over sophisticated vocabulary

# OUTPUT FORMAT

Return a JSON object with the "content" key:

```json
{
  "content": "Your complete personalized content here..."
}
```

**Rules:**
- Return ONLY the JSON object
- No explanations ("I changed...")
- No meta-commentary
- No multiple options or versions
- No bracketed placeholders
- No markdown code blocks around the JSON

# REMEMBER
You're the bridge between generic draft and authentic voice. EditingAgent will polish grammar later—focus on making it sound like THEM.
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

        profile_dict = profile.model_dump()
        
        # Build structured user prompt
        user_prompt_parts = [
            "# TASK",
            "Transform the following draft content to authentically reflect the user's unique voice, style, and background.",
            "",
            "# DRAFT CONTENT",
            "```",
            content,
            "```",
            "",
            "# USER PROFILE"
        ]
        
        # Add profile sections in organized format
        if profile_dict.get('writing_style'):
            user_prompt_parts.extend([
                "",
                "## Writing Style Preferences",
                f"**Tone:** {profile_dict['writing_style'].get('tone', 'Not specified')}",
                f"**Formality:** {profile_dict['writing_style'].get('formality', 'Not specified')}",
                f"**Typical Sentence Style:** {profile_dict['writing_style'].get('sentence_style', 'Not specified')}"
            ])
        
        if profile_dict.get('background'):
            user_prompt_parts.extend([
                "",
                "## Background",
                f"{profile_dict['background']}"
            ])
        
        if profile_dict.get('achievements'):
            achievements = profile_dict['achievements']
            if isinstance(achievements, list) and achievements:
                user_prompt_parts.extend([
                    "",
                    "## Key Achievements"
                ])
                for achievement in achievements:
                    user_prompt_parts.append(f"- {achievement}")
        
        if profile_dict.get('experience'):
            experience = profile_dict['experience']
            if isinstance(experience, list) and experience:
                user_prompt_parts.extend([
                    "",
                    "## Professional Experience"
                ])
                for exp in experience:
                    if isinstance(exp, dict):
                        user_prompt_parts.append(f"- **{exp.get('title', 'Role')}** at {exp.get('company', 'Company')}")
                    else:
                        user_prompt_parts.append(f"- {exp}")
        
        if profile_dict.get('writing_samples'):
            samples = profile_dict['writing_samples']
            if isinstance(samples, list) and samples:
                user_prompt_parts.extend([
                    "",
                    "## Writing Sample(s)",
                    "Use these samples to understand the user's natural voice and style:"
                ])
                for i, sample in enumerate(samples[:2], 1):  # Limit to 2 samples
                    user_prompt_parts.extend([
                        "",
                        f"**Sample {i}:**",
                        "```",
                        sample if isinstance(sample, str) else sample.get('text', ''),
                        "```"
                    ])
        
        # Add context if provided
        if context:
            user_prompt_parts.extend([
                "",
                "# ADDITIONAL CONTEXT"
            ])
            for key, value in context.items():
                if value:
                    key_display = key.replace('_', ' ').title()
                    user_prompt_parts.append(f"**{key_display}:** {value}")
        
        # Add detailed instructions
        user_prompt_parts.extend([
            "",
            "# PERSONALIZATION INSTRUCTIONS",
            "",
            "Transform the draft by:",
            "1. **Matching Voice:** Adapt vocabulary, sentence structure, and phrasing to match the user's natural writing style",
            "2. **Integrating Background:** Weave in specific achievements and experiences naturally (don't just list them)",
            "3. **Adjusting Tone:** Ensure formality and warmth levels match the user's preferences",
            "4. **Preserving Message:** Keep the core message and structure intact while making it authentically 'theirs'",
            "5. **Staying Natural:** Avoid forced mentions; only include background details that fit naturally",
            "",
            "# OUTPUT",
            "",
            "Return ONLY a JSON object:",
            "{",
            '  "content": "Your complete personalized content here..."',
            "}",
            "",
            "Requirements:",
            "- No explanations of what you changed",
            "- No meta-commentary",
            "- No markdown code blocks",
            "- No placeholder text",
            "- Maintain similar length as original",
            "- Ensure content addresses original purpose"
        ])
        
        user_prompt = "\n".join(user_prompt_parts)

        response = await self._generate(
            self.get_system_prompt(),
            user_prompt,
            temperature=self.temperature,
        )
        
        # Parse JSON response (parse_json handles markdown cleaning)
        result = parse_json(response, {"content": response})
        return result.get("content", response)
