#!/usr/bin/env python3
"""Ollama-Deck CLI — ativa/desativa o serviço Ollama no Steam Deck a partir de
um terminal (SSH), reutilizando exatamente o backend do plugin Decky.

Usage:
    ollama-deck on | start             liga o serviço Ollama
    ollama-deck off | stop             desliga o serviço Ollama
    ollama-deck status [--json]        estado atual
    ollama-deck enable                 auto-arranque com a sessão
    ollama-deck disable                sem auto-arranque
    ollama-deck awake [on|off]         keep-deck-awake (sem arg, alterna)
    ollama-deck update                 atualiza binário do Ollama + modelos
    ollama-deck pull <model>           faz pull de um modelo

Exit codes: 0 ok, 1 erro de runtime, 2 erro de utilização.
"""

import argparse
import asyncio
import json
import os
import sys

# Partilha o diretório de settings com a UI do plugin (env sobrepõe-se, p.ex.
# em smoke tests). Sem isto, keep-awake/model_tags divergiriam CLI vs UI.
# O Decky usa `$HOME/homebrew/settings/<name de plugin.json>` ("Ollama Deck").
def default_settings_dir() -> str:
    return os.path.join(
        os.path.expanduser("~"),
        "homebrew",
        "settings",
        "Ollama Deck",
    )


def ensure_settings_dir_env() -> None:
    os.environ.setdefault("DECKY_PLUGIN_SETTINGS_DIR", default_settings_dir())


ensure_settings_dir_env()

import main as backend  # noqa: E402


def build_parser() -> argparse.ArgumentParser:
    parent = argparse.ArgumentParser(add_help=False)
    parent.add_argument(
        "--json",
        action="store_true",
        help="saída JSON (apenas para o comando status)",
    )
    parser = argparse.ArgumentParser(
        prog="ollama-deck",
        parents=[parent],
        description=(
            "Controla o serviço Ollama no Steam Deck "
            "(mesmo backend do plugin Decky Ollama-Deck)."
        ),
    )
    sub = parser.add_subparsers(dest="command", required=True, metavar="COMANDO")

    def _on(name: str, aliases: tuple, help: str) -> None:
        sub.add_parser(name, aliases=list(aliases), parents=[parent], help=help)

    _on("on", ("start",), "liga o serviço Ollama")
    _on("off", ("stop",), "desliga o serviço Ollama")
    _on("status", (), "mostra o estado atual")
    _on("enable", (), "ativa auto-arranque com a sessão")
    _on("disable", (), "desativa auto-arranque")

    awake = sub.add_parser("awake", parents=[parent], help="keep-deck-awake (bloqueia a suspensão)")
    awake.add_argument("action", nargs="?", choices=("on", "off"))

    sub.add_parser("update", parents=[parent], help="atualiza o Ollama e os modelos instalados")

    pull = sub.add_parser("pull", parents=[parent], help="faz pull/atualiza um modelo")
    pull.add_argument("model")

    return parser


async def _set_service(plugin, on: bool) -> int:
    res = await plugin.set_service(on)
    if not res.get("ok"):
        print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
        return 1
    state = "ativo" if res.get("service_active") else "inativo"
    print(f"Serviço Ollama: {state}")
    return 0


def _format_status(status: dict, as_json: bool) -> str:
    if as_json:
        return json.dumps(status, indent=2, default=str)
    def _y(b: bool) -> str:
        return "sim" if b else "não"
    lines = [
        f"SERVIÇO:    {'ativo' if status['service_active'] else 'inativo'}"
        f" ({'servir' if status.get('api_reachable') else 'não responde'})",
        f"VERSÃO:     {status.get('version') or '—'}",
        f"AUTOSTART:  {_y(status['autostart'])}",
        f"KEEP-AWAKE: {'ativo (suspensão bloqueada)' if status['keep_awake_locked'] else _y(status['keep_awake'])}",
        f"API:        {status.get('api_url') or '—'}",
    ]
    models = status.get("models") or []
    for m in models:
        lines.append(f"MODELO:     {m['name']} · {m['family']} · "
                     f"{backend.format_size(m['size'])}")
    if not models:
        lines.append("MODELOS:    nenhum")
    error = status.get("error")
    if error:
        lines.append(f"ERRO:       {error}")
    return "\n".join(lines)


async def cmd_status(plugin, as_json: bool) -> int:
    status = await plugin.get_status()
    print(_format_status(status, as_json))
    return 0


async def cmd_autostart(plugin, on: bool) -> int:
    res = await plugin.set_autostart(on)
    if not res.get("ok"):
        print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
        return 1
    print(f"Auto-arranque: {'ativado' if on else 'desativado'}")
    return 0


async def cmd_awake(plugin, action: str | None) -> int:
    if action is None:
        status = await plugin.get_status()
        action = "off" if status.get("keep_awake") else "on"
    res = await plugin.set_keep_awake(action == "on")
    if not res.get("ok"):
        print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
        return 1
    locked = res.get("keep_awake_locked")
    if action == "off":
        print("Keep-awake: desativado")
    elif locked:
        print("Keep-awake: ativado — suspensão bloqueada")
    else:
        print(
            "Keep-awake: ativado — bloqueia a suspensão quando o serviço "
            "estiver ativo"
        )
    return 0


async def cmd_update(plugin) -> int:
    res = await plugin.update_all()
    o = res.get("ollama", {})
    print(f"Ollama: {o.get('before') or '?'} -> {o.get('after') or '?'}")
    for m in res.get("models", []):
        mark = "ok" if m.get("ok") else "FALHOU"
        print(f"  [{mark}] {m.get('model')}: {m.get('detail','')[:80]}")
    return 0 if res.get("ok") else 1


async def cmd_pull(plugin, model: str) -> int:
    res = await plugin._pull(model)
    print(f"[{'ok' if res['ok'] else 'FALHOU'}] {model}: {res['detail'][:120]}")
    return 0 if res["ok"] else 1


async def dispatch(args, plugin) -> int:
    command = args.command
    if command in ("on", "start"):
        return await _set_service(plugin, True)
    if command in ("off", "stop"):
        return await _set_service(plugin, False)
    if command == "status":
        return await cmd_status(plugin, args.json)
    if command == "enable":
        return await cmd_autostart(plugin, True)
    if command == "disable":
        return await cmd_autostart(plugin, False)
    if command == "awake":
        return await cmd_awake(plugin, args.action)
    if command == "update":
        return await cmd_update(plugin)
    if command == "pull":
        return await cmd_pull(plugin, args.model)
    print(f"erro: comando desconhecido: {command}", file=sys.stderr)
    return 2


def main(argv: list | None = None) -> int:
    args = build_parser().parse_args(argv)
    if os.geteuid() == 0:
        print(
            "erro: corre como o utilizador 'deck' (não como root); "
            "o serviço e o keep-awake são geridos no user manager de 'deck'.",
            file=sys.stderr,
        )
        return 2
    ensure_settings_dir_env()
    plugin = backend.Plugin()
    plugin.settings = backend.Settings()
    plugin.settings.load()
    backend.install_unit()
    return asyncio.run(dispatch(args, plugin))


if __name__ == "__main__":
    sys.exit(main())