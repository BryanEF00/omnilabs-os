# os-client & Painel de Autenticação Split-Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o frontend `os-client` do OmniLabs OS com Vite, React 18, TypeScript, Tailwind CSS e shadcn/ui, implementando a tela de acesso em arquitetura Split-Screen (Hero com 3 animações biológicas à esquerda + formulário de Login, Primeiro Acesso e Setup Inicial à direita) integrada à API do `core-server`.

**Architecture:** Frontend SPA em monorepo com Vite e React Router DOM. O Painel Hero esquerdo utiliza CSS/SVG/Canvas 2D para renderizar 3 animações biológicas alternáveis (`Bubbles`, `Waves`, `Cells`) com sentinela de economia de GPU 24/7. O Painel de Formulário direito utiliza tokens do OmniDS e primitivas do shadcn/ui para governança nominal. Comunicação via cliente HTTP nativo com caminhos 100% relativos (`/api/v1`) através de proxy do Vite e cookies de sessão seguros `HttpOnly`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), Lucide React, React Router DOM v6/v7, Zustand, Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-14-os-client-auth-split-screen-design.md`](../specs/2026-09-14-os-client-auth-split-screen-design.md)

## Global Constraints

- Código e identificadores 100% em Inglês (`kebab-case` para arquivos, `camelCase` para funções/variáveis).
- Comentários de código 100% em Português explicando as regras de negócio e bioprocesso.
- Interface do Usuário (UI) 100% em Português (pt-BR).
- Fundo geral de descanso visual Slate 50 (`#f8fafc`), card branco puro (`#ffffff`), botão primário único em Vermelho Oficial Ajinomoto Pantone 186 C (`#de3636`).
- Portabilidade multi-máquina: caminhos 100% relativos, zero URLs absolutas com host ou portas no código da aplicação.
- Sentinela 24/7 Sleep Guard: animações de Canvas e timers devem ser pausados quando a página estiver oculta (`document.visibilityState === 'hidden'`).
- Commits atômicos semânticos e sincronização contínua com GitHub (`git push`).

---

### Task 1: Scaffolding do Workspace `os-client` e Tooling de Build

**Files:**
- Create: `os-client/package.json`
- Create: `os-client/tsconfig.json`
- Create: `os-client/tsconfig.node.json`
- Create: `os-client/vite.config.ts`
- Create: `os-client/index.html`
- Create: `os-client/src/vite-env.d.ts`
- Modify: `package.json:10` (garantir scripts do monorepo)

**Interfaces:**
- Produces: Workspace `os-client` funcional com compilação TypeScript limpa e proxy configurado para `/api` -> `http://localhost:3000`.

- [ ] **Step 1: Criar `os-client/package.json`**

```json
{
  "name": "os-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.5",
    "tailwind-merge": "^3.0.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

- [ ] **Step 2: Criar configurações TypeScript (`tsconfig.json`, `tsconfig.node.json`) e `vite-env.d.ts`**

Configurar `tsconfig.json` com path alias `@/*` apontando para `./src/*` e modo estrito de checagem.

- [ ] **Step 3: Criar `os-client/vite.config.ts` com Proxy Reverso para `/api`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 4: Criar `os-client/index.html`**

Estrutura HTML com título "OmniLabs OS - LD2", meta tags de viewport e fonte Inter.

- [ ] **Step 5: Executar instalação de dependências no monorepo e validar compilação**

Run: `npm install`
Run: `npm run build --workspace=os-client`
Expected: Compilação concluída com sucesso (ou com arquivo mínimo index).

- [ ] **Step 6: Commit**

```bash
git add os-client/ package.json package-lock.json
git commit -m "chore(os-client): scaffold client workspace with vite, react, typescript and tailwind"
git push origin main
```

---

### Task 2: Tokens de Design System OmniDS & Configuração Tailwind

**Files:**
- Create: `os-client/tailwind.config.js`
- Create: `os-client/postcss.config.js`
- Create: `os-client/src/index.css`
- Create: `os-client/src/lib/utils.ts`

**Interfaces:**
- Produces: Função utilitária `cn(...inputs)` para mesclagem limpa de classes Tailwind.
- Produces: Paleta semântica OmniDS configurada no Tailwind (`brand-primary`, `bg-app`, `bg-surface`, etc.) e animações CSS das bolhas e ondas.

- [ ] **Step 1: Criar `os-client/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: Criar `os-client/tailwind.config.js` com Tokens do OmniDS**

Configurar tokens exatos de [`docs/06-design-system.md`](../../06-design-system.md):
- `brand.primary`: `#de3636` (Ajinomoto Red)
- `brand.hover`: `#cb1c1c`
- `brand.light`: `#ffefe5`
- `bg.app`: `#f8fafc`
- `bg.surface`: `#ffffff`
- `neutral.soft`: `#f5f5f5`
- `neutral.dark`: `#0f172a`
- Status: emerald, amber, rose, blue, slate.

- [ ] **Step 3: Criar `os-client/src/index.css` com Animações e Diretivas**

Adicionar `@tailwind base; @tailwind components; @tailwind utilities;` e keyframes das animações `riseAndGrowBubbles`, `glassTearDrip`, `wallSloshEdges`, `pureLinearRight`, `pureLinearLeft`, `snakeSlither`.

- [ ] **Step 4: Criar `os-client/src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utilitário de composição de classes CSS com desduplicação Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Validar compilação do Tailwind**

Run: `npm run build --workspace=os-client`
Expected: Build limpo sem warnings de CSS.

- [ ] **Step 6: Commit**

```bash
git add os-client/tailwind.config.js os-client/postcss.config.js os-client/src/index.css os-client/src/lib/utils.ts
git commit -m "feat(os-client): configure OmniDS design tokens and tailwind styles"
git push origin main
```

---

### Task 3: Primitivas shadcn/ui e Logotipo Ajinomoto Blindado

**Files:**
- Create: `os-client/src/components/brand/AjinomotoLogo.tsx`
- Create: `os-client/src/components/ui/button.tsx`
- Create: `os-client/src/components/ui/input.tsx`
- Create: `os-client/src/components/ui/card.tsx`
- Create: `os-client/src/components/ui/label.tsx`

**Interfaces:**
- Consumes: `cn` de `@/lib/utils`.
- Produces: Componentes reutilizáveis acessíveis de formulário respeitando a taxonomia do OmniDS (botão primário `#de3636`, outline `#f5f5f5`, ghost passivo, etc.).

- [ ] **Step 1: Criar `os-client/src/components/brand/AjinomotoLogo.tsx`**

Copiar e otimizar o SVG vetorial pristine oficial do protótipo com renderização em branco puro `#ffffff`.

- [ ] **Step 2: Criar `os-client/src/components/ui/button.tsx`**

Implementar Button com `class-variance-authority` contemplando as 7 variantes especificadas no OmniDS:
- `primary`: Fundo `#de3636`, texto branco, hover `#cb1c1c`, foco ring `#de3636`/30.
- `secondary`: Fundo `#f5f5f5`, texto `#0f172a`, borda `border-neutral-200`.
- `outline`: Borda `border-neutral-300`, fundo transparente, hover `bg-neutral-100`.
- `ghost`: Transparente sem borda, hover suave.
- `destructive`: Fundo `#dc2626`, texto branco.
- `contextualHelp`: Botão `[ ? ]` minimalista.

- [ ] **Step 3: Criar `os-client/src/components/ui/input.tsx` e `label.tsx`**

Inputs com altura padrão 38px, borda suave `border-slate-200`, foco nítido com anel `ring-2 ring-[#de3636]/20 border-[#de3636]`, e estados de desabilitado/erro.

- [ ] **Step 4: Criar `os-client/src/components/ui/card.tsx`**

Cards em branco puro `bg-white` com `shadow-xs` / `shadow-sm` e borda `border-slate-200/60`.

- [ ] **Step 5: Validar tipagem e build**

Run: `npm run build --workspace=os-client`
Expected: Zero erros de TypeScript.

- [ ] **Step 6: Commit**

```bash
git add os-client/src/components/
git commit -m "feat(os-client): create shadcn UI primitives and official ajinomoto brand logo"
git push origin main
```

---

### Task 4: Painel Hero: As 3 Animações Biológicas & 24/7 Sleep Guard

**Files:**
- Create: `os-client/src/modules/auth/animations/microbeTypes.ts`
- Create: `os-client/src/modules/auth/animations/microbePhysics.ts`
- Create: `os-client/src/modules/auth/animations/microbeRenderer.ts`
- Create: `os-client/src/modules/auth/components/LoginCellsContainer.tsx`
- Create: `os-client/src/modules/auth/components/LoginBubbles.tsx`
- Create: `os-client/src/modules/auth/components/LoginWaves.tsx`
- Create: `os-client/src/modules/auth/components/LoginHeroPanel.tsx`

**Interfaces:**
- Produces: `<LoginHeroPanel />` componente completo para a coluna esquerda do Split-Screen.
- Contém:
  - Modo `bubbles`: Microbolhas de CO2 com geração procedural.
  - Modo `waves`: Camadas SVG fluidas com gotas de impacto em vidro seco.
  - Modo `cells`: Microscopia em Canvas 2D com mitose, movimento browniano e profundidade Z.
  - Alternador no rodapé com persistência no `localStorage`.
  - Sentinela de documento visível (`document.visibilityState`) para suspender o Canvas e economizar GPU/CPU.

- [ ] **Step 1: Criar módulos matemáticos da simulação de células (`microbeTypes.ts`, `microbePhysics.ts`, `microbeRenderer.ts`)**

Transpor e tipar com rigor a física de deslocamento, fricção de meio biológico, detecção de colisão leve e o ciclo celular de mitose (duplicação estocástica a cada 8-15s com teto populacional).

- [ ] **Step 2: Criar `os-client/src/modules/auth/components/LoginCellsContainer.tsx` com 24/7 Sleep Guard**

Implementar o canvas com escuta ao evento `visibilitychange`. Se `document.hidden` for true, pausar o `requestAnimationFrame` e retomar suavemente no retorno.

- [ ] **Step 3: Criar `os-client/src/modules/auth/components/LoginBubbles.tsx` e `LoginWaves.tsx`**

Transpor os geradores de bolhas assíncronas e camadas de ondas SVG fluidas com as gotas escorrendo.

- [ ] **Step 4: Criar `os-client/src/modules/auth/components/LoginHeroPanel.tsx`**

Integrar o gradiente oficial Ajinomoto, o `AjinomotoLogo`, os textos institucionais ("Laboratório de Desenvolvimento II - OmniLabs OS LD2"), a alternância dos 3 modos e o seletor no rodapé.

- [ ] **Step 5: Validar build e tipagem**

Run: `npm run build --workspace=os-client`
Expected: Build limpo.

- [ ] **Step 6: Commit**

```bash
git add os-client/src/modules/auth/animations/ os-client/src/modules/auth/components/Login*
git commit -m "feat(os-client): implement hero panel with bubbles, waves, cells canvas and 24/7 sleep guard"
git push origin main
```

---

### Task 5: Cliente HTTP, Store de Sessão e Formulários de Governança

**Files:**
- Create: `os-client/src/lib/api.ts`
- Create: `os-client/src/stores/authStore.ts`
- Create: `os-client/src/modules/auth/components/LoginForm.tsx`
- Create: `os-client/src/modules/auth/components/FirstAccessForm.tsx`
- Create: `os-client/src/modules/auth/components/SetupInitialForm.tsx`

**Interfaces:**
- Consumes: Endpoints `/api/v1/auth/setup-status`, `/api/v1/auth/setup-master`, `/api/v1/auth/first-access`, `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`.
- Produces: Hook/Store `useAuthStore` com reatividade de login, dados do operador, turno e permissões.
- Produces: Formulários de login nominal, primeiro acesso e configuração inicial.

- [ ] **Step 1: Criar `os-client/src/lib/api.ts`**

Cliente HTTP nativo com tratamento tipado de respostas, envio automático de cookies de sessão (`credentials: 'include'`) e mensagens de erro amigáveis em português.

- [ ] **Step 2: Criar `os-client/src/stores/authStore.ts` com Zustand**

Store contendo:
- `user`: Dados do usuário logado (id, fullName, username, email, role, habitualShiftId, permissions).
- `isInitialized`: Booleano para evitar flash de tela antes da checagem inicial.
- `setupRequired`: Booleano se o sistema está no Dia Zero.
- `checkSession()`: Consulta `/api/v1/auth/me` e `/api/v1/auth/setup-status`.
- `login(identifier, password)`: Dispara login e armazena estado.
- `logout()`: Invalida cookie no servidor e reseta estado.

- [ ] **Step 3: Criar `os-client/src/modules/auth/components/LoginForm.tsx`**

Campos: Usuário ou e-mail corporativo, senha, botão primário `[ Entrar ]`, mensagens de erro em balão semântico `status-danger` e link para primeiro acesso.

- [ ] **Step 4: Criar `os-client/src/modules/auth/components/FirstAccessForm.tsx`**

Validação em tempo real do e-mail corporativo (`@br.ajinomoto.com`), campos de nova senha e confirmação de senha, botão de ativação e link para voltar ao login.

- [ ] **Step 5: Criar `os-client/src/modules/auth/components/SetupInitialForm.tsx`**

Formulário exclusivo do Dia Zero: Nome Completo do Supervisor, E-mail corporativo, senha e confirmação, com alerta informativo de que este usuário será o mestre permanente do sistema.

- [ ] **Step 6: Validar tipagem e build**

Run: `npm run build --workspace=os-client`
Expected: Build limpo.

- [ ] **Step 7: Commit**

```bash
git add os-client/src/lib/api.ts os-client/src/stores/authStore.ts os-client/src/modules/auth/components/*Form.tsx
git commit -m "feat(os-client): create api client, auth store, and nominal auth forms"
git push origin main
```

---

### Task 6: Container Split-Screen, Roteamento e Aplicação Completa

**Files:**
- Create: `os-client/src/modules/auth/pages/AuthPage.tsx`
- Create: `os-client/src/App.tsx`
- Create: `os-client/src/main.tsx`

**Interfaces:**
- Produces: Aplicação SPA montada no navegador. O roteamento exibe o Split-Screen em `/login`, `/primeiro-acesso` e `/setup`, alternando o formulário ativo com animação suave, ou a tela principal autenticada.

- [ ] **Step 1: Criar `os-client/src/modules/auth/pages/AuthPage.tsx`**

Layout Split-Screen 50/50 em telas grandes (desktop de bancada) e responsivo em telas menores:
- Coluna Esquerda: `<LoginHeroPanel />`
- Coluna Direita: Container com fundo `#f8fafc` centralizando o card de formulário ativo (`LoginForm`, `FirstAccessForm` ou `SetupInitialForm`).

- [ ] **Step 2: Criar `os-client/src/App.tsx` com React Router DOM**

- Rota `/login`: Renderiza `AuthPage` no modo login.
- Rota `/primeiro-acesso`: Renderiza `AuthPage` no modo first-access.
- Rota `/setup`: Renderiza `AuthPage` no modo setup.
- Rota `/`: Redireciona para o painel se autenticado ou `/login` se não autenticado.
- Tela temporária de boas-vindas/placeholder do Workspace pós-login com botão `[ Sair ]` para testar o ciclo completo.

- [ ] **Step 3: Criar `os-client/src/main.tsx`**

Ponto de entrada que monta o `<App />` no elemento `#root`.

- [ ] **Step 4: Validar build de produção**

Run: `npm run build --workspace=os-client`
Expected: `dist/` gerado com sucesso sem erros.

- [ ] **Step 5: Commit**

```bash
git add os-client/src/modules/auth/pages/AuthPage.tsx os-client/src/App.tsx os-client/src/main.tsx
git commit -m "feat(os-client): connect split-screen auth container and routing"
git push origin main
```

---

### Task 7: Verificação Integrada Ponta a Ponta & Sincronização Final

**Files:**
- Teste integrado manual e automatizado no navegador.
- Persistência e documentação do marco alcançado no `PROJECT_CONTEXT.md`.

- [ ] **Step 1: Iniciar os dois servidores em desenvolvimento**

Executar `npm run dev` para subir o Fastify (`core-server` na porta 3000) e o Vite (`os-client` na porta 5173).

- [ ] **Step 2: Validar visualmente e funcionalmente no navegador**

1. Verificar que o Split-Screen carrega perfeitamente.
2. Alternar entre as 3 animações no Hero (`Bubbles`, `Waves`, `Cells`) e conferir a persistência no `localStorage`.
3. Testar a transição entre Login e Primeiro Acesso.
4. Efetuar um login com credenciais de teste criadas no backend e verificar a consulta de sessão `/me` e a persistência do cookie `HttpOnly`.

- [ ] **Step 3: Atualizar `PROJECT_CONTEXT.md` com as entregas da casca e auth do frontend**

Registrar o marco da conclusão do `os-client` com Split-Screen e animações biológicas.

- [ ] **Step 4: Executar suíte de testes de backend para garantir não-regressão**

Run: `npm run test --workspace=core-server`
Expected: 11 testes passando 100%.

- [ ] **Step 5: Commit final e push**

```bash
git add PROJECT_CONTEXT.md
git commit -m "docs: record frontend auth split-screen implementation milestone"
git push origin main
```
