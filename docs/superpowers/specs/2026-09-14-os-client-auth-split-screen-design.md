# Especificação Técnica: os-client & Painel de Autenticação Split-Screen

> **Status**: Aprovado para Planejamento de Implementação  
> **Data**: 14 de Setembro de 2026  
> **Referência Visual**: Protótipo `D:\Programação\LIMS-LD2\frontend` e [`docs/06-design-system.md`](../../06-design-system.md)

---

## 1. Visão Geral do Subsistema Frontend (`os-client`)

O `os-client` é a Single Page Application (SPA) do OmniLabs OS que operará 24 horas por dia, 7 dias por semana nos navegadores do Laboratório LD2. Ele é construído sobre Vite, React 18, TypeScript, Tailwind CSS e as primitivas acessíveis do shadcn/ui (Radix UI), aplicando integralmente as diretrizes do **OmniDS**.

A porta de entrada do sistema é a tela de acesso em arquitetura **Split-Screen** (Painel Hero à esquerda + Painel de Formulário à direita), unindo a forte identidade corporativa da Ajinomoto às necessidades operacionais de governança nominal do laboratório.

---

## 2. Arquitetura da Tela de Acesso (Split-Screen)

```
+-------------------------------------------------------+-------------------------------------------------------+
|                PAINEL HERO (Esquerda)                 |             PAINEL DE FORMULÁRIO (Direita)             |
|                                                       |                                                       |
|  [Logotipo Ajinomoto Oficial em Branco]               |   [Card Superfície Branca - Sombra Sutil]            |
|                                                       |                                                       |
|  Laboratório de Desenvolvimento II                    |   Título: Acesso ao Sistema                           |
|  ---------------------------------                    |   Subtítulo: Identificação nominal do operador       |
|  OmniLabs OS - LD2                                    |                                                       |
|                                                       |   [ Input: Usuário / E-mail Corporativo ]             |
|  [ÁREA DAS 3 ANIMAÇÕES BIOLÓGICAS]                    |   [ Input: Senha ]                                    |
|   - Bubbles (Microbolhas de CO2)                      |                                                       |
|   - Waves (Ondas e Gotas em Vidro)                    |   [ BOTÃO PRIMÁRIO: Entrar (#de3636) ]                |
|   - Cells (Canvas 2D: Mitose e Parallax)              |                                                       |
|                                                       |   [ Link: Primeiro Acesso / Ativação de Conta ]       |
|  [Seletor de Animação: Bubbles | Waves | Cells]       |                                                       |
|  Ajinomoto do Brasil © 2026                           |                                                       |
+-------------------------------------------------------+-------------------------------------------------------+
```

### 2.1. Painel Hero (Coluna Esquerda - Identidade & Bioprocesso)

1. **Identidade Corporativa & Fundo**:
   - Gradiente de fundo Ajinomoto: `linear-gradient(160deg, #f03232 0%, #de3636 55%, #a81313 100%)`, utilizando a cor oficial Pantone 186 C (`#de3636`).
   - Logotipo oficial vetorial em SVG pristino (`AjinomotoLogo.tsx`).
   - Títulos: "Laboratório de Desenvolvimento II" com subtítulo "OmniLabs OS - LD2".
2. **As 3 Animações Biológicas Inspiradas no Protótipo**:
   - **`Bubbles`**: Microbolhas dinâmicas de CO2 simulando o ambiente aeróbio de fermentação, com bio-parallax, escalonamento e dispersão lateral aleatória (`--bubble-dx`).
   - **`Waves`**: Ondulação fluida multicamadas (vetores SVG) combinada com ejeção e escorrimento físico de gota cristalina em vidro seco (`glassTearDrip`).
   - **`Cells`**: Simulação rica em Canvas 2D de microrganismos produtores de aminoácidos, com movimento browniano, efeito de profundidade óptica no eixo Z, ciclo celular com mitose estocástica e controle de densidade populacional (15 a 18 células).
3. **Controle de Modo & Persistência**:
   - Alternador minimalista no rodapé (`Bubbles`, `Waves`, `Cells`).
   - Persistência da preferência do operador no `localStorage` sob a chave `omnilabs_hero_theme`.
4. **Otimização Industrial "24/7 Sleep Guard"**:
   - O loop de renderização do Canvas (`requestAnimationFrame`) e as animações são imediatamente suspensos quando o documento perde a visibilidade (`document.visibilityState === 'hidden'`).
   - Retomada instantânea ao reativar a tela, preservando memória e ciclo de GPU do computador da bancada.

### 2.2. Painel de Formulário (Coluna Direita - Governança Nominal)

1. **Ergonomia Visual (OmniDS)**:
   - Fundo geral de descanso visual Slate 50 (`#f8fafc`).
   - Card de trabalho em branco puro (`#ffffff`) com bordas suaves e elevação `shadow-sm`.
   - Botão de ação primária único estilizado no Vermelho Oficial Ajinomoto (`#de3636`, `hover:bg-[#cb1c1c]`, foco com anel `ring-2 ring-[#de3636]/30`).
2. **Os 3 Estados de Interação**:
   - **Estado 1: Login Nominal (Padrão Diário)**:
     - Entrada com `Usuário` ou `E-mail Corporativo` + `Senha`.
     - Botão `[ Entrar ]` com feedback de carregamento acessível.
     - Link para ativação de primeiro acesso.
   - **Estado 2: Primeiro Acesso (Ativação de Conta)**:
     - Campo com máscara/validação estrita para o e-mail corporativo `@br.ajinomoto.com`.
     - Definição de nova senha e confirmação com regras mínimas de segurança.
     - Botão `[ Ativar Conta ]`.
     - Link `[ Voltar para o Login ]`.
   - **Estado 3: Setup Inicial (Dia Zero)**:
     - Detectado automaticamente via endpoint `/api/v1/auth/setup-status`.
     - Cadastro do primeiro usuário mestre (Supervisor) caso o banco esteja zerado.
     - Trancamento automático após a criação.

---

## 3. Estrutura de Diretórios do `os-client`

```
os-client/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                       # Vetores e imagens estáticas
│   ├── components/
│   │   ├── brand/
│   │   │   └── AjinomotoLogo.tsx      # SVG blindado oficial da Ajinomoto
│   │   ├── ui/                       # Primitivas do shadcn/ui (Radix UI)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── label.tsx
│   │   └── layout/                   # Layouts compartilhados da aplicação
│   ├── modules/
│   │   └── auth/                     # Módulo de Autenticação
│   │       ├── components/
│   │       │   ├── LoginHeroPanel.tsx       # Painel Hero esquerdo
│   │       │   ├── LoginCellsContainer.tsx  # Canvas 2D da mitose bacteriana
│   │       │   ├── LoginForm.tsx            # Formulário de login nominal
│   │       │   ├── FirstAccessForm.tsx      # Formulário de primeiro acesso
│   │       │   └── SetupInitialForm.tsx     # Formulário de Dia Zero
│   │       ├── animations/
│   │       │   ├── microbePhysics.ts        # Física browniana e mitose
│   │       │   ├── microbeRenderer.ts       # Renderizador Canvas 2D
│   │       │   └── microbeTypes.ts          # Tipos das células
│   │       ├── hooks/
│   │       │   └── useAuth.ts               # Hook de login, logout e sessão
│   │       └── pages/
│   │           └── AuthPage.tsx             # Container Split-Screen
│   ├── lib/
│   │   ├── api.ts                    # Cliente HTTP (fetch relativo com credenciais)
│   │   └── utils.ts                  # Utilitário cn (clsx + tailwind-merge)
│   ├── stores/
│   │   └── authStore.ts              # Store Zustand de sessão do usuário
│   ├── App.tsx                       # Roteamento e verificação de sessão
│   ├── main.tsx                      # Ponto de montagem React
│   └── index.css                     # Diretivas Tailwind e animações CSS
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js                # Tokens oficiais do OmniDS
└── vite.config.ts                    # Proxy reverso (/api -> http://localhost:3000)
```

---

## 4. Segurança, Cookies e Portabilidade Multi-Máquina

1. **Proxy no Vite para Desenvolvimento**:
   - O `vite.config.ts` conterá proxy para `/api` redirecionando para `http://localhost:3000`.
   - Todas as chamadas no frontend serão feitas para `/api/v1/...` (caminhos 100% relativos, respeitando a Regra 12 de portabilidade).
2. **Comunicação por Cookies `HttpOnly`**:
   - O cliente HTTP utilizará `credentials: 'include'` nativo para trafegar os cookies de sessão com segurança total contra ataques XSS.
3. **Mapeamento de Erros Sem Exposição**:
   - Tratamento uniforme das respostas da API, exibindo mensagens amigáveis em português sem expor rastros técnicos ao usuário final.

---

## 5. Plano de Verificação

1. **Compilação e Tipagem**:
   - `npm run build --workspace=os-client` executando `tsc` e `vite build` sem erros de tipagem.
2. **Execução Local**:
   - Inicialização dos servidores via `npm run dev` com carregamento no navegador.
3. **Validação Visual e Funcional**:
   - Alternância entre os 3 modos de animação (`Bubbles`, `Waves`, `Cells`) e persistência no `localStorage`.
   - Teste de responsividade da coluna Hero e formulário.
   - Fluxo completo de Login, Primeiro Acesso e Setup Inicial integrados à API real do `core-server`.
