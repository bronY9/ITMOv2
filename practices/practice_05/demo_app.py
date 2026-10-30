"""Deterministic local application used by the homework demo and E2E test."""

from review_app import ReviewService, create_app


class DemoLLM:
    def generate(self, prompt: str) -> str:
        return "<strong>Демо:</strong> diff принят для ревью"


app = create_app(ReviewService(DemoLLM()))
