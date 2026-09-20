# Ollama-Deck

[Decky Loader](https://decky.xyz) plugin to serve and control **Ollama** on the
Steam Deck with GPU (Vulkan/RADV).

## Features

- **On-demand Ollama service** (`ollama.service` user unit).
- **Keep Deck Awake** — prevents Steam Deck suspend during inference or remote
  access via `systemd-inhibit`, auto-released when service stops.
- **Start with Steam Deck** — toggles service auto-start with user session.
- **Status panel** — service state, Ollama version, API URL (incl. LAN IP for
  remote access), reachability, and installed models list (name/size/family).
- **LAN exposure toggle** — switch bind address between `0.0.0.0` (LAN) and
  `127.0.0.1` (local only) with live service restart.
- **Chat with Ollama** — send prompts and receive responses directly in the
  Decky overlay (Gaming Mode), with model selector, session history, and
  full-screen modal.
- **Web Search RAG** — enable web search (DuckDuckGo) as default RAG source
  for chat; results are embedded as context.
- **Persona configuration** — define name, system prompt, temperature, max
  tokens, and model; applied to all chats.
- **LAN connection info** — shows address, port, and usage examples (curl,
  Python, JavaScript) for connecting from other devices on the network.
- **Update Ollama & models** — updates the Ollama binary (official tarball,
  no sudo) and pulls installed models, all from the plugin.
- **Model Library** — search and install models from the Ollama library with
  tag filters (chat, code, embedding, vision, tools).
- **RAG configuration** — documents directory and embedding model management.
- **Internationalization** — English (default) and Portuguese (auto when
  system locale is `pt-*`).
- **CLI** — `ollama-deck` command for SSH/headless control sharing the same
  backend and settings.

In normal operation the plugin runs **without root privileges** and **does not
modify** an existing Ollama installation or its pre-existing unit file.
Updates are always explicit (button in the plugin).

## Requirements

- Steam Deck with Decky Loader installed.
- Ollama at `/home/deck/.local/share/ollama-bin/` (the installer below installs
  it automatically if missing). On first run, if `ollama.service` does not
  exist, the plugin creates it from a default template (Vulkan +
  `OLLAMA_HOST=0.0.0.0`).

## Installation

### Quick (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/linuxkafe/Ollama-Deck/main/install.sh | sh
```

The installer downloads the plugin from `main`, installs it to
`/home/deck/homebrew/plugins/ollama-deck` (sudo only for that directory),
installs Ollama if absent, and restarts `plugin_loader`. To force a specific
branch: `OLLAMA_DECK_BRANCH=v1.0.0 curl -fsSL ... | sh`.

### Manual

```bash
# on dev machine
make build
scp -r . deck@<DECK_IP>:/tmp/ollama-deck

# on Steam Deck (deck user)
sudo rm -rf /home/deck/homebrew/plugins/ollama-deck
sudo cp -r /tmp/ollama-deck /home/deck/homebrew/plugins/ollama-deck
```

Then reload Decky (Settings > Reload) or `sudo systemctl restart plugin_loader`.

### Updates

- **Plugin**: re-run the quick installer (`curl | sh`); previous backup(s)
  remain at `ollama-deck.bak.<timestamp>`.
- **Ollama + models**: in the plugin, **Updates** section, button
  *Update Ollama & models* — stops service, downloads and extracts the official
  tarball to `~/.local/share/ollama-bin`, restarts, and runs `ollama pull` for
  each installed model (plus extra tags from `model_tags` in settings).

## Usage

1. Open Decky (`…` button / Quick Access > plugin).
2. In **Ollama Deck**:
   - enable **Ollama Service** to start the server;
   - enable **Keep Deck Awake** to prevent suspend during work;
   - enable **Expose on LAN** to allow LAN connections (binds to `0.0.0.0`);
   - (optional) enable **Start with Steam Deck** for session auto-start.
3. Panel shows version, API URL, and installed models.
4. **Chat**: click **Open Chat** for full-screen modal with model selector,
   web search toggle, and session history.
5. **Persona**: configure name, system prompt, temperature, max tokens, model;
   applies to all chats.
6. **Model Library**: search/install models with tag filters.

## CLI (SSH)

The installer places `ollama-deck` in `~/.local/bin/` (same backend as the
plugin — shares settings and keep-awake with the UI):

```bash
# if ~/.local/bin not in PATH:
export PATH="$HOME/.local/bin:$PATH"

ollama-deck on            # start Ollama service
ollama-deck off           # stop service
ollama-deck status        # current state (human)
ollama-deck status --json # state as JSON (for scripts)
ollama-deck enable        # auto-start with session
ollama-deck disable       # no auto-start
ollama-deck awake         # toggle keep-deck-awake
ollama-deck awake on      # block suspend (when service active)
ollama-deck awake off     # release block
ollama-deck update        # update Ollama + installed models
ollama-deck pull <model>  # pull/update a model
ollama-deck rm <model>    # remove an installed model
ollama-deck chat <prompt> # send prompt to Ollama (requires active service)
ollama-deck lan-info      # show LAN connection info
ollama-deck lan-info --json # LAN info as JSON
```

Exit codes: `0` success, `1` runtime error, `2` usage error. Must run as user
`deck` (not root). `awake on` only blocks suspend while service is active; if
enabled with service stopped, it registers and blocks when service starts.

**Chat via CLI:**
```bash
ollama-deck chat "Explain quantum computing"
ollama-deck chat "Write hello world in Rust" --model llama3.2
```

**LAN info via CLI:**
```bash
ollama-deck lan-info
# Base URL: http://10.0.0.128:11434
# Port: 11434
# Models: llama3.2, mistral:7b
#
# Examples:
#   [curl] curl -X POST http://10.0.0.128:11434/api/generate ...
#   [python] import requests ...
```

Remote API (when `OLLAMA_HOST=0.0.0.0`): any LAN client can use
`http://<DECK_IP>:11434`.

> Security notice: with `OLLAMA_HOST=0.0.0.0` the API is exposed on LAN without
> authentication. For local-only use, set `OLLAMA_HOST=127.0.0.1` in the unit.

## Development

```bash
make setup    # npm install
make check    # typecheck (tsc), py_compile, pytest, rollup build
make deploy   # scp to Deck (prints final sudo commands)
```

Smoke test the backend on Deck (without Decky, restores original state):

```bash
python3 scripts/smoke_test.py
```

## Structure

```
main.py            backend (systemctl, systemd-inhibit, update, API, settings)
src/index.tsx      frontend React (@decky/ui)
src/i18n.ts        i18n module (EN/PT, auto-detect)
plugin.json        Decky metadata
install.sh         curl | sh installer
cli.py             CLI (ollama-deck on|off|status|...) — shared backend
dist/index.js      compiled bundle (committed — Decky loads from here)
scripts/smoke_test.py   integration test on Deck
tests/             offline unit tests (main + cli)
docs/              VISION, REQUIREMENTS, ROADMAP, DESIGN, CHECKLIST
aes/               Ambrósio Engineering System project tracking
```

## License

MIT — see [LICENSE](LICENSE).