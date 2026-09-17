#!/usr/bin/env python3
"""
Smoke test for the Ollama-Deck backend.

Runs ON the Steam Deck (as user `deck`), exercising the real systemctl --user
and systemd-inhibit integration WITHOUT a Decky runtime (the `decky` module is
absent -- main.py falls back to env-based paths).

Usage (on the deck):
    cd /path/to/ollama-deck
    python3 scripts/smoke_test.py

The test restores the original service/autostart states at the end.
Exit code 0 = all assertions passed.
"""

import asyncio
import json
import os
import subprocess
import time
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

os.environ.setdefault("DECKY_PLUGIN_SETTINGS_DIR", "/tmp/ollama-deck-smoke/settings")

import main as backend  # noqa: E402


def inhibit_list() -> str:
    out = subprocess.run(
        ["systemd-inhibit", "--list"], capture_output=True, text=True
    ).stdout
    return out


async def wait_text(needle: str, want: bool, timeout: float = 5.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if (needle in inhibit_list()) == want:
            return
        await asyncio.sleep(0.25)
    raise AssertionError(
        f"{needle!r} {'expected' if want else 'not expected'} in logind list"
    )


async def run() -> None:
    plugin = backend.Plugin()
    plugin.settings = backend.Settings()
    plugin.settings.load()
    backend.install_unit()

    before = await plugin.get_status()
    print("BEFORE:", json.dumps(before, indent=2, default=str))

    # --- service on ---
    res = await plugin.set_service(True)
    assert res["ok"], f"start failed: {res}"
    assert res["service_active"], "service should be active after start"
    print("START OK:", json.dumps(res))

    st = await plugin.get_status()
    assert st["service_active"] and st["api_reachable"], (
        "service should be active and API reachable"
    )
    assert "0.0.0.0\"" not in st["api_url"], f"bad api_url: {st['api_url']}"
    print("STATUS_ACTIVE OK: version=%s models=%d url=%s"
          % (st["version"], len(st["models"]), st["api_url"]))
    if st["models"]:
        print("  model[0]:", st["models"][0]["name"])

    # --- keep awake on ---
    res = await plugin.set_keep_awake(True)
    assert res["ok"] and res["keep_awake_locked"], f"keep_awake failed: {res}"
    assert await backend.Inhibitor.active(), "awake unit inactive"
    await wait_text("Ollama-Deck", True)
    print("KEEP_AWAKE HELD OK")

    # --- keep awake off ---
    res = await plugin.set_keep_awake(False)
    assert res["ok"] and not res["keep_awake_locked"]
    assert not await backend.Inhibitor.active(), "awake unit still active"
    await wait_text("Ollama-Deck", False)
    print("KEEP_AWAKE RELEASED OK")

    # --- autostart toggle round-trip ---
    was_enabled = before["autostart"]
    await plugin.set_autostart(True)
    assert await backend.Systemctl.is_enabled(), "enable failed"
    await plugin.set_autostart(False)
    assert not await backend.Systemctl.is_enabled(), "disable failed"
    print("AUTOSTART TOGGLE OK")

    # --- service off ---
    res = await plugin.set_service(False)
    assert res["ok"] and not res["service_active"]
    st = await plugin.get_status()
    assert not st["service_active"], "service should be inactive after stop"
    assert not st["keep_awake_locked"], "keep_awake should auto-release"
    print("STOP OK")

    # --- restore original states ---
    if before["service_active"]:
        await plugin.set_service(True)
        print("RESTORED: service active (as found)")
    if was_enabled:
        await plugin.set_autostart(True)
        print("RESTORED: autostart enabled (as found)")
    if before["keep_awake"]:
        await plugin.set_keep_awake(True)
        print("RESTORED: keep-awake on (as found)")

    print("SMOKE OK")


if __name__ == "__main__":
    asyncio.run(run())