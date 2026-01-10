"""Base agent class with LangChain integration."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

from api.config import settings


class BaseAgent(ABC):
    """Base class for all agents with LangChain integration."""

    def __init__(
        self,
        model: Optional[str] = None,
        temperature: float = 0.7,
        tools: Optional[List[Any]] = None,
    ):
        """Initialize the base agent."""
        self.model = model or settings.DEFAULT_MODEL
        self.temperature = temperature
        self.tools = tools or []
        self.agent_executor: Optional[AgentExecutor] = None
        self.llm = None

        if self.tools:
            self.llm = self._create_llm()
            self._initialize_agent()


    def _create_llm(self) -> BaseChatModel:
        """Create the LLM instance using OpenRouter."""
        return ChatOpenAI(
            model=self.model,
            temperature=self.temperature,
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://github.com/agentic-writing-assistant",
                "X-Title": "Agentic Writing Assistant",
            },
        )


    def _initialize_agent(self) -> None:
        """Initialize the agent executor with tools and prompt."""
        prompt = self._create_prompt()
        agent = create_openai_tools_agent(self.llm, self.tools, prompt)
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=settings.is_development,
            handle_parsing_errors=True,
        )


    def _create_prompt(self) -> ChatPromptTemplate:
        """Create the agent prompt template."""
        return ChatPromptTemplate.from_messages([
            ("system", self.get_system_prompt()),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])


    async def _generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generate text using LLM directly."""
        if not self.llm:
            self.llm = self._create_llm()

        llm = self.llm
        if temperature is not None:
            llm = llm.bind(temperature=temperature)
        if response_format:
            llm = llm.bind(response_format=response_format)

        response = await llm.ainvoke([
            ("system", system_prompt),
            ("human", user_prompt),
        ])
        return response.content or ""


    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent."""
        pass


    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent with given input."""
        if not self.agent_executor:
            raise ValueError("Agent executor not initialized. No tools provided.")

        result = await self.agent_executor.ainvoke(input_data)
        return result


    def run_sync(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent synchronously with given input."""
        if not self.agent_executor:
            raise ValueError("Agent executor not initialized. No tools provided.")

        result = self.agent_executor.invoke(input_data)
        return result

