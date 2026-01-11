"""Personalization agent for user profile integration."""

from typing import Dict, Any, Optional, List

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


    def _retrieve_relevant_chunks(
        self,
        user_id: str,
        content: str,
        writing_context: Dict[str, Any]
    ) -> List[str]:
        """Retrieve relevant profile chunks via semantic search.

        Builds contextual queries from content and writing context to find
        the most relevant user profile information for personalization.

        Args:
            user_id: User ID to filter chunks
            content: Draft content or query text (used for semantic matching)
            writing_context: Context from WritingRequest (job_title, company, etc.)

        Returns:
            List of relevant profile chunk texts, deduplicated and limited to 15
        """
        if not self.database or not self.database.vector_db:
            return []

        try:
            queries = []
            
            if content and len(content) > 50:
                queries.append(content[:500])
            
            if job_title := writing_context.get("job_title"):
                queries.append(f"experience and skills for {job_title}")
            if company := writing_context.get("company"):
                queries.append(f"work experience at {company}")
            if program_name := writing_context.get("program_name"):
                queries.append(f"background and education for {program_name}")
            if scholarship_name := writing_context.get("scholarship_name"):
                queries.append(f"achievements and qualifications for {scholarship_name}")
            if post_content := writing_context.get("post_content"):
                post_preview = post_content[:200] if len(post_content) > 200 else post_content
                queries.append(f"relevant experience and background for: {post_preview}")
            if subject := writing_context.get("subject"):
                queries.append(f"relevant experience and expertise for: {subject}")
            elif reply_to := writing_context.get("reply_to"):
                if not writing_context.get("post_content"):
                    queries.append("professional background and communication style")

            if not queries:
                queries.append("professional background experience skills achievements")

            results = self.database.vector_db.query(
                query_texts=queries[:3],
                n_results=10,
                where={"user_id": user_id}
            )

            chunks = []
            seen = set()
            for docs in results.get("documents", []):
                for doc in docs:
                    if doc and doc not in seen:
                        seen.add(doc)
                        chunks.append(doc)

            return chunks[:15]
        except Exception:
            return []


    def get_system_prompt(self) -> str:
        """Get system prompt for personalization agent."""
        return \
"""
You are a Voice Personalization Expert specializing in adapting written content to match individual communication styles.

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

{
  "content": "Your complete personalized content here..."
}

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


    def get_user_prompt(
        self,
        content: str,
        context_section: str,
        relevant_profile_section: str,
        writing_style_section: str,
        writing_samples_section: str,
    ) -> str:
        """Build user prompt for personalization task.

        Args:
            content: Draft content to personalize
            context_section: Pre-formatted writing context section
            relevant_profile_section: Pre-formatted relevant profile chunks from semantic search
            writing_style_section: Pre-formatted style section
            writing_samples_section: Pre-formatted samples section

        Returns:
            Formatted user prompt string
        """
        return \
f"""
# TASK
Transform the following draft content to authentically reflect the user's unique voice, style, and background.

# DRAFT CONTENT
```
{content}
```

# WRITING CONTEXT{context_section}

# USER PROFILE{relevant_profile_section}

# WRITING STYLE PREFERENCES{writing_style_section}

# WRITING SAMPLES{writing_samples_section}

# PERSONALIZATION INSTRUCTIONS

Transform the draft by:
1. **Matching Voice:** Adapt vocabulary, sentence structure, and phrasing to match the user's natural writing style
2. **Integrating Background:** Weave in specific achievements and experiences naturally (don't just list them)
3. **Adjusting Tone:** Ensure formality and warmth levels match the user's preferences
4. **Preserving Message:** Keep the core message and structure intact while making it authentically 'theirs'
5. **Staying Natural:** Avoid forced mentions; only include background details that fit naturally

# OUTPUT

Return ONLY a JSON object:

{{
  "content": "Your complete personalized content here..."
}}

Requirements:
- No explanations of what you changed
- No meta-commentary
- No markdown code blocks
- No placeholder text
- Maintain similar length as original
- Ensure content addresses original purpose
"""


    async def personalize(
        self,
        content: str,
        user_id: str,
        writing_context: Dict[str, Any] = None,
    ) -> str:
        """Personalize content using semantic search for relevant profile data.
        
        Args:
            content: Draft content to personalize
            user_id: User ID to retrieve profile for
            writing_context: Optional context (job_title, company, program_name, etc.)
            
        Returns:
            Personalized content (original content if personalization fails)
        """
        if not self.database:
            return content
            
        if not (profile := await self.database.get_user_profile(user_id)):
            return content

        relevant_chunks = self._retrieve_relevant_chunks(
            user_id,
            content,
            writing_context or {}
        )

        profile_dict = profile.model_dump()

        # build context section
        context_section = ""
        if writing_context:
            context_section = \
                f"""
                {chr(10).join(f"**{k.replace('_', ' ').title()}:** {v}" for k, v in writing_context.items() if v)}
                """

        # build relevant profile section
        relevant_profile_section = ""
        if relevant_chunks:
            relevant_profile_section = \
                f"""
                ## Relevant Background & Experience
                {chr(10).join(f"- {chunk}" for chunk in relevant_chunks)}
                """

        # build writing style section
        writing_style_section = ""
        if prefs := profile_dict.get('writing_preferences'):
            tone = prefs.get('tone')
            style = prefs.get('style')
            if tone or style:
                writing_style_section = \
                    f"""
                    **Tone:** {tone or 'Not specified'}
                    **Style:** {style or 'Not specified'}
                    """

        # build writing samples section
        writing_samples_section = ""
        if samples := profile_dict.get('writing_preferences', {}).get('writing_samples'):
            if samples:
                sample_texts = []
                for i, sample in enumerate(samples[:2], 1):
                    sample_texts.append(\
                        f"""
                        **Sample {i}:**
                        ```
                        {sample}
                        ```
                        """
                    )
                writing_samples_section = \
                        f"""
                        {chr(10).join(sample_texts)}
                        """

        response = await self._generate(
            self.get_system_prompt(),
            self.get_user_prompt(
                content,
                context_section,
                relevant_profile_section,
                writing_style_section,
                writing_samples_section,
            ),
            temperature=self.temperature,
        )

        result = parse_json(response, {"content": response})
        return result.get("content", response)
