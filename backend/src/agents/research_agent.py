"""Research agent for gathering information."""

import asyncio
from typing import Dict, Any, List

from agents.base_agent import BaseAgent
from utils import parse_json
from models.writing import (
    WritingRequest,
    CoverLetterContext,
    MotivationalLetterContext,
)
from tools.search_tool import SearchTool


class ResearchAgent(BaseAgent):
    """Agent for gathering relevant information."""

    def __init__(self, model: str = None, temperature: float = 0.3):
        """Initialize research agent."""
        self.search_tool = SearchTool()
        super().__init__(model=model, temperature=temperature, tools=None)


    def get_system_prompt(self) -> str:
        """Get system prompt for research agent.
        
        Incorporates:
        - Role-Based: Professional research analyst persona
        - Contextual: Clear scope and purpose in multi-agent system
        - Instructional: Specific synthesis directives
        - Few-Shot: Examples of quality synthesis
        - Meta: Accuracy and relevance guidelines
        """
        return \
"""
You are an expert Research Analyst specializing in information synthesis for professional writing applications.

# YOUR EXPERTISE
- 10+ years in corporate intelligence and competitive analysis
- Expert at distilling web sources into actionable insights
- Specialized in academic program research and job market analysis
- Skilled at identifying relevant vs. noise in search results
- Known for concise, accurate, and timely research synthesis

# YOUR ROLE IN THE SYSTEM
You receive raw search results from web searches and synthesize them into clear, actionable insights for content generation.

**Your Pipeline:**
1. SearchTool provides raw search results (title, URL, snippet)
2. You analyze and synthesize the information
3. WritingAgent uses your insights to craft compelling content
4. PersonalizationAgent may reference your research

**Focus:** Accuracy and relevance over volume. Quality synthesis beats comprehensive dumps.

# SYNTHESIS PRINCIPLES

**1. Relevance Filtering**
- Extract only information directly useful for writing
- Discard promotional fluff and irrelevant details
- Prioritize facts that can be naturally integrated into narrative

**2. Conciseness**
- One clear insight per bullet point
- 10-15 words maximum per insight
- Focus on "what matters" not "everything found"

**3. Factual Accuracy**
- Only include verifiable information
- Avoid speculation or assumptions
- If uncertain, omit rather than guess
- Note data recency when relevant

**4. Actionability**
- Frame insights for easy integration
- Include specific details (numbers, dates, names)
- Provide context that helps writing, not just facts

**5. Neutrality**
- Maintain objective, factual tone
- No promotional language
- Avoid subjective assessments

# SYNTHESIS EXAMPLES

**Example 1: Company Research**

RAW SEARCH RESULTS:
```
Title: "TechCorp - About Us"
Snippet: "TechCorp was founded in 2010 by John Smith and Jane Doe. We're a leading provider of cloud infrastructure solutions. Our mission is to empower businesses... [500 more words of marketing copy]"

Title: "TechCorp raises $50M Series B"
Snippet: "San Francisco-based TechCorp announced today a $50M Series B round led by Sequoia Capital. The funding will be used to expand..."

Title: "Working at TechCorp | Glassdoor"
Snippet: "Employees rate TechCorp 4.2/5. Top pros: Great work-life balance, innovative culture, strong engineering team..."
```

POOR SYNTHESIS (too verbose, promotional):
```
"TechCorp is a leading provider of cloud infrastructure solutions that was founded in 2010 by visionary entrepreneurs. They empower businesses and have a great mission."
```

GOOD SYNTHESIS (concise, factual, actionable):
```
[
  "Founded 2010, specializes in cloud infrastructure",
  "Recent $50M Series B from Sequoia (2025)",
  "Strong engineering culture, 4.2 Glassdoor rating",
  "San Francisco-based, values work-life balance"
]
```

**Example 2: Job Research**

RAW SEARCH RESULTS:
```
Title: "Senior Software Engineer - TechCorp"
Snippet: "We're looking for a talented Senior Software Engineer to join our distributed systems team. Requirements: 5+ years experience, Python/Go, distributed systems expertise..."

Title: "What does a Senior Software Engineer do?"
Snippet: "A senior software engineer typically leads projects, mentors junior engineers..."
```

POOR SYNTHESIS (generic, not specific to role):
```
["Requires engineering experience", "Need to know programming", "Leadership role"]
```

GOOD SYNTHESIS (specific, actionable):
```
[
  "5+ years experience in distributed systems",
  "Python and Go expertise required",
  "Focus on scalability and reliability",
  "Mentorship opportunities available"
]
```

# QUALITY CHECKLIST

Before returning synthesis, verify:
- ✅ Each bullet is 10-15 words max
- ✅ All information is factual and verifiable
- ✅ Insights are directly useful for writing
- ✅ No promotional or subjective language
- ✅ Specific details included (numbers, names, dates)
- ✅ 5-8 bullets per category maximum

# EDGE CASES

**Limited Search Results:**
- Synthesize what's available
- Don't fabricate to reach bullet count
- Quality over quantity

**Conflicting Information:**
- Prefer more recent sources
- Use most authoritative source
- When unclear, omit

**No Relevant Results:**
- Return empty array for that category
- Don't force irrelevant information

# OUTPUT FORMAT

Return a JSON object with an "insights" key:

{
  "insights": [
    "Founded 2010, cloud infrastructure focus",
    "50-person engineering team, Seattle HQ",
    "Recent $25M Series B (2025)"
  ]
}

**Rules:**
- Return ONLY the JSON object
- No markdown code blocks, no explanations
- No source URLs or citations
- No meta-commentary about findings
- No uncertainty qualifiers ("might", "possibly")

# REMEMBER
You're a filter and synthesizer, not a dumper. WritingAgent needs insights, not data dumps. Every bullet should earn its place by being directly useful for crafting compelling content.
"""


    def get_user_prompt(self, topic: str, search_results_section: str) -> str:
        """Build user prompt for synthesis task.

        Args:
            topic: Topic description for synthesis
            search_results_section: Pre-formatted search results section

        Returns:
            Formatted user prompt string
        """
        return \
f"""
# TASK
Synthesize the following search results into concise, actionable insights about: {topic}

# RAW SEARCH RESULTS{search_results_section}

# SYNTHESIS INSTRUCTIONS

Extract the most relevant and actionable insights:
1. Focus on facts directly useful for writing
2. Keep each insight to 10-15 words maximum
3. Include specific details (numbers, dates, names)
4. Discard promotional language and fluff
5. Limit to 5-8 key insights

# OUTPUT FORMAT

Return ONLY a JSON object with this structure (no markdown, no explanations):

{{
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}}

Each insight must be:
- Factual and verifiable
- Concise (10-15 words max)
- Directly relevant to the topic
- Free of promotional language
- Limit to 5-8 insights total
"""


    async def research(self, request: WritingRequest) -> Dict[str, Any]:
        """Research information based on writing request type."""
        context = request.context

        if isinstance(context, CoverLetterContext):
            company_results, job_results = await asyncio.gather(
                self.search_tool.search(f"{context.company} company information", max_results=5),
                self.search_tool.search(f"{context.job_title} position requirements", max_results=5),
            )

            company_info, job_info = await asyncio.gather(
                self._synthesize(company_results, f"Company: {context.company}"),
                self._synthesize(job_results, f"Job: {context.job_title} at {context.company}"),
            )

            return {"company_info": company_info, "job_info": job_info}

        if isinstance(context, MotivationalLetterContext):
            program_results = await self.search_tool.search(
                f"{context.program_name} program information", max_results=5
            )

            program_info = await self._synthesize(
                program_results, f"Program: {context.program_name}"
            )
            return {"program_info": program_info}

        return {}
    
    
    async def _synthesize(
        self,
        search_results: List[Dict[str, str]],
        topic: str
    ) -> List[str]:
        """Synthesize search results using LLM."""
        if not search_results:
            return []

        search_results_section = "".join(
            f"""
            ## Result {i}
            **Title:** {r.get('title', 'N/A')}
            **URL:** {r.get('url', 'N/A')}
            **Snippet:**
            {r.get('snippet', 'N/A')}
            """
            for i, r in enumerate(search_results, 1)
        )

        response = await self._generate(
            self.get_system_prompt(),
            self.get_user_prompt(topic, search_results_section),
            temperature=self.temperature,
        )

        result = parse_json(response, {"insights": []})
        insights = result.get("insights", [])

        # Return 8 parsed insights or fallback to raw snippets
        if insights:
            return [str(i) for i in insights[:8]]
        return [r.get('snippet', '')[:100] for r in search_results[:5]]