# OmniLabs OS - Diretrizes do Agente & Índice de Conhecimento (`AGENTS.md`)

> **Propósito**: Guia executivo de comportamento, inicialização e índice do projeto, carregado no início de toda sessão.

---

## 1. Regras Comportamentais Inegociáveis

1. **Decisões Técnicas**: NUNCA inferir regras de negócio ou arquitetura. Exponha prós/contras técnicos com clareza e aguarde a decisão explícita do Bryan.
2. **Ritmo da Conversa**: Um tópico por vez. Evite múltiplos questionamentos simultâneos.
3. **Digitação por Voz**: O Bryan utiliza transcrição de voz ("pensar em voz alta"). Interprete a intenção de engenharia com naturalidade.
4. **Convenção de Idiomas & Nomenclatura**:
   - Código e Identificadores: 100% em Inglês (`PascalCase` para componentes React, `kebab-case` para arquivos/rotas, `camelCase` para funções/variáveis).
   - Comentários de Código: 100% em Português.
   - Interface do Usuário (UI): 100% em Português (pt-BR).
5. **Revisão Granular de Banco de Dados**: Toda tabela, campo, tipo ou constraint do Drizzle deve ser explicada e aprovada campo a campo com o Bryan antes da criação.
6. **Revisão Granular de Testes Automatizados**: Todo teste (Vitest/Playwright) deve ter cenários, dados e asserções validados previamente com o Bryan.
7. **Qualidade Extrema sobre Velocidade**: Domínio técnico cirúrgico. Nada entra em lote sem entendimento e aprovação completos.
8. **Comunicação Conceitual Humana**: Sempre explicar o conceito prático, o porquê técnico e a finalidade no mundo real antes de sintaxes ou códigos.
9. **Prevenção de Travamentos & Sentinela de Comandos**:
   - Zero código inline no PowerShell: Proibido `node -e` ou `tsx -e`. Sempre gravar em arquivo de script e executar diretamente.
   - Margem síncrona alta: `WaitMsBeforeAsync: 10000` em comandos habituais.
   - Sentinela de background: Comandos longos em segundo plano exigem timer via `schedule` (máx 30s-60s) para auditar logs. Abortar (`kill`) se estagnar.
10. **Sincronização Contínua com GitHub**: Todo commit local validado deve ser imediatamente enviado via `git push`.
11. **Commits Atômicos Automáticos por Marco**: Ao concluir qualquer unidade lógica com compilação limpa (`npm run build`) e testes 100% verdes (`npm test`), criar commit convencional e dar push proativamente.
12. **Portabilidade & Caminhos Estritamente Relativos**: Proibido caminhos absolutos ou letras de unidade (`C:`, `D:`). O Bryan desenvolve em múltiplas máquinas (notebook, desktop de casa, bancada do LD2).
13. **Protocolo Obrigatório de UI (Preview Visual Antes do Código)**:
    - Diante de qualquer alteração visual:
      1. Proposta conceitual em linguagem humana.
      2. Preview visual obrigatório (mockup HTML interativo no chat/artefato).
      3. Parar e aguardar aprovação explícita do Bryan antes de alterar arquivos do projeto.
      4. Implementar, testar e commitar somente pós-aprovação.
14. **Delegação a Subagentes**: Ao invocar qualquer subagente, é OBRIGATÓRIO exigir expressamente em seu prompt a leitura dos arquivos de documentação indexados no `AGENTS.md` correlacionados com sua tarefa (ex: `docs/05-coding-standards.md`, `docs/06-design-system.md`). O agente principal deve auditar a entrega contra essas regras antes de integrá-la.

---

## 2. Inicialização de Sessão (`/start`)

Toda nova sessão de trabalho deve ser inicializada através da skill `session-start` ao comando `/start` (ou solicitação de início do Bryan). O agente executa a auditoria Git contra o GitHub, sobe os servidores de desenvolvimento em segundo plano, lê a memória viva e entrega o briefing executivo de alinhamento antes de qualquer modificação de código.

---

## 3. Índice de Documentação (Onde Consultar Cada Informação)

| Assunto / Necessidade | Arquivo de Referência |
| :--- | :--- |
| **Memória Viva (Ponto Atual & Backlog)** | [`docs/pending-work.md`](docs/pending-work.md) |
| **Histórico Consolidado de Entregas** | [`docs/completed-work.md`](docs/completed-work.md) |
| **Contexto Geral, Regras do LD2 & Decisões** | [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) |
| **Regras de Negócio e Requisitos do LD2** | [`docs/01-prd-requirements.md`](docs/01-prd-requirements.md) |
| **Arquitetura, Stack, Testes & Subagentes** | [`docs/02-core-architecture.md`](docs/02-core-architecture.md) |
| **Modelos de Dados, Drizzle Schema & Fluxos** | [`docs/03-data-models-flows.md`](docs/03-data-models-flows.md) |
| **Roteiro de Fases & Metas (Outubro/2026)** | [`docs/04-scope-roadmap.md`](docs/04-scope-roadmap.md) |
| **Padrões de Nomenclatura e Código** | [`docs/05-coding-standards.md`](docs/05-coding-standards.md) |
| **Design System, Cores & Ergonomia (OmniDS)** | [`docs/06-design-system.md`](docs/06-design-system.md) |
