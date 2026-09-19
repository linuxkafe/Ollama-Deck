# Requirements — Ollama-Deck

## Functional Requirements

| ID | Requisito | Verificável por |
|----|-----------|-----------------|
| FR-1 | O plugin apresenta um painel no menu Decky (quick access). | Frontend carrega em Decky; `dist/index.js` presente. |
| FR-2 | Toggle "Ollama Service": ON → `systemctl --user start ollama`; OFF → `systemctl --user stop ollama`. | Smoke test no Deck muda estado do unit. |
| FR-3 | Toggle "Keep Deck Awake": enquanto serviço ativo, mantém `systemd-inhibit --what=sleep:idle --who=Ollama-Deck --mode=block sleep infinity`. Libertado quando OFF ou serviço OFF. | Smoke test verifica processo inhibitor presente/ausente. |
| FR-4 | Toggle "Start with Steam Deck": ON → `systemctl --user enable`, OFF → `disable`. | `systemctl --user is-enabled ollama` reflete o toggle. |
| FR-5 | Painel mostra: `service_active`, `autostart`, `keep_awake_locked`, versão Ollama, `api_reachable`, URL da API, lista de modelos (**nome**, **tamanho**, **família**). | `get_status()` devolve campos; smoke test imprime. |
| FR-6 | Plugin corre sem root (sem flag `root`). | plugin.json sem flag root; processo plugin corre com uid 1000. |
| FR-7 | Cleanup: reload/crash do plugin não deixa inhibitor órfão permanente. | `reap_stragglers()` em `_main`; smoke test e revisão de código. |
| FR-8 | Se o unit `ollama.service` estiver ausente mas o binário existir, o plugin cria o unit padrão (idempotente). | `install_unit()`; smoke test em estado limpo. |
| FR-9 | Persistência do toggle keep-awake entre reloads (`settings.json`). | Ficheiro criado em `DECKY_PLUGIN_SETTINGS_DIR`. |
| FR-10 | Botão "Instalar modelo" abre modal para pull de novo modelo (ex: llama3.2). Requer serviço ativo. | UI abre modal, chamada `pull_model`, toaster mostra resultado. |
| FR-11 | Botão de remoção por modelo com confirmação — chama `delete_model` (`ollama rm`). | UI mostra confirmação, chamada `delete_model`, toaster mostra resultado. |
| FR-12 | Painel "Biblioteca de Modelos" com pesquisa por nome/descrição e filtros por tags (chat, code, embedding, vision, tools). Lista resultados com botão "Instalar". | UI carrega resultados, `search_models` chamado, `pull_model` instalado. |
| FR-13 | CLI `ollama-deck search <query> [--tag TAG]` lista modelos da biblioteca curada. | CLI devolve lista filtrada. |
| FR-14 | CLI `ollama-deck install <model>` alias para `pull`. | Modelo instalado via `pull_model`. |
| FR-15 | Painel "Configuração RAG" com input de diretório de documentos (persistido em settings). | `set_rag_config` guarda `rag_documents_dir`; `get_rag_config` lê. |
| FR-16 | Deteção automática de modelos de embedding instalados; se nenhum, oferece instalar recomendado (embeddinggemma). | `get_rag_config` devolve `installed_embedding_models` e `recommended_embedding_model`; botão instala via `pull_model`. |
| FR-17 | CLI `ollama-deck rag-dir [path] [--json]` define/consulta diretório RAG. | `set_rag_config`/`get_rag_config` chamado. |
| FR-18 | CLI `ollama-deck rag-model [model] [--json]` define/consulta modelo de embedding. | `set_rag_config`/`get_rag_config` chamado. |

## Non-Functional Requirements

| ID | Requisito | Verificável por |
|----|-----------|-----------------|
| NFR-1 | Não altera ficheiros de infraestrutura existentes (unit, ollama-bin). | Diff de repo + smoke (unit pré-existente intocado). |
| NFR-2 | Backend resiliente a bus/DBus indisponível — erros reportados sem crash. | smoke com systemctl a falhar devolve `error`. |
| NFR-3 | Latência UI aceitável (< 2s por ação). | Smoke: chamadas < 2s. |
| NFR-4 | Build reprodutível (`npm ci` + `npm run build`). | CI/terminal local. |
| NFR-5 | Segurança: plugin não expõe novos portos; apenas reflete `OLLAMA_HOST` existente. | Revisão de código. |
| NFR-6 | Subprocessos systemctl/systemd-run usam LD_LIBRARY_PATH_ORIG, ou removem LD_LIBRARY_PATH quando ausente/vazio, evitando conflito com bibliotecas do Decky/PyInstaller sem alterar o ambiente do plugin. | `test_user_env_restores_system_libraries`; validação no Deck com ambiente do loader. |