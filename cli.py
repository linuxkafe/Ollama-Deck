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
    ollama-deck rm <model>             remove um modelo
    ollama-deck chat <prompt>          envia prompt ao Ollama (requer serviço ativo)
    ollama-deck lan-info [--json]      mostra como ligar ao Ollama pela LAN

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
    parser = argparse.ArgumentParser(
        prog="ollama-deck",
        description=(
            "Controla o serviço Ollama no Steam Deck "
            "(mesmo backend do plugin Decky Ollama-Deck)."
        ),
    )
    sub = parser.add_subparsers(dest="command", required=True, metavar="COMANDO")

    def _on(name: str, aliases: tuple, help: str) -> None:
        sub.add_parser(name, aliases=list(aliases), help=help)

    _on("on", ("start",), "liga o serviço Ollama")
    _on("off", ("stop",), "desliga o serviço Ollama")

    status = sub.add_parser("status", help="mostra o estado atual")
    status.add_argument("--json", action="store_true", help="saída JSON")

    _on("enable", (), "ativa auto-arranque com a sessão")
    _on("disable", (), "desativa auto-arranque")

    awake = sub.add_parser("awake", help="keep-deck-awake (bloqueia a suspensão)")
    awake.add_argument("action", nargs="?", choices=("on", "off"))

    sub.add_parser("update", help="atualiza o Ollama e os modelos instalados")

    pull = sub.add_parser("pull", help="faz pull/atualiza um modelo")
    pull.add_argument("model")

    rm = sub.add_parser("rm", help="remove um modelo instalado")
    rm.add_argument("model")

    chat = sub.add_parser("chat", help="envia prompt ao Ollama")
    chat.add_argument("prompt")
    chat.add_argument("--model", help="modelo a usar (default: primeiro disponível)")

    lan_info = sub.add_parser("lan-info", help="mostra como ligar ao Ollama pela LAN")
    lan_info.add_argument("--json", action="store_true", help="saída JSON")

    search = sub.add_parser("search", help="pesquisa modelos na biblioteca")
    search.add_argument("query", nargs="?", default="")
    search.add_argument("--tag", action="append", help="filtrar por tag (chat, code, embedding, vision, tools)")

    install = sub.add_parser("install", help="instala um modelo (alias para pull)")
    install.add_argument("model")

    rag_dir = sub.add_parser("rag-dir", help="define/consulta diretório RAG")
    rag_dir.add_argument("path", nargs="?")
    rag_dir.add_argument("--json", action="store_true", help="saída JSON")

    rag_model = sub.add_parser("rag-model", help="define/consulta modelo de embedding RAG")
    rag_model.add_argument("model", nargs="?")
    rag_model.add_argument("--json", action="store_true", help="saída JSON")

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


async def cmd_rm(plugin, model: str) -> int:
    res = await plugin.delete_model(model)
    print(f"[{'ok' if res['ok'] else 'FALHOU'}] {model}: {res['detail'][:120]}")
    return 0 if res["ok"] else 1


async def cmd_chat(plugin, prompt: str, model: str | None) -> int:
    if model is None:
        status = await plugin.get_status()
        models = status.get("models") or []
        if not models:
            print("erro: nenhum modelo disponível", file=sys.stderr)
            return 1
        model = models[0]["name"]
    res = await plugin.chat(model, prompt)
    if not res.get("ok"):
        print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
        return 1
    print(res.get("response", ""))
    return 0


async def cmd_lan_info(plugin, as_json: bool) -> int:
    res = await plugin.lan_info()
    if not res.get("ok"):
        print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
        return 1
    if as_json:
        import json as _json
        print(_json.dumps(res, indent=2, default=str))
        return 0
    print(f"Endereço base: {res.get('base_url')}")
    print(f"Porta: {res.get('port')}")
    print(f"Modelos: {', '.join(res.get('models') or [])}")
    warning = res.get("warning")
    if warning:
        print(f"\n⚠️  {warning}")
    print("\nExemplos:")
    for lang, cmd in (res.get("examples") or {}).items():
        print(f"  [{lang}] {cmd}")
    return 0


async def cmd_search(plugin, query: str, tags: list[str] | None) -> int:
    res = await plugin.search_models(query, tags)
    if not res.get("ok"):
        print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
        return 1
    models = res.get("models", [])
    if not models:
        print("Nenhum modelo encontrado")
        return 0
    for m in models:
        tags_str = ", ".join(m.get("tags", []))
        sizes_str = ", ".join(m.get("sizes", []))
        print(f"{m['name']}  [{tags_str}]  ({sizes_str})  - {m['description']}")
    return 0


async def cmd_install(plugin, model: str) -> int:
    res = await plugin.pull_model(model)
    print(f"[{'ok' if res['ok'] else 'FALHOU'}] {model}: {res['detail'][:120]}")
    return 0 if res["ok"] else 1


async def cmd_rag_dir(plugin, path: str | None, as_json: bool) -> int:
    if path is None:
        res = await plugin.get_rag_config()
        if not res.get("ok"):
            print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
            return 1
        if as_json:
            import json as _json
            print(_json.dumps(res, indent=2, default=str))
            return 0
        print(f"Diretório RAG: {res.get('rag_documents_dir') or 'não definido'}")
        print(f"Modelo embedding: {res.get('rag_embedding_model') or 'não definido'}")
        installed = res.get("installed_embedding_models", [])
        if installed:
            print(f"Embeddings instalados: {', '.join(installed)}")
        recommended = res.get("recommended_embedding_model")
        if recommended:
            print(f"Recomendado: {recommended}")
        return 0
    else:
        res = await plugin.set_rag_config(path, None)
        if not res.get("ok"):
            print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
            return 1
        if as_json:
            import json as _json
            print(_json.dumps(res, indent=2, default=str))
            return 0
        print(f"Diretório RAG definido: {res.get('rag_documents_dir')}")
        return 0


async def cmd_rag_model(plugin, model: str | None, as_json: bool) -> int:
    if model is None:
        res = await plugin.get_rag_config()
        if not res.get("ok"):
            print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
            return 1
        if as_json:
            import json as _json
            print(_json.dumps(res, indent=2, default=str))
            return 0
        print(f"Modelo embedding atual: {res.get('rag_embedding_model') or 'não definido'}")
        installed = res.get("installed_embedding_models", [])
        if installed:
            print(f"Disponíveis: {', '.join(installed)}")
        return 0
    else:
        res = await plugin.set_rag_config(None, model)
        if not res.get("ok"):
            print(f"erro: {res.get('error', 'desconhecido')}", file=sys.stderr)
            return 1
        if as_json:
            import json as _json
            print(_json.dumps(res, indent=2, default=str))
            return 0
        print(f"Modelo de embedding definido: {res.get('rag_embedding_model')}")
        return 0


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
    if command == "install":
        return await cmd_install(plugin, args.model)
    if command == "rm":
        return await cmd_rm(plugin, args.model)
    if command == "chat":
        return await cmd_chat(plugin, args.prompt, args.model)
    if command == "lan-info":
        return await cmd_lan_info(plugin, args.json)
    if command == "search":
        return await cmd_search(plugin, args.query, args.tag)
    if command == "rag-dir":
        return await cmd_rag_dir(plugin, args.path, args.json)
    if command == "rag-model":
        return await cmd_rag_model(plugin, args.model, args.json)
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