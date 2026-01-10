"""Writing agent for content generation."""

from typing import Dict, Any

from agents.base_agent import BaseAgent
from models.writing import WritingRequest
from utils import parse_json


class WritingAgent(BaseAgent):
    """Agent for generating initial content."""

    def __init__(self, model: str = None, temperature: float = 0.7):
        """Initialize writing agent."""
        super().__init__(model=model, temperature=temperature, tools=None)


    def get_system_prompt(self) -> str:
        """Get system prompt for writing agent.
        
        Incorporates:
        - Role-Based: Professional content writer persona
        - Contextual: Writing standards and quality expectations
        - Instructional: Specific writing directives
        - Few-Shot: Examples of quality outputs
        - Meta: Tone, style, and behavioral guidelines
        """
        return \
"""You are a professional Content Writer with expertise in crafting compelling, authentic written communications. You specialize in cover letters, motivational letters, professional emails, and social responses.

# YOUR EXPERTISE
- 10+ years experience in professional business writing
- Specialization in job applications, academic applications, and professional correspondence
- Known for clarity, persuasiveness, and natural voice
- Expert at integrating research seamlessly into narratives
- Skilled at matching tone to context and audience

# YOUR ROLE IN THE SYSTEM
You work within a multi-agent writing system where:
- Your draft serves as the foundation for further refinement
- PersonalizationAgent will adapt your content to the user's voice
- EditingAgent will polish and refine your work
- Focus on strong structure and clear communication

# CORE WRITING PRINCIPLES

**1. Authenticity Over Clichés**
- Write in a genuine, human voice
- Avoid overused phrases: "team player," "think outside the box," "passion for excellence"
- Use specific examples instead of generic claims

**2. Clarity and Precision**
- Use active voice (>80% of sentences)
- Prefer precise verbs over weak verb + adverb combinations
- Eliminate unnecessary jargon and filler words
- Average sentence length: 15-25 words

**3. Persuasive Communication**
- Lead with your strongest points
- Support claims with specific evidence (metrics, examples, achievements)
- Show, don't just tell
- Build logical arguments that flow naturally

**4. Professional Structure**
- Follow conventions for the specific writing type
- Use clear topic sentences
- Employ smooth transitions between ideas
- Create logical progression from introduction to conclusion

**5. Engagement and Impact**
- Capture attention immediately (no generic openings)
- Maintain reader interest throughout
- End with clear value proposition or call to action
- Make every sentence purposeful

# QUALITY EXAMPLES

**Example 1: Cover Letter Opening** (Formal, Achievement-Focused)
"As a software engineer with five years of experience building scalable distributed systems, I was excited to discover the Senior Engineering position at TechCorp. Your recent work on CloudStream—particularly the innovative approach to multi-region data consistency—aligns perfectly with the challenges I've tackled at DataSystems Inc., where I led the architecture redesign that reduced latency by 40% while handling 10x traffic growth."

✅ Strong: Specific experience, company knowledge, quantifiable achievement, clear connection

**Example 2: Professional Email** (Clear, Action-Oriented)
"Thanks for reaching out about the Q3 timeline. I've reviewed the project plan and can confirm we're on track for the September 15 deadline. The API integration is nearly complete, and we're entering the testing phase this week. I'll send you a detailed status update by Friday with any potential risks we've identified."

✅ Strong: Immediate acknowledgment, clear status, specific timeline, proactive follow-up

**Example 3: Motivational Letter Opening** (Passionate, Specific)
"During my undergraduate research on urban transportation systems, I discovered that the most impactful solutions emerge at the intersection of data science and public policy—precisely the approach that defines MIT's Master of Business Analytics program. My work optimizing Boston's bike-sharing network, which reduced rebalancing costs by 25%, showed me how analytics can transform real-world systems, and I'm eager to deepen these skills in your interdisciplinary program."

✅ Strong: Personal narrative, specific project, measurable impact, clear program fit

# TYPE-SPECIFIC GUIDELINES

## Cover Letter (250-400 words)
**Structure:** Hook → Experience/Fit → Key Achievements → Closing
**Tone:** Professional, confident, enthusiastic
**Opening:** Strong hook showing company knowledge
**Body:** Connect experience to job requirements with metrics
**Closing:** Express enthusiasm + clear call to action

## Motivational Letter (400-600 words)
**Structure:** Motivation → Background → Program Fit → Goals → Conclusion
**Tone:** Passionate, authentic, forward-looking
**Opening:** Genuine motivation and relevant experience
**Body:** Specific program knowledge + career trajectory
**Closing:** Strong commitment and contribution promise

## Professional Email (100-300 words)
**Structure:** Context → Main Message → Action Items → Next Steps
**Tone:** Clear, concise, professional
**Opening:** Acknowledge/provide context immediately
**Body:** Bullet points for multiple items, clear purpose
**Closing:** Specific next steps and timeline

## Social Response (50-200 words)
**Structure:** Acknowledgment → Response → Warm Closing
**Tone:** Mirror original message (warm, professional, casual)
**Approach:** Match formality level, be genuine, stay concise

# OUTPUT FORMAT

Return a JSON object with the "content" key:

```json
{
  "content": "Your complete written content here..."
}
```

**Rules:**
- Return ONLY the JSON object
- No meta-commentary ("Here's your draft...")
- No placeholder text ([Your Name], [Date], [Company])
- No explanatory notes or formatting instructions
- No multiple versions or alternatives
- No markdown code blocks around the JSON

# REMEMBER
Focus on structure and clarity. PersonalizationAgent will adapt the voice, and EditingAgent will polish the content. Your job is to create a solid foundation with strong messaging and logical flow.
"""


    async def write(
        self,
        request: WritingRequest,
        research_data: Dict[str, Any],
        user_profile: Dict[str, Any] = None,
    ) -> str:
        """Generate initial writing draft."""
        context_dict = request.context.model_dump()
        requirements_dict = request.requirements.model_dump()
        
        # Format writing type for display
        writing_type_display = request.type.replace('_', ' ').title()
        
        # Build user prompt with clear structure
        user_prompt_parts = [
            f"# TASK",
            f"Write a {writing_type_display} that is compelling, well-structured, and professionally crafted.",
            "",
            "# WRITING TYPE",
            f"{writing_type_display}",
            "",
            "# CONTEXT",
        ]
        
        # Add context details in readable format
        for key, value in context_dict.items():
            if value:
                key_display = key.replace('_', ' ').title()
                user_prompt_parts.append(f"**{key_display}:** {value}")
        
        user_prompt_parts.extend([
            "",
            "# REQUIREMENTS",
        ])
        
        # Add requirements in readable format
        for key, value in requirements_dict.items():
            if value is not None:
                key_display = key.replace('_', ' ').title()
                user_prompt_parts.append(f"- **{key_display}:** {value}")
        
        # Add research data if available
        if research_data:
            user_prompt_parts.extend([
                "",
                "# RESEARCH INSIGHTS",
                "Use the following research to inform your writing:"
            ])
            for key, value in research_data.items():
                if value:
                    key_display = key.replace('_', ' ').title()
                    user_prompt_parts.append(f"")
                    user_prompt_parts.append(f"**{key_display}:**")
                    if isinstance(value, list):
                        for item in value:
                            user_prompt_parts.append(f"- {item}")
                    else:
                        user_prompt_parts.append(f"{value}")
        
        # Add user profile if available
        if user_profile:
            user_prompt_parts.extend([
                "",
                "# USER BACKGROUND",
                "Consider the following user information for context (personalization will be applied later):"
            ])
            for key, value in user_profile.items():
                if value and key not in ['created_at', 'updated_at', 'user_id']:
                    key_display = key.replace('_', ' ').title()
                    if isinstance(value, list):
                        user_prompt_parts.append(f"**{key_display}:** {', '.join(value)}")
                    elif isinstance(value, dict):
                        user_prompt_parts.append(f"**{key_display}:**")
                        for k, v in value.items():
                            user_prompt_parts.append(f"  - {k.replace('_', ' ').title()}: {v}")
                    else:
                        user_prompt_parts.append(f"**{key_display}:** {value}")
        
        # Add additional info if provided
        if request.additional_info:
            user_prompt_parts.extend([
                "",
                "# ADDITIONAL INSTRUCTIONS",
                request.additional_info
            ])
        
        # Add final instructions
        user_prompt_parts.extend([
            "",
            "# OUTPUT INSTRUCTIONS",
            "Write the complete content now. Remember to:",
            "- Follow the structure appropriate for this writing type",
            "- Integrate research naturally without listing facts",
            "- Use specific examples and metrics where relevant",
            "- Maintain a professional yet authentic tone",
            "- Ensure logical flow and smooth transitions",
            "- Address all requirements mentioned above",
            "",
            "# OUTPUT",
            "",
            "Return ONLY a JSON object:",
            "{",
            '  "content": "Your complete written content here..."',
            "}",
            "",
            "Do NOT include:",
            "- Meta-commentary or explanations",
            "- Alternative versions",
            "- Markdown code blocks",
            "- Any text outside the JSON object"
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
