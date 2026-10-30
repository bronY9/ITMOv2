# Tasks

## 1. Shared HTTP validation

- [x] 1.1 Extract the existing length and whitespace checks into one helper
  used by the review route, and verify all current API and MCP tests still pass.
- [x] 1.2 Add regression coverage for validation order and unchanged accepted
  input, and verify oversized whitespace remains HTTP 413 while surrounding
  whitespace still reaches `ReviewService` unchanged.

## 2. Validation preview operation

- [x] 2.1 Add `POST /api/reviews/validate` using `ReviewRequest` and the shared
  helper, and verify a valid diff returns HTTP 200 with `{"valid": true}` while
  the fake LLM records no calls.
- [x] 2.2 Add preview tests for missing, non-string, empty, whitespace-only,
  exactly 20,000-character, and 20,001-character inputs, and verify their HTTP
  responses and the absence of LLM calls match the delta spec.

## 3. Integration verification

- [x] 3.1 Run the practice_05 checks and the root `make check`, and verify the
  new preview tests plus all preserved practice checks pass.
- [x] 3.2 Run strict OpenSpec validation for this change and verify the proposal,
  delta spec, design, and completed task evidence remain consistent.
