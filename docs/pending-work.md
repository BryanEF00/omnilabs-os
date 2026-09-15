# OmniLabs OS - Memória Viva: Onde Paramos & O Que Falta Fazer (`docs/pending-work.md`)

> **Finalidade**: Ponto de referência imediato de cada sessão. Registra com precisão cirúrgica o estado atual exato, a tarefa em andamento e o backlog das próximas etapas.

---

## 📍 1. Ponto de Parada Atual (Exatamente Onde Estamos)

* **Fase 1 (Fundação & Calibração Visual do Acesso Dual-Panel)**: **100% Concluída** (identidade visual refinada com Outfit, mascote Ajipanda, logo 10rem, card 24px, 11 testes verdes no backend e build limpo).
* **Fase 2 (Blindagem OWASP, Padronização de API `/api`, Fallback Universal com `incidentId` & Testes E2E Playwright)**: **100% Concluída**:
  - `app.setNotFoundHandler` mascarando rotas inexistentes 404 (OWASP A05).
  - Fallback universal 500 no `app.setErrorHandler` gerando código de incidente `INC-XXXX-YYYY` com log seguro e zero vazamento de caminhos.
  - Normalização estrita do cliente HTTP sob `/api` canônico com erradicação total de `/v1`.
  - Restauração do fluxo Dia Zero de criação do primeiro supervisor (`setupRequired`) e isolamento no roteamento.
  - Mapeamento defensivo anti-enumeração e suporte a código de incidente em todos os formulários.
  - Workspace `e2e-tests` configurado com Playwright e 3 cenários reais em Chromium 100% verdes.
  - Suíte completa: 13 testes unitários/integração + 3 testes E2E Playwright.
* **Fase em Execução**: **Preparação para a Fase 3 (Pilar 1 - Caderno de Turno & Kanban de Pendências)**.
* **Frente Contínua Ativa**: Refinamento visual da UI (OmniDS) segue aberto e contínuo, sempre respeitando o protocolo de preview antes do código (Regra 13).
* **Servidores Ativos**:
  - Frontend (`os-client`): `http://localhost:5173/` (Vite SPA).
  - Backend (`core-server`): `http://localhost:3000/` (Fastify com SQLCipher).

---

## ⏳ 2. O Que Falta Fazer (Próximo Passo Imediato)

### Início da Fase 3: Pilar 1 - Caderno de Turno & Kanban de Pendências
- [ ] **Alinhamento e Especificação Técnica da Fase 3**:
  - Mapeamento do Schema Drizzle para Ocorrências de Turno e Colunas do Kanban.
  - Proposta de arquitetura de WebSocket local (Socket.io) para sincronização instantânea entre computadores da bancada do LD2.
  - Elaboração da spec e plano via superpowers (`brainstorming` / `writing-plans`).
- [ ] **Refinamentos Visuais Contínuos (OmniDS)**:
  - Continuar refinando componentes de UI com o Bryan sob o protocolo de mockups visuais antes de qualquer alteração de código.

---

## 🗺️ 3. Roteiro das Próximas Fases (Atualizado)

* **Fase 3**: Pilar 1 - Caderno de Turno & Kanban de Pendências (Sockets, Feed 24/7, Drag & Drop).
* **Fase 4**: Pilar 2 - Atividades & Limpezas de Rotina (Tarefas periódicas e sincronização bidirecional).
* **Fase 5**: Pilar 3 - Cronograma Semanal Digital (Gantt, alocação de Jars e P&D).
* **Fase 6**: Dashboard Integrado, Dark Mode & Refinamento Visual.
* **Fase 7**: Homologação na Bancada & Deploy 24/7 no LD2.
