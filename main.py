import asyncio
import json
import os
import re
import shlex
import subprocess
import urllib.request
import urllib.parse
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

MODEL_LIBRARY = [
    {"name": "llama3.2", "tags": ["chat"], "sizes": ["1b", "3b"], "description": "Meta's Llama 3.2 - fast, efficient"},
    {"name": "llama3.1", "tags": ["chat"], "sizes": ["8b", "70b"], "description": "Meta's Llama 3.1 - strong general purpose"},
    {"name": "mistral", "tags": ["chat"], "sizes": ["7b"], "description": "Mistral 7B - excellent quality/size ratio"},
    {"name": "mistral-nemo", "tags": ["chat"], "sizes": ["12b"], "description": "Mistral NeMo 12B - multilingual"},
    {"name": "gemma2", "tags": ["chat"], "sizes": ["2b", "9b", "27b"], "description": "Google Gemma 2 - open weights"},
    {"name": "qwen2.5", "tags": ["chat"], "sizes": ["0.5b", "1.5b", "3b", "7b", "14b", "32b", "72b"], "description": "Alibaba Qwen 2.5 - strong multilingual"},
    {"name": "phi3.5", "tags": ["chat"], "sizes": ["3.8b"], "description": "Microsoft Phi-3.5 - small but capable"},
    {"name": "codellama", "tags": ["code"], "sizes": ["7b", "13b", "34b"], "description": "Meta Code Llama - code generation"},
    {"name": "qwen2.5-coder", "tags": ["code"], "sizes": ["0.5b", "1.5b", "3b", "7b", "14b", "32b"], "description": "Qwen 2.5 Coder - strong code model"},
    {"name": "deepseek-coder-v2", "tags": ["code"], "sizes": ["16b", "236b"], "description": "DeepSeek Coder V2 - advanced coding"},
    {"name": "starcoder2", "tags": ["code"], "sizes": ["3b", "7b", "15b"], "description": "StarCoder2 - code completion"},
    {"name": "embeddinggemma", "tags": ["embedding"], "sizes": ["300m"], "description": "Google EmbeddingGemma - recommended for RAG"},
    {"name": "qwen3-embedding", "tags": ["embedding"], "sizes": ["4b", "8b"], "description": "Qwen3 Embedding - multilingual embeddings"},
    {"name": "all-minilm", "tags": ["embedding"], "sizes": ["22m"], "description": "All-MiniLM - tiny, fast embeddings"},
    {"name": "mxbai-embed-large", "tags": ["embedding"], "sizes": ["335m"], "description": "Mixedbread AI Embed Large - high quality"},
    {"name": "nomic-embed-text", "tags": ["embedding"], "sizes": ["137m"], "description": "Nomic Embed Text - popular for RAG"},
    {"name": "snowflake-arctic-embed", "tags": ["embedding"], "sizes": ["22m", "110m", "335m"], "description": "Snowflake Arctic Embed - efficient"},
    {"name": "llava", "tags": ["vision"], "sizes": ["7b", "13b", "34b"], "description": "LLaVA - vision + language"},
    {"name": "llava-phi3", "tags": ["vision"], "sizes": ["3.8b"], "description": "LLaVA-Phi3 - small vision model"},
    {"name": "bakllava", "tags": ["vision"], "sizes": ["7b"], "description": "BakLLaVA - Mistral-based vision"},
    {"name": "moondream", "tags": ["vision"], "sizes": ["2b"], "description": "Moondream - tiny vision model"},
    {"name": "nemotron3-ultra", "tags": ["chat", "tools"], "sizes": ["53b"], "description": "NVIDIA Nemotron 3 Ultra - tool calling"},
    {"name": "command-r", "tags": ["chat", "tools"], "sizes": ["35b"], "description": "Cohere Command R - RAG optimized"},
    {"name": "command-r-plus", "tags": ["chat", "tools"], "sizes": ["104b"], "description": "Cohere Command R+ - advanced RAG"},
    {"name": "aya-expanse", "tags": ["chat"], "sizes": ["8b", "32b"], "description": "Cohere Aya Expanse - 23 languages"},
    {"name": "granite3.1-dense", "tags": ["chat"], "sizes": ["2b", "8b"], "description": "IBM Granite 3.1 - enterprise focused"},
    {"name": "olmo2", "tags": ["chat"], "sizes": ["7b", "13b"], "description": "AllenAI OLMo 2 - fully open"},
    {"name": "dolphin3", "tags": ["chat"], "sizes": ["8b", "70b"], "description": "Dolphin 3 - uncensored chat"},
    {"name": "openhermes", "tags": ["chat"], "sizes": ["7b", "13b"], "description": "OpenHermes - Hermes fine-tune"},
    {"name": "zephyr", "tags": ["chat"], "sizes": ["7b"], "description": "Zephyr - aligned chat model"},
    {"name": "yarn-llama2", "tags": ["chat"], "sizes": ["7b", "13b"], "description": "YaRN Llama2 - extended context"},
    {"name": "stable-beluga", "tags": ["chat"], "sizes": ["7b", "13b", "70b"], "description": "Stable Beluga - Orca-style training"},
    {"name": "wizardlm2", "tags": ["chat"], "sizes": ["7b", "8x22b"], "description": "WizardLM 2 - Microsoft evolved"},
    {"name": "solar", "tags": ["chat"], "sizes": ["10.7b"], "description": "SOLAR - upstage LLM"},
    {"name": "openchat", "tags": ["chat"], "sizes": ["7b", "8x7b"], "description": "OpenChat - open source chat"},
    {"name": "neural-chat", "tags": ["chat"], "sizes": ["7b"], "description": "Intel Neural Chat - fine-tuned Mistral"},
    {"name": "orca-mini", "tags": ["chat"], "sizes": ["3b", "7b", "13b"], "description": "Orca Mini - small efficient"},
    {"name": "falcon", "tags": ["chat"], "sizes": ["7b", "40b"], "description": "Falcon - TII UAE model"},
    {"name": "mpt", "tags": ["chat"], "sizes": ["7b", "30b"], "description": "MPT - MosaicML foundation"},
    {"name": "redpajama", "tags": ["chat"], "sizes": ["3b", "7b"], "description": "RedPajama - open reproduction"},
    {"name": "stablelm", "tags": ["chat"], "sizes": ["3b", "7b"], "description": "StableLM - Stability AI"},
    {"name": "xwinlm", "tags": ["chat"], "sizes": ["7b", "13b", "70b"], "description": "XWin-LM - aligned LLM"},
    {"name": "vicuna", "tags": ["chat"], "sizes": ["7b", "13b", "33b"], "description": "Vicuna - LLaMA fine-tune"},
    {"name": "alpaca", "tags": ["chat"], "sizes": ["7b"], "description": "Alpaca - Stanford instruction-tuned"},
    {"name": "orca2", "tags": ["chat"], "sizes": ["7b", "13b"], "description": "Orca 2 - Microsoft reasoning"},
    {"name": "wizardcoder", "tags": ["code"], "sizes": ["7b", "13b", "34b"], "description": "WizardCoder - code fine-tune"},
    {"name": "magicoder", "tags": ["code"], "sizes": ["7b"], "description": "Magicoder - code generation"},
    {"name": "stable-code", "tags": ["code"], "sizes": ["3b"], "description": "Stable Code - Stability AI"},
    {"name": "codegeex", "tags": ["code"], "sizes": ["6b"], "description": "CodeGeeX - multilingual code"},
]

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


DEFAULT_PERSONA = {
    "name": "Default",
    "system_prompt": "You are a helpful assistant.",
    "temperature": 0.7,
    "max_tokens": 2048,
    "model": "",
}


def _validate_persona(persona: dict) -> tuple[bool, str]:
    required = ("name", "system_prompt", "temperature", "max_tokens", "model")
    for field in required:
        if field not in persona:
            return False, f"Missing field: {field}"
    if not isinstance(persona["name"], str) or not persona["name"].strip():
        return False, "Name must be non-empty string"
    if not isinstance(persona["system_prompt"], str):
        return False, "System prompt must be string"
    try:
        temp = float(persona["temperature"])
        if not (0.0 <= temp <= 2.0):
            return False, "Temperature must be 0.0-2.0"
    except (ValueError, TypeError):
        return False, "Temperature must be a number"
    try:
        tokens = int(persona["max_tokens"])
        if not (1 <= tokens <= 8192):
            return False, "Max tokens must be 1-8192"
    except (ValueError, TypeError):
        return False, "Max tokens must be an integer"
    if not isinstance(persona["model"], str):
        return False, "Model must be string"
    return True, ""


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

    @staticmethod
    def web_search(query: str, max_results: int = 5) -> list[dict]:
        """Search the web using DuckDuckGo HTML scrape. Returns list of {title, url, snippet}."""
        try:
            url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"},
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode()
            results = []
            for match in re.finditer(r'class="result__title">\s*<a[^>]*href="([^"]*)"[^>]*>([^<]*)</a>.*?class="result__snippet">([^<]*)', html, re.DOTALL):
                link, title, snippet = match.groups()
                if link.startswith("//"):
                    link = "https:" + link
                results.append({"title": title.strip(), "url": link, "snippet": snippet.strip()[:300]})
                if len(results) >= max_results:
                    break
            return results
        except (OSError, ValueError, re.error) as e:
            log(f"Web search failed: {e}")
            return []


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

    def _filter_models(self, query: str = "", tags: list[str] | None = None) -> list[dict]:
        """Filter MODEL_LIBRARY by query string and/or tags."""
        tags = tags or []
        q = query.lower().strip()
        results = []
        for m in MODEL_LIBRARY:
            if q and q not in m["name"].lower() and q not in m["description"].lower():
                continue
            if tags and not any(t in m["tags"] for t in tags):
                continue
            results.append(m)
        return results

    async def search_models(self, query: str = "", tags: list[str] | None = None) -> dict:
        """Search the curated model library."""
        results = self._filter_models(query, tags)
        return {"ok": True, "models": results, "total": len(results)}

    def _get_installed_embedding_models(self) -> list[str]:
        """Return names of installed models that have 'embedding' tag."""
        installed = OllamaApi.models()
        installed_names = {m["name"] for m in installed}
        embedding_names = {m["name"] for m in MODEL_LIBRARY if "embedding" in m["tags"]}
        return sorted(installed_names & embedding_names)

    async def get_rag_config(self) -> dict:
        """Get current RAG configuration."""
        documents_dir = self.settings.get("rag_documents_dir", "")
        embedding_model = self.settings.get("rag_embedding_model", "")
        installed_embeddings = self._get_installed_embedding_models()
        recommended = None
        if not installed_embeddings:
            for m in MODEL_LIBRARY:
                if "embedding" in m["tags"]:
                    recommended = m["name"]
                    break
        return {
            "ok": True,
            "rag_documents_dir": documents_dir,
            "rag_embedding_model": embedding_model or None,
            "installed_embedding_models": installed_embeddings,
            "recommended_embedding_model": recommended,
        }

    async def set_rag_config(self, documents_dir: str | None = None, embedding_model: str | None = None) -> dict:
        """Set RAG configuration."""
        if documents_dir is not None:
            expanded = os.path.expanduser(documents_dir)
            os.makedirs(expanded, exist_ok=True)
            self.settings.set("rag_documents_dir", expanded)
        if embedding_model is not None:
            if embedding_model and embedding_model not in [m["name"] for m in MODEL_LIBRARY if "embedding" in m["tags"]]:
                return _fault(f"Model '{embedding_model}' is not a known embedding model")
            self.settings.set("rag_embedding_model", embedding_model)
        return await self.get_rag_config()

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

    async def set_network_exposure(self, expose: bool) -> dict:
        """Set OLLAMA_HOST to 0.0.0.0 (expose) or 127.0.0.1 (local only)."""
        host = "0.0.0.0" if expose else "127.0.0.1"
        try:
            with open(UNIT_PATH, "r", encoding="utf-8") as fh:
                text = fh.read()
            if "OLLAMA_HOST=" in text:
                text = re.sub(r"OLLAMA_HOST=\S+", f"OLLAMA_HOST={host}", text)
            else:
                text = text.replace(
                    'Environment="OLLAMA_VULKAN=1"',
                    f'Environment="OLLAMA_HOST={host}"\nEnvironment="OLLAMA_VULKAN=1"',
                )
            with open(UNIT_PATH, "w", encoding="utf-8") as fh:
                fh.write(text)
            await Systemctl.run("daemon-reload")
            was_active = await Systemctl.is_active()
            if was_active:
                await Systemctl.run("restart", SERVICE)
            await self._sync()
            return {"ok": True, "expose": expose, "bind_address": host}
        except OSError as e:
            return _fault(f"Failed to update unit file: {e}")

    def _get_persona(self) -> dict:
        persona = self.settings.get("persona")
        if persona:
            ok, _ = _validate_persona(persona)
            if ok:
                return persona
        return DEFAULT_PERSONA.copy()

    async def get_persona(self) -> dict:
        return {"ok": True, "persona": self._get_persona()}

    async def set_persona(self, persona: dict) -> dict:
        ok, err = _validate_persona(persona)
        if not ok:
            return _fault(f"Invalid persona: {err}")
        self.settings.set("persona", persona)
        return await self.get_persona()

    async def chat(self, model: str, prompt: str, use_web_search: bool = True, persona: dict | None = None) -> dict:
        if not await Systemctl.is_active():
            return _fault("Ollama service is not running")
        models = OllamaApi.models()
        model_names = [m["name"] for m in models]
        if model not in model_names:
            return _fault(f"Model '{model}' not found. Available: {', '.join(model_names) or 'none'}")
        
        active_persona = persona or self._get_persona()
        system_prompt = active_persona.get("system_prompt", "")
        temperature = active_persona.get("temperature", 0.7)
        max_tokens = active_persona.get("max_tokens", 2048)
        
        full_prompt = prompt
        if use_web_search:
            search_results = OllamaApi.web_search(prompt)
            if search_results:
                context = "\n\n".join([f"Source: {r['title']} ({r['url']})\n{r['snippet']}" for r in search_results])
                full_prompt = f"Web search results:\n{context}\n\nUser question: {prompt}"
        
        if system_prompt:
            full_prompt = f"System: {system_prompt}\n\n{full_prompt}"
        
        payload = json.dumps({
            "model": model,
            "prompt": full_prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens}
        }).encode()
        
        req = urllib.request.Request(
            API_BASE + "/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode())
            response = str(data.get("response", ""))
            return {"ok": True, "response": response, "model": model}
        except (OSError, ValueError) as e:
            log(f"Ollama chat failed: {e}")
            return _fault(f"Failed to get response from Ollama: {e}")

    async def list_plugins(self) -> dict:
        """List available plugins (placeholder for future marketplace)."""
        return {"ok": True, "plugins": []}

    async def download_persona(self, persona_id: str) -> dict:
        """Download a persona from registry (placeholder)."""
        return _fault("Persona download not yet implemented")