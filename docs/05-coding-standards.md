# OmniLabs OS - Naming Conventions and Coding Standards

> **Golden Rule**: 
> 1. **Code & Identifiers**: 100% in **English** (variables, functions, classes, models, routes, file names).
> 2. **Code Comments**: In **Portuguese** (explaining business rules, non-obvious logic, and architectural choices for easy maintenance).
> 3. **User Interface (UI)**: 100% in **Portuguese** (labels, buttons, placeholders, toast notifications, badges, error messages, print layouts).

---

## 1. File and Folder Naming Standards

All file and directory names must be in lowercase **`kebab-case`** in English:

* **Directories**:
  * `core-server/` (Backend application)
  * `os-client/` (Frontend application)
  * `docs/` (Project documentation)
  * `src/modules/shift-handover/` (Specific module directory)
  * `src/components/ui/` (Shared UI primitives)

* **Documentation Files**:
  * Sequential numeric prefix + English descriptive name:
    * `01-prd-requirements.md`
    * `02-core-architecture.md`
    * `03-data-models-flows.md`
    * `04-scope-roadmap.md`
    * `05-coding-standards.md`
    * `README.md`

* **Source Code Files**:
  * **React Components**: `PascalCase.tsx` (e.g., `ShiftFeed.tsx`, `OccurrenceCard.tsx`, `OrchestratorPanel.tsx`)
  * **Hooks**: `kebab-case.ts` with `use-` prefix (e.g., `use-websocket.ts`, `use-shift-feed.ts`)
  * **Services & Utils**: `kebab-case.ts` (e.g., `auth-service.ts`, `excel-engine.ts`, `date-utils.ts`)
  * **Routes & Controllers**: `kebab-case.ts` (e.g., `shift-routes.ts`, `auth-controller.ts`)

---

## 2. Code Identifiers (English Only)

* **Variables & Functions**: `camelCase` in English
  ```typescript
  // Exemplo correto:
  const activeShift = getCurrentShift();
  async function submitHandoverReport(handoverId: string): Promise<void> { ... }
  ```

* **Classes, Interfaces, Types & Enums**: `PascalCase` in English
  ```typescript
  // Exemplo correto:
  interface OccurrencePayload {
    title: string;
    priority: PriorityLevel;
    equipmentId?: string;
  }

  enum ShiftType {
    SHIFT_1_MORNING = 'SHIFT_1_MORNING',
    SHIFT_2_AFTERNOON = 'SHIFT_2_AFTERNOON',
    SHIFT_3_NIGHT = 'SHIFT_3_NIGHT',
    ADMINISTRATIVE = 'ADMINISTRATIVE',
  }
  ```

* **Database Models (Prisma)**: `PascalCase` in English singular, fields in `camelCase`
  ```prisma
  model HandoverLog {
    id             String         @id @default(cuid())
    labId          String
    shift          ShiftType
    status         HandoverStatus
    handedOverAt   DateTime?
    receivedAt     DateTime?
  }
  ```

---

## 3. Code Comments (Portuguese Only)

All comments explaining business logic, workarounds, or maintenance tips must be in **Portuguese**:

```typescript
// Valida se o turno anterior foi devidamente encerrado antes de permitir o check-in do próximo analista
if (previousHandover.status !== 'SUBMITTED') {
  // Alerta o analista de entrada de que a assinatura do turno anterior ainda está pendente
  throw new BusinessValidationError('O turno anterior ainda não foi finalizado pelo responsável.');
}

// Captura de imagem da área de transferência (Ctrl+V) direta da bancada do laboratório
const handlePasteClipboardImage = (event: ClipboardEvent) => {
  // Percorre os itens do clipboard buscando arquivos de imagem (print de tela ou foto do analisador)
  const items = event.clipboardData?.items;
  ...
};
```

---

## 4. User Interface (UI) Standards (Portuguese Only)

Every text element displayed to laboratory users on the screen must be in **Portuguese (pt-BR)**:

* **Buttons & Actions**:
  * "Registrar Ocorrência", "Passar Turno", "Assumir Turno", "Colar Imagem (Ctrl+V)", "Imprimir Folha A4", "Exportar para Excel".
* **Status Badges**:
  * `OPERACIONAL` (Verde), `MANUTENÇÃO` (Amarelo), `CALIBRAÇÃO` (Azul), `PARADO / QUEBRADO` (Vermelho).
* **Priorities**:
  * `Informativo` (Cinza/Azul), `Atenção` (Amarelo), `Urgente` (Laranja), `Crítico` (Vermelho pulsante).
* **Shifts**:
  * `1º Turno (Manhã)`, `2º Turno (Tarde)`, `3º Turno (Noite)`, `Administrativo (Adm)`.
* **Placeholders & Labels**:
  * "Descreva a ocorrência ou o código da amostra...", "Selecione o analisador...", "Digite o seu PIN de 4 dígitos".
