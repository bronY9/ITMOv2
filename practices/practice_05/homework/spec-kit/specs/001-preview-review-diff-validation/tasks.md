# Tasks: Preview Review Diff Validation

**Input**: `spec.md`, `plan.md`, `research.md`, `data-model.md`,
`contracts/shared-contract.md`, `quickstart.md`  
**Tests**: required by the accepted specification and constitution  
**Organization**: tasks are grouped by independently testable user story

## Phase 1: Setup

**Purpose**: make the accepted test and demo commands reproducible.

- [x] T001 Add the explicit Uvicorn runtime dependency in `practices/practice_05/requirements.txt`
- [x] T002 Add browser-test targets and source paths in `practices/practice_05/Makefile`; verify the root `Makefile` still delegates to it

---

## Phase 2: Foundational Tests

**Purpose**: write failing evidence for the shared contract before implementation.

- [x] T003 [P] Add preview contract, boundary-order, no-LLM, and review-regression tests in `practices/practice_05/test_review_app.py`
- [x] T004 [P] Add the real-browser happy-path, validation-error, stale-state, duplicate-request, and plain-text scenarios in `practices/practice_05/test_ui_e2e.py`

**Checkpoint**: new tests exist and fail because preview/UI are not implemented.

---

## Phase 3: User Story 1 - Check diff before review (Priority: P1) MVP

**Goal**: preview accepted and rejected diff without invoking review or LLM.

**Independent Test**: preview `test`, whitespace, exactly 20 000 characters, and
20 001 characters; confirm statuses and zero LLM calls.

- [x] T005 [US1] Extract length-first shared validation and add `POST /api/reviews/validate` in `practices/practice_05/review_app.py`
- [x] T006 [P] [US1] Create the accessible page structure in `practices/practice_05/static/index.html`
- [x] T007 [P] [US1] Create the responsive visual states in `practices/practice_05/static/styles.css`
- [x] T008 [US1] Implement Unicode count, preview request, and status mapping in `practices/practice_05/static/app.js`
- [x] T009 [US1] Serve the page and static assets from `practices/practice_05/review_app.py`

**Checkpoint**: US1 contract and browser preview scenarios pass independently.

---

## Phase 4: User Story 2 - Run existing review (Priority: P2)

**Goal**: complete the browser journey while preserving the API/MCP behavior.

**Independent Test**: send a valid diff from the page, receive one plain-text comment,
and observe exactly one LLM call; invalid input causes no call.

- [x] T010 [US2] Implement the review action and safe `textContent` result rendering in `practices/practice_05/static/app.js`
- [x] T011 [US2] Add a deterministic local demo application in `practices/practice_05/demo_app.py`
- [x] T012 [US2] Verify existing MCP behavior remains unchanged in `practices/practice_05/test_mcp_review_server.py`

**Checkpoint**: UI and API review paths work without changing response formats.

---

## Phase 5: User Story 3 - Recover without losing work (Priority: P3)

**Goal**: preserve input, invalidate stale preview, and prevent duplicate requests.

**Independent Test**: trigger an error, edit and retry; verify the field remains, old
success clears, and rapid double activation produces one request.

- [x] T013 [US3] Complete busy, stale, error, and retry state transitions in `practices/practice_05/static/app.js`
- [x] T014 [US3] Add accessible live-status, alert, keyboard, and 320 px assertions in `practices/practice_05/test_ui_e2e.py`

**Checkpoint**: all three stories are independently demonstrable.

---

## Phase 6: Polish and Homework Evidence

**Purpose**: make the full hand-in reproducible and explain the decisions.

- [x] T015 [P] Install practice_05 dependencies and Chromium in `.github/workflows/python-checks.yml`
- [x] T016 [P] Record OpenSpec/Spec Kit comparison and reflection in `homework/spec-kit/specs/001-preview-review-diff-validation/reflection.md`
- [x] T017 Capture the final browser demo in `homework/spec-kit/specs/001-preview-review-diff-validation/demo.png`
- [x] T018 Run every command from `quickstart.md` and record factual results in `homework/spec-kit/specs/001-preview-review-diff-validation/verification.md`

---

## Dependencies and Execution Order

- Phase 1 precedes all executable tests.
- T003 and T004 may be written in parallel; both must exist before implementation.
- US1 is the MVP and precedes the browser review integration in US2.
- US3 depends on the page request functions created in US1 and US2.
- Phase 6 follows successful story checks.

## Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-001, FR-002 | T006-T009, T014 |
| FR-003-FR-007 | T003, T005, T008-T010 |
| FR-008-FR-010 | T004, T013 |
| FR-011 | T004, T010 |
| FR-012 | T003, T012, T018 |
| SC-001-SC-005 | T003-T004, T014, T017-T018 |

## Implementation Strategy

Implement and validate US1 first, add the existing review journey as US2, then polish
recovery behavior as US3. Do not create commits; the user will decide when commits resume.
