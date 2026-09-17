# VISION — Ollama-Deck

## Problema
O Steam Deck tem o Ollama instalado (Vulkan/RADV) com um serviço systemd do
utilizador, mas:
1. O serviço é ativado/desativado apenas por scripts CLI — inconveniente em
   modo jogo.
2. Durante inferências longas (ou acesso remoto) o Deck pode suspender e
   interromper o servidor a meio.
3. Não existe visibilidade do estado do servidor (versão, modelos, endereço).

## Solução
Um plugin Decky — **Ollama-Deck** — que fornece:
- Ativação/desativação **on demand** do serviço `ollama.service`.
- Opção **"Keep Deck Awake"** que impede o Deck de suspender enquanto o Ollama
  está a servir (systemd-inhibit).
- Painel de estado: serviço ativo, auto-start, versão, URL da API,
  reachability e lista de modelos instalados.

## Value Proposition
O utilizador liga o Ollama pelo menu rápido do Steam (Quick Access), mantém o
Deck acordado durante inferências, e sabe — à distância de um olhar — se o
servidor está disponível e com que modelos, em qualquer interface (gamemode
ou desktop), sem tocar numa shell.

## Non-goals (fase atual)
- Gestão de modelos (pull/delete/quantização).
- Web UI embutida.
- Atualização automática do binário Ollama.
- Suporte root-only (o plugin funciona sem privilégios).