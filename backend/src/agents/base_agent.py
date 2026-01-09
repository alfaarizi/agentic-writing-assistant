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
        """
        Initialize the base agent.

        Args:
            model: OpenRouter model name (e.g., 'openai/gpt-4o')
            temperature: Model temperature for generation
            tools: List of LangChain tools available to the agent
        """
        self.model = model or "openai/gpt-4o"
        self.temperature = temperature
        self.tools = tools or []
        self.agent_executor: Optional[AgentExecutor] = None
        self.llm = None

        if self.tools:
            self.llm = self._create_llm()
            self._initialize_agent()

    def _create_llm(self) -> BaseChatModel:
        """
        Create the LLM instance using OpenRouter.

        Returns:
            Configured chat model instance
        """
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
        """
        Create the agent prompt template.

        Returns:
            Chat prompt template for the agent
        """
        return ChatPromptTemplate.from_messages(
            [
                ("system", self.get_system_prompt()),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )

    @abstractmethod
    def get_system_prompt(self) -> str:
        """
        Get the system prompt for this agent.

        Returns:
            System prompt string
        """
        pass

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent with given input.

        Args:
            input_data: Input data for the agent

        Returns:
            Agent execution result
        """
        if not self.agent_executor:
            raise ValueError("Agent executor not initialized. No tools provided.")

        result = await self.agent_executor.ainvoke(input_data)
        return result

    def run_sync(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent synchronously with given input.

        Args:
            input_data: Input data for the agent

        Returns:
            Agent execution result
        """
        if not self.agent_executor:
            raise ValueError("Agent executor not initialized. No tools provided.")

        result = self.agent_executor.invoke(input_data)
        return result

