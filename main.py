import asyncio
import json
import os
import re
import shlex
import subprocess
import urllib.request
from typing import Any, Optional

try:
    import decky
except ImportError:
    decky = None  # type: ignore[assignment]

SERVICE = "ollama"
AWAKE_UNIT = "ollama-deck-awake"
INHIBIT_WHO = "Ollama-Deck"
INHIBIT_REASON = "Serving Ollama requests on Ollama-Deck"
INHIBIT_WHAT = "sleep:idle"
API_BASE = "http://127.0.0.1:11434"
LAN_BIN = "/home/deck/.local/share/ollama-bin/bin/ollama"
OLLAMA_ROOT = os.path.dirname(os.path.dirname(LAN_BIN))
UNIT_PATH = os.path.expanduser("~/.config/systemd/user/ollama.service")
OLLAMA_ARCH = {
    "x86_64": "amd64",
    "aarch64": "arm64",
    "armv7l": "arm64",
    "arm64": "arm64",
}.get(os.uname().machine or "")

UNIT_TEMPLATE = """[Unit]
Description=Ollama Service (Vulkan RADV no Steam Deck)
After=network.target

[Service]
Type=exec
Environment="LD_LIBRARY_PATH=/home/deck/.local/share/ollama-bin/lib/ollama"
Environment="OLLAMA_VULKAN=1"
Environment="OLLAMA_HOST=0.0.0.0"
Environment="VULKAN_DEVICE_INDEX=0"
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/bin:/home/deck/.local/share/ollama-bin/bin"

WorkingDirectory=/home/deck/.local/share/ollama-bin/bin
ExecStart=/home/deck/.local/share/ollama-bin/bin/ollama serve

Restart=always
RestartSec=3

[Install]
WantedBy=default.target
"""


def log(msg: str) -> None:
    if decky is not None:
        decky.logger.info(msg)


def settings_dir() -> str:
    if decky is not None:
        return decky.DECKY_PLUGIN_SETTINGS_DIR
    return os.environ.get("DECKY_PLUGIN_SETTINGS_DIR", "/tmp/ollama-deck-settings")


def _user_env() -> dict:
    env = os.environ.copy()
    original_library_path = env.get("LD_LIBRARY_PATH_ORIG")
    if original_library_path:
        env["LD_LIBRARY_PATH"] = original_library_path
    else:
        env.pop("LD_LIBRARY_PATH", None)
    uid = str(os.getuid())
    env.setdefault("XDG_RUNTIME_DIR", f"/run/user/{uid}")
    env.setdefault("DBUS_SESSION_BUS_ADDRESS", f"unix:path=/run/user/{uid}/bus")
    return env


def ollama_bin_env() -> dict:
    """Environment to run the ollama CLI/binary from its user-space install."""
    env = os.environ.copy()
    lib = os.path.join(OLLAMA_ROOT, "lib", "ollama")
    existing = env.get("LD_LIBRARY_PATH")
    env["LD_LIBRARY_PATH"] = lib + (os.pathsep + existing if existing else "")
    env["PATH"] = (
        os.path.join(OLLAMA_ROOT, "bin")
        + os.pathsep
        + env.get("PATH", "/usr/bin:/bin")
    )
    return env


async def update_ollama_bin() -> tuple[bool, str]:
    """Download the official ollama tarball and extract it over the user-space
    install root (no sudo, matches the existing ~/.local/share/ollama-bin)."""
    if not OLLAMA_ARCH:
        return False, "arquitetura não suportada"
    url = f"https://ollama.com/download/ollama-linux-{OLLAMA_ARCH}.tar.zst"
    os.makedirs(OLLAMA_ROOT, exist_ok=True)
    target = shlex.quote(OLLAMA_ROOT)
    for extractor in (f"tar --zstd -C {target} -xf -", f"unzstd | tar -C {target} -xf -"):
        proc = await asyncio.create_subprocess_shell(
            f"curl -fsSL {shlex.quote(url)} | {extractor}",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        out, err = await proc.communicate()
        if proc.returncode == 0:
            return True, ""
        last_err = err.decode(errors="replace").strip()
        if extractor.startswith("unzstd"):
            break
    return False, last_err or "download/extração falhou"


def format_size(size: int) -> str:
    units = ("B", "KB", "MB", "GB", "TB")
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}" if unit != "B" else f"{value:.0f} B"
        value /= 1024
    return f"{value:.1f} TB"


def _fault(msg: str) -> dict:
    return {"ok": False, "error": msg}


def read_host() -> str:
    try:
        with open(UNIT_PATH, "r", encoding="utf-8") as fh:
            text = fh.read()
        match = re.search(r"OLLAMA_HOST=(\S+)", text)
        host = match.group(1).strip().strip('"') if match else "127.0.0.1"
    except OSError:
        host = "127.0.0.1"
    return host


def lan_ip() -> str:
    candidates = (
        ["ip", "-4", "-o", "addr", "show", "scope", "global"],
        ["hostname", "-I"],
    )
    for cmd in candidates:
        try:
            out = subprocess.run(
                cmd, capture_output=True, text=True, timeout=2
            ).stdout
            parts = re.findall(r"(\d{1,3}(?:\.\d{1,3}){3})", out)
            if parts:
                return parts[0]
        except (OSError, ValueError):
            continue
    return ""


def install_unit() -> bool:
    if not os.path.exists(LAN_BIN):
        log("Ollama binary missing; not creating service unit")
        return False
    if os.path.exists(UNIT_PATH):
        return True
    unit_dir = os.path.dirname(UNIT_PATH)
    os.makedirs(unit_dir, exist_ok=True)
    with open(UNIT_PATH, "w", encoding="utf-8") as fh:
        fh.write(UNIT_TEMPLATE)
    subprocess.run(
        ["systemctl", "--user", "daemon-reload"], env=_user_env(), check=True
    )
    log("Created ollama.service user unit from template")
    return True


class Settings:
    def __init__(self) -> None:
        self.path = os.path.join(settings_dir(), "settings.json")
        self.data: dict = {}

    def load(self) -> None:
        try:
            with open(self.path, "r", encoding="utf-8") as fh:
                self.data = json.load(fh) or {}
        except (OSError, ValueError):
            self.data = {}

    def save(self) -> None:
        os.makedirs(settings_dir(), exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as fh:
            json.dump(self.data, fh, indent=2)

    def get(self, key: str, default: Any = None) -> Any:
        return self.data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self.data[key] = value
        self.save()


class Systemctl:
    @staticmethod
    async def run(*args: str) -> tuple[int, str, str]:
        proc = await asyncio.create_subprocess_exec(
            "systemctl",
            "--user",
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=_user_env(),
        )
        out, err = await proc.communicate()
        return proc.returncode or 0, out.decode(), err.decode()

    @staticmethod
    async def is_active() -> bool:
        rc, out, _ = await Systemctl.run("is-active", SERVICE)
        return rc == 0 and out.strip() == "active"

    @staticmethod
    async def is_enabled() -> bool:
        rc, out, _ = await Systemctl.run("is-enabled", SERVICE)
        return rc == 0 and out.strip() == "enabled"


class OllamaApi:
    @staticmethod
    def call(path: str) -> Optional[dict]:
        try:
            with urllib.request.urlopen(API_BASE + path, timeout=2) as resp:
                return json.loads(resp.read().decode())
        except (OSError, ValueError):
            return None

    @staticmethod
    def generate(model: str, prompt: str, stream: bool = False) -> Optional[dict]:
        payload = json.dumps({"model": model, "prompt": prompt, "stream": stream}).encode()
        req = urllib.request.Request(
            API_BASE + "/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                if stream:
                    return resp
                return json.loads(resp.read().decode())
        except (OSError, ValueError) as e:
            log(f"Ollama generate failed: {e}")
            return None

    @staticmethod
    def chat(model: str, prompt: str) -> Optional[str]:
        data = OllamaApi.generate(model, prompt, stream=False)
        if data is None:
            return None
        return str(data.get("response", ""))

    @staticmethod
    def version() -> Optional[str]:
        data = OllamaApi.call("/api/version")
        if data is None:
            return None
        return str(data.get("version", ""))

    @staticmethod
    def models() -> list:
        data = OllamaApi.call("/api/tags")
        if data is None:
            return []
        out = []
        for model in data.get("models", []):
            details = model.get("details", {}) or {}
            out.append(
                {
                    "name": model.get("name", "?"),
                    "size": model.get("size", 0),
                    "family": details.get("family") or "",
                    "quant": details.get("quantization_level") or "",
                }
            )
        out.sort(key=lambda m: m["size"])
        return out


class Inhibitor:
    """Holds a block sleep:idle inhibitor via a transient user service unit.

    Using `systemd-run --user` puts the inhibitor child under the deck user
    manager (empirically allowed for uid 1000 even without a logind seat
    session), and gives us a stable unit name to start/stop and inspect.
    Transient units do not survive a reboot -- keep-awake resets cleanly.
    """

    @staticmethod
    async def active() -> bool:
        rc, _, _ = await Systemctl.run("is-active", AWAKE_UNIT)
        return rc == 0

    @staticmethod
    async def start() -> bool:
        if await Inhibitor.active():
            return True
        await Systemctl.run("reset-failed", AWAKE_UNIT)
        cmd = [
            "systemd-run",
            "--user",
            f"--unit={AWAKE_UNIT}",
            "--collect",
            "systemd-inhibit",
            f"--what={INHIBIT_WHAT}",
            f"--who={INHIBIT_WHO}",
            f"--why={INHIBIT_REASON}",
            "--mode=block",
            "sleep",
            "infinity",
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=_user_env(),
        )
        _, err = await proc.communicate()
        if proc.returncode != 0:
            log(f"Keep-awake failed: {err.strip()}")
            return False
        return await Inhibitor.active()

    @staticmethod
    async def stop() -> None:
        await Systemctl.run("stop", AWAKE_UNIT)
        await Systemctl.run("reset-failed", AWAKE_UNIT)


class Plugin:
    async def _main(self) -> None:
        self.settings = Settings()
        self.settings.load()
        install_unit()
        await self._sync()
        log("Ollama-Deck backend ready")

    async def _unload(self) -> None:
        await Inhibitor.stop()

    async def _uninstall(self) -> None:
        await Inhibitor.stop()

    async def _sync(self) -> None:
        active = await Systemctl.is_active()
        want = active and bool(self.settings.get("keep_awake", False))
        if want and not await Inhibitor.active():
            await Inhibitor.start()
        elif not want and await Inhibitor.active():
            await Inhibitor.stop()

    async def get_status(self) -> dict:
        await self._sync()
        host = read_host()
        ip = lan_ip()
        if host in ("0.0.0.0", ""):
            if ip:
                api_url = f"http://{ip}:11434 (LAN)"
            else:
                api_url = "http://127.0.0.1:11434"
        else:
            api_url = f"http://{host}:11434"
        data = OllamaApi.call("/api/tags")
        return {
            "service_active": await Systemctl.is_active(),
            "autostart": await Systemctl.is_enabled(),
            "keep_awake": bool(self.settings.get("keep_awake", False)),
            "keep_awake_locked": await Inhibitor.active(),
            "version": OllamaApi.version(),
            "api_reachable": data is not None,
            "models": OllamaApi.models() if data is not None else [],
            "api_url": api_url,
            "error": "",
        }

    async def set_service(self, on: bool) -> dict:
        op = "start" if on else "stop"
        rc, _, err = await Systemctl.run(op, SERVICE)
        if rc != 0:
            log(f"systemctl {op} {SERVICE} failed: {err.strip()}")
            return _fault(f"systemctl {op} falhou: {err.strip()}")
        await self._sync()
        return {"ok": True, "service_active": await Systemctl.is_active()}

    async def set_autostart(self, on: bool) -> dict:
        op = "enable" if on else "disable"
        rc, _, err = await Systemctl.run(op, SERVICE)
        if rc != 0:
            log(f"systemctl {op} {SERVICE} failed: {err.strip()}")
            return _fault(f"systemctl {op} falhou: {err.strip()}")
        return {"ok": True, "autostart": on}

    async def set_keep_awake(self, on: bool) -> dict:
        self.settings.set("keep_awake", bool(on))
        await self._sync()
        return {
            "ok": True,
            "keep_awake": bool(on),
            "keep_awake_locked": await Inhibitor.active(),
        }

    async def _pull(self, tag: str) -> dict:
        proc = await asyncio.create_subprocess_exec(
            LAN_BIN,
            "pull",
            tag,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env=ollama_bin_env(),
        )
        out, _ = await proc.communicate()
        tail = out.decode(errors="replace").strip().splitlines()
        detail = (tail[-1] if tail else "").strip()
        return {
            "model": tag,
            "ok": proc.returncode == 0 and not any(
                s in detail.lower() for s in ("error", "failed", "not found")
            ),
            "detail": detail[:200],
        }

    async def _delete(self, tag: str) -> dict:
        proc = await asyncio.create_subprocess_exec(
            LAN_BIN,
            "rm",
            tag,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env=ollama_bin_env(),
        )
        out, _ = await proc.communicate()
        detail = out.decode(errors="replace").strip()
        return {
            "model": tag,
            "ok": proc.returncode == 0,
            "detail": detail[:200] if detail else "Modelo removido",
        }

    async def pull_model(self, tag: str) -> dict:
        return await self._pull(tag)

    async def delete_model(self, tag: str) -> dict:
        return await self._delete(tag)

    async def chat(self, model: str, prompt: str) -> dict:
        if not await Systemctl.is_active():
            return _fault("Ollama service is not running")
        models = OllamaApi.models()
        model_names = [m["name"] for m in models]
        if model not in model_names:
            return _fault(f"Model '{model}' not found. Available: {', '.join(model_names) or 'none'}")
        response = OllamaApi.chat(model, prompt)
        if response is None:
            return _fault("Failed to get response from Ollama")
        return {"ok": True, "response": response, "model": model}

    async def lan_info(self) -> dict:
        host = read_host()
        ip = lan_ip()
        if host in ("0.0.0.0", ""):
            bind_addr = ip if ip else "127.0.0.1"
        else:
            bind_addr = host
        port = 11434
        base_url = f"http://{bind_addr}:{port}"
        examples = {
            "curl": f'curl -X POST {base_url}/api/generate -d \'{{"model": "llama3.2", "prompt": "Hello", "stream": false}}\'',
            "python": f'import requests\nrequests.post("{base_url}/api/generate", json={{"model": "llama3.2", "prompt": "Hello", "stream": False}})',
            "javascript": f'fetch("{base_url}/api/generate", {{method: "POST", headers: {{"Content-Type": "application/json"}}, body: JSON.stringify({{model: "llama3.2", prompt: "Hello", stream: false}})}})',
        }
        warning = ""
        if bind_addr != "127.0.0.1":
            warning = "⚠️ Ollama is bound to 0.0.0.0 — API is exposed on LAN without authentication."
        return {
            "ok": True,
            "bind_address": bind_addr,
            "port": port,
            "base_url": base_url,
            "examples": examples,
            "warning": warning,
            "models": [m["name"] for m in OllamaApi.models()],
        }

    async def update_all(self) -> dict:
        """Update the ollama binary, then pull the installed/config models."""
        was_active = await Systemctl.is_active()
        version_before = OllamaApi.version()
        tags = [m["name"] for m in OllamaApi.models()]
        for extra in self.settings.get("model_tags", []) or []:
            if extra not in tags:
                tags.append(extra)
        await Systemctl.run("stop", SERVICE)
        bin_ok, bin_err = await update_ollama_bin()
        await Systemctl.run("start", SERVICE)
        await self._sync()
        version_after = OllamaApi.version()
        results = [await self._pull(tag) for tag in tags]
        failed_models = [r["model"] for r in results if not r["ok"]]
        ok = bin_ok and not failed_models
        return {
            "ok": ok,
            "service_active": await Systemctl.is_active(),
            "was_active": was_active,
            "ollama": {
                "ok": bin_ok,
                "before": version_before,
                "after": version_after,
                "error": bin_err,
            },
            "models": results,
            "error": (
                ""
                if ok
                else "falhas em: " + ", ".join(failed_models)
                + ("" if bin_ok else " e update do binário")
            ),
        }