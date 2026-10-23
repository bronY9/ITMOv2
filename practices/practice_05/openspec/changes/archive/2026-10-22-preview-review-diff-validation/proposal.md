# Proposal

## Why

Clients currently learn whether a review diff is acceptable only when they
submit it for review. A validation preview lets them detect input errors before
starting an LLM-backed review.

## What Changes

- Add an HTTP operation that validates a review diff without calling the LLM.
- Reuse the accepted input rules and error precedence of `POST /api/reviews`.
- Return a small success response for an acceptable diff while preserving the
  existing review endpoint and MCP behavior.

## Capabilities

### New Capabilities

- `review-diff-validation-preview`: Covers previewing whether a review diff is
  acceptable without starting a review or calling the LLM.

### Modified Capabilities

None.

## Impact

- Adds one FastAPI route and request/response contract.
- Reuses review-diff validation logic shared with the existing review route.
- Adds API tests for accepted, invalid, and oversized preview requests.
- Does not change `POST /api/reviews`, `ReviewService`, or the MCP tool.
