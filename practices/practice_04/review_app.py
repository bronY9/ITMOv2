"""Minimal FastAPI implementation of review request features A and B."""

from typing import Protocol

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

MAX_DIFF_LENGTH = 20_000


class LLM(Protocol):
    def generate(self, prompt: str) -> str:
        ...


class ReviewService:
    def __init__(self, llm: LLM) -> None:
        self.llm = llm

    def review(self, diff: str) -> dict[str, str]:
        prompt = f"Review this pull request and find problems:\n{diff}"
        answer = self.llm.generate(prompt)
        return {"comment": answer}


class ReviewRequest(BaseModel):
    diff: str = Field(strict=True, min_length=1)


def create_app(review_service: ReviewService) -> FastAPI:
    app = FastAPI()

    @app.post("/api/reviews")
    def create_review(payload: ReviewRequest) -> dict[str, str]:
        if len(payload.diff) > MAX_DIFF_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="diff exceeds 20000 characters",
            )

        return review_service.review(payload.diff)

    return app
