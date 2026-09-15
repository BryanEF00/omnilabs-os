# Fase 2: Blindagem OWASP, Padronização de API (`/api`) & Resiliência de Erros — Design Doc

> **Módulo**: Governança Nominal, Infraestrutura HTTP & Tratamento de Exceções  
> **Data**: 15 de Setembro de 2026  
> **Status**: Proposto  
> **Decisão Canônica**: Prefixo global canônico `/api` (sem `/v1`), idêntico à arquitetura de referência do protótipo LIMS-LD2.

---

## 1. Contexto & Diagnóstico de Segurança

Durante os testes de integração do formulário de acesso (`http://localhost:5173/login`), a submissão de credenciais resultou na exibição em tela de uma mensagem crua de erro:
`Route POST:/api/v1/auth/login not found`

Essa ocorrência revelou três não-conformidades de engenharia e segurança:

1. **Desalinhamento de Contrato de Rota**:
   - O cliente HTTP no frontend (`os-client/src/lib/api.ts`) presumia o prefixo versionado `/api/v1`.
   - O servidor Fastify no backend (`core-server/src/app.ts`) registrou o módulo em `/api/auth`.
2. **Vazamento de Informações Internas (OWASP A05 - Security Misconfiguration / Information Disclosure)**:
   - O Fastify trata rotas inexistentes (404) através do `setNotFoundHandler`, e não pelo `setErrorHandler`.
   - Como o `setNotFoundHandler` não estava customizado, o manipulador nativo do Fastify respondeu com a string técnica expondo o verbo HTTP e a rota interna (`Route POST:/api/v1/auth/login not found`).
3. **Ausência de Defesa em Camadas na UI (`LoginForm.tsx`)**:
   - O formulário do cliente repassou a mensagem do erro diretamente para o estado `errorMessage`, renderizando dados de infraestrutura diretamente para o operador do laboratório.

---

## 2. Requisitos Arquiteturais & Contrato Canônico

### 2.1. Padrão Global de Endpoints (`/api`)
- Todos os endpoints de backend e frontend devem operar exclusivamente sob a raiz canônica `/api`.
- Nenhuma rota terá versionamento `/v1` na URI, mantendo simplicidade e paridade com o LIMS-LD2.
- Rotas oficiais do módulo de autenticação:
  - `GET  /api/auth/setup-status`
  - `POST /api/auth/setup-first-supervisor`
  - `POST /api/auth/login`
  - `POST /api/auth/first-access`
  - `GET  /api/auth/me`
  - `POST /api/auth/logout`

### 2.2. Blindagem de Erros no Backend (Fastify)
- **`app.setNotFoundHandler` (OWASP A05)**:
  Toda e qualquer requisição direcionada a rotas não mapeadas deve responder com código HTTP 404 e payload uniforme:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Recurso não encontrado."
    }
  }
  ```
  *Asserção de segurança estrita*: O corpo da resposta nunca deve conter strings como `Route POST:`, `Route GET:`, identificadores internos de arquivos ou caminhos do sistema operacional.

- **`app.setErrorHandler`**:
  - `AppError` operacional: Retorna o código e a mensagem de negócio definida pela aplicação.
  - `ZodError` de validação: Retorna mensagem clara do primeiro campo inválido.
  - Erro Inesperado (500): Mascaramento total com mensagem neutra institucional:
    `"Ocorreu uma instabilidade interna no servidor. Se o problema persistir, notifique a liderança do LD2."`

### 2.3. Defesa em Camadas no Frontend (`os-client`)
- **Cliente HTTP (`os-client/src/lib/api.ts`)**:
  - Normalização da URL base: endpoints sem prefixo `/api` recebem automaticamente `/api` (ex: `/auth/login` -> `/api/auth/login`).
  - Tratamento de status de erro de transporte: se o backend devolver erro sem corpo JSON ou com erro genérico, criar um `ApiError` sanitizado.
- **Formulários de Autenticação (`LoginForm.tsx`, `FirstAccessForm.tsx`, `SetupInitialForm.tsx`)**:
  - Mapear os erros para mensagens humanas elegantes:
    - `INVALID_CREDENTIALS` (401): *"Usuário ou senha incorretos."* (Anti-enumeração de usuários conforme OWASP).
    - `NOT_FOUND` (404) ou `INTERNAL_SERVER_ERROR` (500): *"Serviço de autenticação temporariamente indisponível. Tente novamente mais tarde."*.
    - `NETWORK_ERROR`: *"Não foi possível conectar ao servidor. Verifique a rede do laboratório."*.

---

## 3. Estratégia de Testes Automatizados (TDD & Regressão)

### 3.1. Backend (`core-server/tests/auth.test.ts`)
- **Cenário 10: Mascaramento Seguro de 404 (OWASP A05)**:
  - Disparar requisições para rotas inexistentes (`POST /api/v1/auth/login`, `GET /api/rotas-falsas`).
  - Validar status 404.
  - Validar código de erro `'NOT_FOUND'`.
  - Asserção regex garantindo ausência de `Route POST`, `Route GET` e caminhos de disco.

### 3.2. Frontend (`os-client`)
- Executar testes de formatação e mapeamento de erros nos componentes de autenticação.

---

## 4. Reorganização do Roadmap (Fase 2 Oficial)
- A refatoração atual é promovida a **Fase 2 Oficial: Blindagem OWASP, Padronização de API (`/api`) & Resiliência de Erros**.
- O Caderno de Turno Digital & Kanban é postergado para a **Fase 3**, preservando o foco absoluto na estabilidade e segurança das fundações.
