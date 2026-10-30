.PHONY: check e2e-test feature-test lint mcp-test test

PYTHON ?= python3
RUFF ?= ruff
REPO_ROOT := ../..
PYTHON_LINT_PATHS := \
	practices/practice_05/mcp_review_server.py \
	practices/practice_05/demo_app.py \
	practices/practice_05/review_app.py \
	practices/practice_05/test_mcp_review_server.py \
	practices/practice_05/test_review_app.py \
	practices/practice_05/test_ui_e2e.py

lint:
	@cd $(REPO_ROOT) && \
		$(RUFF) check --select E4,E7,E9,F,I $(PYTHON_LINT_PATHS)

test: feature-test mcp-test e2e-test

check: lint test

feature-test:
	@$(PYTHON) test_review_app.py

mcp-test:
	@$(PYTHON) test_mcp_review_server.py

e2e-test:
	@$(PYTHON) test_ui_e2e.py
