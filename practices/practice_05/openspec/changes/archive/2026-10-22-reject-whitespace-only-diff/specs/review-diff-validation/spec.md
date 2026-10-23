# Spec Delta

## Purpose

Defines the observable validation contract for review diffs across the HTTP
API and the MCP contract checker before an LLM call is allowed.

## ADDED Requirements

### Requirement: Valid review diff is accepted unchanged

The review API SHALL accept a strict string containing at least one
non-whitespace character when its length is at most 20,000 characters, pass
the exact string to the review service, and call the LLM once.

#### Scenario: Ordinary diff is accepted

- **WHEN** the client submits `{"diff": "test"}`
- **THEN** the API returns HTTP 200 with `{"comment": <string>}` and calls the
  LLM once

#### Scenario: Significant surrounding whitespace is preserved

- **WHEN** the client submits `{"diff": "  test  "}`
- **THEN** the API passes the unchanged string to the review service

#### Scenario: Maximum-length diff is accepted

- **WHEN** the client submits a valid `diff` of exactly 20,000 characters
- **THEN** the API returns HTTP 200 and calls the LLM once

### Requirement: Invalid review diff is rejected before the LLM

The review API SHALL return HTTP 422 without calling the LLM when `diff` is
missing, is not a string, or is empty. A whitespace-only string of at most
20,000 characters SHALL also return HTTP 422 without calling the LLM.

#### Scenario: Whitespace-only diff is rejected

- **WHEN** the client submits a `diff` containing only spaces, tabs, or line
  breaks
- **THEN** the API returns HTTP 422 and does not call the LLM

#### Scenario: Existing validation failures remain rejected

- **WHEN** `diff` is missing, is not a string, or is an empty string
- **THEN** the API returns HTTP 422 and does not call the LLM

### Requirement: Oversized review diff is rejected before the LLM

The review API SHALL return HTTP 413 without calling the LLM when a string
`diff` is longer than 20,000 characters, regardless of its contents.

#### Scenario: Diff exceeds the maximum length

- **WHEN** the client submits a `diff` of 20,001 characters
- **THEN** the API returns HTTP 413 and does not call the LLM

#### Scenario: Oversized whitespace-only diff uses the size error

- **WHEN** the client submits a `diff` containing 20,001 whitespace characters
- **THEN** the API returns HTTP 413 and does not call the LLM

### Requirement: MCP checker mirrors the whitespace rule

The MCP contract checker MUST reject an empty or whitespace-only `diff` and
MUST continue to reject a non-string or oversized `diff`. An oversized string
MUST be rejected by the size rule even when it contains only whitespace.

#### Scenario: MCP receives whitespace-only diff

- **WHEN** the MCP tool is called with a `diff` containing only whitespace
- **THEN** the tool returns an error and does not report that an LLM call is
  allowed

#### Scenario: MCP receives oversized whitespace-only diff

- **WHEN** the MCP tool is called with 20,001 whitespace characters
- **THEN** the tool reports that the maximum length was exceeded
