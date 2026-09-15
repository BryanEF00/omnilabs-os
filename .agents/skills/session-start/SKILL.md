---
name: session-start
description: >-
  Use esta skill sempre que o usuário digitar '/start', 'iniciar sessão' ou abrir um novo
  chat de trabalho no OmniLabs OS. Executa a auditoria ativa de sincronia com o GitHub,
  inicia os servidores Fastify e Vite se necessário, lê a memória viva e apresenta o briefing executivo.
---

# Procedimento de Inicialização de Sessão (OmniLabs OS)

Esta skill define o roteiro padrão de abertura de sessão para garantir que o ambiente
esteja pronto, o código sincronizado entre múltiplas máquinas, os servidores online
e o foco alinhado antes de qualquer alteração de código.

---

## Etapa 1: Auditoria Ativa de Sincronia com o GitHub

Como o desenvolvimento ocorre em múltiplas máquinas (notebook, desktop de casa e computador da bancada do LD2), a máquina local nunca deve ser considerada a única fonte da verdade.

1. **Buscar metadados remotos**:
   Executar `git fetch origin` para consultar o estado mais recente no GitHub sem alterar a árvore local.
2. **Comparar paridade de ramos**:
   Executar `git status` para avaliar a relação com o branch remoto (`origin/main` ou branch ativa):
   - **Cenário A: Sincronizado (`up to date`)**: Prosseguir para a Etapa 2.
   - **Cenário B: Atrás do Remoto (`behind`)**:
     - Se a árvore de trabalho estiver limpa: executar `git pull --ff-only` para trazer as atualizações feitas em outro computador de forma segura.
     - Se houver arquivos locais modificados não commitados: **NÃO executar pull**. Alertar o Bryan imediatamente no briefing para evitar perda ou conflito de código.
   - **Cenário C: À frente do Remoto (`ahead`)**:
     - Alertar no briefing que existem commits locais pendentes de envio (`git push`).
3. **Identificar último commit**:
   Executar `git log -1 --oneline` para registrar a identificação do commit ativo.

---

## Etapa 2: Verificação e Inicialização do Servidor de Desenvolvimento

1. **Verificar processos ativos**:
   Consultar se o servidor de desenvolvimento já está rodando em segundo plano (via `manage_task` ação `list` ou teste de resposta das portas).
2. **Se o servidor NÃO estiver ativo**:
   - Iniciar os serviços via `run_command`:
     - `CommandLine`: `"npm run dev"`
     - `Cwd`: raiz do projeto
     - `IsDaemon`: `true` (mantém o processo Fastify + Vite em segundo plano)
     - `WaitMsBeforeAsync`: `5000` (aguarda 5 segundos para confirmar que não houve erro de porta ou inicialização imediata)
   - Confirmar se o backend Fastify (`core-server` na porta configurada) e o frontend Vite (`os-client` na porta 5173) iniciaram corretamente.
3. **Se o servidor JÁ estiver ativo**:
   - Manter a instância existente sem tentar reiniciar, evitando erros de conflito de porta (`EADDRINUSE`).

---

## Etapa 3: Resgate da Memória Viva do Projeto

1. Ler o arquivo [`docs/pending-work.md`](docs/pending-work.md) para resgatar:
   - Qual foi o último marco concluído.
   - Qual é a tarefa prioritária imediata no checklist.
2. Caso a tarefa exija consulta a especificações, consultar sob demanda os documentos relevantes:
   - Regras de negócio do LD2: [`docs/01-prd-requirements.md`](docs/01-prd-requirements.md)
   - Arquitetura e testes: [`docs/02-core-architecture.md`](docs/02-core-architecture.md)
   - Modelos de dados e banco: [`docs/03-data-models-flows.md`](docs/03-data-models-flows.md)
   - Design System (OmniDS): [`docs/06-design-system.md`](docs/06-design-system.md)

---

## Etapa 4: Briefing Executivo ao Bryan

Apresentar uma mensagem de boas-vindas estruturada, concisa e objetiva:

```markdown
🚀 **OmniLabs OS — Sessão Iniciada**

- 📌 **Git & GitHub**: Branch `[nome]`, status [Sincronizado / Atualizado via pull / Alerta], último commit: `[hash] [mensagem]`.
- ⚡ **Servidores**: Fastify (`core-server`) e Vite (`os-client`) [Online e operantes / Já em execução].
- 📋 **Onde Paramos**: [Resumo em 1 a 2 linhas do marco anterior].
- 🎯 **Próximo Passo Imediato**: [Tarefa exata a ser realizada agora].

Podemos avançar com essa tarefa ou você prefere ajustar alguma prioridade antes de começarmos?
```

**Regra Crítica**: Parar a execução aqui e aguardar a resposta do Bryan antes de alterar qualquer código ou criar novos arquivos de implementação.
