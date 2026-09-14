# OmniLabs OS - Contexto Geral e Memória do Projeto

> **Status Atual**: Camada Externa 100% Alinhada e Validada.  
> **Meta Imediata**: Entrega do MVP até **Outubro de 2026** focado exclusivamente no **Módulo do Laboratório LD2**.  
> **Princípio Fundamental**: Evoluir e unificar o que a equipe já usa, eliminando atrito e dores reais, sem inventar complexidade desnecessária.

---

## 1. O Domínio e o Cenário Real (Laboratório LD2)

* **Área de Atuação**: Laboratório de **microbiologia focado em fermentação para produção de aminoácidos**.
* **Confidencialidade & Segurança**:
  - Dados industriais e biológicos de alta sensibilidade corporativa.
  - **Zero Nuvem Externa**: Toda a aplicação e banco de dados rodam estritamente dentro da rede local da empresa (LAN).
  - **Criptografia em Repouso (SQLCipher / AES-256)**: Arquivo do banco de dados 100% criptografado no disco rígido com chave secreta no `.env`, garantindo confidencialidade total caso o arquivo seja copiado, enquanto mantém consultas textuais completas (`LIKE '%termo%'`) nativas e em alta performance.
  - Tráfego em **HTTP interno**, evitando complexidade e atrito com certificados de TI nas máquinas do laboratório.
* **Infraestrutura Física**:
  - Roda em um **computador dedicado fixo na bancada do LD2**, ligado 24/7.
  - Backend em Node.js com **Fastify** + **Drizzle ORM** + **`better-sqlite3-multiple-ciphers`** (100% TypeScript puro, sem binários Rust externos, ultraleve para operação 24/7).
  - Demais computadores do laboratório acessam diretamente pelo navegador web via IP da máquina servidora (ex.: `http://192.168.x.x:3000`).
* **Janela Operacional Semanal**:
  - Início da semana operacional: **Segunda-feira às 00:40** (entrada do 3º Turno).
  - Encerramento: **Sábado às 16:20**. (Domingo não há operação).
  - Turno Administrativo: Segunda a Sexta, das **07:30 às 17:30**.
  - Existe sobreposição entre turnos para a troca de informações entre quem sai e quem entra.

---

## 2. Os 3 Pilares do MVP (Módulo LD2 para Outubro)

O escopo de Outubro substitui e unifica as aplicações isoladas e planilhas paralelas nos 3 pilares a seguir:

### Pilar 1: Caderno de Turno Digital (Passagem, Feed & Ocorrências)
* **Fim da Armadilha do `localStorage`**: Persistência instantânea no banco de dados central assim que o analista digita e adiciona uma ocorrência. Não há risco de perda de dados se o usuário esquecer de apertar "Enviar" ou se trocar de computador.
* **Colaboração em Tempo Real**: Se um analista registra um card no PC 1 da bancada, o PC 2 recebe a atualização ao vivo.
* **Ocorrência do Turno (O que foi feito)**: Registro conciso contendo `Horário` (automático do sistema), `Responsável que executou` e `Texto descritivo`. Sem sobrecarga de uploads pesados no MVP.
* **Congelamento e Imutabilidade com Auditoria Nominal**: Encerrado o turno, os registros ficam congelados. Edições retroativas são restritas ao Supervisor com justificativa e carimbo de auditoria nominal.
* **Entidades Distintas: Pendência vs. Aviso**:
  - **Pendência** (Acionável): Possui prioridade (`Alta`, `Média`, `Baixa`), direcionamento (`Pessoa específica`, `Turno específico` ou `Geral`) e ciclo de vida (Aberta -> Concluída).
  - **Aviso** (Informativo/Broadcast): Comunicados gerais ou direcionados para ciência da equipe.
* **Quadro de Pendências & Avisos (Kanban de 4 Colunas)**:
  - 3 colunas para Pendências (`Alta`, `Média`, `Baixa`) + 1 coluna para `Avisos`.
* **Projetado para Apresentação no Microsoft Teams**: A passagem de turno é apresentada/gravada no Teams; a interface do sistema serve como um painel limpo e direto para quem está assistindo e registrando o alinhamento.
* **Performance Otimizada**: Carrega por padrão apenas a janela de trabalho recente (últimos dias/semana), com busca sob demanda para o histórico passado, garantindo abertura instantânea da tela.

### Pilar 2: Controle de Atividades & Limpezas de Rotina
* **Fim do Grid Gigante (40 linhas x 30 colunas)**: Substituição da matriz cansativa que exigia `Ctrl + F` por uma experiência limpa e produtiva.
* **Visão Dupla**:
  - **"Minhas Atividades"**: Visão personalizada do analista logado com checklist rápido de suas tarefas pendentes para conclusão em 1 clique.
  - **"Visão do Laboratório"**: Visão macro consolidada para a gestão e acompanhamento geral.
* **Cálculo de Vencimento**: Conta X dias corridos a partir da última vez em que a atividade foi executada.
* **Sincronização Bidirecional com o Turno**:
  - Ao ticar a atividade como concluída -> o sistema atualiza a atividade e **injeta automaticamente o registro no feed do turno** da pessoa que concluiu.
  - Se a pessoa remover a conclusão do seu histórico de turno -> a atividade **retorna automaticamente ao status de pendente** (consistência total).
* **Escalação Automática de Prioridades**:
  - Tarefa/limpeza **vencida** -> Promovida automaticamente para **Alta Prioridade** no Quadro de Pendências.
  - Tarefa que vence hoje/amanhã -> **Média Prioridade**.
* **Gestão Cadastral Nativa (Adeus Planilha Paralela)**:
  - Definição de periodicidade (semanal, mensal, flexível/"quando der").
  - Associação nominal de **Responsável Titular** e **Suplente** (para cobrir folgas e outros turnos).

### Pilar 3: Cronograma Semanal Digital
* **Digitalização da Planilha Impressa**: O cronograma que hoje é montado no Excel e impresso em papel passa a viver digitalmente na plataforma, com planejamento para a semana seguinte.
* **Gantt Semanal (Seg 00:40 a Sáb 16:20)**:
  - **Testes de Fermentação**: Identificados por código padrão gerado automaticamente via menus `select` hierárquicos (**Planta** -> **Aminoácido** -> **Cepa**), eliminando erros de digitação. Vinculado ao objetivo técnico do teste e alocação nos reatores/biorreatores (**jars / s-jars**, até 6 condições por painel).
  - **Atividades de Suporte (P&D)**: Ocupam as últimas linhas do Gantt (com código, prazo e responsável).
  - **Área Descritiva Inferior**: Espaço abaixo do Gantt detalhando o descritivo completo das Atividades de Suporte e os **Pontos de Atenção** (globais ou específicos do teste).

---

## 3. Ergonomia de Tela & Dashboard (O Dia a Dia)

* **Dashboard Principal (Visão Geral da Bancada)**:
  - **Área Central de Destaque**: O Cronograma Semanal estilo Gantt, permitindo que a equipe veja a evolução do dia e da semana (ex.: "às 03:00 inicia a fase do teste tal").
  - **Widget Lateral ("Meu Foco Hoje")**: Minicard com as atividades/limpezas do usuário logado + avisos de alta prioridade ou tarefas direcionadas nominalmente a ele.
* **Navegação Sem Atrito**:
  - Abas diretas para: `Dashboard`, `Caderno de Turno & Pendências`, `Atividades & Limpezas`, `Cronograma Semanal` e `Administração`.

---

## 4. Autenticação, Usuários e Governança Nominal

* **Bootstrap de Instalação (Dia Zero)**:
  - Na primeira execução com banco zerado, o sistema abre o setup inicial para criação do primeiro usuário mestre (Bryan / Supervisor). Após isso, o modo setup se fecha permanentemente.
* **Fluxo de Convite & "Primeiro Acesso" (Sem dependência de e-mail de TI)**:
  - O Supervisor pré-cadastra o usuário: Nome Completo, E-mail Corporativo (`usuario@br.ajinomoto.com`), Turno Habitual e Permissões.
  - O analista clica em *"Primeiro Acesso"* na tela de login, insere o e-mail corporativo.
  - O sistema extrai automaticamente o nome antes do arroba como o login oficial (ex: `bryan.fernandes`).
  - O analista define sua senha pessoal e ativa o acesso. Nos logins seguintes, entra com `usuário + senha`.
* **Turnos Habitual, Realocação & Guardrails**:
  - Cada colaborador tem um turno padrão fixo (1º, 2º, 3º ou Adm).
  - Capacidade de sobrescrever/realocar temporariamente o turno (por 1 dia ou períodos mais longos).
  - **Guardrail**: Alerta visual preventivo caso um usuário registre ocorrências fora do horário de seu turno cadastrado.
* **Matriz Granular de 3 Níveis por Módulo**:
  Cada tela/módulo pode ser configurada para o usuário em:
  1. `SEM ACESSO` (Aba oculta/bloqueada).
  2. `SOMENTE LEITURA` (Visualiza dados, consulta parâmetros técnicos de engenharia e pode **imprimir relatórios**, sem poder editar/deletar).
  3. `ACESSO COMPLETO` (Criação, edição e exclusão de registros).
* **Fim do Usuário Genérico "admin"**: Todo usuário é uma pessoa real. Qualquer intervenção ou retificação grava o nome do responsável na Trilha de Auditoria.

---

## 5. Convenções de Código e Idiomas (Regra de Ouro)

1. **Nomes de Pastas e Arquivos**: Sempre em **`kebab-case`** e em **Inglês** (ex: `core-server/`, `os-client/`, `shift-handover/`).
2. **Código-Fonte**: 100% em **Inglês** (variáveis, funções, classes, interfaces, rotas, modelos Prisma).
3. **Comentários de Código**: 100% em **Português** (explicando regras de negócio do LD2 e decisões técnicas).
4. **Interface do Usuário (UI)**: 100% em **Português (pt-BR)** (todos os botões, títulos, placeholders, badges de status, etc.).

---

## 6. Progresso da Engenharia & Status da Fase 1

* **Fase Atual**: **Fase 1 - Fundação, Monorepo, Banco Criptografado & Autenticação Nominal**.
* **Entregas Concluídas**:
  - Monorepo configurado com workspaces (`core-server`, `os-client`, `e2e-tests`).
  - Autoboot criptográfico com geração segura de chaves (AES-256 e HMAC-SHA256 via CSPRNG de 256 bits).
  - Banco de dados SQLite integrado com **SQLCipher** via `better-sqlite3-multiple-ciphers` e **Drizzle ORM** com modo WAL ativado.
  - As 6 tabelas relacionais de governança criadas e migradas: `users`, `work_shifts`, `work_shift_schedules`, `user_shift_assignments`, `system_modules`, `user_module_permissions`.
  - Blindagem OWASP Top 10:
    - Mascaramento global de erros (`setErrorHandler` no Fastify, zero stack traces ou caminhos expostos).
    - Proteção de cabeçalhos HTTP com `@fastify/helmet`.
    - Cookies seguros com flag `HttpOnly` e `SameSite=Lax` (blindados contra roubo XSS).
    - Validação de entrada estrita com Zod (domínio obrigatório `@br.ajinomoto.com` e separador `_`).
    - Proteção anti-enumeração de usuários (respostas 401 uniformes para login).
  - Módulo de Autenticação e Governança Nominal implementado:
    - Setup do 1º Supervisor (trancamento definitivo anti-invasão).
    - Convite de operadores e Primeiro Acesso com extração de username.
    - Login nominal com hash `bcrypt` e tokens JWT (12h de expiração para o turno).
    - Consulta de sessão `/me` e logout seguro.
  - Suíte de testes do Vitest (TDD) com **11 testes passando 100%** (tempo de execução: ~1.6s).
  - Especificação formal do **OmniDS (Design System & Ergonomia Visual)** documentada em [`docs/06-design-system.md`](docs/06-design-system.md) (paleta neutra pura, taxonomia de botões, regras WCAG e anti-padrões).
* **Próxima Etapa da Fase 1**:
  - Configuração da casca do frontend (`os-client` com Vite, React, TailwindCSS, Lucide Icons e telas de Setup Inicial, Primeiro Acesso e Login).


