# Hostile Insights — Ollama-Deck

Registo de aprendizagens relevantes da análise hostil (fase de plan).

## [Systemd] — systemd-inhibit funciona fora de uma sessão logind
- **Task**: T001
- **Insight**: `systemd-inhibit` consegue bloquear sleep/idle a partir de um
  processo dentro de `system.slice`/user manager, sem pertencer a uma sessão
  logind com TTY (testado via `systemd-run --user --pipe`: INHIBIT_OK).
- **Origin**: teste empírico (TEST 2) antes de decidir a arquitectura.
- **Impact**: evitou uma dependência de root (flag `root`) e permitiu manter o
  modelo de plugin unprivilegiado do Decky.
- **Applied To**: mecanismo Keep-Deck-Awake implementado com `systemd-inhibit`
  como subprocesso persistente gerido pelo backend (com cleanup de órfãos).

## [Decky] — Plugins sem flag `root` correm como utilizador, não como root
- **Task**: T001
- **Insight**: no Decky Loader v3.2.8 o PluginLoader corre como root mas cada
  plugin mantém o uid do utilizador a menos que `plugin.json` declare
  `flags: ["root"]` (ex.: AutoFlatpaks corre como root, ProtonDB como deck).
- **Origin**: `ps aux` + grep a `plugin.json` de plugins instalados.
- **Impact**: decisão de NÃO usar flag root; controlo do user-service
  `ollama.service` diretamente via `systemctl --user` + XDG_RUNTIME_DIR.
- **Applied To**: plugin.json sem flag root; env `_user_env()` no backend.

## [Systemd] — `systemctl stop` não é afetado por `Restart=always`
- **Task**: T001
- **Insight**: `Restart=always` apenas re-arranca processos que terminam
  inesperadamente; um `systemctl --user stop` limpo não dispara restart.
  (Padrão systemd; risco apontado na análise hostil foi anulado.)
- **Origin**: análise de risco + conhecimento systemd.
- **Impact**: toggle OFF é determinístico — o serviço fica parado até novo start.
- **Applied To**: `set_service(False)` confiável.

## [Decky] — Settings não têm manager builtin no módulo `decky`
- **Task**: T001
- **Insight**: a API `decky` (v1.0.0) expõe constantes de paths e helpers de
  migração, mas sem `SettingsManager`; o template moderno usa `@decky/api` no
  frontend e JSON file nos paths recomendados no backend.
- **Origin**: leitura de `backend/decky_loader/plugin/imports/decky.py`.
- **Impact**: persistência do toggle keep-awake implementada com JSON em
  `DECKY_PLUGIN_SETTINGS_DIR`.
- **Applied To**: classe `Settings` em main.py.

## [Ollama] — Exposição de rede já configurada (0.0.0.0) sem auth
- **Task**: T001
- **Insight**: `OLLAMA_HOST=0.0.0.0` expõe a API 11434 a toda a LAN sem
  autenticação; é configuração pré-existente do utilizador (útil para acesso
  remoto), não introduzida pelo plugin.
- **Origin**: leitura do unit + `curl` ao API.
- **Impact**: o plugin apenas reflete o endereço; risco documentado no README.
- **Applied To**: painel mostra URL da API dinamicamente (LAN vs localhost).