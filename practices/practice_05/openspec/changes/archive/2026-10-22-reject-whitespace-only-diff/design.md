# Design

## Context

The practice 4 API uses a Pydantic request model for type and minimum-length
validation, while its MCP checker performs a parallel contract check. Both
paths reject an empty string, but neither rejects a non-empty string made only
of whitespace. Practice 5 has its own OpenSpec root, so the small application
and tests will be carried forward before applying the change. See
`proposal.md` for motivation and the capability spec for observable behavior.

## Goals / Non-Goals

**Goals:**

- Reject whitespace-only input before either path allows an LLM call.
- Reuse one small predicate so API and MCP whitespace semantics cannot drift.
- Return accepted strings unchanged.
- Preserve HTTP 413 precedence for every oversized string.
- Make the repository-level check execute the practice 5 checks.
- Keep practices 1–4 unchanged as the historical baseline.

**Non-Goals:**

- Trimming or normalizing accepted diffs.
- Changing the 20,000-character rule or HTTP response formats.
- Adding redaction, authentication, LLM error handling, or dependencies.

## Decisions

1. Copy the minimal practice 4 application, MCP checker, tests, and dependency
   declaration into `practice_05`, then add a local check command. Editing the
   earlier practice in place was rejected because it would blur the boundary
   between the completed practice and the new OpenSpec exercise.
2. Add a pure predicate to the carried-forward review module that reports
   whether a string contains a non-whitespace character. The MCP checker
   already imports the length constant from this module, so reusing the
   predicate introduces no new dependency direction. Duplicating `strip()` in
   both paths was rejected because the two public entry points could later
   diverge.
3. Keep strict type and minimum-length checks in Pydantic, but perform the new
   whitespace check in the endpoint after the existing length check. A
   Pydantic field validator was rejected because it would return HTTP 422 for
   20,001 whitespace characters before the required HTTP 413 size check.
4. Use `strip()` only inside the predicate and never assign its result. This
   detects whitespace-only input without changing accepted diffs.
5. Make the root `make check` invoke the local practice 5 check. A local-only
   command was rejected because the repository's canonical check could pass
   without exercising the new implementation.
6. Cover whitespace rejection, preservation, and the overlapping oversized
   whitespace case in API and MCP tests. Existing tests remain the regression
   suite for all preserved behavior.

## Risks / Trade-offs

- Unicode characters classified as whitespace are also rejected -> This is
  intentional and matches Python's ordinary definition of whitespace.
- The predicate lives in the API implementation module -> The project is
  deliberately small, and extracting a new shared module would add structure
  without improving this one-rule change.
- The root check gains another nested check -> Keep the practice 5 target
  focused on its own lint and tests so it does not recurse into the root.

## Migration Plan

No data migration is required. Deploy the validation and tests together. A
rollback consists of removing the predicate use and its new tests; the earlier
input contract remains intact.
