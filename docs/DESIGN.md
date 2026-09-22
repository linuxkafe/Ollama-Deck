# DESIGN — Ollama-Deck

Design system base: tokens próprios (decky-frontend-lib `@decky/ui` oferece
theme do Steam). O plugin segue o tema Decky (dark) e usa os componentes
nativos (`ToggleField`, `PanelSection`, `PanelSectionRow`).

## Tokens (dark, decky)
| Token | Valor |
|-------|-------|
| Background (deck) | `#1a1a1a` (Steam dark) |
| Surface (painel) | Decky card padrão |
| Border | `#4a4a4a` (Softened by decky theme) |
| Text | `#e6e6e6` |
| Muted | `#8b8b8b` |
| Accent (ON/active) | `#82b5ff` (Steam blue) |
| Destructive/Off | `#f33b49` |

## Tipografia
Inter (decoração default do Steam UI). Tamanhos: Título de secção 20px/600,
corpo 14px/400, muted 12px/400.

## Componentes (UI do plugin)
| Componente | Uso |
|------------|-----|
| ToggleField "Ollama Service" | start/stop on demand (FR-2) |
| ToggleField "Start with Steam Deck" | enable/disable (FR-4) |
| ToggleField "Keep Deck Awake" | systemd-inhibit (FR-3) |
| Linha de estado (dot verde/cinza) | serviço ativo + API reachable |
| Lista de modelos | nome, tamanho, família (muted) |
| URL da API | endereço visível para acesso remoto |
| ChatModal (`src/components/ChatModal.tsx`) | chat em popout a ecrã completo via `openChatModal()` (padrão decky-lsfg-vk) |

## Padrões
- Estados refletem sempre o backend (`get_status`), nunca estado local otimista.
- Nenhum emoji no código fonte.
- Feedback de erro do backend mostrado inline (sem toasters excessivos).
- Inputs/selects/textarea usam `box-sizing: border-box` (e `min-width: 0` em filhos
  flex) para evitar transbordo/deslocação à direita.