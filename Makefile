.PHONY: check feature-test install lint mcp-test test step1 step2 step5 step6

PYTHON ?= python3
RUFF ?= ruff
PYTHON_LINT_PATHS := \
	practices/practice_04/check_feature_a.py \
	practices/practice_04/mcp_review_server.py \
	practices/practice_04/review_app.py \
	practices/practice_04/test_mcp_review_server.py \
	practices/practice_04/test_review_app.py

install:
	@echo "Для практик 1–2 ничего устанавливать не нужно."

lint:
	@$(RUFF) check --select E4,E7,E9,F,I $(PYTHON_LINT_PATHS)

test: step1 step2 feature-test mcp-test step5 step6

check: lint test

feature-test:
	@$(PYTHON) practices/practice_04/test_review_app.py

mcp-test:
	@$(PYTHON) practices/practice_04/test_mcp_review_server.py

step1:
	@$(MAKE) -s -C practices/practice_01 test

step2:
	@$(MAKE) -s -C practices/practice_02 test

step5:
	@$(MAKE) -s -C practices/practice_05 check \
		PYTHON=$(PYTHON) RUFF=$(RUFF)

step6:
	@$(MAKE) -s -C practices/practice_06 test
