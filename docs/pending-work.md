# OmniLabs OS - Memória Viva: Onde Paramos & O Que Falta Fazer (`docs/pending-work.md`)

> **Finalidade**: Ponto de referência imediato de cada sessão. Registra com precisão cirúrgica o estado atual exato, a tarefa em andamento e o backlog das próximas etapas.

---

## 📍 1. Ponto de Parada Atual (Exatamente Onde Estamos)

* **Fase em Execução**: Fase 1 - Fechamento Visual da Camada de Autenticação.
* **Status Imediato**: Aguardando o Bryan apresentar seus feedbacks visuais e escolhas pessoais para o formulário da coluna da direita (Tela de Acesso / Login).
* **Servidores Ativos**:
  - Frontend (`os-client`): `http://localhost:5173/` (Vite SPA).
  - Backend (`core-server`): `http://localhost:3000/` (Fastify com SQLCipher).
* **Protocolo Operacional Ativo (Regra 13 do `AGENTS.md`)**:
  - Todo e qualquer feedback ou proposta de ajuste de UI exige obrigatoriamente:
    1. **Proposta Conceitual** explicada de forma clara e humana.
    2. **Preview Visual Obrigatório** (mockup interativo HTML ou demonstração visual no chat) para que o Bryan teste e veja como vai ficar na prática antes de qualquer código ser alterado.
    3. **Aprovação Explícita**: NENHUM arquivo de código do projeto deve ser editado ou commitado antes do "aprovado" do Bryan.

---

## ⏳ 2. O Que Falta Fazer (Próximos Passos Imediatos)

### Passo Imediato (Tela de Login / Split-Screen):
- [ ] Ouvir as escolhas pessoais e feedbacks do Bryan sobre a coluna da direita.
- [ ] Construir a proposta técnica com preview visual interativo em HTML/artefato.
- [ ] Apresentar ao Bryan e aguardar aprovação explícita.
- [ ] Aplicar as alterações nos componentes (`LoginForm.tsx`, etc.), verificar build (`npm run build --workspace=os-client`) e suíte de testes (`npm test`).
- [ ] Persistir no git com commit convencional atômico e `git push origin main`.

---

## 🗺️ 3. Roteiro das Próximas Fases (Visão Geral)

### Fase 2: Caderno de Turno Digital & Passagem de Turno (Meta: Outubro/2026)
- [ ] **Modelos de Dados do Turno**:
  - Tabelas de turnos ativos, diário de ocorrências (feed), pendências e avisos.
  - Regra de imutabilidade e auditoria nominal pós-congelamento de turno.
- [ ] **Feed em Tempo Real do Turno**:
  - Registro de ocorrências com horário automático e autor nominal.
  - Sincronização entre as bancadas do LD2 (PC 1 e PC 2).
- [ ] **Quadro Kanban de 4 Colunas**:
  - 3 colunas de Pendências (`Alta`, `Média`, `Baixa`) com triagem rápida + 1 coluna de `Avisos`.
  - Design ergonômico otimizado para apresentação durante a reunião de passagem no Microsoft Teams.

### Fase 3: Controle de Atividades & Limpezas de Rotina
- [ ] Gestão de tarefas periódicas (semanal, mensal, flexível).
- [ ] Associação de responsável titular e suplente.
- [ ] Visão dupla: *"Minhas Atividades"* (checklist pessoal em 1 clique) e *"Visão do Laboratório"*.
- [ ] Sincronização bidirecional entre a conclusão de atividades e o feed do caderno de turno.
- [ ] Escalação automática de prioridades (tarefas vencidas sobem automaticamente para Alta Prioridade no Kanban).
