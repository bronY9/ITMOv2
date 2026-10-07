"""Acceptance scenarios for review request features A and B."""

import unittest

import review_app
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


if __name__ == "__main__":
    unittest.main()
