#!/bin/sh
# Ollama-Deck installer -- installs the Decky plugin from GitHub.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/linuxkafe/Ollama-Deck/main/install.sh | sh
#
# Options (env):
#   OLLAMA_DECK_BRANCH     git ref to install (default: main)
#   OLLAMA_DECK_PLUGIN_DIR override the Decky plugin directory
#   DECKY_INSTALL_OLLAMA   set to 0 to skip installing the Ollama runtime
#
# Requires: curl, tar, and write access (sudo) to the Decky plugins dir.

set -eu

REPO="linuxkafe/Ollama-Deck"
BRANCH="${OLLAMA_DECK_BRANCH:-main}"
PLUGIN_NAME="ollama-deck"
PLUGIN_VERSION="1.0.0"
OLLAMA_ROOT="${HOME:-/home/deck}/.local/share/ollama-bin"

say()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33mWARN\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31mERROR\033[0m %s\n' "$*" >&2; exit 1; }

if [ "${DECKY_INSTALL_OLLAMA:-1}" != "0" ] && [ ! -x "$OLLAMA_ROOT/bin/ollama" ]; then
  say "Ollama runtime not found, installing to $OLLAMA_ROOT ..."
  mkdir -p "$OLLAMA_ROOT"
  arch="$(uname -m)"
  case "$arch" in
    x86_64|amd64) oarch="amd64" ;;
    aarch64|arm64) oarch="arm64" ;;
    *) die "unsupported architecture: $arch" ;;
  esac
  curl -fsSL "https://ollama.com/download/ollama-linux-$oarch.tar.zst" \
    | tar --zstd -C "$OLLAMA_ROOT" -xf -
  say "Ollama installed. Add to PATH: export PATH=\"$OLLAMA_ROOT/bin:\$PATH\""
fi

plugins_dir="${OLLAMA_DECK_PLUGIN_DIR:-}"
if [ -z "$plugins_dir" ]; then
  if [ -d "${HOME}/homebrew/plugins" ]; then
    plugins_dir="${HOME}/homebrew/plugins"
  else
    candidates=""
    for h in /home/*/homebrew/plugins; do
      [ -d "$h" ] && candidates="$candidates $h"
    done
    [ -n "$candidates" ] || die "Decky plugins dir not found (set OLLAMA_DECK_PLUGIN_DIR)"
    plugins_dir=$(echo "$candidates" | tr ' ' '\n' | head -1)
  fi
fi
dest="$plugins_dir/$PLUGIN_NAME"

say "Installing $PLUGIN_NAME (v$PLUGIN_VERSION, branch=$BRANCH) into $dest"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT HUP INT TERM

curl -fsSL "https://github.com/$REPO/archive/refs/heads/$BRANCH.tar.gz" -o "$tmp/plugin.tar.gz"
tar -xzf "$tmp/plugin.tar.gz" -C "$tmp" --strip-components=1

for required in plugin.json main.py dist/index.js; do
  [ -f "$tmp/$required" ] || die "downloaded archive is missing $required; aborting"
done

sudo_cmd=""
if [ ! -w "$plugins_dir" ]; then
  if [ "$(id -u)" -eq 0 ]; then
    sudo_cmd=""
  elif command -v sudo >/dev/null 2>&1; then
    sudo_cmd="sudo"
  else
    die "no write access to $plugins_dir and sudo is not available"
  fi
  say "Using '$sudo_cmd' to write into $plugins_dir (root-owned)"
fi

if [ -d "$dest" ]; then
  ts="$(date +%Y%m%d%H%M%S)"
  backup="$dest.bak.$ts"
  say "Backing up existing install to $backup"
  $sudo_cmd mv "$dest" "$backup"
fi

$sudo_cmd mkdir -p "$dest"
$sudo_cmd cp -r "$tmp"/. "$dest/"
if [ -n "$sudo_cmd" ]; then
  owner="$(stat -c %u:%g "$plugins_dir" 2>/dev/null || true)"
  [ -n "$owner" ] && $sudo_cmd chown -R "$owner" "$dest"
fi

say "Plugin files installed. Restarting the Decky loader..."
if command -v systemctl >/dev/null 2>&1; then
  $sudo_cmd systemctl restart plugin_loader 2>/dev/null \
    && say "Plugin loader restarted." \
    || say "Plugin loader restarted (decky auto-reloads)."
fi

say "Done. Open Game Mode and check Decky > Ollama Deck."
say "To update later: curl -fsSL https://raw.githubusercontent.com/$REPO/$BRANCH/install.sh | sh"