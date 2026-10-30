# Verification Report

**Date**: 2026-10-22  
**Environment**: Python 3.11.2, Spec Kit 1.2.3, Playwright 1.55.0  
**Result**: accepted locally

## TDD evidence

Before implementation, `test_review_app.py` reported 9 failures and 3 errors:
the preview route and page returned 404 and `validate_review_diff` did not exist.
The initial browser test could not start under the restricted sandbox; it was then
run with the required local-server permission after implementation.

## Final commands from repository root

| Command | Exit code | Evidence |
|---|---:|---|
| `make lint` | 0 | Ruff: all checks passed |
| `make step1` | 0 | Practice 1 artifacts: OK |
| `make step2` | 0 | Practice 2 artifacts: OK |
| `make test` | 0 | all repository and practice_05 tests passed |
| `make check` | 0 | full lint and test suite passed |

`PYTHON` and `RUFF` pointed to the isolated practice_05 virtual environment so the
commands used exactly the pinned dependencies.

## Practice 05 evidence

| Layer | Count | Result |
|---|---:|---|
| Review API and validator | 19 | passed |
| MCP contract | 5 | passed |
| Chromium end-to-end | 4 | passed |

Browser coverage includes the happy path, 422/413 messages, stale preview, retained
input, duplicate-request protection, text-only rendering, accessible labels, and 320 px
layout. The final screenshot is `demo.png`; browser console errors were `[]`.

OpenSpec strict validation also passed for both main specs. The comparison change has
6/6 completed tasks and is archived at
`openspec/changes/archive/2026-10-22-preview-review-diff-validation/`; no active change
remains.

## Homework contents

- Specs before agreement: `before/ui-spec.md`, `before/logic-spec.md`
- Specs after agreement: `ui-spec.md`, `logic-spec.md`
- Human-approved contract: `contracts/shared-contract.md`
- Plan and task traceability: `plan.md`, `tasks.md`
- Code: application root `practices/practice_05`
- Short demo: `quickstart.md`, `demo.png`
- Comparison and lessons: `reflection.md`
