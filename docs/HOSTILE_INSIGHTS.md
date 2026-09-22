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

## [UI] — Botões de ação: compactos à esquerda (sem flex-end, sem ButtonItem inline)
- **Task**: T017
- **Insight**: mesmo com o empilhamento (T015), o utilizador rejeita botões alinhados à
  direita ("o botão copiar também continua à direita") e os `ButtonItem` do Decky renderizam
  largos/monstruosos quando isolados. Regra final: **zero `justify-content: flex-end`** em
  `src/`; ações em `<button>` nativo compacto (largura=conteúdo) alinhado à esquerda;
  primárias full-width (`layout="below"`) mantêm-se (não são "à direita").
- **Origin**: greps do estado publicado + report iterativo do utilizador (3ª iteração).
- **Impact**: eliminação total de botões na margem direita; largura controlada por conteúdo.
  Trade-off: focus navigation nativa (gamepad) deixa de se aplicar a estes botões.
- **Applied To**: `src/components/ui.tsx` (helper `Btn`); chat send, LAN copy, RAG save,
  library install, embedding use/install, models delete/confirm, pull modal, persona footer.
- **Date**: 2026-09-22
## [UI] — Action icons do modal Decky são "botões à direita" no chat
- **Task**: T018
- **Insight**: último report ("Começa o problema a partir do chat"): o chat é a única janela
  `showModal` do plugin — e o Decky modal renderiza **action icons no header (topo-direita)**
  quando `bHideActionIcons: false` (default). Ou seja, havia botões à direita no chat mesmo
  com o conteúdo 100% empilhado (T013/T015/T017). Fix: `bHideActionIcons: true` no `showModal`
  do popout do chat; fecho continua por `Esc`/`onCancel`/SteamOS B.
- **Origin**: auditoria de TODAS as janelas (painel + 1 modal) após 4ª iteração do report.
- **Impact**: chat sem qualquer botão na margem direita; independe de i18n — verificação
  PT/EN confirma (labels curtas, `Btn` compacto `nowrap`, idêntico nas duas línguas).
- **Applied To**: `src/components/ChatModal.tsx` (`openChatModal` options).
- **Date**: 2026-09-22

## [Process] — Report "contínua" ≠ regressão: auditar por construção, não por mancha
- **Task**: T018
- **Insight**: o utilizador repete o mesmo symptoma 4 iterações seguidas. Em vez de re-empilhar
  o que já está empilhado (T015/T016/T017 foram mais do mesmo), a causa estava OMISSA: o modal
  Decky (única janela extra) tem action icons próprios no header direito. Lição: quando um
  report persiste, procurar camadas de UI fora do `src` que possua — o framework/loader
  (SteamOS/Decky) também desenha botões.
- **Origin**: análise de hosts de botões (plugin vs framework) no 4º ciclo.
- **Impact**: método de diagnóstico para ciclos repetidos; checar chrome do framework antes de
  duplicar correções no src.
- **Applied To**: processo AES (Diagnóstico: primeiro os donos dos pixels).
- **Date**: 2026-09-22

## [UI] — Botões largos ≠ alinhamento: CSS global do host estica <button>
- **Task**: T019
- **Insight**: o utilizador corria EXACTAMENTE o build T018 publicado (hash provado via
  `ssh deck@10.0.0.128 sha256sum`) e AINDA via botões à direita. Portanto a causa nunca foi
  o layout (0 flex-end desde T015/T017); era a LARGURA dos `<button>` nativos esticada pelo
  CSS global do SteamOS/Decky. `inline style display:inline-block; width:auto; flex:0 0
  auto; flexShrink:0; minWidth:0; boxSizing:border-box; whiteSpace:nowrap` é a defesa
  intra-plugin (inline > stylesheet).
- **Origin**: verificação empírica da instalação no device (sha256) + 5ª iteração do report.
- **Impact**: todos os botões compactos voltam à largura do conteúdo e nunca overflow;
  regra encerrada: filtrar por width, não por alinhamento.
- **Applied To**: `Btn` (ui.tsx), tags da biblioteca (index.tsx), filas flex com wrap.
- **Date**: 2026-09-22

## [UX] — O utilizador pergunta "o enter não basta?" → remover o botão
- **Task**: T019
- **Insight**: no chat, o utilizador questiona se o botão Enviar é necessário. Resposta:
  não. Enter (sem Shift) envia; Shift+Enter nova linha. Menos botões = mais conformidade
  com a regra do utilizador (zero botões desnecessários).
- **Origin**: pergunta directa do utilizador (5º report).
- **Impact**: janela de chat sem qualquer botão além dos controls do modal; footer só
  textarea.
- **Applied To**: `src/components/ChatModal.tsx`.
- **Date**: 2026-09-22

## [Ops] — "nada mudou" ao re-instalar: o Decky serve o .bak, não o ativo
- **Task**: T020
- **Insight**: o install.sh fazia `mv $dest $backup` em cada execução e nunca limpava os
  backups. Como cada `.bak.*` contém `plugin.json` + `main.py` + `dist/` válidos, o scanner
  do Decky loader "found plugin: ollama-deck.bak.…" e **servia o código do backup antigo**
  — por isso o utilizador viu as mesmas correções (T013..T019) "tudo igual", apesar de o
  dist ativo no disco estar correto. Rigor: verificar o processo a correr
  (`pgrep -af main.py` → caminho) e os logs do loader, não só o hash dos ficheiros.
- **Origin**: ssh ao Deck + journalctl -u plugin_loader; processo PID 164180 a correr de
  `.bak.20260921205846` (cópia 21/09).
- **Impact**: instalador passa a remover todos `ollama-deck.bak.*`; invariante = 1 dir
  ativo. Lição geral: cache/backups em diretórios vigiados por scanners podem mascarar
  deploys "certos".
- **Applied To**: `install.sh`.
- **Date**: 2026-09-22
