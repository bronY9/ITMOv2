# review-diff-validation-preview Specification

## Purpose

Lets clients check whether a review diff is acceptable before starting an
LLM-backed review, using the same observable validation contract.

## Requirements

### Requirement: Valid diff can be previewed without starting a review

The API SHALL accept `POST /api/reviews/validate` with a valid review diff and
return HTTP 200 with `{"valid": true}` without calling the LLM.

#### Scenario: Ordinary diff passes preview validation

- **WHEN** the client submits `{"diff": "test"}` to
  `POST /api/reviews/validate`
- **THEN** the API returns HTTP 200 with `{"valid": true}` and does not call
  the LLM

#### Scenario: Maximum-length diff passes preview validation

- **WHEN** the client submits a valid `diff` of exactly 20,000 characters to
  `POST /api/reviews/validate`
- **THEN** the API returns HTTP 200 with `{"valid": true}` and does not call
  the LLM

### Requirement: Preview uses the review diff error contract

The preview operation SHALL reject a missing, non-string, empty, or
whitespace-only `diff` with HTTP 422 and SHALL reject any string longer than
20,000 characters with HTTP 413, without calling the LLM.

#### Scenario: Whitespace-only diff fails preview validation

- **WHEN** the client submits a whitespace-only `diff` of at most 20,000
  characters to `POST /api/reviews/validate`
- **THEN** the API returns HTTP 422 and does not call the LLM

#### Scenario: Oversized diff fails preview validation

- **WHEN** the client submits a `diff` of 20,001 characters to
  `POST /api/reviews/validate`
- **THEN** the API returns HTTP 413 and does not call the LLM

#### Scenario: Oversized whitespace uses the size error

- **WHEN** the client submits 20,001 whitespace characters to
  `POST /api/reviews/validate`
- **THEN** the API returns HTTP 413 and does not call the LLM
