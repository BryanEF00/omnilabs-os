# Phase 2: OWASP Hardening & Canonical `/api` Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blindar a aplicação contra vazamento de dados de infraestrutura (OWASP A05), unificar todas as rotas sob o prefixo canônico `/api` e implementar defesa em camadas contra erros não tratados no frontend.

**Architecture:** No backend (`core-server`), o Fastify implementa `setNotFoundHandler` com mascaramento seguro para rotas 404 e preserva `setErrorHandler` para falhas 500 e validações Zod. No frontend (`os-client`), o cliente `api.ts` normaliza requisições sob `/api`, e os formulários de autenticação (`LoginForm`, `FirstAccessForm`, `SetupInitialForm`) traduzem códigos de erro em mensagens humanas neutras e seguras (anti-enumeração).

**Tech Stack:** Fastify, TypeScript, Vitest, React 18, Zustand, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-15-phase-2-owasp-and-api-hardening-design.md`

## Global Constraints

- Prefixo canônico estritamente `/api` (zero `/v1` na URI).
- Zero vazamento de nomes de rotas, métodos HTTP ou stack traces para o cliente (OWASP A05).
- Mensagens de erro de autenticação neutras (anti-enumeração de usuários no 401).
- Padrão de idioma: código e identificadores em Inglês, comentários e documentação em Português, UI em pt-BR.
- Caminhos 100% relativos sem letras de unidade ou hosts fixos.

---

### Task 1: Backend Fastify `setNotFoundHandler` & OWASP 404 Tests (TDD)

**Files:**
- Modify: `core-server/src/app.ts:34-70`
- Test: `core-server/tests/auth.test.ts:285-305`

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

Inserir logo após `app.setErrorHandler`:
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

### Task 2: Padronização Canônica do Cliente HTTP (`api.ts`) sob `/api`

**Files:**
- Modify: `os-client/src/lib/api.ts:28-31`

**Interfaces:**
- Consumes: Endpoints do `core-server` em `/api/auth/*`.
- Produces: URLs normalizadas com prefixo `/api` em todas as chamadas do frontend.

- [ ] **Step 1: Modificar a resolução de prefixo em `os-client/src/lib/api.ts`**

Alterar:
```typescript
  // Garante que o endpoint inicie com /api canônico (sem versionamento /v1 na URI)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
```

- [ ] **Step 2: Sanitizar respostas de erro de transporte em `api.ts`**

Garantir que respostas não-OK com formato inesperado ou 404 gerem `ApiError` com mensagem segura:
```typescript
    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        (response.status === 404 ? 'Recurso não encontrado.' : `Erro de comunicação com o servidor (${response.status}).`);
      const errorCode = data?.error?.code || (response.status === 404 ? 'NOT_FOUND' : 'API_ERROR');
      throw new ApiError(errorMessage, response.status, errorCode);
    }
```

- [ ] **Step 3: Commit atômico da Task 2**

```bash
git add os-client/src/lib/api.ts
git commit -m "fix(os-client): standardize HTTP client url normalization to canonical /api"
```

---

### Task 3: Defesa em Camadas & Sanitização de Erros nos Formulários de Acesso

**Files:**
- Modify: `os-client/src/modules/auth/components/LoginForm.tsx:36-40`
- Modify: `os-client/src/modules/auth/components/FirstAccessForm.tsx`
- Modify: `os-client/src/modules/auth/components/SetupInitialForm.tsx`

**Interfaces:**
- Produces: Mensagens amigáveis, informativas e seguras renderizadas nos alertas da UI, sem textos técnicos brutos.

- [ ] **Step 1: Implementar mapeamento defensivo em `LoginForm.tsx`**

Substituir o tratamento de erro em `handleSubmit`:
```typescript
    } catch (err: any) {
      if (err.status === 401 || err.code === 'INVALID_CREDENTIALS') {
        setErrorMessage('Usuário ou senha incorretos.');
      } else if (err.status === 404 || err.status === 500) {
        setErrorMessage('Serviço de autenticação temporariamente indisponível. Tente novamente mais tarde.');
      } else if (err.code === 'NETWORK_ERROR') {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique a rede do laboratório.');
      } else {
        setErrorMessage(err.message || 'Falha ao autenticar. Tente novamente.');
      }
    }
```

- [ ] **Step 2: Aplicar o mesmo padrão defensivo em `FirstAccessForm.tsx` e `SetupInitialForm.tsx`**

Garantir que falhas de rede ou de servidor sejam tratadas com mensagens amigáveis institucionais em vez de textos crus.

- [ ] **Step 3: Commit atômico da Task 3**

```bash
git add os-client/src/modules/auth/components/LoginForm.tsx os-client/src/modules/auth/components/FirstAccessForm.tsx os-client/src/modules/auth/components/SetupInitialForm.tsx
git commit -m "fix(os-client): implement defensive OWASP error mapping across authentication forms"
```

---

### Task 4: Reorganização do Roadmap & Documentação Oficial

**Files:**
- Modify: `docs/04-scope-roadmap.md`
- Modify: `docs/pending-work.md`
- Modify: `docs/completed-work.md`

**Interfaces:**
- Produces: Documentação de projeto atualizada posicionando a Fase 2 como marco oficial de blindagem e reorganizando as fases posteriores.

- [ ] **Step 1: Atualizar `docs/04-scope-roadmap.md`**

Inserir a Fase 2 oficial:
- **Fase 1**: Fundação, Monorepo & Autenticação Nominal (Concluída).
- **Fase 2**: Blindagem OWASP, Padronização de API (`/api`) & Resiliência de Erros (Concluída).
- **Fase 3**: Pilar 1 - Caderno de Turno & Kanban de Pendências.
- **Fase 4**: Pilar 2 - Atividades & Limpezas de Rotina.
- **Fase 5**: Pilar 3 - Cronograma Semanal Digital (Gantt).
- **Fase 6**: Dashboard Integrado, Dark Mode & Refinamento Visual.
- **Fase 7**: Homologação na Bancada & Deploy 24/7.

- [ ] **Step 2: Atualizar `docs/completed-work.md` e `docs/pending-work.md`**

Registrar os itens finalizados e apontar o próximo passo para a Fase 3.

- [ ] **Step 3: Executar validação completa do monorepo**

```bash
npm test
npm run build
```
Esperado: 100% de testes verdes e compilação limpa.

- [ ] **Step 4: Commit e sincronização remota**

```bash
git add docs/04-scope-roadmap.md docs/pending-work.md docs/completed-work.md
git commit -m "docs(roadmap): formalize Phase 2 and reorganize subsequent roadmap milestones"
git push origin main
```
