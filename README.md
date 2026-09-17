# Ollama-Deck

Plugin [Decky Loader](https://decky.xyz) que serve e controla o **Ollama** no
Steam Deck com GPU (Vulkan/RADV).

## Funcionalidades

- **Liga/desliga o serviço Ollama on demand** (`ollama.service` do utilizador).
- **Keep Deck Awake** — impede o Steam Deck de suspender durante inferências
  ou acesso remoto (`systemd-inhibit`), libertado automaticamente quando o
  serviço é desligado.
- **Start with Steam Deck** — regula o auto-arranque do serviço com a sessão.
- **Painel de estado** — serviço ativo, versão do Ollama, URL da API
  (incl. IP LAN para acesso remoto), reachability e lista de modelos instalados
  (nome/tamanho/família).
- **Update Ollama & models** — atualiza o binário do Ollama (download oficial,
  sem sudo) e faz *pull* dos modelos instalados, tudo a partir do plugin.

Em execução normal, o plugin corre **sem privilégios root** e **não modifica**
a instalação do Ollama nem o seu unit file pré-existente. As atualizações são
sempre explícitas (botão no plugin).

## Requisitos

- Steam Deck com Decky Loader instalado.
- Ollama em `/home/deck/.local/share/ollama-bin/` (o instalador abaixo instala-o
  automaticamente se estiver ausente). Na primeira execução, se o unit
  `ollama.service` não existir, o plugin cria-o a partir de um template padrão
  (Vulkan + `OLLAMA_HOST=0.0.0.0`).

## Instalação

### Rápida (recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/linuxkafe/Ollama-Deck/main/install.sh | sh
```

O instalador descarrega o plugin da `main`, instala-o em
`/home/deck/homebrew/plugins/ollama-deck` (pede sudo apenas para essa pasta),
instala o Ollama se faltar e reinicia o `plugin_loader`. Para forçar outra
branch: `OLLAMA_DECK_BRANCH=v1.0.0 curl -fsSL ... | sh`.

### Manual

```bash
# na máquina de desenvolvimento
make build
scp -r . deck@<IP_DO_DECK>:/tmp/ollama-deck

# no Steam Deck (utilizador deck)
sudo rm -rf /home/deck/homebrew/plugins/ollama-deck
sudo cp -r /tmp/ollama-deck /home/deck/homebrew/plugins/ollama-deck
```

Depois recarrega o Decky (Definições > Reload) ou
`sudo systemctl restart plugin_loader`.

### Atualizações

- **Plugin**: volta a correr o instalador rápido (`curl | sh`); o(s) backup(s)
  anterior(es) ficam em `ollama-deck.bak.<timestamp>`.
- **Ollama + modelos**: no plugin, secção **Updates**, botão
  *Update Ollama &amp; models* — stop do serviço, descarrega e extrai o tarball
  oficial para `~/.local/share/ollama-bin`, arranca de novo e faz `ollama pull`
  de cada modelo instalado (e de tags extra em `model_tags` no settings).

## Uso

1. Abre o Decky (botão `…` / Quick Access > plugin).
2. Em **Ollama Deck**:
   - ativa **Ollama Service** para arrancar o servidor;
   - ativa **Keep Deck Awake** para impedir a suspensão durante o trabalho;
   - (opcional) ativa **Start with Steam Deck** para iniciar com a sessão.
3. O painel mostra versão, URL da API e modelos instalados.

API remota (se `OLLAMA_HOST=0.0.0.0`): qualquer cliente na LAN pode usar
`http://<IP_DO_DECK>:11434`.

> Aviso de segurança: com `OLLAMA_HOST=0.0.0.0` a API fica exposta à LAN sem
> autenticação. Para uso apenas local, define `OLLAMA_HOST=127.0.0.1` no unit.

## Desenvolvimento

```bash
make setup    # npm install
make check    # typecheck (tsc), py_compile, pytest, rollup build
make deploy   # scp para o Deck (imprime os comandos sudo finais)
```

Smoke test do backend no Deck (sem Decky, restaura o estado original):

```bash
python3 scripts/smoke_test.py
```

## Estrutura

```
main.py            backend (systemctl, systemd-inhibit, update, API, settings)
src/index.tsx      frontend React (@decky/ui)
plugin.json        metadados Decky
install.sh         instalador curl | sh
dist/index.js      bundle compilado (commitado — o Decky carrega daqui)
scripts/smoke_test.py   teste de integração no Deck
tests/test_main.py      testes unitários offline
docs/              VISION, REQUIREMENTS, ROADMAP, DESIGN, CHECKLIST
```

## License

MIT — ver [LICENSE](LICENSE).