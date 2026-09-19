# VISION — Ollama-Deck

## Problema
O Steam Deck tem o Ollama instalado (Vulkan/RADV) com um serviço systemd do
utilizador, mas:
1. O serviço é ativado/desativado apenas por scripts CLI — inconveniente em
   modo jogo.
2. Durante inferências longas (ou acesso remoto) o Deck pode suspender e
   interromper o servidor a meio.
3. Não existe visibilidade do estado do servidor (versão, modelos, endereço).
4. Não há forma de interagir com o Ollama diretamente no Gaming Mode.
5. Não há instruções claras para ligar ao Ollama a partir de outros equipamentos na LAN.

## Solução
Um plugin Decky — **Ollama-Deck** — que fornece:
- Ativação/desativação **on demand** do serviço `ollama.service`.
- Opção **"Keep Deck Awake"** que impede o Deck de suspender enquanto o Ollama
  está a servir (systemd-inhibit).
- Painel de estado: serviço ativo, auto-start, versão, URL da API,
  reachability e lista de modelos instalados.
- **Chat com Ollama** diretamente no overlay do Decky (Gaming Mode), com
  seleção de modelo e histórico da sessão.
- **Info de conexão LAN** — endereço, porta, modelos disponíveis e exemplos
  de uso (curl, Python, JavaScript) para ligar a partir de outros equipamentos.
- **Biblioteca de modelos** — pesquisa e instalação de modelos da biblioteca
  Ollama com filtros por categoria (chat, code, embedding, vision, tools).
- **Configuração RAG** — diretório de documentos configurável pelo utilizador
  e detecção/instalação automática de modelos de embedding recomendados.

## Value Proposition
O utilizador liga o Ollama pelo menu rápido do Steam (Quick Access), mantém o
Deck acordado durante inferências, conversa com o modelo diretamente no overlay
do Gaming Mode, sabe — à distância de um olhar — como ligar ao servidor a
partir de qualquer equipamento na rede local, **descobre e instala modelos**
sem saber tags exatas, e **configura um diretório RAG** com modelo de embedding
recomendado em um clique, sem tocar numa shell.

## Non-goals (fase atual)
- Web UI embutida.
- Atualização automática do binário Ollama.
- Suporte root-only (o plugin funciona sem privilégios).
- Seleção de quantização / busca de modelos (apenas pull/rm por nome).
- Histórico de chat persistente entre reboots (apenas sessão atual).