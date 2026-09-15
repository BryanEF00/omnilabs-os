# OmniLabs OS - Histórico de Entregas Concluídas (`docs/completed-work.md`)

> **Finalidade**: Registro histórico consolidado de todas as entregas técnicas, arquiteturais e de interface do usuário já validadas e em produção local.

---

## 1. Fundação, Monorepo & Infraestrutura Criptográfica (Fase 1)

* **Arquitetura Monorepo**:
  - Configurado com workspaces npm: `core-server` (backend Fastify), `os-client` (frontend SPA) e `e2e-tests` (testes ponta a ponta).
  - Comunicação interna estritamente via rede local (LAN), sem dependência de nuvem externa.
* **Autoboot Criptográfico**:
  - Geração segura de chaves AES-256 e HMAC-SHA256 via CSPRNG de 256 bits nativo do Node.js (`crypto`).
  - Geração automática e idempotente de chaves e variáveis no `.env` do servidor.
* **Banco de Dados Criptografado em Repouso (SQLCipher)**:
  - SQLite integrado com extensão SQLCipher através da biblioteca `better-sqlite3-multiple-ciphers`.
  - Mapeamento e queries declarativas com **Drizzle ORM** em TypeScript puro.
  - Modo WAL (`Write-Ahead Logging`) ativado para suporte a concorrência 24/7.
  - 6 tabelas relacionais de governança criadas e migradas:
    1. `users` (dados cadastrais, papel, status, hash bcrypt).
    2. `work_shifts` (definição dos turnos de trabalho do LD2: 1º, 2º, 3º e ADM).
    3. `work_shift_schedules` (janelas operacionais de segunda 00:40 a sábado 16:20).
    4. `user_shift_assignments` (associação nominal de analistas a turnos).
    5. `system_modules` (módulos do sistema: LD2, etc.).
    6. `user_module_permissions` (níveis de acesso: visualizador, operador, supervisor).
* **Blindagem de Segurança OWASP Top 10**:
  - Mascaramento global de erros (`setErrorHandler` no Fastify, zero stack traces ou caminhos expostos).
  - Proteção de cabeçalhos HTTP com `@fastify/helmet`.
  - Cookies de sessão com flags `HttpOnly`, `SameSite=Lax` e `Path=/` (blindados contra roubo XSS).
  - Validação estrita de esquemas com **Zod** (domínio obrigatório `@br.ajinomoto.com` e separador `_`).
  - Proteção anti-enumeração de usuários com mensagens e tempos de resposta 401 uniformes.
* **Autenticação & Governança Nominal**:
  - Setup inicial exclusivo do 1º Supervisor (Dia Zero) com trancamento definitivo anti-invasão.
  - Convite de operadores e fluxo de Primeiro Acesso com extração e sugestão automática de `username`.
  - Login nominal do dia a dia com hash `bcrypt` (12 rounds) e tokens JWT com expiração de 12 horas.
  - Rotas de sessão `/me` e logout seguro com invalidação imediata de cookie.
* **Qualidade de Código & Testes**:
  - 100% em TypeScript estrito.
  - Suíte de testes automatizados com **Vitest** cobrindo autenticação, migrações, criptografia e segurança (11 testes verdes em ~1.6s).

---

## 2. Design System OmniDS & Frontend SPA (`os-client`)

* **Setup do Frontend**:
  - SPA moderno construído com **Vite 6**, **React 18** e **TypeScript**.
  - Configuração do **Tailwind CSS** com tokens corporativos do OmniDS (`brand-primary: #de3636`, `bg-app: #f8fafc`, `neutral-dark: #0f172a`).
  - Primitivas de UI estilizadas segundo diretrizes do shadcn/ui (`button`, `input`, `label`, `card`).
  - Logotipo vetorial oficial em SVG da Ajinomoto (`AjinomotoLogo`).
* **Tela de Acesso Split-Screen Dual-Panel**:
  - **Painel Hero (Coluna Esquerda)**:
    - Fundo em degradê oficial Vermelho Ajinomoto (`#de3636` a `#9f1818`).
    - Cabeçalho limpo com logotipo oficial branco e identificação do módulo: *"Laboratório de Desenvolvimento II"*.
    - Rodapé institucional com marca d'água discreta: `OmniLabs OS • v1.0.0`.
    - Seletor de animações modernizado em **vidro acetinado translúcido** (`bg-white/16`, `backdrop-blur-md`).
    - **As 3 Animações Biológicas do LD2**:
      1. *Bolhas de Fermentação*: Microbolhas de CO2 com oscilação senoidal procedural.
      2. *Ondas de Fluido*: Camadas de ondas SVG com gotas em escorrimento de vidro.
      3. *Microrganismos*: Canvas 2D com física browniana, profundidade Z e mitose ótica simétrica.
    - **Sentinela 24/7 Sleep Guard**: Pausa imediata de timers e `requestAnimationFrame` quando a aba do navegador fica em segundo plano (`document.hidden === true`), poupando ciclos de CPU/GPU na bancada.
  - **Painel de Governança (Coluna Direita)**:
    - Formulário de login estritamente nominal por `username` (`nome_sobrenome`), sem menção a e-mail no dia a dia.
    - Cabeçalho padronizado em Sentence case (`Acesso ao sistema`), sem subtítulo.
    - **Zero Layout Shift (CLS = 0)**: Slot de feedback de erro pré-alocado (`min-h-[44px]`), garantindo que alertas de validação não empurrem campos nem botões.
    - Telas auxiliares para **Primeiro Acesso** (com validação do e-mail corporativo `@br.ajinomoto.com`) e **Configuração Inicial** (Dia Zero).
* **Diretrizes e Regras de Governança Estabelecidas**:
  - Regra de Zero Layout Shift documentada formalmente na tabela de anti-padrões de [`docs/06-design-system.md`](06-design-system.md).
  - Regra 13 do [`AGENTS.md`](../AGENTS.md): Obrigatoriedade de proposta conceitual + **preview visual prévio** + aprovação explícita do Bryan antes de qualquer codificação de UI.

* **Calibração Visual Fina & Identidade LD2 (Fechamento da Fase 1)**:
  - **Tipografia**: Incorporada a família **`Outfit`** (Google Fonts) combinada com `Inter` como fonte padrão do sistema, trazendo curvas arredondadas, estética moderna e leveza visual.
  - **Mascote & Identidade**: Favicon oficial em SVG do mascote **Ajipanda** (`public/favicon.svg`) e `<title>` da aplicação padronizado para **`LD II - Ajinomoto do Brasil`**.
  - **Logotipo Ajinomoto**: Redimensionado para **`10rem`** (160px de largura) com diagramação equilibrada via flexbox `gap` e `margin-top: 2.6rem`.
  - **Tokens de Raio (Border Radius)**: Adicionados os tokens semânticos `card: 1.25rem` (20px) e `card-lg: 1.5rem` (24px) no `tailwind.config.js`. Card principal configurado com `rounded-card-lg` (24px).
  - **Ergonomia do Formulário**:
    - Subtítulo explicativo: *"Insira suas credenciais para continuar."*.
    - Remoção de divisórias rígidas acima do link de ativação de conta.
    - Hover de linha inteira com sublinhado em *"Primeiro acesso? Ativar conta"*.
    - Botão primário com estado inativo cinza neutro (`#e2e8f0` / `#94a3b8`) e `cursor-not-allowed` até preenchimento completo dos campos.

---

## 3. Blindagem OWASP, Padronização Canônica (`/api`), Fallback Universal com Código de Incidente & E2E Playwright (Fase 2)

* **Prevenção de Vazamento de Rotas e Informações (OWASP A05)**:
  - Implementado `app.setNotFoundHandler` no `core-server/src/app.ts` retornando payload mascarado padrão `{ success: false, error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } }` com status 404.
  - Eliminação completa do comportamento padrão do Fastify que vazava nomes de rotas e verbos HTTP internos (`Route POST:... not found`).
  - Cenário 10 adicionado em `core-server/tests/auth.test.ts` via ciclo TDD.
* **Fallback Universal de Exceções com Código de Rastreio de Incidente (`incidentId`)**:
  - Atualizado `app.setErrorHandler` no Fastify com tratamento específico para `AppError`, erros de validação `ZodError` e sanitização tipada de erros nativos Fastify (400-499).
  - Fallback universal para falhas não mapeadas / status 500 gerando dinamicamente identificador auditável no formato `INC-<TIMESTAMP_B36>-<RANDOM_B36>` (ex: `INC-MU2WX6SJ-VRSZ`).
  - Emissão de log completo no console do servidor (`🚨 [OmniLabs OS - Incidente INC-...]: <error>`) para auditoria de engenharia interna, mascarando 100% dos dados técnicos para o cliente (zero stack traces, zero caminhos de disco no Windows `D:\Projetos`).
  - Cenário 11 adicionado em `core-server/tests/auth.test.ts` via ciclo TDD com validação de regex e asserções estritas de não-vazamento.
* **Erradicação Completa de `/v1` & Normalização sob `/api` Canônico**:
  - Remoção de qualquer prefixo residual `/v1` em `os-client/src/lib/api.ts`. O cliente normaliza qualquer endpoint relativo exclusivamente sob o padrão canônico `/api`.
  - Atualização da classe `ApiError` e da interface `ApiResponse` para incluir a propriedade `incidentId?: string`.
  - Remoção de menção a `v1` na interface do usuário em `AuthenticatedApp`.
* **Restauração do Fluxo de Setup do Primeiro Supervisor (Dia Zero)**:
  - Resolução do erro silencioso em que requisições para `/api/v1/auth/setup-status` falhavam com 404, forçando erroneamente a ida para a tela de login.
  - Atualização do `authStore.ts` e do roteamento condicional em `os-client/src/App.tsx`: quando `setupRequired === true`, a rota `/setup` é forçada e todas as demais rotas são redirecionadas para `/setup`, garantindo o isolamento da configuração inicial antes da liberação do login normal.
* **Mapeamento Defensivo e Anti-Enumeração nos Formulários de Acesso**:
  - Alinhamento do tratamento de erros em `LoginForm.tsx`, `FirstAccessForm.tsx` e `SetupInitialForm.tsx`.
  - Retorno de mensagens uniformes anti-enumeração (`Usuário ou senha incorretos.`), instruções de rede para quedas de conexão (`NETWORK_ERROR`) e orientação com exibição do código de incidente auditável (`Instabilidade no servidor (Código: INC-XXXX-YYYY). Contate a liderança.`).
* **Suíte de Testes Ponta a Ponta (E2E) com Playwright**:
  - Inicializado workspace dedicado `e2e-tests` com `@playwright/test` e navegador Chromium real.
  - Implementado `e2e-tests/tests/auth-flow.spec.ts` cobrindo 3 cenários reais de navegação e renderização:
    1. *Cenário A*: Chaveamento automático entre Dia Zero (`/setup`) e login padrão (`/login`).
    2. *Cenário B*: Validação defensiva de formulário com asserções estritas contra vazamento de rotas ou dados do sistema operacional.
    3. *Cenário C*: Intercepção de rotas inexistentes ou com prefixo legado `/v1`, redirecionando com segurança.
  - 100% verde: 13 testes unitários/integração no backend e 3 testes E2E no Chromium.

