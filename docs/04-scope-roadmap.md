# OmniLabs OS - Escopo & Roteiro de Execução (Roadmap Outubro/2026)

> **Módulo Foco**: Laboratório LD2 (Microbiologia / Fermentação)  
> **Prazo Final**: Outubro de 2026 (Janela de ~3 a 4 semanas)  
> **Estratégia**: Entregas incrementais com validação contínua e testes automatizados em cada fase.  

---

## 1. Fases do Roteiro de Entrega

```
[Fase 1: Fundação & Auth] ──> [Fase 2: Blindagem OWASP & E2E] ──> [Fase 3: Caderno & Kanban]
                                                                          │
[Homologação & Deploy 24/7] <── [Fase 6: Dashboard & Polish] <── [Fase 5: Cronograma Gantt] <── [Fase 4: Atividades & Sincronia]
```

---

### Fase 1: Fundação, Monorepo & Autenticação Nominal (Concluída ✅)
* **Objetivos**:
  - Configuração do monorepo (`core-server`, `os-client`, `e2e-tests`).
  - Banco de dados SQLite criptografado em repouso com SQLCipher e Drizzle ORM inicializado em modo WAL.
  - Setup do Dia Zero (criação do primeiro supervisor/mestre).
  - Fluxo de "Primeiro Acesso" com e-mail corporativo (`@br.ajinomoto.com` -> extração de login nominal).
  - Telas de Login e Matriz de Permissões (3 níveis).
  - Calibração de identidade visual (Outfit, Ajipanda, logo 10rem, card 24px).
* **Testes Automatizados (Vitest)**:
  - 11 testes unitários/integração cobrindo criptografia, migrações e governança nominal.

### Fase 2: Blindagem OWASP, Padronização Canônica (`/api`), Fallback Universal & E2E Playwright (Concluída ✅)
* **Objetivos**:
  - Prevenção de vazamento de informações e rotas não registradas (OWASP A05) via `app.setNotFoundHandler`.
  - Fallback universal de exceções não tratadas (500) via `app.setErrorHandler` gerando código de incidente auditável (`INC-XXXX-YYYY`) sem vazar stack traces ou caminhos de disco.
  - Erradicação completa de qualquer menção ou prefixo `/v1` em todo o ecossistema, padronizando o prefixo canônico exclusivamente sob `/api`.
  - Restauração do fluxo e roteamento obrigatório de Setup do Primeiro Supervisor no Dia Zero (`/setup`).
  - Mapeamento defensivo anti-enumeração e mensagens acolhedoras em pt-BR em todos os formulários.
  - Inicialização do workspace `e2e-tests` com testes ponta a ponta no navegador Chromium real via Playwright.
* **Testes Automatizados (Playwright/Vitest)**:
  - 13 testes unitários e de integração no backend (`vitest run`).
  - 3 cenários E2E reais no Chromium (`playwright test`): chaveamento Dia Zero/login, validação defensiva sem vazamento técnico e intercepção de rotas legadas `/v1`.

### Fase 3: Pilar 1 - Caderno de Turno & Kanban de Pendências
* **Objetivos**:
  - Hub de WebSockets (Socket.io) para colaboração ao vivo entre computadores da bancada.
  - Lançamento de ocorrências com persistência imediata (adeus `localStorage`).
  - Congelamento de turnos encerrados e fluxo de retificação auditada pelo Supervisor.
  - Quadro Kanban de 4 colunas (`Alta`, `Média`, `Baixa Prioridade` + `Avisos`) com Drag and Drop (`@dnd-kit`).
  - Layout limpo e contrastante preparado para transmissão e gravação no Microsoft Teams.
* **Testes Automatizados (Playwright/Vitest)**:
  - Drag and drop de cards no Kanban (mudança de prioridade e persistência de ordem).
  - Sincronização de ocorrências em tempo real entre dois navegadores simultâneos.

### Fase 4: Pilar 2 - Atividades & Limpezas de Rotina
* **Objetivos**:
  - Cadastro de tarefas com periodicidade, Titular e Suplente.
  - Cálculo dinâmico de dias para vencimento e escalação automática de tarefas vencidas para Alta Prioridade.
  - Visão dupla: *"Minhas Atividades"* (checklist 1 clique) vs. *"Visão Geral do Laboratório"*.
  - **Sincronização Bidirecional**: Ticar conclusão injeta linha no feed do turno ativo; remover do turno restaura o status pendente.
* **Testes Automatizados (Playwright/Vitest)**:
  - Teste de consistência bidirecional entre conclusão de limpeza e feed de turno.
  - Teste de escalação automática de tarefas com data ultrapassada.

### Fase 5: Pilar 3 - Cronograma Semanal Digital (Gantt)
* **Objetivos**:
  - Cadastro hierárquico das entidades mestras: `Planta` -> `Aminoácido` -> `Cepa`.
  - Construtor assistido do código padronizado de testes via menus `select`.
  - Visualização estilo Gantt da semana operacional (Segunda 00:40 a Sábado 16:20), com alocação nos reatores (Jars 1 a 6).
  - Linhas inferiores de Atividades de Suporte Técnico de P&D e painel descritivo de Pontos de Atenção.
  - Layout para visualização clara no Teams e botão de impressão em folha A4 padronizada.
* **Testes Automatizados (Playwright/Vitest)**:
  - Validação da formação de códigos de teste por combinações hierárquicas.
  - Renderização do grid Gantt e persistência de datas de início e fim.

### Fase 6: Dashboard Integrado, Dark Mode & Refinamento Visual
* **Objetivos**:
  - Montagem da tela inicial integrada: Gantt principal + Widget lateral *"Meu Foco Hoje"* (minhas limpezas do dia + avisos direcionados).
  - Implementação do seletor Dark / Light Mode (foco no conforto visual do 3º turno/madrugada).
  - Polimento com Design Tokens rigorosos via Tailwind CSS e shadcn/ui.
  - Continuidade do refinamento visual contínuo da UI sob o protocolo de preview antes do código (Regra 13).

### Fase 7: Homologação na Bancada & Deploy 24/7
* **Objetivos**:
  - Execução da suite completa de testes Playwright E2E.
  - Deploy da aplicação no PC dedicado fixo da bancada do LD2.
  - Teste de acesso cruzado via IP local nos computadores secundários da bancada.
  - Treinamento rápido e transição suave da equipe para o novo sistema.
