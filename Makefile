.PHONY: check install lint test step1 step2

RUFF ?= ruff
PYTHON_LINT_PATHS := practices/practice_04/check_feature_a.py

install:
	@echo "Для практик 1–2 ничего устанавливать не нужно."

lint:
	@$(RUFF) check --select E4,E7,E9,F,I $(PYTHON_LINT_PATHS)

test: step1 step2

check: lint test

step1:
	@$(MAKE) -s -C practices/practice_01 test

step2:
	@$(MAKE) -s -C practices/practice_02 test
