<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles: specification before code; two-team contract; compatibility;
  tests as evidence; narrow scope.
- Added sections: Project Constraints; Development Workflow.
- Removed sections: none.
- Follow-up TODOs: none.
-->
# Review Diff Preview Constitution

## Core Principles

### I. Specification Before Code

Every feature MUST have testable acceptance scenarios and explicit scope before
application code is changed. Decisions accepted by the human are authoritative;
implementation MUST trace back to those decisions.

### II. Two-Team Contract

UI and logic specifications MUST be prepared independently before their shared
contract is reconciled. Data, calls, errors, and states MUST agree in both final
specifications before implementation begins. Original drafts MUST remain available
to show what changed during reconciliation.

### III. Backward Compatibility

Existing accepted behavior for `POST /api/reviews` and the MCP tool MUST remain
unchanged unless the specification explicitly replaces it. Valid diff text MUST be
passed without trimming or normalization, and existing success response shapes MUST
remain stable.

### IV. Tests Are Evidence

Every behavioral requirement MUST have an automated check at the lowest useful
level. The finished feature MUST include unit or contract checks, API integration
checks, and one browser-level end-to-end scenario. Test results, not implementation
claims, determine acceptance.

### V. Narrow Scope and Simplicity

Implementation MUST use the existing FastAPI application and the smallest coherent
browser interface. Authentication, persistence, file upload, diff history, secret
redaction, and LLM error handling are out of scope unless a later specification
adds them.

## Project Constraints

- Python code MUST follow `practices/practice_04/STYLE_GUIDE.md`.
- The validation order MUST be length first, meaningful content second.
- A preview request MUST NOT call the review service or LLM.
- User-visible review text MUST be rendered as text, never interpreted as HTML.
- No commit may be created until the user explicitly permits commits.

## Development Workflow

1. Preserve the independent UI and logic drafts.
2. Record the human-approved shared contract and align both final specifications.
3. Generate a plan, interface contract, validation guide, and executable task list.
4. Analyze the artifacts for contradictions before implementation.
5. Implement tests before or alongside each behavior and mark tasks complete only
   after evidence exists.
6. Run the project commands `make lint`, `make step1`, `make step2`, `make test`,
   and `make check` before acceptance.

## Governance

This constitution governs the isolated Spec Kit homework workflow. Amendments require
an explicit rationale, a semantic version change, and human acceptance when they alter
the agreed feature contract. Every review MUST verify the five principles and record
any justified exception in the implementation plan. The repository `AGENTS.md` and
practice style guide remain mandatory where they are stricter.

**Version**: 1.0.0 | **Ratified**: 2026-10-22 | **Last Amended**: 2026-10-22
