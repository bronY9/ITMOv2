# Proposal

## Why

`POST /api/reviews` rejects an empty `diff`, but currently accepts a string
made only of whitespace and sends it to the LLM. Rejecting that input closes a
small validation gap without changing the successful review flow.

## What Changes

- Reject a whitespace-only `diff` with HTTP 422 before the LLM is called.
- Preserve the original value of every accepted `diff`, including leading and
  trailing whitespace.
- Apply the same whitespace-only rule in the MCP contract checker.
- Keep the existing success response, 20,000-character limit, and all earlier
  validation behavior unchanged.
- Carry the practice 4 implementation and tests into `practice_05` so the new
  OpenSpec project is self-contained without rewriting earlier practice files.
- Include the practice 5 checks in the repository-level `make check` command.

## Capabilities

### New Capabilities

- `review-diff-validation`: Validation rules shared by the review API and its
  MCP contract checker.

### Modified Capabilities

None.

## Impact

- A carried-forward API implementation and tests under `practices/practice_05`.
- A carried-forward MCP checker and tests under `practices/practice_05`.
- The root `Makefile`, which will invoke the practice 5 check.
- Practice 1–4 files remain unchanged and serve as the baseline and evidence.
- No new runtime dependencies and no response-format changes.
