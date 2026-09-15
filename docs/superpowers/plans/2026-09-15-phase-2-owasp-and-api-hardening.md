# Phase 2: OWASP Hardening, Universal Fallback Error Handler & Day-Zero Setup with Playwright E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blindar a aplicação contra vazamento de dados de infraestrutura (OWASP A05), implementar fallback universal de erros com código de rastreio de incidentes no backend, padronizar rotas sob o prefixo canônico `/api`, restaurar o fluxo de Setup Inicial (Dia Zero) do Primeiro Supervisor e validar a integração real da UI via Playwright E2E.

**Architecture:** No backend (`core-server`), o Fastify implementa `setNotFoundHandler` mascarando rotas 404 e expande `setErrorHandler` para agir como um funil universal que gera códigos de incidentes auditáveis (`incidentId`) para erros não tratados. No frontend (`os-client`), o cliente `api.ts` normaliza rotas exclusivamente sob `/api` (eliminando `/v1`), o `authStore.ts` e `App.tsx` restauram o direcionamento obrigatório para a tela de Setup Inicial no Dia Zero, e os formulários de acesso exibem mensagens institucionais amigáveis. No workspace `e2e-tests`, o Playwright executa testes ponta a ponta navegando no Chromium real para garantir que a UI e a API operem sem falhas de integração. A frente de refinamento contínuo da UI (OmniDS) permanece formalmente ativa.

**Tech Stack:** Fastify, TypeScript, Vitest, React 18, Zustand, Tailwind CSS, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-15-phase-2-owasp-and-api-hardening-design.md`

## Global Constraints

- Prefixo canônico estritamente `/api` (zero `/v1` na URI).
- Zero vazamento de nomes de rotas, métodos HTTP ou stack traces para o cliente (OWASP A05).
- Erros 500 inesperados devem emitir um código de incidente amigável no formato `INC-<TIMESTAMP>-<HASH>`.
- Dia Zero: se não houver supervisores cadastrados, o acesso no navegador deve obrigatoriamente abrir na tela de Setup Inicial.
- Mensagens de erro de autenticação neutras (anti-enumeração de usuários no 401).
- Testes E2E obrigatórios no Playwright validando a experiência real do usuário no browser.
- Padrão de idioma: código e identificadores em Inglês, comentários e documentação em Português, UI em pt-BR.
- Caminhos 100% relativos sem letras de unidade ou hosts fixos.
- Refinamento visual da UI (OmniDS) continua como processo ativo e incremental com preview visual obrigatório.

---

### Task 1: Backend Fastify `setNotFoundHandler` & OWASP 404 Tests (TDD)

**Files:**
- Modify: `core-server/src/app.ts:60-75`
- Test: `core-server/tests/auth.test.ts:285-310`

**Interfaces:**
- Produces: `app.setNotFoundHandler` devolvendo `{ success: false, error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } }` com status 404.

- [ ] **Step 1: Escrever o teste que falha em `core-server/tests/auth.test.ts`**

Adicionar Cenário 10 verificando a resposta de rota inexistente:
```typescript
  // --------------------------------------------------------------------------
  // CENÁRIO 10: MASCARAMENTO SEGURO DE ROTAS 404 (OWASP A05 - ZERO ROUTE LEAK)
  // --------------------------------------------------------------------------
  it('Cenário 10: Rotas inexistentes devem retornar 404 mascarado sem expor nomes de rota ou métodos internos', async () => {
    const notFoundRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login', // Tentativa de rota inexistente
    });

    expect(notFoundRes.statusCode).toBe(404);
    const body = JSON.parse(notFoundRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Recurso não encontrado.');

    // Asserção rigorosa de segurança: zero vazamento de métodos HTTP internos ou "Route POST:"
    expect(notFoundRes.payload).not.toMatch(/Route POST/i);
    expect(notFoundRes.payload).not.toMatch(/Route GET/i);
    expect(notFoundRes.payload).not.toMatch(/not found/i);
  });
```

- [ ] **Step 2: Executar o teste e verificar a falha**

Executar: `npm test --workspace=core-server`  
Esperado: FAIL no Cenário 10 com vazamento de `"Route POST:/api/v1/auth/login not found"`.

- [ ] **Step 3: Implementar `app.setNotFoundHandler` em `core-server/src/app.ts`**

Adicionar logo após o `app.setErrorHandler`:
```typescript
  // 3. TRATADOR GLOBAL DE ROTAS NÃO ENCONTRADAS (OWASP A05 - PREVENÇÃO DE VAZAMENTO DE ROTAS)
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado.',
      },
    });
  });
```

- [ ] **Step 4: Executar os testes e verificar aprovação**

Executar: `npm test --workspace=core-server`  
Esperado: 12 testes passando (100% verde).

- [ ] **Step 5: Commit atômico da Task 1**

```bash
git add core-server/src/app.ts core-server/tests/auth.test.ts
git commit -m "feat(core-server): implement OWASP A05 secure 404 not-found handler with TDD"
```

---

### Task 2: Backend Fastify Universal Fallback Error Handler & Incident Tracking (TDD)

**Files:**
- Modify: `core-server/src/app.ts:34-70`
- Test: `core-server/tests/auth.test.ts:310-345`

**Interfaces:**
- Produces: `app.setErrorHandler` emitindo `incidentId` seguro para exceções não tratadas (500) e sanitizando status HTTP Fastify (ex: 400, 429).

- [ ] **Step 1: Escrever o teste que falha em `core-server/tests/auth.test.ts`**

Adicionar Cenário 11 testando a captura universal de erro 500 com código de incidente:
```typescript
  // --------------------------------------------------------------------------
  // CENÁRIO 11: FALLBACK UNIVERSAL DE ERRO E CÓDIGO DE RASTREIO DE INCIDENTE
  // --------------------------------------------------------------------------
  it('Cenário 11: Erro inesperado deve gerar código de rastreio de incidente sem vazar stack trace ou caminhos de disco', async () => {
    const crashRes = await app.inject({
      method: 'GET',
      url: '/api/test-simulated-crash',
    });

    expect(crashRes.statusCode).toBe(500);
    const body = JSON.parse(crashRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNEXPECTED_ERROR');
    expect(body.error.incidentId).toBeDefined();
    expect(body.error.incidentId).toMatch(/^INC-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(body.error.message).toContain(body.error.incidentId);

    // Asserção rigorosa: zero vazamento de arquivos do Windows ou nomes de pastas
    expect(crashRes.payload).not.toMatch(/D:\\Projetos/i);
    expect(crashRes.payload).not.toMatch(/node_modules/i);
    expect(crashRes.payload).not.toMatch(/secret\.ts/i);
    expect(crashRes.payload).not.toMatch(/at /i);
  });
```

- [ ] **Step 2: Executar o teste e verificar a falha**

Executar: `npm test --workspace=core-server`  
Esperado: FAIL no Cenário 11 (faltando `incidentId` e código `UNEXPECTED_ERROR`).

- [ ] **Step 3: Implementar o fallback universal e geração de incidente em `core-server/src/app.ts`**

Atualizar o bloco `app.setErrorHandler`:
```typescript
  // 2. TRATADOR GLOBAL DE ERROS (OWASP A05 & FALLBACK UNIVERSAL DE INCIDENTES)
  app.setErrorHandler((error, _request, reply) => {
    // Caso A: Erro Operacional / Regra de Negócio conhecida (AppError)
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Caso B: Erro de Validação de Dados (Zod Schema)
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const params = (firstIssue as { params?: Record<string, unknown> } | undefined)?.params;
      const customCode = typeof params?.code === 'string' ? params.code : 'VALIDATION_ERROR';
      return reply.status(400).send({
        success: false,
        error: {
          code: customCode,
          message: firstIssue?.message || 'Dados inválidos.',
        },
      });
    }

    // Caso C: Erro HTTP nativo do Fastify com statusCode reconhecido (ex: 400, 429)
    if (typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code || 'HTTP_ERROR',
          message: error.message || 'Requisição inválida.',
        },
      });
    }

    // Caso D: Fallback Universal para Falhas Não Mapeadas / Erro Inesperado (Status 500)
    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const incidentId = `INC-${timestampPart}-${randomPart}`;

    // Registra log completo no servidor para auditoria interna
    console.error(`🚨 [OmniLabs OS - Incidente ${incidentId}]:`, error);

    // Mascara 100% dos dados técnicos para o cliente
    return reply.status(500).send({
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        incidentId,
        message: `Ocorreu uma instabilidade inesperada no servidor. Se o problema persistir, informe a liderança com o código de rastreio ${incidentId}.`,
      },
    });
  });
```

- [ ] **Step 4: Executar os testes e verificar aprovação**

Executar: `npm test --workspace=core-server`  
Esperado: 13 testes passando (100% verde).

- [ ] **Step 5: Commit atômico da Task 2**

```bash
git add core-server/src/app.ts core-server/tests/auth.test.ts
git commit -m "feat(core-server): implement universal fallback error handler with incident tracking code"
```

---

### Task 3: Frontend API Client Normalization under `/api` & Incident Tracking Support

**Files:**
- Modify: `os-client/src/lib/api.ts:15-60`

**Interfaces:**
- Consumes: Endpoints do `core-server` em `/api/auth/*`.
- Produces: `ApiError` contendo `incidentId` e normalização estrita de URLs sob `/api`.

- [ ] **Step 1: Atualizar a normalização de URL e classe ApiError em `os-client/src/lib/api.ts`**

Modificar a definição de `ApiError` e `request`:
```typescript
export class ApiError extends Error {
  public code?: string;
  public status: number;
  public incidentId?: string;

  constructor(message: string, status: number, code?: string, incidentId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.incidentId = incidentId;
  }
}
```

Atualizar a montagem de `url`:
```typescript
  // Garante que o endpoint inicie com /api canônico (sem versionamento /v1 na URI)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
```

Atualizar o tratamento de resposta com erro:
```typescript
    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        (response.status === 404 ? 'Recurso não encontrado.' : `Erro de comunicação com o servidor (${response.status}).`);
      const errorCode = data?.error?.code || (response.status === 404 ? 'NOT_FOUND' : 'API_ERROR');
      const incidentId = data?.error?.incidentId;
      throw new ApiError(errorMessage, response.status, errorCode, incidentId);
    }
```

- [ ] **Step 2: Verificar a compilação do cliente**

Executar: `npm run build --workspace=os-client`  
Esperado: Compilação bem-sucedida.

- [ ] **Step 3: Commit atômico da Task 3**

```bash
git add os-client/src/lib/api.ts
git commit -m "fix(os-client): standardize HTTP client to canonical /api and support incident tracking"
```

---

### Task 4: Frontend Day-Zero Setup Restoration & Authentication Routing

**Files:**
- Modify: `os-client/src/stores/authStore.ts:37-72`
- Modify: `os-client/src/App.tsx:103-122`

**Interfaces:**
- Produces: Direcionamento mandatório para `/setup` quando `setupRequired === true` no Dia Zero.

- [ ] **Step 1: Ajustar `checkSession` em `os-client/src/stores/authStore.ts`**

```typescript
  checkSession: async () => {
    set({ isLoading: true });
    try {
      // 1. Consulta se o sistema requer inicialização Dia Zero (primeiro supervisor)
      const setupRes = await api.get<{ setupRequired: boolean }>('/auth/setup-status');
      if (setupRes.data.setupRequired) {
        set({
          setupRequired: true,
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      // 2. Se já inicializado, verifica a sessão do usuário ativo via Cookie HttpOnly
      const meRes = await api.get<{ user: AuthUser }>('/auth/me');
      set({
        user: meRes.data.user,
        isAuthenticated: true,
        setupRequired: false,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        user: null,
        isAuthenticated: false,
        setupRequired: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },
```

- [ ] **Step 2: Atualizar roteamento em `os-client/src/App.tsx` para forçar `/setup` no Dia Zero**

No bloco de rotas de `App.tsx`:
```tsx
        ) : setupRequired ? (
          <>
            <Route path="/setup" element={<AuthPage initialMode="setup" />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/primeiro-acesso" element={<AuthPage initialMode="first-access" />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )
```

- [ ] **Step 3: Verificar a compilação do frontend**

Executar: `npm run build --workspace=os-client`  
Esperado: Compilação limpa.

- [ ] **Step 4: Commit atômico da Task 4**

```bash
git add os-client/src/stores/authStore.ts os-client/src/App.tsx
git commit -m "feat(os-client): restore day-zero first supervisor setup flow and routing"
```

---

### Task 5: Frontend Defensive UI Error Mapping with Incident Support across Forms

**Files:**
- Modify: `os-client/src/modules/auth/components/LoginForm.tsx`
- Modify: `os-client/src/modules/auth/components/FirstAccessForm.tsx`
- Modify: `os-client/src/modules/auth/components/SetupInitialForm.tsx`

**Interfaces:**
- Produces: Mensagens amigáveis, anti-enumeração e informativas de incidentes renderizadas na UI.

- [ ] **Step 1: Atualizar tratamento de erro em `LoginForm.tsx`**

```typescript
    } catch (err: any) {
      if (err.status === 401 || err.code === 'INVALID_CREDENTIALS') {
        setErrorMessage('Usuário ou senha incorretos.');
      } else if (err.status === 404) {
        setErrorMessage('Serviço de autenticação temporariamente indisponível. Tente novamente mais tarde.');
      } else if (err.code === 'NETWORK_ERROR') {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique a rede do laboratório.');
      } else if (err.incidentId) {
        setErrorMessage(`Instabilidade no servidor (Código: ${err.incidentId}). Contate a liderança.`);
      } else {
        setErrorMessage(err.message || 'Falha ao autenticar. Tente novamente.');
      }
    }
```

- [ ] **Step 2: Aplicar o mesmo padrão em `FirstAccessForm.tsx` e `SetupInitialForm.tsx`**

Replicar o tratamento com mensagens acolhedoras e exibição do `incidentId` quando disponível.

- [ ] **Step 3: Verificar compilação**

Executar: `npm run build --workspace=os-client`  
Esperado: Compilação limpa sem erros de tipagem.

- [ ] **Step 4: Commit atômico da Task 5**

```bash
git add os-client/src/modules/auth/components/LoginForm.tsx os-client/src/modules/auth/components/FirstAccessForm.tsx os-client/src/modules/auth/components/SetupInitialForm.tsx
git commit -m "fix(os-client): implement defensive error mapping and incident tracking in auth forms"
```

---

### Task 6: Suíte de Testes Ponta a Ponta (E2E) com Playwright

**Files:**
- Create: `e2e-tests/tests/auth-flow.spec.ts`

**Interfaces:**
- Consumes: Navegador Chromium abrindo `http://localhost:5173` contra o `core-server` na porta 3000.
- Produces: Asserções reais de interface, rotas e formulários rodando em browser automatizado.

- [ ] **Step 1: Escrever os testes E2E em `e2e-tests/tests/auth-flow.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Governança Nominal e Fluxos de Acesso (E2E)', () => {
  test('Cenário A: Dia Zero deve redirecionar obrigatoriamente para a tela de Setup do Primeiro Supervisor', async ({ page }) => {
    await page.goto('/');

    // Se o banco estiver no Dia Zero, a URL deve virar /setup
    // E o formulário de Setup do Supervisor deve estar renderizado
    const setupTitle = page.getByRole('heading', { name: /configuração inicial/i });
    const isSetup = await setupTitle.isVisible().catch(() => false);

    if (isSetup) {
      await expect(page).toHaveURL(/.*setup/);
      await expect(page.getByLabel(/nome completo/i)).toBeVisible();
      await expect(page.getByLabel(/e-mail corporativo/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /criar conta de supervisor/i })).toBeVisible();
    } else {
      // Se já houver supervisor, deve estar na tela de login
      await expect(page).toHaveURL(/.*login/);
      await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    }
  });

  test('Cenário B: Falha de login deve exibir alerta seguro e amigável sem vazar rotas ou erros brutos', async ({ page }) => {
    await page.goto('/login');

    // Preenche credenciais inválidas para simular erro de autenticação
    await page.getByPlaceholder(/seu\.usuario/i).fill('usuario_inexistente');
    await page.getByPlaceholder(/••••••••/i).fill('SenhaErrada123!');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Valida que o alerta na UI é acolhedor e anti-enumeração
    const alert = page.locator('.text-red-700, [role="alert"]');
    await expect(alert).toBeVisible();

    const alertText = await alert.innerText();
    expect(alertText).not.toMatch(/Route POST/i);
    expect(alertText).not.toMatch(/not found/i);
    expect(alertText).not.toMatch(/D:\\Projetos/i);
  });
});
```

- [ ] **Step 2: Executar os testes E2E no Playwright**

Executar: `npm run test:e2e`  
Esperado: 2 testes passando no Chromium real.

- [ ] **Step 3: Commit atômico da Task 6**

```bash
git add e2e-tests/tests/auth-flow.spec.ts
git commit -m "test(e2e): add Playwright end-to-end tests for day-zero setup and defensive login"
```

---

### Task 7: Documentation, Living Memory & Roadmap Alignment

**Files:**
- Modify: `docs/04-scope-roadmap.md`
- Modify: `docs/pending-work.md`
- Modify: `docs/completed-work.md`

**Interfaces:**
- Produces: Documentação de projeto atualizada formalizando a Fase 2 (com Playwright) e mantendo aberta a frente de refinamento visual contínuo da UI.

- [ ] **Step 1: Atualizar `docs/04-scope-roadmap.md`**

Formalizar o marco da Fase 2 e registrar a suíte Playwright integrada.

- [ ] **Step 2: Atualizar `docs/pending-work.md` e `docs/completed-work.md`**

Registrar tarefas concluídas e apontar para a próxima fase.

- [ ] **Step 3: Executar validação global de compilação e testes**

```bash
npm test
npm run test:e2e
npm run build
```
Esperado: 13 testes unitários verdes, 2 testes E2E Playwright verdes e compilação limpa em todos os workspaces.

- [ ] **Step 4: Commit e sincronização remota**

```bash
git add docs/04-scope-roadmap.md docs/pending-work.md docs/completed-work.md
git commit -m "docs(roadmap): formalize Phase 2 with Playwright E2E suite and universal error handling"
git push origin main
```

---

## Execution Choice

Plano completo e salvo em `docs/superpowers/plans/2026-09-15-phase-2-owasp-and-api-hardening.md`. Duas opções de execução disponíveis:

1. **Subagent-Driven (Recomendado com Regra 14)**: Despacho de subagentes independentes por tarefa, com coleira estrita de prompt (proibição de `/v1`, leitura obrigatória dos docs) e auditoria rigorosa minha antes de aprovar cada entrega.
2. **Inline Execution**: Execução direta comigo nesta mesma sessão, passo a passo com você, sem subagentes.
