"""FastAPI review service with shared diff validation and a small web UI."""

from pathlib import Path
from typing import Protocol

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

MAX_DIFF_LENGTH = 20_000
STATIC_DIR = Path(__file__).with_name("static")


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


def has_non_whitespace(diff: str) -> bool:
    """Return whether a diff contains at least one meaningful character."""
    return bool(diff.strip())


def validate_review_diff(diff: str) -> str:
    """Validate a diff without changing its accepted text."""
    if len(diff) > MAX_DIFF_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="diff exceeds 20000 characters",
        )

    if not has_non_whitespace(diff):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="diff must contain a non-whitespace character",
        )

    return diff


def create_app(review_service: ReviewService) -> FastAPI:
    app = FastAPI()
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/", response_class=FileResponse)
    def review_page() -> FileResponse:
        return FileResponse(STATIC_DIR / "index.html")

    @app.post("/api/reviews/validate")
    def validate_review(payload: ReviewRequest) -> dict[str, bool]:
        validate_review_diff(payload.diff)
        return {"valid": True}

    @app.post("/api/reviews")
    def create_review(payload: ReviewRequest) -> dict[str, str]:
        diff = validate_review_diff(payload.diff)
        return review_service.review(diff)

    return app
