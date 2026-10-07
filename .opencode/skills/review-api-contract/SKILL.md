---
name: review-api-contract
description: Verify the POST /api/reviews contracts A and B in this repository, including validation, the 20,000-character boundary, LLM call counts, and repository checks. Use when reviewing or continuing the review API implementation; do not use for unrelated endpoints.
---

# Review API contract

Verify the implementation against repository evidence instead of reconstructing
requirements from chat history.

1. Read the root `AGENTS.md`, then
   `practices/practice_04/HANDOFF.md` and
   `practices/practice_04/STYLE_GUIDE.md`.
2. Inspect `review_app.py`, `test_review_app.py`, the root `Makefile`, and the
   current Git diff. Do not change files unless the user asks for a fix.
3. Confirm each contract independently:
   - a valid non-empty string reaches the LLM once and returns HTTP 200;
   - missing, non-string, and empty values return HTTP 422 before the LLM;
   - 20,000 characters are accepted and reach the LLM once;
   - 20,001 characters return HTTP 413 before the LLM.
4. Run the command documented in the handoff. Also run `git diff --check`.
   Preserve the user's environment overrides for Python, Ruff, and cache paths.
5. Report the branch, examined files, command exit codes, scenario results, and
   remaining unverified behavior. Separate observed results from assumptions.
6. If a check fails, reproduce the smallest failing scenario before proposing a
   fix. After an authorized fix, rerun the failed scenario and the full check.

Do not modify `practices/practice_01/TRAINING_PR.diff`. Do not add timeout,
secret filtering, authentication, or a different response shape while checking
features A and B.
