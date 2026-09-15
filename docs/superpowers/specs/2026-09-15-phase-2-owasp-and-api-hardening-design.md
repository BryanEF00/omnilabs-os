# Fase 2: Blindagem OWASP, Fallback Universal de Erros, Padronização de API (`/api`) & Restauração do Setup Dia Zero — Design Doc

> **Módulo**: Governança Nominal, Infraestrutura HTTP, Tratamento de Exceções & Setup Dia Zero  
> **Data**: 15 de Setembro de 2026  
> **Status**: Aprovado / Atualizado  
> **Decisão Canônica**: Prefixo global canônico `/api` (sem `/v1`), idêntico à arquitetura de referência do protótipo LIMS-LD2.

---

## 1. Contexto & Diagnóstico de Segurança

Durante os testes de integração do formulário de acesso (`http://localhost:5173/login`), a submissão de credenciais e o boot inicial revelaram três não-conformidades de engenharia e segurança:

1. **Desalinhamento de Contrato de Rota & Ocultação do Setup Dia Zero**:
   - O cliente HTTP no frontend (`os-client/src/lib/api.ts`) presumia o prefixo versionado `/api/v1`.
   - O servidor Fastify no backend (`core-server/src/app.ts`) registrou o módulo em `/api/auth`.
   - Ao iniciar a aplicação, a consulta a `/auth/setup-status` foi enviada como `/api/v1/auth/setup-status`, recebendo 404. O frontend tratou o erro silenciosamente, assumiu falsamente que o setup já estava concluído (`setupRequired: false`) e jogou o operador no `/login` convencional em vez de abrir a **tela única de Cadastro do Primeiro Supervisor (Dia Zero)**.
2. **Vazamento de Informações Internas (OWASP A05 - Security Misconfiguration / Information Disclosure)**:
   - O Fastify trata rotas inexistentes (404) através do `setNotFoundHandler`, e não pelo `setErrorHandler`.
   - Como o `setNotFoundHandler` não estava customizado, o manipulador nativo do Fastify respondeu com a string técnica expondo o verbo HTTP e a rota interna (`Route POST:/api/v1/auth/login not found`).
3. **Ausência de Fallback Universal para Erros Não Mapeados com Código de Rastreio**:
   - Erros inesperados ou não mapeados (4xx de plugins Fastify, 5xx ou falhas de infraestrutura) precisam de um funil de segurança universal que nunca vaze erros brutos e entregue um identificador de incidente auditável (`incidentId`) para o operador e a liderança.
4. **Ausência de Defesa em Camadas na UI (`LoginForm.tsx`, `FirstAccessForm.tsx`, `SetupInitialForm.tsx`)**:
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

#### A. `app.setNotFoundHandler` (OWASP A05 - Rotas Inexistentes)
Toda requisição para rotas não mapeadas deve responder com código HTTP 404 e payload uniforme:
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

#### B. `app.setErrorHandler` (Fallback Universal & Rastreio de Incidentes)
1. **`AppError`**: Preserva `statusCode`, `code` e `message` da regra de negócio.
2. **`ZodError`**: Preserva status 400 e primeira mensagem amigável de validação de campo.
3. **Erros HTTP Fastify (com `statusCode`)**: Responde com o status code correspondente e mensagem sanitizada (sem jargões internos).
4. **Erros Inesperados / Não Mapeados (500)**:
   - Gera um `incidentId` único (ex: `INC-M7K2-A4F9`).
   - Registra no console interno o erro com stack trace e seu `incidentId` para auditoria dos desenvolvedores.
   - Devolve ao cliente payload blindado:
     ```json
     {
       "success": false,
       "error": {
         "code": "UNEXPECTED_ERROR",
         "incidentId": "INC-M7K2-A4F9",
         "message": "Ocorreu uma instabilidade inesperada no servidor. Se o problema persistir, informe a liderança com o código de rastreio INC-M7K2-A4F9."
       }
     }
     ```

### 2.3. Restauração do Setup Dia Zero no Frontend (`os-client`)
- `useAuthStore.checkSession()`:
  - Consulta `GET /api/auth/setup-status`.
  - Se `setupRequired === true`, define `setupRequired: true` e limpa sessão ativa.
  - Em caso de falha de comunicação, define erro explícito.
- `App.tsx`:
  - No estado não-autenticado, se `setupRequired === true`, força a rota ou renderização da tela de **Cadastro do Primeiro Supervisor**.
- `AuthPage.tsx`:
  - Renderiza o `SetupInitialForm` com layout protegido, impedindo que o operador caia no login convencional sem supervisores existentes.

### 2.4. Defesa em Camadas & Mapeamento de Erros na UI
- O cliente HTTP (`api.ts`) normaliza as rotas para `/api` e expõe `incidentId` via `ApiError`.
- Os formulários (`LoginForm`, `FirstAccessForm`, `SetupInitialForm`) traduzem erros para mensagens acolhedoras em português, exibindo o código de rastreio de incidentes caso ele exista.

### 2.5. Refinamento Contínuo da UI
- A conclusão desta fase técnica mantém formalmente aberto e ativo o processo de refinamento visual e ergonômico da UI (OmniDS), com aprovação prévia via preview visual antes de qualquer modificação de arquivo.

---

## 3. Estratégia de Testes Automatizados (TDD)

### 3.1. Backend (`core-server/tests/auth.test.ts`)
- **Cenário 10**: Mascaramento Seguro de 404 (OWASP A05 - zero route leak).
- **Cenário 11**: Fallback Universal de Erro 500 com Código de Rastreio (`incidentId`) e zero stack leak.

### 3.2. Frontend (`os-client`)
- Suíte de compilação limpa (`tsc` e `vite build`).
- Validação manual ponta a ponta do boot em Dia Zero.
