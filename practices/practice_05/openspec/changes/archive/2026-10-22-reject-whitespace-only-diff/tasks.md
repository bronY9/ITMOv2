# Tasks

## 1. Carry Forward the Baseline

- [x] 1.1 Copy the minimal API, MCP checker, tests, and dependency declaration
  from `practice_04` into `practice_05`, add a local `Makefile`, and verify the
  unchanged baseline tests pass from the new project root.

## 2. API Input Validation

- [x] 2.1 Add the shared non-whitespace predicate and check it in the endpoint
  after the size check; add API tests for whitespace-only rejection,
  preservation of accepted whitespace, and HTTP 413 for 20,001 whitespace
  characters; then verify all API tests pass.

## 3. MCP Contract Consistency

- [x] 3.1 Reuse the shared predicate in the MCP checker after its size check,
  add client tests for ordinary and oversized whitespace-only rejection, and
  verify all MCP tests pass.

## 4. Integration Verification

- [x] 4.1 Add the non-recursive practice 5 check to the root `Makefile`, run
  the repository-level `make check` and strict OpenSpec validation, and verify
  that both commands finish successfully with no changes to practices 1–4.
