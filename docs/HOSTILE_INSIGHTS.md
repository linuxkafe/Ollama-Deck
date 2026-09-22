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

## [Decky] — Diretório de settings usa o `name` do plugin.json
- **Task**: T003
- **Insight**: `DECKY_PLUGIN_SETTINGS_DIR` default =
  `$HOME/homebrew/settings/<name>` com espaços/case exatos do `name` em
  `plugin.json` (ex.: "Ollama Deck"), não o nome do diretório do plugin.
- **Origin**: assumption INFERRED na análise hostil + listagem de
  `/home/deck/homebrew/settings/` no Deck (ControllerTools, Lossless Scaling…).
- **Impact**: sem esta correção, o CLI e a UI partilhariam `keep-awake`/
  `model_tags` de modo incorreto (pastas diferentes).
- **Applied To**: `cli.default_settings_dir()` derivado do `name`.
- **Date**: 2026-09-17

## [Decky] — Modais popout precisam de `popupWidth/Height` explícitos + `ModalRoot bAllowFullSize`
- **Task**: T013
- **Insight**: `showModal(..., { bForcePopOut: true })` sem `popupWidth`/`popupHeight`
  abre uma janela popout com tamanho default/instável (varia com o conteúdo), o que dá
  a sensação de "janela dentro do menu Decky" com tamanhos a diferir. A solução é
  dimensionar explicitamente para `window.screen` e envolver o conteúdo em
  `<ModalRoot bAllowFullSize>` com `closeModal`/`onCancel` (padrão decky-lsfg-vk,
  `BranchSetupModal.tsx`).
- **Origin**: comparação entre o modal do T007 (sem tamanho, sem ModalRoot) e o do
  plugin de referência decky-lsfg-vk (com `popupWidth/Height` + `ModalRoot bAllowFullSize`).
- **Impact**: popout determinístico e a ecrã completo; fallback aceitável no QAM com `bAllowFullSize`.
- **Applied To**: `openChatModal()` em `src/components/ChatModal.tsx`.
- **Date**: 2026-09-22

## [Decky] — Inputs com `width: 100%`/`flex: 1` + `padding` transbordam para a direita
- **Task**: T013
- **Insight**: os `<input>`/`<select>`/`<textarea>` nativos usam `content-box` e, em
  flex, `min-width: auto` impede encolher abaixo da largura intrínseca; com
  `width: 100%` + `padding` o conteúdo fica deslocado para a direita/orbiança. Correção
  mínima: `box-sizing: border-box` (+ `min-width: 0` nos filhos flex). Sintoma reportado
  como "seleção de modelo deslocado para o lado direito por não caber".
- **Origin**: análise do JSX do painel e do chat (estados de estilo inline sem boxSizing).
- **Impact**: eliminou a deslocação à direita no selector de modelo e nos inputs do painel.
- **Applied To**: todos os inputs/selects/textarea do plugin (chat + painel).
- **Date**: 2026-09-22

## [Deploy] — O instalador consome o snapshot do branch `main`, não releases/tags
- **Task**: T014
- **Insight**: `install.sh` descarrega
  `https://github.com/<user>/<repo>/archive/refs/heads/main.tar.gz` — publicar o plugin
  é fazer `git push origin main` (e incluir `dist/index.js` no commit); releases/tags
  GitHub não são necessários para o fluxo curl|sh. `.gitignore` com `aes/` garante que
  os internals AES nunca entram no archive público.
- **Origin**: leitura do `install.sh` do repo + verificação do archive de main pós-push.
- **Impact**: o fluxo "instalar actualização" é só um push; sem PR/release overhead.
- **Applied To**: fluxo de publicação/release do projeto; verificação pós-push faz parte
  do Phase 4 (download do archive + `ls` + grep do dist).
- **Date**: 2026-09-22

## [UI] — Regra de layout: nunca colocar botões à direita de campos
- **Task**: T015
- **Insight**: report do utilizador: "não podem haver botões à direita, senão não há espaço
  e é feita a deslocação à direita". Qualquer linha `campo + botão` num `PanelSectionRow` da
  Decky/SteamOS pode perder espaço (o botão a largura de conteúdo rouba ao campo que não
  encolhe) e o campo transborda à direita. A correção robusta, independente do mecanismo
  flex do container, é **empilhar**: campo sozinho na linha a `width:100%` + `box-sizing:
  border-box`; botões numa linha própria (footer `flex-end`). Campos lado-a-lado
  (ex.: sliders persona) são seguros — a regra aplica-se a botões.
- **Origin**: auditoria linha-a-linha de `src/` após o report do utilizador (6 composições).
- **Impact**: deslocação à direita eliminada por construção; padrão simples de policiar
  (grep `ButtonItem` a coabitar com input/select/textarea/code).
- **Applied To**: ChatModal footer (Enviar), RAG dir (Guardar), LAN (Copiar), Biblioteca
  (Instalar), Embedding (Usar), Modelos (Apagar/Confirmar).
- **Date**: 2026-09-22