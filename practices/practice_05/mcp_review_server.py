"""MCP server for checking the review API diff contract."""

from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from review_app import MAX_DIFF_LENGTH, has_non_whitespace

mcp = MCPServer(
    "review-contract",
    description="Checks diff input against the review API contract.",
    version="1.0.0",
)


@mcp.tool()
def check_review_diff(diff: str) -> dict[str, bool | int]:
    """Check whether a diff may be sent to POST /api/reviews."""
    if not diff:
        raise ToolError("diff must be a non-empty string")

    length = len(diff)
    if length > MAX_DIFF_LENGTH:
        raise ToolError(
            f"diff has {length} characters; maximum is {MAX_DIFF_LENGTH}"
        )

    if not has_non_whitespace(diff):
        raise ToolError("diff must contain a non-whitespace character")

    return {
        "accepted": True,
        "length": length,
        "http_status": 200,
        "llm_call_allowed": True,
    }


if __name__ == "__main__":
    mcp.run()
