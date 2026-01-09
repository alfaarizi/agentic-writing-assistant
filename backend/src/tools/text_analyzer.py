"""Text analysis tools for counting characters, words, pages, and other metrics."""

from typing import Dict


class TextAnalyzer:
    """Text analysis utilities for writing metrics."""

    @staticmethod
    def count_characters(text: str, include_spaces: bool = True) -> int:
        """Count characters in text."""
        return len(text) if include_spaces else len(text.replace(" ", ""))


    @staticmethod
    def count_words(text: str) -> int:
        """Count words in text."""
        return len(text.split()) if text.strip() else 0


    @staticmethod
    def count_lines(text: str) -> int:
        """Count lines in text."""
        return len(text.splitlines())


    @staticmethod
    def count_paragraphs(text: str) -> int:
        """Count paragraphs in text (empty lines separate paragraphs)."""
        return len([p.strip() for p in text.split("\n\n") if p.strip()])


    @staticmethod
    def estimate_pages(text: str, words_per_page: int = 250) -> float:
        """Estimate number of pages."""
        return round(TextAnalyzer.count_words(text) / words_per_page, 2)


    @staticmethod
    def get_all_stats(text: str) -> Dict[str, int | float]:
        """Get all text statistics."""
        return {
            "characters": TextAnalyzer.count_characters(text),
            "characters_no_spaces": TextAnalyzer.count_characters(text, include_spaces=False),
            "words": TextAnalyzer.count_words(text),
            "lines": TextAnalyzer.count_lines(text),
            "paragraphs": TextAnalyzer.count_paragraphs(text),
            "pages": TextAnalyzer.estimate_pages(text),
        }
