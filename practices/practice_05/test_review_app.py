"""Acceptance scenarios for review request features A and B."""

import unittest

import review_app
from fastapi import HTTPException
from fastapi.testclient import TestClient


class FakeLLM:
    def __init__(self) -> None:
        self.prompts: list[str] = []

    def generate(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return "ok"


class ReviewApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.llm = FakeLLM()
        service = review_app.ReviewService(self.llm)
        self.client = TestClient(review_app.create_app(service))

    def test_valid_diff_preserves_feature_a_contract(self) -> None:
        response = self.client.post("/api/reviews", json={"diff": "test"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"comment": "ok"})
        self.assertEqual(len(self.llm.prompts), 1)

    def test_missing_diff_is_rejected_before_llm(self) -> None:
        response = self.client.post("/api/reviews", json={})

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.llm.prompts, [])

    def test_non_string_diff_is_rejected_before_llm(self) -> None:
        response = self.client.post("/api/reviews", json={"diff": 123})

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.llm.prompts, [])

    def test_empty_diff_is_rejected_before_llm(self) -> None:
        response = self.client.post("/api/reviews", json={"diff": ""})

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.llm.prompts, [])

    def test_whitespace_only_diff_is_rejected_before_llm(self) -> None:
        response = self.client.post(
            "/api/reviews",
            json={"diff": " \t\n"},
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.llm.prompts, [])

    def test_accepted_diff_preserves_surrounding_whitespace(self) -> None:
        diff = "  test  "

        response = self.client.post("/api/reviews", json={"diff": diff})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.llm.prompts,
            [f"Review this pull request and find problems:\n{diff}"],
        )

    def test_20000_character_diff_is_accepted(self) -> None:
        diff = "x" * review_app.MAX_DIFF_LENGTH

        response = self.client.post("/api/reviews", json={"diff": diff})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"comment": "ok"})
        self.assertEqual(len(self.llm.prompts), 1)

    def test_20001_character_diff_is_rejected_before_llm(self) -> None:
        diff = "x" * (review_app.MAX_DIFF_LENGTH + 1)

        response = self.client.post("/api/reviews", json={"diff": diff})

        self.assertEqual(response.status_code, 413)
        self.assertEqual(self.llm.prompts, [])

    def test_oversized_whitespace_diff_uses_size_error(self) -> None:
        diff = " " * (review_app.MAX_DIFF_LENGTH + 1)

        response = self.client.post("/api/reviews", json={"diff": diff})

        self.assertEqual(response.status_code, 413)
        self.assertEqual(self.llm.prompts, [])

    def test_preview_accepts_valid_diff_without_calling_llm(self) -> None:
        response = self.client.post(
            "/api/reviews/validate",
            json={"diff": "test"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"valid": True})
        self.assertEqual(self.llm.prompts, [])

    def test_preview_rejects_schema_errors_before_llm(self) -> None:
        payloads = ({}, {"diff": 123}, {"diff": ""})

        for payload in payloads:
            with self.subTest(payload=payload):
                response = self.client.post(
                    "/api/reviews/validate",
                    json=payload,
                )

                self.assertEqual(response.status_code, 422)

        self.assertEqual(self.llm.prompts, [])

    def test_preview_rejects_whitespace_before_llm(self) -> None:
        response = self.client.post(
            "/api/reviews/validate",
            json={"diff": " \t\n"},
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.llm.prompts, [])

    def test_preview_accepts_exactly_20000_characters(self) -> None:
        response = self.client.post(
            "/api/reviews/validate",
            json={"diff": "x" * review_app.MAX_DIFF_LENGTH},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"valid": True})
        self.assertEqual(self.llm.prompts, [])

    def test_preview_uses_size_error_for_oversized_whitespace(self) -> None:
        response = self.client.post(
            "/api/reviews/validate",
            json={"diff": " " * (review_app.MAX_DIFF_LENGTH + 1)},
        )

        self.assertEqual(response.status_code, 413)
        self.assertEqual(self.llm.prompts, [])

    def test_review_revalidates_after_successful_preview(self) -> None:
        preview = self.client.post(
            "/api/reviews/validate",
            json={"diff": "test"},
        )
        review = self.client.post(
            "/api/reviews",
            json={"diff": "test"},
        )

        self.assertEqual(preview.status_code, 200)
        self.assertEqual(review.status_code, 200)
        self.assertEqual(len(self.llm.prompts), 1)

    def test_home_page_serves_the_review_form(self) -> None:
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn('id="diff-input"', response.text)
        self.assertIn('id="validate-button"', response.text)
        self.assertIn('id="review-button"', response.text)


class ReviewValidationTest(unittest.TestCase):
    def test_valid_diff_is_preserved(self) -> None:
        diff = "  test  "

        result = review_app.validate_review_diff(diff)

        self.assertEqual(result, diff)

    def test_length_error_has_priority_over_whitespace_error(self) -> None:
        diff = " " * (review_app.MAX_DIFF_LENGTH + 1)

        with self.assertRaises(HTTPException) as error:
            review_app.validate_review_diff(diff)

        self.assertEqual(error.exception.status_code, 413)

    def test_whitespace_only_diff_uses_validation_error(self) -> None:
        with self.assertRaises(HTTPException) as error:
            review_app.validate_review_diff(" \t\n")

        self.assertEqual(error.exception.status_code, 422)


if __name__ == "__main__":
    unittest.main()
