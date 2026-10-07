"""Real MCP client calls for the review contract tool."""

import unittest

from mcp import Client
from mcp_review_server import MAX_DIFF_LENGTH, mcp


class ReviewContractMcpTest(unittest.IsolatedAsyncioTestCase):
    async def test_lists_and_calls_check_review_diff(self) -> None:
        async with Client(mcp) as client:
            tools = await client.list_tools()
            self.assertEqual(
                [tool.name for tool in tools.tools],
                ["check_review_diff"],
            )

            result = await client.call_tool(
                "check_review_diff",
                {"diff": "test"},
            )

        self.assertFalse(result.is_error)
        self.assertEqual(
            result.structured_content,
            {
                "accepted": True,
                "length": 4,
                "http_status": 200,
                "llm_call_allowed": True,
            },
        )

    async def test_rejects_oversized_diff_as_tool_error(self) -> None:
        async with Client(mcp) as client:
            result = await client.call_tool(
                "check_review_diff",
                {"diff": "x" * (MAX_DIFF_LENGTH + 1)},
            )

        self.assertTrue(result.is_error)
        self.assertIn("maximum is 20000", result.content[0].text)

    async def test_rejects_non_string_input_from_client(self) -> None:
        async with Client(mcp) as client:
            result = await client.call_tool(
                "check_review_diff",
                {"diff": 123},
            )

        self.assertTrue(result.is_error)


if __name__ == "__main__":
    unittest.main()
