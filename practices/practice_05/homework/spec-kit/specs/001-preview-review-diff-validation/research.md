# Research: Preview Review Diff Validation

## Decision 1: GitHub Spec Kit as the second SDD framework

**Decision**: use the official Spec Kit 1.2.3 project structure in the isolated
`homework/spec-kit` directory.

**Rationale**: it provides a chain from constitution and user stories to plan,
contracts, tasks, analysis, and implementation. Isolation prevents its agent files from
overwriting the OpenSpec setup already used in class.

**Alternatives considered**: a second OpenSpec change would not meet the requirement to
use another SDD framework; plain Markdown without a framework is harder to audit.

## Decision 2: One same-origin FastAPI application

**Decision**: serve the page and JSON calls from the existing application.

**Rationale**: one origin avoids CORS configuration and keeps the demo reproducible.

**Alternatives considered**: a separate frontend server adds unnecessary setup and a
cross-origin contract.

## Decision 3: Shared validation function

**Decision**: preview and real review call one function that checks length before
meaningful content.

**Rationale**: this prevents rule drift while the real review remains the final
authority.

**Alternatives considered**: duplicated route logic is initially shorter but can make
the endpoints disagree.

## Decision 4: Unicode code points

**Decision**: the browser uses spread iteration and the server uses Python string length.

**Rationale**: both count Unicode code points, unlike JavaScript's raw UTF-16 `length`.
The server remains authoritative for unusual input.

**Alternatives considered**: grapheme clusters are more visual but require extra logic
and differ from the existing server limit.

## Decision 5: Safe result rendering

**Decision**: set result text through `textContent`.

**Rationale**: model output and diff-related messages must never become executable HTML.

**Alternatives considered**: `innerHTML` adds no value for a plain-text comment and
creates an avoidable injection risk.

## Decision 6: Browser-level evidence

**Decision**: run Chromium through Playwright against a real local Uvicorn process.

**Rationale**: this verifies page delivery, JavaScript, requests, state transitions, and
safe result output as one end-to-end scenario.

**Alternatives considered**: checking only HTML strings with `TestClient` would not
prove browser behavior.

## OpenSpec comparison baseline

OpenSpec remains useful for its delta/change/archive workflow and project rules. Spec Kit
fits this homework because its constitution, separate planning artifacts, user-story task
phases, and cross-artifact analysis make the two-team agreement easy to audit before code.
