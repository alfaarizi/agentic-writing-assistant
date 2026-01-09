"""Web search tool using Tavily API (primary) and SerpAPI (fallback)."""

import httpx
from typing import Dict, List

from api.config import settings


class SearchTool:
    """Web search tool with Tavily (primary) and SerpAPI (fallback)."""

    async def search(
        self, 
        query: str, 
        max_results: int = 5, 
        use_tavily: bool = True
    ) -> List[Dict[str, str]]:
        """Search the web for information."""
        if use_tavily and settings.TAVILY_API_KEY:
            return await self._search_tavily(query, max_results)
        elif settings.SERPAPI_KEY:
            return await self._search_serpapi(query, max_results)
        else:
            raise ValueError(
                "No search API keys configured. Set TAVILY_API_KEY or SERPAPI_KEY in .env"
            )


    async def _search_tavily(self, query: str, max_results: int) -> List[Dict[str, str]]:
        """Search using Tavily API."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": settings.TAVILY_API_KEY,
                    "query": query,
                    "max_results": max_results,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

            results = []
            for result in data.get("results", []):
                results.append({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "snippet": result.get("content", ""),
                })
            return results


    async def _search_serpapi(self, query: str, max_results: int) -> List[Dict[str, str]]:
        """Search using SerpAPI (fallback)."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://serpapi.com/search",
                params={
                    "api_key": settings.SERPAPI_KEY,
                    "q": query,
                    "num": max_results,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

            results = []
            for result in data.get("organic_results", [])[:max_results]:
                results.append({
                    "title": result.get("title", ""),
                    "url": result.get("link", ""),
                    "snippet": result.get("snippet", ""),
                })
            return results