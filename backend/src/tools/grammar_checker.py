"""Grammar checking tool using LanguageTool (free) and Grammarly API (optional)."""

import httpx
from typing import Dict

from api.config import settings


class GrammarChecker:
    """Grammar checking tool with LanguageTool (primary) and Grammarly (optional)."""

    async def check(
        self, 
        text: str, 
        use_grammarly: bool = False
    ) -> Dict:
        """Check grammar and spelling in text."""
        if use_grammarly and settings.GRAMMARLY_API_KEY:
            return await self._check_grammarly(text)
        else:
            return await self._check_languagetool(text)


    async def _check_languagetool(self, text: str) -> Dict:
        """Check grammar using LanguageTool (free, open-source)."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.LANGUAGETOOL_API_URL}/v2/check",
                data={
                    "text": text,
                    "language": "en-US",
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()

            return {
                "matches": data.get("matches", []),
                "language": data.get("language", {}).get("name", "en-US"),
                "error_count": len(data.get("matches", [])),
            }


    async def _check_grammarly(self, text: str) -> Dict:
        """Check grammar using Grammarly API (requires API key)."""
        if not settings.GRAMMARLY_API_KEY:
            raise ValueError("GRAMMARLY_API_KEY not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.grammarly.com/v1/check",
                headers={"Authorization": f"Bearer {settings.GRAMMARLY_API_KEY}"},
                json={"text": text},
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()

            return {
                "matches": data.get("alerts", []),
                "error_count": len(data.get("alerts", [])),
            }