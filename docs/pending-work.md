# OmniLabs OS - Memória Viva: Onde Paramos & O Que Falta Fazer (`docs/pending-work.md`)

> **Finalidade**: Ponto de referência imediato de cada sessão. Registra com precisão cirúrgica o estado atual exato, a tarefa em andamento e o backlog das próximas etapas.

---

## 📍 1. Ponto de Parada Atual (Exatamente Onde Estamos)

* **Fase 1 (Fundação & Calibração Visual do Acesso Dual-Panel)**: **100% Concluída** (identidade visual refinada com Outfit, mascote Ajipanda, logo 10rem, card 24px, 11 testes verdes no backend e build limpo).
* **Fase em Execução**: **Fase 2 - Blindagem OWASP, Padronização de API (`/api`) & Resiliência de Erros**.
* **Documentos de Referência Aprovados e Commitados**:
  - Especificação Técnica: [`docs/superpowers/specs/2026-09-15-phase-2-owasp-and-api-hardening-design.md`](superpowers/specs/2026-09-15-phase-2-owasp-and-api-hardening-design.md)
  - Plano de Implementação: [`docs/superpowers/plans/2026-09-15-phase-2-owasp-and-api-hardening.md`](superpowers/plans/2026-09-15-phase-2-owasp-and-api-hardening.md)
* **Status Imediato**: Bryan lendo/revisando o plano de implementação da Fase 2 para dar o aval de início de execução.
* **Servidores Ativos**:
  - Frontend (`os-client`): `http://localhost:5173/` (Vite SPA).
  - Backend (`core-server`): `http://localhost:3000/` (Fastify com SQLCipher).

---

## ⏳ 2. O Que Falta Fazer (Próximo Passo Imediato)

### Execução da Fase 2 (Passo a Passo via Plano):
- [ ] **Task 1**: Backend Fastify `setNotFoundHandler` & OWASP 404 Tests (TDD).
  - Escrever teste no `core-server/tests/auth.test.ts` (Cenário 10) validando 404 sem vazamento de rotas.
  - Implementar `app.setNotFoundHandler` em `core-server/src/app.ts`.
  - Validar suíte de testes verdes (`npm test`).
- [ ] **Task 2**: Padronização Canônica do Cliente HTTP (`api.ts`) sob `/api`.
  - Ajustar normalização de URL no `os-client/src/lib/api.ts` para `/api` (sem `/v1`).
- [ ] **Task 3**: Defesa em Camadas & Sanitização de Erros nos Formulários de Acesso.
  - Mapear erros em `LoginForm.tsx`, `FirstAccessForm.tsx` e `SetupInitialForm.tsx` para mensagens humanas seguras.
- [ ] **Task 4**: Reorganização do Roadmap & Documentação Oficial.
  - Atualizar `docs/04-scope-roadmap.md` e sincronizar `docs/completed-work.md`.

---

## 🗺️ 3. Roteiro das Próximas Fases (Atualizado)

* **Fase 3**: Pilar 1 - Caderno de Turno & Kanban de Pendências (Sockets, Feed 24/7, Drag & Drop).
* **Fase 4**: Pilar 2 - Atividades & Limpezas de Rotina (Tarefas periódicas e sincronização bidirecional).
* **Fase 5**: Pilar 3 - Cronograma Semanal Digital (Gantt, alocação de Jars e P&D).
* **Fase 6**: Dashboard Integrado, Dark Mode & Refinamento Visual.
* **Fase 7**: Homologação na Bancada & Deploy 24/7 no LD2.
