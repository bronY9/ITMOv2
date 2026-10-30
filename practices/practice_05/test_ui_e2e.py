"""Real-browser acceptance scenarios for the review diff page."""

import socket
import subprocess
import sys
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from playwright.sync_api import Page, Route, expect, sync_playwright

PROJECT_DIR = Path(__file__).parent


def find_free_port() -> int:
    with socket.socket() as server_socket:
        server_socket.bind(("127.0.0.1", 0))
        return int(server_socket.getsockname()[1])


class ReviewUiE2ETest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.port = find_free_port()
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.server = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "demo_app:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(cls.port),
                "--log-level",
                "warning",
            ],
            cwd=PROJECT_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        cls.wait_for_server()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.terminate()
        try:
            cls.server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            cls.server.kill()

    @classmethod
    def wait_for_server(cls) -> None:
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            if cls.server.poll() is not None:
                output = cls.server.stdout.read() if cls.server.stdout else ""
                raise RuntimeError(f"Demo server stopped early:\n{output}")
            try:
                urllib.request.urlopen(cls.base_url, timeout=0.2)
            except (urllib.error.URLError, TimeoutError):
                time.sleep(0.05)
            else:
                return
        raise RuntimeError("Demo server did not start in 10 seconds")

    def open_page(self, page: Page) -> None:
        page.goto(self.base_url)
        expect(page.locator("#diff-input")).to_be_visible()

    def test_preview_and_review_happy_path(self) -> None:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            self.open_page(page)

            page.locator("#diff-input").fill("diff --git a/a.py b/a.py")
            expect(page.locator("#character-count")).to_contain_text("24 / 20 000")
            page.locator("#validate-button").click()
            expect(page.locator("#status-message")).to_have_text(
                "Diff прошёл предварительную проверку",
            )

            page.locator("#review-button").click()
            expect(page.locator("#review-result")).to_have_text(
                "<strong>Демо:</strong> diff принят для ревью",
            )
            self.assertEqual(page.locator("#review-result strong").count(), 0)
            browser.close()

    def test_error_keeps_input_and_edit_invalidates_preview(self) -> None:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            self.open_page(page)

            field = page.locator("#diff-input")
            field.fill("test")
            page.locator("#validate-button").click()
            expect(page.locator("#status-message")).to_contain_text("прошёл")

            field.fill("   ")
            expect(page.locator("#status-message")).to_have_text(
                "Diff изменён — проверьте его снова",
            )
            page.locator("#validate-button").click()
            expect(page.locator("#error-message")).to_have_text(
                "Diff должен быть непустым текстом и содержать хотя бы один "
                "непробельный символ",
            )
            self.assertEqual(field.input_value(), "   ")
            browser.close()

    def test_size_error_and_responsive_accessible_layout(self) -> None:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 320, "height": 800})
            self.open_page(page)

            page.locator("#diff-input").fill("x" * 20_001)
            page.locator("#validate-button").click()
            expect(page.locator("#error-message")).to_have_text(
                "Diff не должен превышать 20 000 символов",
            )
            self.assertEqual(
                page.locator("label[for='diff-input']").count(),
                1,
            )
            self.assertLessEqual(
                page.evaluate("document.documentElement.scrollWidth"),
                320,
            )
            browser.close()

    def test_busy_state_blocks_duplicate_preview_requests(self) -> None:
        request_count = 0

        def delay_preview(route: Route) -> None:
            nonlocal request_count
            request_count += 1
            time.sleep(0.2)
            route.continue_()

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.route("**/api/reviews/validate", delay_preview)
            self.open_page(page)
            page.locator("#diff-input").fill("test")

            page.locator("#validate-button").evaluate(
                "button => { button.click(); button.click(); }",
            )
            expect(page.locator("#status-message")).to_contain_text("прошёл")

            self.assertEqual(request_count, 1)
            browser.close()


if __name__ == "__main__":
    unittest.main()
