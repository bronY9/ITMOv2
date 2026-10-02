"""Web/API acceptance check for feature A using the webapp-testing skill."""

from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8000").rstrip("/")
SCREENSHOT = Path(os.environ.get("SCREENSHOT", "/tmp/feature-a-swagger.png"))


def require_running_app() -> None:
    try:
        with urlopen(f"{BASE_URL}/docs", timeout=3) as response:
            if response.status != 200:
                raise SystemExit(
                    "FastAPI docs returned "
                    f"HTTP {response.status}: {BASE_URL}/docs"
                )
    except URLError as error:
        raise SystemExit(
            f"Cannot run feature A check: no application at {BASE_URL}. "
            "Start FastAPI first or use webapp-testing/scripts/with_server.py."
        ) from error


def post(
    request: object,
    payload: dict[object, object],
    expected: int,
) -> dict:
    response = request.post(f"{BASE_URL}/api/reviews", data=payload)
    assert response.status == expected, (
        f"POST /api/reviews with {payload!r}: expected {expected}, got "
        f"{response.status}: {response.text()}"
    )
    return response.json()


def main() -> None:
    require_running_app()

    # Keep the missing-server error independent from the optional dependency.
    from playwright.sync_api import sync_playwright

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(f"{BASE_URL}/docs")
        page.wait_for_load_state("networkidle")
        assert page.get_by_text("/api/reviews", exact=True).count() > 0
        page.screenshot(path=str(SCREENSHOT), full_page=True)

        result = post(page.request, {"diff": "test"}, 200)
        assert isinstance(result.get("comment"), str), json.dumps(result)

        post(page.request, {}, 422)
        post(page.request, {"diff": 123}, 422)
        post(page.request, {"diff": ""}, 422)

        browser.close()

    print(f"Feature A web check passed; screenshot: {SCREENSHOT}")


if __name__ == "__main__":
    main()
