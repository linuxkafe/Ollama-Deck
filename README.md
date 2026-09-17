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

O plugin corre **sem privilégios root** e **não modifica** a instalação do
Ollama nem o seu unit file pré-existente.

## Requisitos

- Steam Deck com Decky Loader instalado.
- Ollama em `/home/deck/.local/share/ollama-bin/`.
  Na primeira execução, se o unit `ollama.service` não existir, o plugin cria-o
  a partir de um template padrão (Vulkan + `OLLAMA_HOST=0.0.0.0`).

## Instalação

### Manual (recomendado)

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

### A partir do repositório

Copia o repo (ou apenas o conteúdo) para
`/home/deck/homebrew/plugins/ollama-deck` seguindo os mesmos passos.

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
main.py            backend (systemctl, systemd-inhibit, API, settings)
src/index.tsx      frontend React (@decky/ui)
plugin.json        metadados Decky
dist/index.js      bundle compilado (commitado — o Decky carrega daqui)
scripts/smoke_test.py   teste de integração no Deck
tests/test_main.py      testes unitários offline
docs/              VISION, REQUIREMENTS, ROADMAP, DESIGN, CHECKLIST
```

## License

MIT — ver [LICENSE](LICENSE).