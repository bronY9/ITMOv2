# Implementation Plan: Preview Review Diff Validation

**Branch**: `practice_05` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: accepted UI and logic specifications plus
`contracts/shared-contract.md`.

## Summary

Extend the existing FastAPI practice with one same-origin browser page and a preview
endpoint. A shared validation function will enforce the accepted length and content
rules for both preview and real review. Preview returns only validity and never touches
the review service. Browser behavior uses small static HTML, CSS, and JavaScript files
and is verified through a real browser scenario.

## Technical Context

**Language/Version**: Python 3.11; browser-native HTML, CSS, and JavaScript  
**Primary Dependencies**: FastAPI 0.142.2, Uvicorn, Playwright 1.55.0  
**Storage**: N/A; all state is request or page-local  
**Testing**: `unittest`, FastAPI `TestClient`, Playwright Chromium, Ruff  
**Target Platform**: local/CI web service and modern desktop/mobile browsers  
**Project Type**: small same-origin web application  
**Performance Goals**: preview performs no external call and only local validation  
**Constraints**: preserve API/MCP contracts; no trimming; inclusive 20 000-character limit  
**Scale/Scope**: one page, one new endpoint, one shared validator, one browser scenario

## Constitution Check

*GATE: passed before research and re-checked after design.*

| Principle | Evidence | Result |
|---|---|---|
| Specification Before Code | `before/`, final specs, and contract predate source edits | PASS |
| Two-Team Contract | UI and logic specs reference `shared-contract.md` | PASS |
| Backward Compatibility | plan preserves exact diff and existing responses | PASS |
| Tests Are Evidence | tasks include contract, integration, and browser checks | PASS |
| Narrow Scope and Simplicity | same app, static assets, no persistence or auth | PASS |

No exception or complexity waiver is required.

## Phase 0: Research

`research.md` records the decisions for the second SDD framework, same-origin delivery,
shared validation, Unicode counting, safe text rendering, and browser verification.
All decisions are resolved; no clarification marker remains.

## Phase 1: Design and Contracts

- `data-model.md` describes request data and UI state transitions.
- `contracts/shared-contract.md` is the human-approved UI/logic boundary.
- `quickstart.md` defines runnable acceptance and demo steps.
- `ui-spec.md` and `logic-spec.md` are the reconciled team specifications.

## Project Structure

### Documentation (Spec Kit root)

```text
specs/001-preview-review-diff-validation/
├── before/
│   ├── ui-spec.md
│   └── logic-spec.md
├── checklists/requirements.md
├── contracts/shared-contract.md
├── data-model.md
├── logic-spec.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
├── tasks.md
└── ui-spec.md
```

### Source Code (practice_05 root)

```text
review_app.py
demo_app.py
static/
├── index.html
├── app.js
└── styles.css
test_review_app.py
test_ui_e2e.py
Makefile
requirements.txt
```

**Structure Decision**: keep the existing flat teaching project and add one static
asset directory. The isolated Spec Kit directory documents the workflow without
overwriting OpenSpec configuration.

## Post-Design Constitution Check

PASS. The design uses one shared validator, preserves prior contracts, maps every
requirement to automated evidence, and introduces no out-of-scope service.
