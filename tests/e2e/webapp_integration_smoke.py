import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:3000")
RUNNER_URL = os.getenv("RUNNER_URL", "http://127.0.0.1:8787")
TEST_TOKEN_ID = os.getenv("TEST_TOKEN_ID", "2")
TEST_DISABLE_TOKEN_ID = os.getenv("TEST_DISABLE_TOKEN_ID", "0")
TEST_NFA = os.getenv(
    "TEST_NFA",
    "0xb65ca34b1526c926c75129ef934c3ba9fe6f29f6",
)
ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"


def http_get_json(url: str, timeout_sec: int = 20) -> tuple[int, dict[str, Any]]:
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body) if body else {}
            return resp.status, data
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            data = {"raw": body}
        return exc.code, data


def http_post_json(url: str, payload: dict[str, Any], timeout_sec: int = 20) -> tuple[int, dict[str, Any]]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            text = resp.read().decode("utf-8")
            data = json.loads(text) if text else {}
            return resp.status, data
    except urllib.error.HTTPError as exc:
        text = exc.read().decode("utf-8")
        try:
            data = json.loads(text) if text else {}
        except json.JSONDecodeError:
            data = {"raw": text}
        return exc.code, data


def ensure(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def main() -> int:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    summary: dict[str, Any] = {
        "baseUrl": BASE_URL,
        "runnerUrl": RUNNER_URL,
        "testTokenId": TEST_TOKEN_ID,
        "testDisableTokenId": TEST_DISABLE_TOKEN_ID,
        "checks": {},
    }

    # Backend precheck: runner health.
    runner_health_status, runner_health = http_get_json(f"{RUNNER_URL}/health")
    ensure(runner_health_status == 200, f"runner /health failed: status={runner_health_status}")
    ensure(bool(runner_health.get("ok")), "runner /health ok is false")
    summary["checks"]["runnerHealth"] = {
        "status": runner_health_status,
        "ok": runner_health.get("ok"),
    }

    # Frontend API integration: web -> runner proxy.
    disable_status, disable_payload = http_post_json(
        f"{BASE_URL}/api/autopilot/disable",
        {
            "tokenId": TEST_DISABLE_TOKEN_ID,
            "mode": "local",
            "reason": "webapp-integration-smoke",
        },
    )
    ensure(disable_status == 200, f"/api/autopilot/disable expected 200, got {disable_status}")
    ensure(bool(disable_payload.get("ok")), "/api/autopilot/disable ok is false")
    summary["checks"]["webApiDisable"] = {
        "status": disable_status,
        "ok": disable_payload.get("ok"),
    }

    # Invalid payload should return 400 from runner and be proxied by web API.
    enable_status, enable_payload = http_post_json(
        f"{BASE_URL}/api/autopilot/enable",
        {"permit": {"tokenId": TEST_TOKEN_ID}, "sig": "0x00"},
    )
    ensure(enable_status == 400, f"/api/autopilot/enable invalid payload expected 400, got {enable_status}")
    summary["checks"]["webApiEnableInvalid"] = {
        "status": enable_status,
        "error": enable_payload.get("error"),
    }

    # Frontend UI smoke via Playwright.
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        console_errors: list[str] = []
        page.on(
            "console",
            lambda msg: console_errors.append(msg.text)
            if msg.type == "error"
            else None,
        )

        home_resp = page.goto(BASE_URL, wait_until="domcontentloaded", timeout=120_000)
        ensure(home_resp is not None and home_resp.status < 400, "home page did not load successfully")
        try:
            page.wait_for_load_state("networkidle", timeout=20_000)
        except PlaywrightTimeoutError:
            # Dev mode may keep live connections active; continue with captured state.
            pass
        page.wait_for_timeout(1200)
        page.screenshot(path=str(ARTIFACT_DIR / "home.png"), full_page=True)
        ensure(len(page.title().strip()) > 0, "home page title is empty")

        console_url = f"{BASE_URL}/agent/{TEST_NFA}/{TEST_TOKEN_ID}/console"
        console_resp = page.goto(console_url, wait_until="domcontentloaded", timeout=120_000)
        ensure(
            console_resp is not None and console_resp.status < 400,
            f"console page failed to load: status={console_resp.status if console_resp else 'none'}",
        )
        try:
            page.wait_for_load_state("networkidle", timeout=20_000)
        except PlaywrightTimeoutError:
            pass
        page.wait_for_timeout(1200)
        page.screenshot(path=str(ARTIFACT_DIR / "console.png"), full_page=True)
        body_text = page.locator("body").inner_text(timeout=10_000)
        ensure(len(body_text.strip()) > 20, "console page body text appears empty")

        browser.close()
        summary["checks"]["frontendUi"] = {
            "homeScreenshot": str(ARTIFACT_DIR / "home.png"),
            "consoleScreenshot": str(ARTIFACT_DIR / "console.png"),
            "consoleErrorCount": len(console_errors),
            "consoleErrors": console_errors[:20],
        }

    summary["ok"] = True
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[webapp-integration-smoke] FAILED: {exc}", file=sys.stderr)
        raise
