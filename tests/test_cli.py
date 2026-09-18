import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cli  # noqa: E402
import pytest  # noqa: E402


class FakePlugin:
    def __init__(self):
        self.calls = []

    async def set_service(self, on):
        self.calls.append(("set_service", on))
        return {"ok": True, "service_active": on}

    async def set_autostart(self, on):
        self.calls.append(("set_autostart", on))
        return {"ok": True, "autostart": on}

    async def set_keep_awake(self, on):
        self.calls.append(("set_keep_awake", on))
        return {"ok": True, "keep_awake": on, "keep_awake_locked": on}

    async def get_status(self):
        self.calls.append(("get_status",))
        return {
            "service_active": True,
            "autostart": True,
            "keep_awake": False,
            "keep_awake_locked": False,
            "version": "X.Y.Z",
            "api_reachable": True,
            "models": [{"name": "m1", "size": 1024, "family": "llama", "quant": ""}],
            "api_url": "http://127.0.0.1:11434",
            "error": "",
        }

    async def chat(self, model, prompt):
        self.calls.append(("chat", model, prompt))
        return {"ok": True, "response": "Hello from Ollama!", "model": model}

    async def lan_info(self):
        self.calls.append(("lan_info",))
        return {
            "ok": True,
            "bind_address": "10.0.0.128",
            "port": 11434,
            "base_url": "http://10.0.0.128:11434",
            "models": ["m1"],
            "warning": "⚠️ Ollama is bound to 0.0.0.0 — API is exposed on LAN without authentication.",
            "examples": {
                "curl": "curl -X POST http://10.0.0.128:11434/api/generate -d '{\"model\": \"llama3.2\", \"prompt\": \"Hello\", \"stream\": false}'",
                "python": "import requests\nrequests.post(\"http://10.0.0.128:11434/api/generate\", json={\"model\": \"llama3.2\", \"prompt\": \"Hello\", \"stream\": False})",
            },
        }

    async def update_all(self):
        self.calls.append(("update_all",))
        return {
            "ok": True,
            "ollama": {"before": "A", "after": "B", "ok": True, "error": ""},
            "models": [],
            "service_active": True,
        }

    async def _pull(self, model):
        self.calls.append(("_pull", model))
        return {"model": model, "ok": True, "detail": "success"}


class BrokenPlugin(FakePlugin):
    async def set_service(self, on):
        return {"ok": False, "error": "systemctl start falhou"}


def test_parser_requires_command():
    with pytest.raises(SystemExit):
        cli.build_parser().parse_args([])


@pytest.mark.parametrize("cmd", ["on", "start", "off", "stop", "status", "enable",
                                 "disable", "update"])
def test_parser_accepts_simple_commands(cmd):
    ns = cli.build_parser().parse_args([cmd])
    assert ns.command in (cmd, {"start": "on", "stop": "off"}.get(cmd, cmd))


def test_parser_awake_accepts_action():
    assert cli.build_parser().parse_args(["awake", "on"]).action == "on"
    assert cli.build_parser().parse_args(["awake"]).action is None


def test_parser_pull_requires_model():
    assert cli.build_parser().parse_args(["pull", "llama3"]).model == "llama3"
    with pytest.raises(SystemExit):
        cli.build_parser().parse_args(["pull"])


def test_dispatch_on_off(capsys):
    import asyncio
    p = FakePlugin()
    assert asyncio.run(cli.dispatch(cli.build_parser().parse_args(["on"]), p)) == 0
    assert asyncio.run(cli.dispatch(cli.build_parser().parse_args(["off"]), p)) == 0
    assert p.calls == [("set_service", True), ("set_service", False)]


def test_dispatch_status_json(capsys):
    import asyncio
    p = FakePlugin()
    rc = asyncio.run(cli.dispatch(cli.build_parser().parse_args(["status", "--json"]), p))
    assert rc == 0
    import json as _json
    out = _json.loads(capsys.readouterr().out)
    assert out["service_active"] is True


def test_dispatch_awake_toggle(capsys):
    import asyncio
    p = FakePlugin()
    assert asyncio.run(cli.dispatch(cli.build_parser().parse_args(["awake"]), p)) == 0
    assert ("set_keep_awake", True) in p.calls  # status.keep_awake=False -> on


def test_dispatch_enable_disable(capsys):
    import asyncio
    p = FakePlugin()
    asyncio.run(cli.dispatch(cli.build_parser().parse_args(["disable"]), p))
    assert ("set_autostart", False) in p.calls


def test_dispatch_update_pull(capsys):
    import asyncio
    p = FakePlugin()
    assert asyncio.run(cli.dispatch(cli.build_parser().parse_args(["update"]), p)) == 0
    assert asyncio.run(cli.dispatch(cli.build_parser().parse_args(["pull", "qwen"]), p)) == 0
    assert ("_pull", "qwen") in p.calls


def test_dispatch_failure_returns_1(capsys):
    import asyncio
    p = BrokenPlugin()
    assert asyncio.run(cli.dispatch(cli.build_parser().parse_args(["on"]), p)) == 1


def test_format_status_human():
    s = {
        "service_active": True,
        "autostart": False,
        "keep_awake": True,
        "keep_awake_locked": True,
        "version": "0.34.1",
        "api_reachable": True,
        "models": [],
        "api_url": "http://10.0.0.128:11434 (LAN)",
        "error": "",
    }
    text = cli._format_status(s, as_json=False)
    assert "0.34.1" in text
    assert "suspensão bloqueada" in text
    assert "LAN" in text


def test_settings_dir_default_points_to_decky(monkeypatch):
    monkeypatch.delenv("DECKY_PLUGIN_SETTINGS_DIR", raising=False)
    monkeypatch.setattr("os.path.expanduser", lambda p: "/home/deck" + p[1:])
    assert cli.default_settings_dir() == "/home/deck/homebrew/settings/Ollama Deck"


def test_main_refuses_root(monkeypatch):
    monkeypatch.setattr("os.geteuid", lambda: 0)
    assert cli.main(["on"]) == 2


def test_dispatch_chat(capsys):
    import asyncio
    p = FakePlugin()
    rc = asyncio.run(cli.dispatch(cli.build_parser().parse_args(["chat", "hello world"]), p))
    assert rc == 0
    assert ("chat", "m1", "hello world") in p.calls
    out = capsys.readouterr().out
    assert "Hello from Ollama!" in out


def test_dispatch_chat_with_model(capsys):
    import asyncio
    p = FakePlugin()
    rc = asyncio.run(cli.dispatch(cli.build_parser().parse_args(["chat", "hello", "--model", "llama3.2"]), p))
    assert rc == 0
    assert ("chat", "llama3.2", "hello") in p.calls


def test_dispatch_chat_failure(capsys):
    import asyncio

    class FailingPlugin(FakePlugin):
        async def chat(self, model, prompt):
            return {"ok": False, "error": "model not found"}

    p = FailingPlugin()
    rc = asyncio.run(cli.dispatch(cli.build_parser().parse_args(["chat", "hello"]), p))
    assert rc == 1
    err = capsys.readouterr().err
    assert "model not found" in err


def test_dispatch_lan_info(capsys):
    import asyncio
    p = FakePlugin()
    rc = asyncio.run(cli.dispatch(cli.build_parser().parse_args(["lan-info"]), p))
    assert rc == 0
    assert ("lan_info",) in p.calls
    out = capsys.readouterr().out
    assert "http://10.0.0.128:11434" in out
    assert "curl" in out
    assert "python" in out


def test_dispatch_lan_info_json(capsys):
    import asyncio
    p = FakePlugin()
    rc = asyncio.run(cli.dispatch(cli.build_parser().parse_args(["lan-info", "--json"]), p))
    assert rc == 0
    import json as _json
    out = _json.loads(capsys.readouterr().out)
    assert out["base_url"] == "http://10.0.0.128:11434"
    assert out["port"] == 11434