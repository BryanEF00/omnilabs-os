# OmniLabs OS - Documento de Requisitos do Produto (PRD)

> **Módulo Foco**: Laboratório LD2 (Microbiologia / Fermentação para Produção de Aminoácidos)  
> **Versão**: 1.0 (MVP)  
> **Prazo Alvo**: Outubro de 2026  
> **Classificação**: Confidencial / Uso Interno  

---

## 1. Visão Geral e Contexto Operacional

### 1.1 Objetivo do Produto
O **OmniLabs OS (Módulo LD2)** é uma plataforma operacional integrada que centraliza e moderniza a rotina de trabalho do laboratório de microbiologia. O sistema substitui aplicações legadas fragmentadas, planilhas Excel desconectadas e anotações manuais por um ecossistema único, confiável e com fluxo linear.

### 1.2 O Cenário de Trabalho (Laboratório 24/7)
* **Domínio de Aplicação**: Processos biotecnológicos de fermentação para síntese e produção de aminoácidos.
* **Segurança e Privacidade**:
  - Dados biológicos e de rendimento industrial são ultraconfidenciais.
  - O sistema opera **100% dentro da rede local da empresa (LAN)**, sem envio ou sincronização com nuvens públicas externas.
  - Comunicação via **HTTP na rede interna**, sem necessidade de instalação de certificados de segurança individuais da TI corporativa nas máquinas da bancada.
* **Infraestrutura Física**:
  - Aplicação hospedada em um **computador dedicado fixo na bancada do LD2**, operando 24 horas por dia, 7 dias por semana.
  - Acesso nos demais computadores da bancada via navegador web (Edge/Chrome) diretamente pelo IP/porta da máquina servidora (`http://192.168.x.x:3000`).
* **Ciclo Operacional Semanal**:
  - A semana de trabalho inicia na **Segunda-feira às 00:40** (entrada do 3º Turno).
  - A semana de trabalho encerra no **Sábado às 16:20**. Aos domingos o laboratório não opera.
  - **Turno Administrativo (Adm)**: Segunda a Sexta-feira, das 07:30 às 17:30.
  - Existe sobreposição planejada entre turnos para a passagem de turno presencial.

---

## 2. Atores, Acesso e Governança Nominal

### 2.1 Princípio da Auditoria Nominal
* Fica expressamente vedada a existência de usuários genéricos ou anônimos (ex.: conta "admin").
* Todas as ações críticas, cadastros, conclusões de tarefas e retificações são registradas vinculando o ID, Nome Completo e carimbo de data/hora do colaborador responsável.

### 2.2 Bootstrap de Instalação (Dia Zero)
* Na primeira inicialização da aplicação com a base de dados vazia, o sistema ativa automaticamente a tela de **Setup Inicial**.
* O mantenedor técnico (Bryan) ou o Supervisor cria o primeiro usuário mestre nominal.
* Uma vez criado o primeiro usuário, o modo de setup é permanentemente desativado.

### 2.3 Fluxo de Convite e "Primeiro Acesso" (Sem Dependência de TI)
1. **Pré-cadastro**: O Supervisor cadastra o novo usuário informando:
   - Nome Completo
   - E-mail Corporativo (ex.: `usuario@br.ajinomoto.com`)
   - Turno Habitual (1º Turno, 2º Turno, 3º Turno ou Administrativo)
   - Permissões Iniciais (Papel base e eventuais overrides)
2. **Ativação ("Primeiro Acesso")**:
   - Na tela inicial de login, o analista clica em **"Primeiro Acesso"**.
   - Insere seu e-mail corporativo.
   - O sistema valida a existência do pré-cadastro e extrai o identificador corporativo antes do `@` como seu nome de usuário oficial (ex.: `bryan.fernandes`).
   - O analista define sua senha pessoal segundo os critérios de segurança estabelecidos.
   - A conta é ativada imediatamente para logins subsequentes via `usuário + senha`.

### 2.4 Matriz de Permissões Granulares (3 Estados por Módulo)
Cada tela/módulo do sistema possui controle de acesso parametrizável em 3 níveis:
* `SEM ACESSO`: O módulo ou aba não é exibido e seu acesso é bloqueado.
* `SOMENTE LEITURA`: O usuário pode navegar, consultar parâmetros técnicos, inspecionar condições de testes dos engenheiros e **imprimir relatórios em A4**, mas não possui permissão para criar, editar ou excluir dados.
* `ACESSO COMPLETO`: Permissão irrestrita para criar, editar, movimentar e gerenciar registros no módulo.

### 2.5 Turnos Habitual, Realocação e Guardrails
* Cada colaborador possui um **Turno Habitual** cadastrado.
* **Mecanismo de Realocação**: Permite que o analista altere seu turno ativo temporariamente (por um plantão específico ou por período prolongado), evitando a necessidade de reconfiguração constante.
* **Guardrail de Prevenção de Erro**: O sistema emite um alerta preventivo se um colaborador tentar realizar lançamentos em horários divergentes do seu turno ativo cadastrado.

---

## 3. Requisitos Funcionais do MVP (Os 3 Pilares)

### 3.1 Pilar 1: Caderno de Turno Digital & Passagem de Turno

* **RF1.1 - Persistência Instantânea em Banco de Dados**: Cada ocorrência digitada pelo analista deve ser salva imediatamente no servidor no momento da confirmação. É proibido o uso de `localStorage` como área de rascunho sujeita a perda por fechamento de navegador ou troca de computador.
* **RF1.2 - Sincronização em Tempo Real (WebSockets)**: Os lançamentos realizados no PC 1 da bancada devem ser refletidos instantaneamente nos demais computadores conectados, sem necessidade de atualização manual de página (F5).
* **RF1.3 - Registro de Ocorrência do Turno**:
  - Campos obrigatórios: `Data/Hora do Registro` (gerada automaticamente pelo sistema), `Responsável pela Execução` (seleção nominal), `Texto Descritivo` da ação realizada.
* **RF1.4 - Imutabilidade e Congelamento de Turno**:
  - Ao término do período operacional do turno, os registros são congelados para edição geral.
  - Retificações em turnos passados são restritas a usuários com permissão de Supervisor, exigindo justificativa e registrando carimbo nominal na Trilha de Auditoria.
* **RF1.5 - Entidades Distintas: Pendências vs. Avisos**:
  - **Pendência**: Ação necessária com ciclo de vida (Aberta -> Concluída), prioridade definida (`Alta`, `Média`, `Baixa`) e direcionamento (`Pessoa específica`, `Turno específico` ou `Geral`).
  - **Aviso**: Mensagem de broadcast ou comunicado geral de ciência, sem ciclo de conclusão por tarefa.
* **RF1.6 - Quadro de Pendências & Avisos (Kanban Interativo)**:
  - Exibição em 4 colunas distintas: `Alta Prioridade`, `Média Prioridade`, `Baixa Prioridade` e `Avisos`.
  - Suporte a movimentação fluida de cards entre colunas (Drag and Drop).
* **RF1.7 - Modo Apresentação para Microsoft Teams**:
  - O layout da tela de passagem de turno deve possuir tipografia limpa, alto contraste e organização hierárquica, funcionando como um dashboard de apresentação durante reuniões gravadas no Teams.
* **RF1.8 - Performance e Paginação Sob Demanda**:
  - O sistema carrega por padrão apenas a janela de dados recente (semana corrente).
  - Registros históricos mais antigos são consultados sob demanda via filtros de busca, garantindo tempo de resposta inferior a 500ms.

---

### 3.2 Pilar 2: Controle de Atividades & Limpezas de Rotina

* **RF2.1 - Eliminação da Matriz Fragmentada**: Substituição do grid de 40 linhas x 30 colunas por listas operacionais inteligentes com foco em produtividade.
* **RF2.2 - Visão Dupla de Tarefas**:
  - **"Minhas Atividades"**: Filtro automático que exibe apenas as atividades sob responsabilidade do usuário logado para o dia/semana corrente, permitindo conclusão rápida com 1 clique.
  - **"Visão do Laboratório"**: Painel geral consolidado para a gestão acompanhar o cumprimento global da equipe.
* **RF2.3 - Regra de Vencimento Dinâmico**: O vencimento de cada atividade é calculado projetando X dias corridos a partir da data de sua última execução concluída.
* **RF2.4 - Sincronização Bidirecional com o Turno**:
  - Ao marcar uma atividade como concluída, o sistema registra a conclusão na atividade e **injeta automaticamente uma linha correspondente no feed do turno ativo** do analista.
  - Caso a conclusão seja removida ou desfeita no feed do turno, o sistema reverte automaticamente a atividade para o status de pendente.
* **RF2.5 - Escalação Automática de Prioridade**:
  - Atividades/limpezas com prazo **vencido** são promovidas automaticamente para a coluna de **Alta Prioridade** do Quadro de Pendências.
  - Atividades com vencimento previsto para o dia corrente ou seguinte são categorizadas como **Média Prioridade**.
* **RF2.6 - Cadastro Parametrizado de Atividades**:
  - Definição de: Nome da Atividade, Periodicidade (dias de intervalo / flexível), **Responsável Titular** e **Responsável Suplente** (para cobertura de folgas).

---

### 3.3 Pilar 3: Cronograma Semanal Digital

* **RF3.1 - Digitalização do Planejamento Semanal**: Substituição da planilha impressa por um módulo digital planejado previamente para a semana seguinte (ciclo Segunda 00:40 a Sábado 16:20).
* **RF3.2 - Matriz de Fermentação estilo Gantt**:
  - Exibição visual da alocação de testes nos biorreatores (**jars / s-jars**, até 6 condições simultâneas por painel).
  - Identificação clara do avanço das fases da fermentação ao longo dos turnos e dias da semana.
* **RF3.3 - Geração Estruturada do Código do Teste**:
  - O código de identificação do teste é gerado de forma assistida através de menus de seleção hierárquicos:
    - **Planta** (Sigla corporativa)
    - **Aminoácido** (Sigla do produto)
    - **Cepa** (Sigla do microrganismo)
    - Número sequencial do teste
  - Elimina erros humanos de digitação e duplicidades.
* **RF3.4 - Atividades de Suporte Técnico (P&D)**:
  - Demandas pontuais ou extraordinárias (análises físico-químicas, validação de equipamentos) ocupam as últimas linhas da grade Gantt, com código identificador, descrição sucinta, prazo limite e responsável.
* **RF3.5 - Área Descritiva Inferior**:
  - Espaço dedicado abaixo do gráfico Gantt contendo o descritivo aprofundado dos Suportes e os **Pontos de Atenção** (globais da semana ou específicos atrelados a determinado teste).

---

### 3.4 Dashboard Integrado da Bancada (Tela Inicial)

* **RF4.1 - Layout Unificado**:
  - **Destaque Principal**: Gráfico Gantt do Cronograma Semanal visível de imediato para acompanhamento dos prazos e transições de fase da fermentação.
  - **Widget Lateral ("Meu Foco Hoje")**: Lista interativa contendo:
    - Checkbox das limpezas/atividades atribuídas ao usuário logado para o dia.
    - Avisos gerais vigentes.
    - Pendências de alta prioridade direcionadas ao usuário ou ao seu turno.

---

## 4. Requisitos Não Funcionais (RNF)

* **RNF01 - Tempo de Carregamento**: Telas principais e requisições de feed devem carregar em tempo inferior a 500ms na rede local.
* **RNF02 - Autonomia Operacional (Zero TI)**: A aplicação não deve depender de conexão com internet, serviços em nuvem externa ou permissões administrativas no domínio do Windows.
* **RNF03 - Integridade de Dados**: Uso de SQLite com WAL (Write-Ahead Logging) para garantir alta performance concorrente e integridade transacional contra quedas de energia.
* **RNF04 - Testabilidade Automatizada Obrigatória**:
  - **Playwright**: Cobertura E2E de todas as interações de UI críticas (autenticação, drag-and-drop no Kanban, conclusão bidirecional de atividades).
  - **Vitest**: Cobertura de testes unitários e de integração de todas as rotas e regras de negócio do backend.
* **RNF05 - Padrão Visual e Acessibilidade**:
  - Uso estrito de Design Tokens via Tailwind CSS e componentes padronizados shadcn/ui.
  - Contraste visual adequado para uso diurno e noturno (Dark Mode nativo para o 3º turno/madrugada).
