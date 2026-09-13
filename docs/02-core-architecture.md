# OmniLabs OS - Arquitetura do Sistema & Engenharia

> **Módulo Foco**: Laboratório LD2 (Microbiologia / Fermentação)  
> **Versão**: 1.0 (Arquitetura do MVP)  
> **Data**: Setembro de 2026  

---

## 1. Visão Arquitetural Geral (Modular Monolith)

O **OmniLabs OS** adota o padrão **Modular Monolith com Shell de Sistema Operacional (OS-Shell Pattern)**. Essa escolha assegura simplicidade máxima de deploy em um PC local 24/7, eliminando a sobrecarga de microsserviços, mas mantendo o código estritamente desacoplado em módulos de negócio.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          os-client (Vite + React)                      │
│   ┌───────────────┐ ┌───────────────────┐ ┌────────────────────────┐   │
│   │   Dashboard   │ │ Caderno de Turno  │ │ Atividades & Limpezas  │   │
│   │ (Gantt+Widget)│ │  (Feed + Kanban)  │ │   (Minhas + Lab Geral) │   │
│   └───────────────┘ └───────────────────┘ └────────────────────────┘   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │       Design System (Tailwind CSS + shadcn/ui + Lucide)        │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ HTTP / WebSocket (Porta 3000/3001)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        core-server (Node.js + Fastify)                 │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              API REST (Rotas, Controllers, Validadores)        │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │       WebSocket Hub (Socket.io - Sincronização em Tempo Real)  │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │              Auth Service (Bcrypt + Sessão Nominal)            │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │       Drizzle ORM (TypeScript Puro + Migrações em Código)      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   SQLite + SQLCipher│
                         │(better-sqlite3-mc)  │
                         │ 100% Cifrado AES-256│
                         └─────────────────────┘
```

---

## 2. Estrutura do Monorepo

O repositório é organizado em pastas com nomenclatura em inglês e em **`kebab-case`**:

```
omnilabs-os/
├── docs/                             # Documentação técnica e funcional
│   ├── 01-prd-requirements.md
│   ├── 02-core-architecture.md
│   ├── 03-data-models-flows.md
│   ├── 04-scope-roadmap.md
│   └── 05-coding-standards.md
├── core-server/                      # Aplicação Backend (API & WebSocket)
│   ├── drizzle/                      # Histórico de migrações geradas pelo Drizzle
│   ├── src/
│   │   ├── config/                   # Variáveis de ambiente e constantes
│   │   ├── db/                       # Conexão SQLCipher e schemas Drizzle
│   │   │   ├── connection.ts         # Inicialização do better-sqlite3-mc com chave
│   │   │   ├── schema/               # Schemas de tabelas em TypeScript
│   │   │   └── index.ts
│   │   ├── modules/                  # Módulos de negócio desacoplados
│   │   │   ├── auth/                 # Autenticação, Primeiro Acesso, RBAC
│   │   │   ├── shift-handover/       # Turnos, Ocorrências, Pendências, Avisos
│   │   │   ├── routine-tasks/        # Atividades & Limpezas de rotina
│   │   │   ├── weekly-schedule/      # Cronograma Semanal (Jars, Suportes)
│   │   │   └── master-data/          # Plantas, Aminoácidos, Cepas
│   │   ├── shared/                   # Utilitários, middlewares e WebSocket Hub
│   │   └── app.ts                    # Bootstrap do servidor Fastify
│   ├── tests/                        # Testes de integração e unitários (Vitest)
│   ├── drizzle.config.ts             # Configuração do Drizzle Kit
│   └── package.json
├── os-client/                        # Aplicação Frontend (SPA)
│   ├── public/                       # Favicons e assets estáticos
│   ├── src/
│   │   ├── components/               # Componentes reutilizáveis do Design System
│   │   │   ├── ui/                   # Primitivas (Button, Card, Dialog, Input...)
│   │   │   ├── layout/               # OS Shell, Header de Turno, Barra Lateral
│   │   │   └── shared/               # Widgets, Kanban Board, Gantt Chart
│   │   ├── modules/                  # Telas e fluxos de cada módulo
│   │   │   ├── auth/                 # Login, Primeiro Acesso
│   │   │   ├── dashboard/            # Dashboard unificado (Gantt + Widget)
│   │   │   ├── shift-handover/       # Feed do Turno e Kanban de Pendências
│   │   │   ├── routine-tasks/        # Minhas Atividades e Gestão do Lab
│   │   │   └── weekly-schedule/      # Visualização e Edição do Cronograma
│   │   ├── hooks/                    # Custom hooks (use-auth, use-socket, use-kanban)
│   │   ├── lib/                      # Cliente HTTP, utilitários e formatadores
│   │   └── main.tsx                  # Ponto de entrada da aplicação
│   ├── tailwind.config.js            # Configuração de Design Tokens
│   └── package.json
├── e2e-tests/                        # Bateria de testes de ponta a ponta (Playwright)
│   ├── specs/                        # Cenários de teste automatizados
│   │   ├── auth-flow.spec.ts         # Login e primeiro acesso
│   │   ├── kanban-dnd.spec.ts        # Drag and Drop do Kanban
│   │   ├── shift-feed.spec.ts        # Lançamento e colaboração em tempo real
│   │   └── task-sync.spec.ts         # Sincronização bidirecional de tarefas
│   └── playwright.config.ts          # Configuração do Playwright
└── PROJECT_CONTEXT.md                # Memória viva e regras fundamentais do projeto
```

---

## 3. Pilha Tecnológica (Tech Stack)

### Backend (`core-server`)
* **Linguagem**: TypeScript 5.x.
* **Framework Web**: **Fastify** (alta performance, baixo consumo de memória e validação nativa com JSON Schema/Zod).
* **ORM & Banco de Dados**: **Drizzle ORM** com **`better-sqlite3-multiple-ciphers`**.
  - **Criptografia AES-256 no Disco (SQLCipher)**: Arquivo `.db` totalmente ilegível no disco rígido sem a chave secreta (`DB_ENCRYPTION_KEY`).
  - **Busca Textual Nativa**: Suporta consultas `LIKE '%termo%'` nativas no banco com tempo de resposta em milissegundos.
  - **100% TypeScript Puro**: Sem binários Rust externos, eliminando travamentos de migrações e garantindo estabilidade 24/7.
  - 100% agnóstico: permite migrar para PostgreSQL corporativo no futuro com facilidade.
* **Comunicação em Tempo Real**: **Socket.io** para emissão de eventos em tempo real para os navegadores na bancada.
* **Criptografia & Sessão**: `bcrypt` para hash seguro de senhas e tokens de sessão leves (JWT / Session Cookie).

### Frontend (`os-client`)
* **Linguagem**: TypeScript 5.x + React 18/19.
* **Build Tool**: **Vite** (inicialização instantânea em ambiente local).
* **Estilização & Design System**: **Tailwind CSS** com padrão **shadcn/ui** e ícones **Lucide React**.
* **Interatividade & Drag and Drop**: **`@dnd-kit`** (biblioteca moderna, leve, altamente acessível e com suporte nativo a reordenação precisa entre colunas).
* **Gerenciamento de Estado**: **Zustand** ou **TanStack Query (React Query)** para cache de dados assíncronos e sincronização com WebSocket.

---

## 4. Design System & Padrões Visuais

Para garantir o rigor estético exigido no projeto:

### 4.1 Design Tokens (Tailwind CSS)
* **Tipografia**: Família sans-serif corporativa e moderna (`Inter` ou sistema nativo), com tamanhos escalonados rigidamente (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`).
* **Paleta de Cores Semântica**:
  - `Primary` / `Brand`: Tons sóbrios de azul corporativo/cinza ardósia para manter foco analítico.
  - `Priority Alta` / `Crítico`: Vermelho operacional (`#EF4444` / `bg-red-500/10` com borda vibrante).
  - `Priority Média` / `Atenção`: Âmbar / Amarelo operacional (`#F59E0B`).
  - `Priority Baixa` / `Informativo`: Azul sereno / Cinza (`#3B82F6` / `#6B7280`).
  - `Sucesso` / `Concluído`: Verde esmeralda (`#10B981`).
* **Dark Mode Nativo**: Suporte completo para conforto visual da equipe do 3º Turno (madrugada), alternável no cabeçalho.

---

## 5. Estratégia de Testes Automatizados

Para garantir que nenhuma alteração quebre o fluxo da bancada, implementamos duas esteiras automáticas:

### 5.1 Testes Unitários e de Integração (Vitest)
* **Foco**: Regras de negócio, autenticação, controllers e serviços.
* **Cenários Testados**:
  - Extração de username Ajinomoto (`usuario@br.ajinomoto.com` -> `usuario`).
  - Cálculo de dias para vencimento de atividades.
  - Sincronização bidirecional: marcar como concluído gera evento no turno; remover evento restaura pendência.
  - Bloqueio de edição para turnos encerrados e validação de permissão de Supervisor para retificações.

### 5.2 Testes de Interface & End-to-End (Playwright)
* **Foco**: Interação do usuário na tela, responsividade e robustez visual.
* **Cenários Testados**:
  - **Drag and Drop no Kanban**: Mover um card da coluna *Média Prioridade* para *Alta Prioridade*, validar se a ordem é mantida no topo/fim da coluna e se o backend persistiu a nova posição.
  - **Lançamento de Ocorrência**: Digitar uma ocorrência no PC 1 e verificar se ela é renderizada instantaneamente na lista sem recarregar a página.
  - **Checklist "Meu Foco Hoje"**: Clicar na caixa de seleção de uma limpeza atribuída e verificar a transição de estado visual.
  - **Screenshots de Regressão Visual**: Captura de telas padronizadas para validar que tabelas, cards e gráficos não quebraram o layout.

---

## 6. Modelo de Orquestração Multi-Agente

Para o desenvolvimento ágil, seguro e econômico em tokens:

* **Orquestrador Líder (Antigravity)**: Gerencia o fluxo, planeja cada iteração, reporta o progresso ao usuário e resolve dúvidas de negócio.
* **Subagente `dev`**: Responsável exclusivo por codificar componentes, endpoints e migrações Prisma.
* **Subagente `qa`**: Responsável por criar e executar as suites de teste no Playwright e Vitest via terminal, garantindo 100% de aprovação antes do merge.
* **Subagente `reviewer`**: Audita o código produzido em conformidade com o `PROJECT_CONTEXT.md` e o `05-coding-standards.md`.
