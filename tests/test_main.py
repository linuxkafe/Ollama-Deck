import sys
import os
import asyncio

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main  # noqa: E402


def test_user_env_runtime_dir():
    env = main._user_env()
    assert env["XDG_RUNTIME_DIR"].startswith("/run/user/")


def test_user_env_bus_socket():
    env = main._user_env()
    assert env["DBUS_SESSION_BUS_ADDRESS"].endswith("/bus")


@pytest.mark.parametrize("original", [None, "", "/usr/local/lib"])
def test_user_env_restores_system_libraries(monkeypatch, original):
    monkeypatch.setenv("LD_LIBRARY_PATH", "/tmp/_MEIdecky")
    if original is None:
        monkeypatch.delenv("LD_LIBRARY_PATH_ORIG", raising=False)
    else:
        monkeypatch.setenv("LD_LIBRARY_PATH_ORIG", original)
    env = main._user_env()
    if original:
        assert env["LD_LIBRARY_PATH"] == original
    else:
        assert "LD_LIBRARY_PATH" not in env
    assert os.environ["LD_LIBRARY_PATH"] == "/tmp/_MEIdecky"


def test_format_size_bytes():
    assert main.format_size(0) == "0 B"
    assert main.format_size(512) == "512 B"


def test_format_size_kb_gb():
    assert main.format_size(1024) == "1.0 KB"
    assert main.format_size(5 * 1024**3) == "5.0 GB"


def test_fault_dict():
    assert main._fault("boom") == {"ok": False, "error": "boom"}


def test_read_host_fallback():
    # UNIT_PATH does not exist in the test container -> fallback localhost
    assert main.read_host() in ("127.0.0.1", "0.0.0.0")


def test_install_unit_returns_false_without_binary():
    # LAN_BIN absent in this container
    assert main.install_unit() is False


def test_ollama_bin_env_ld_library_path():
    env = main.ollama_bin_env()
    assert main.OLLAMA_ROOT + "/lib/ollama" in env["LD_LIBRARY_PATH"]
    assert main.OLLAMA_ROOT + "/bin" in env["PATH"]


def test_ollama_arch_map():
    assert main.OLLAMA_ARCH in ("amd64", "arm64", None)


def test_update_unsupported_arch_returns_false(monkeypatch):
    import asyncio
    monkeypatch.setattr(main, "OLLAMA_ARCH", None)
    ok, err = asyncio.run(main.update_ollama_bin())
    assert not ok
    assert "arquitetura" in err


def test_pull_model_calls_pull(monkeypatch):
    import asyncio
    mock_proc = AsyncMock()
    mock_proc.communicate = AsyncMock(return_value=(b"pulling...\nsuccess", b""))
    mock_proc.returncode = 0
    mock_create = AsyncMock(return_value=mock_proc)
    monkeypatch.setattr(asyncio, "create_subprocess_exec", mock_create)

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.pull_model("test-model"))

    assert res["ok"] is True
    assert res["model"] == "test-model"
    mock_create.assert_called_once()


def test_pull_model_failure(monkeypatch):
    import asyncio
    mock_proc = AsyncMock()
    mock_proc.communicate = AsyncMock(return_value=(b"error: not found", b""))
    mock_proc.returncode = 1
    mock_create = AsyncMock(return_value=mock_proc)
    monkeypatch.setattr(asyncio, "create_subprocess_exec", mock_create)

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.pull_model("bad-model"))

    assert res["ok"] is False
    assert res["model"] == "bad-model"


def test_delete_model_calls_rm(monkeypatch):
    import asyncio
    mock_proc = AsyncMock()
    mock_proc.communicate = AsyncMock(return_value=(b"deleted", b""))
    mock_proc.returncode = 0
    mock_create = AsyncMock(return_value=mock_proc)
    monkeypatch.setattr(asyncio, "create_subprocess_exec", mock_create)

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.delete_model("test-model"))

    assert res["ok"] is True
    assert res["model"] == "test-model"
    mock_create.assert_called_once()


def test_delete_model_failure(monkeypatch):
    import asyncio
    mock_proc = AsyncMock()
    mock_proc.communicate = AsyncMock(return_value=(b"error: not found", b""))
    mock_proc.returncode = 1
    mock_create = AsyncMock(return_value=mock_proc)
    monkeypatch.setattr(asyncio, "create_subprocess_exec", mock_create)

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.delete_model("bad-model"))

    assert res["ok"] is False
    assert res["model"] == "bad-model"


def test_chat_service_inactive(monkeypatch):
    import asyncio
    mock_is_active = AsyncMock(return_value=False)
    monkeypatch.setattr(main.Systemctl, "is_active", mock_is_active)

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.chat("llama3.2", "hello"))

    assert res["ok"] is False
    assert "not running" in res["error"]


def test_chat_model_not_found(monkeypatch):
    import asyncio
    mock_is_active = AsyncMock(return_value=True)
    monkeypatch.setattr(main.Systemctl, "is_active", mock_is_active)
    monkeypatch.setattr(main.OllamaApi, "models", lambda: [{"name": "llama3.2", "size": 100, "family": "llama", "quant": ""}])

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.chat("mistral", "hello"))

    assert res["ok"] is False
    assert "not found" in res["error"]


def test_chat_success(monkeypatch):
    import asyncio
    from unittest.mock import AsyncMock, patch
    
    mock_is_active = AsyncMock(return_value=True)
    monkeypatch.setattr(main.Systemctl, "is_active", mock_is_active)
    monkeypatch.setattr(main.OllamaApi, "models", lambda: [{"name": "llama3.2", "size": 100, "family": "llama", "quant": ""}])
    monkeypatch.setattr(main.OllamaApi, "web_search", lambda q, max_results=5: [])

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}

    # Mock the urllib.request.urlopen to return a successful response
    import urllib.request
    original_urlopen = urllib.request.urlopen
    
    class MockResponse:
        def read(self):
            return b'{"response": "Hello there!"}'
        def decode(self):
            return '{"response": "Hello there!"}'
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
    
    def mock_urlopen(req, timeout=120):
        return MockResponse()
    
    monkeypatch.setattr(urllib.request, "urlopen", mock_urlopen)

    res = asyncio.run(plugin.chat("llama3.2", "hello"))

    assert res["ok"] is True
    assert res["response"] == "Hello there!"
    assert res["model"] == "llama3.2"


def test_lan_info_success(monkeypatch):
    import asyncio
    monkeypatch.setattr(main, "read_host", lambda: "0.0.0.0")
    monkeypatch.setattr(main, "lan_ip", lambda: "10.0.0.128")
    monkeypatch.setattr(main.OllamaApi, "models", lambda: [{"name": "llama3.2", "size": 100, "family": "llama", "quant": ""}])

    plugin = main.Plugin()
    plugin.settings = main.Settings()
    plugin.settings.data = {}
    res = asyncio.run(plugin.lan_info())

    assert res["ok"] is True
    assert res["bind_address"] == "10.0.0.128"
    assert res["port"] == 11434
    assert res["base_url"] == "http://10.0.0.128:11434"
    assert "curl" in res["examples"]
    assert "python" in res["examples"]
    assert "javascript" in res["examples"]
    assert "⚠️" in res["warning"]
    assert res["models"] == ["llama3.2"]