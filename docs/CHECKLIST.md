# Checklist — Ollama-Deck

## Pre-commit (rápido)
- [ ] `npm ci` reproduz build (`dist/index.js`)
- [ ] `npx tsc --noEmit` sem erros
- [ ] `python3 -m py_compile main.py`
- [ ] `pytest tests -q` verde
- [ ] Sem console.log/debug no src (exceto logs decky necessários)
- [ ] Sem TODOs no src
- [ ] diff mínima, sem scope creep
- [ ] Docs atualizados se comportamento mudou

## Pré-release (profundo)
- [ ] Smoke test no Deck real: start/stop serviço, keep-awake acquire/release, autostart enable/disable, estado restaurado no fim
- [ ] `plugin.json` sem flag root; `api_version: 1`
- [ ] `dist/index.js` commitado
- [ ] GitHub public sem `aes/` e `.aes/`

## Quality gates (Makefile)
| Gate | Comando |
|------|---------|
| Build frontend | `npm run build` |
| Typecheck | `npx tsc --noEmit` |
| Python syntax | `python3 -m py_compile main.py` |
| Unit tests | `pytest tests -q` |
| Smoke (deck) | `python3 scripts/smoke_test.py` no Deck |