.PHONY: install backend frontend build test browser-test check

PYTHON ?= python3
REPO_ROOT := ../../..

install:
	$(PYTHON) -m venv .venv
	.venv/bin/python -m pip install -r requirements.txt
	cd frontend && npm ci
	cd frontend && npx playwright install chromium

backend:
	cd $(REPO_ROOT) && practices/practice_08/homework/.venv/bin/python -m uvicorn practices.practice_08.homework.server:app --host 127.0.0.1 --port 8088

frontend:
	cd frontend && npm run dev -- --port 5188 --strictPort

build:
	cd frontend && npm run build

test:
	cd frontend && npm test

browser-test:
	cd frontend && npm run test:e2e

check:
	cd frontend && npm run check
