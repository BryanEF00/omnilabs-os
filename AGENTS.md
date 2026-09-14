# OmniLabs OS - Diretrizes do Agente & Índice de Conhecimento (`AGENTS.md`)

> **Propósito**: Guia enxuto de comportamento e indexador de documentação, carregado no início de toda sessão.

---

## 1. Regras Comportamentais Inegociáveis

1. **Tomada de Decisão**: **NUNCA inferir ou presumir decisões de negócio ou arquitetura**. Exponha prós e contras técnicos com clareza e aguarde a decisão explícita do Bryan.
2. **Ritmo da Conversa**: **Um tópico por vez**. Evite múltiplos questionamentos simultâneos.
3. **Digitação por Voz**: O Bryan utiliza transcrição de voz ("pensar em voz alta"). Interprete a intenção de engenharia com naturalidade.
4. **Convenção de Idiomas**:
   - **Código e Identificadores**: 100% em **Inglês** (`kebab-case` para arquivos, `camelCase` para funções/variáveis).
   - **Comentários de Código**: 100% em **Português**.
   - **Interface do Usuário (UI)**: 100% em **Português (pt-BR)**.
5. **Revisão Granular de Banco de Dados**: Toda e qualquer tabela, campo, tipo e restrição a ser criada no banco de dados deve ser apresentada e **revisada campo por campo com o Bryan** antes da criação. Nada entra no banco sem que ele concorde e saiba explicar 100% da finalidade técnica.
6. **Qualidade Extrema sobre Velocidade**: O foco é solidez, domínio técnico e qualidade cirúrgica. Nenhum código entra em lote massivo sem que cada detalhe tenha sido compreendido e aprovado.
7. **Revisão Granular de Testes Automatizados**: Todo e qualquer teste automatizado (unitário no Vitest ou E2E no Playwright) deve ter seus **cenários, dados de entrada e asserções apresentados e validados previamente com o Bryan**. Nada é testado no escuro; cada teste deve ter finalidade clara e aprovada por ele.
8. **Comunicação Conceitual em Linguagem Humana**: Sempre apresentar propostas, revisões e códigos explicando primeiro o **conceito prático, o porquê da escolha e a finalidade no mundo real**, em linguagem humana e acessível, sem despejar sintaxes brutas ou jargões herméticos.
9. **Prevenção de Travamentos e Sentinela de Comandos**:
   - **Zero Código Inline no PowerShell**: Nunca executar scripts multilinhas com aspas e escapes inline (`node -e` ou `tsx -e`). No Windows/PowerShell isso causa congelamento de stdin (espera fantasma de teclado). Sempre gravar o código em arquivo de script (`.ts` ou `.js`) e executá-lo diretamente.
   - **Margem Síncrona Adequada**: Comandos habituais devem rodar com margem síncrona alta (`WaitMsBeforeAsync: 10000`) para responderem no mesmo instante sem ir para segundo plano à toa.
   - **Alarme Sentinela Ativo**: Todo processo longo enviado para segundo plano deve ser acompanhado de um timer via ferramenta `schedule` (máximo 30s a 60s) para auditar os logs e o status. Se o log tiver 0 bytes ou o processo estagnar, abortar imediatamente (`kill`) e investigar o motivo com o Bryan, eliminando esperas cegas no escuro.
10. **Sincronização Contínua com GitHub**: Todo e qualquer commit validado e realizado no repositório local deve ser imediatamente enviado ao GitHub via `git push`, mantendo o repositório remoto sempre espelhado e pronto para ser consumido na máquina do laboratório.
11. **Commits Atômicos Automáticos por Marco Validado**: O agente deve agir de forma proativa na persistência do código, sem que o Bryan precise solicitar ou lembrar de salvar. Assim que qualquer unidade lógica for concluída e validada (compilação limpa no `npm run build` / `tsc` e testes 100% verdes no `npm test`), o agente deve imediatamente realizar o commit semântico (padrão *Conventional Commits*) e executar o `git push` para o GitHub.
12. **Portabilidade Multi-máquina & Caminhos Estritamente Relativos**: Nunca utilizar caminhos absolutos ou letras de unidade (`C:`, `D:`) em código, scripts, testes, configurações ou documentação. O Bryan desenvolve em múltiplas máquinas (notebook, desktop de casa, computador da bancada do LD2). Toda resolução de caminhos deve ser 100% relativa à raiz do projeto ou ao arquivo em execução (`import.meta.url`, `process.cwd()`, links relativos em Markdown).

---

## 2. Procedimento de Inicialização (Checklist Rápido)

Ao iniciar uma nova conversa:
1. **Git Sync**: Verificar o status do repositório (`git status` / `git pull` quando aplicável) para sincronizar trabalho entre computadores.
2. **Consulte o Índice abaixo** e leia apenas os arquivos relevantes para a tarefa solicitada, evitando injeção desnecessária de tokens.

---

## 3. Índice de Documentação (Onde Consultar Cada Informação)

| Assunto / Necessidade | Arquivo de Referência |
| :--- | :--- |
| **Contexto Vivo, Fase Atual & Decisões** | [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) |
| **Regras de Negócio e Requisitos do LD2** | [`docs/01-prd-requirements.md`](docs/01-prd-requirements.md) |
| **Arquitetura, Stack, Testes & Subagentes** | [`docs/02-core-architecture.md`](docs/02-core-architecture.md) |
| **Modelos de Dados, Prisma Schema & Fluxos** | [`docs/03-data-models-flows.md`](docs/03-data-models-flows.md) |
| **Roteiro de Fases & Metas (Outubro/2026)** | [`docs/04-scope-roadmap.md`](docs/04-scope-roadmap.md) |
| **Padrões de Nomenclatura e Código** | [`docs/05-coding-standards.md`](docs/05-coding-standards.md) |
| **Design System, Cores & Ergonomia (OmniDS)** | [`docs/06-design-system.md`](docs/06-design-system.md) |
