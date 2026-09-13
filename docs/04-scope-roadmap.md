# OmniLabs OS - Escopo & Roteiro de Execução (Roadmap Outubro/2026)

> **Módulo Foco**: Laboratório LD2 (Microbiologia / Fermentação)  
> **Prazo Final**: Outubro de 2026 (Janela de ~3 a 4 semanas)  
> **Estratégia**: Entregas incrementais com validação contínua e testes automatizados em cada fase.  

---

## 1. Fases do Roteiro de Entrega

```
[Fase 1: Fundação & Auth] ──> [Fase 2: Caderno & Kanban] ──> [Fase 3: Atividades & Sincronia]
                                                                        │
[Homologação & Deploy 24/7] <── [Fase 5: Dashboard & Polish] <── [Fase 4: Cronograma Gantt]
```

---

### Fase 1: Fundação, Monorepo & Autenticação Nominal
* **Objetivos**:
  - Configuração do monorepo (`core-server`, `os-client`, `e2e-tests`).
  - Banco de dados SQLite com Prisma inicializado e modo WAL ativado.
  - Setup do Dia Zero (criação do primeiro supervisor/mestre).
  - Fluxo de "Primeiro Acesso" com e-mail corporativo (`@br.ajinomoto.com` -> extração de login nominal).
  - Telas de Login e Matriz de Permissões (3 níveis).
* **Testes Automatizados (Playwright/Vitest)**:
  - Spec de Setup inicial.
  - Spec de ativação via Primeiro Acesso e login seguro.

### Fase 2: Pilar 1 - Caderno de Turno & Kanban de Pendências
* **Objetivos**:
  - Hub de WebSockets (Socket.io) para colaboração ao vivo entre computadores da bancada.
  - Lançamento de ocorrências com persistência imediata (adeus `localStorage`).
  - Congelamento de turnos encerrados e fluxo de retificação auditada pelo Supervisor.
  - Quadro Kanban de 4 colunas (`Alta`, `Média`, `Baixa Prioridade` + `Avisos`) com Drag and Drop (`@dnd-kit`).
  - Layout limpo e contrastante preparado para transmissão e gravação no Microsoft Teams.
* **Testes Automatizados (Playwright/Vitest)**:
  - Drag and drop de cards no Kanban (mudança de prioridade e persistência de ordem).
  - Sincronização de ocorrências em tempo real entre dois navegadores simultâneos.

### Fase 3: Pilar 2 - Atividades & Limpezas de Rotina
* **Objetivos**:
  - Cadastro de tarefas com periodicidade, Titular e Suplente.
  - Cálculo dinâmico de dias para vencimento e escalação automática de tarefas vencidas para Alta Prioridade.
  - Visão dupla: *"Minhas Atividades"* (checklist 1 clique) vs. *"Visão Geral do Laboratório"*.
  - **Sincronização Bidirecional**: Ticar conclusão injeta linha no feed do turno ativo; remover do turno restaura o status pendente.
* **Testes Automatizados (Playwright/Vitest)**:
  - Teste de consistência bidirecional entre conclusão de limpeza e feed de turno.
  - Teste de escalação automática de tarefas com data ultrapassada.

### Fase 4: Pilar 3 - Cronograma Semanal Digital (Gantt)
* **Objetivos**:
  - Cadastro hierárquico das entidades mestras: `Planta` -> `Aminoácido` -> `Cepa`.
  - Construtor assistido do código padronizado de testes via menus `select`.
  - Visualização estilo Gantt da semana operacional (Segunda 00:40 a Sábado 16:20), com alocação nos reatores (Jars 1 a 6).
  - Linhas inferiores de Atividades de Suporte Técnico de P&D e painel descritivo de Pontos de Atenção.
  - Layout para visualização clara no Teams e botão de impressão em folha A4 padronizada.
* **Testes Automatizados (Playwright/Vitest)**:
  - Validação da formação de códigos de teste por combinações hierárquicas.
  - Renderização do grid Gantt e persistência de datas de início e fim.

### Fase 5: Dashboard Integrado, Dark Mode & Refinamento Visual
* **Objetivos**:
  - Montagem da tela inicial integrada: Gantt principal + Widget lateral *"Meu Foco Hoje"* (minhas limpezas do dia + avisos direcionados).
  - Implementação do seletor Dark / Light Mode (foco no conforto visual do 3º turno/madrugada).
  - Polimento com Design Tokens rigorosos via Tailwind CSS e shadcn/ui.

### Fase 6: Homologação na Bancada & Deploy 24/7
* **Objetivos**:
  - Execução da suite completa de testes Playwright E2E.
  - Deploy da aplicação no PC dedicado fixo da bancada do LD2.
  - Teste de acesso cruzado via IP local nos computadores secundários da bancada.
  - Treinamento rápido e transição suave da equipe para o novo sistema.
