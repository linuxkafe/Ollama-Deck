import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main  # noqa: E402


def test_user_env_runtime_dir():
    env = main._user_env()
    assert env["XDG_RUNTIME_DIR"].startswith("/run/user/")


def test_user_env_bus_socket():
    env = main._user_env()
    assert env["DBUS_SESSION_BUS_ADDRESS"].endswith("/bus")


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