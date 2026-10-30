# Quickstart and Demo

## Prerequisites

- Python 3.11
- dependencies from `practices/practice_05/requirements.txt`
- Chromium installed for Playwright

## Automated acceptance

From the repository root:

```bash
make lint
make step1
make step2
make test
make check
```

Expected result: every command exits with code 0. The practice_05 test set includes API,
MCP, and real-browser checks.

## Short manual demo

From `practices/practice_05`:

```bash
python -m uvicorn demo_app:app --port 8000
```

Open `http://127.0.0.1:8000` and demonstrate:

1. Enter `diff --git a/a.py b/a.py` and choose «Проверить diff» — success appears.
2. Choose «Запустить ревью» — one plain-text demo comment appears.
3. Replace the text with spaces — preview shows a validation message and keeps input.
4. Enter 20 001 characters — preview shows the size message.
5. Edit the text after successful preview — the previous success becomes stale.

## Contract evidence

The accepted boundary is in `contracts/shared-contract.md`. The original team drafts are
in `before/`; reconciled versions are `ui-spec.md` and `logic-spec.md`.
