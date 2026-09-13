# OmniLabs OS - Modelo de Dados & Fluxos (Drizzle ORM + SQLCipher)

> **Módulo Foco**: Laboratório LD2 (Microbiologia / Fermentação)  
> **Motor**: Drizzle ORM com `better-sqlite3-multiple-ciphers` (SQLCipher AES-256 + WAL Mode)  
> **Versão**: 1.0  
> **Data**: Setembro de 2026  

---

## 1. Visão Geral das Entidades

O modelo de dados do **OmniLabs OS** foi projetado para garantir:
1. **Auditoria Nominal**: Nenhuma ação ou registro é anônimo.
2. **Criptografia em Repouso no Disco (SQLCipher)**: Arquivo `.db` totalmente cifrado com chave AES-256, sem expor dados confidenciais fora da aplicação.
3. **Busca Textual Nativa (`LIKE`)**: Consultas instantâneas por termos em ocorrências, testes e notas.
4. **Sincronização Bidirecional**: Conclusão de tarefas de rotina reflete instantaneamente no feed do turno ativo.
5. **Consistência de Códigos**: Geração de códigos de testes por relações hierárquicas (`Plant` -> `AminoAcid` -> `Strain`).

---

## 2. Conexão & Criptografia (`connection.ts`)

```typescript
import Database from 'better-sqlite3-multiple-ciphers';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Inicialização com chave secreta AES-256 e modo WAL ativado
const sqlite = new Database(process.env.DATABASE_PATH || 'omnilabs.db');
sqlite.pragma(`key = '${process.env.DB_ENCRYPTION_KEY}'`);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
```

---

## 3. Schemas de Tabelas em TypeScript (`schema.ts`)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// -------------------------------------------------------------
// 1. USUÁRIOS & GOVERNANÇA NOMINAL
// -------------------------------------------------------------

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(), // ex: "bryan.fernandes" (extraído do e-mail)
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(), // ex: "bryan.fernandes@br.ajinomoto.com"
  passwordHash: text('password_hash').notNull(), // Hash bcrypt
  isSupervisor: integer('is_supervisor', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// -------------------------------------------------------------
// 2. TURNOS & GRADE HORÁRIA DIÁRIA (ESCALA 6x1 CUSTOMIZÁVEL)
// -------------------------------------------------------------

export const workShifts = sqliteTable('work_shifts', {
  id: text('id').primaryKey(), // ex: 'SHIFT_1', 'SHIFT_2', 'SHIFT_3', 'ADMINISTRATIVE'
  name: text('name').notNull(), // ex: '3º Turno (Madrugada)'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const workShiftSchedules = sqliteTable('work_shift_schedules', {
  id: text('id').primaryKey(),
  shiftId: text('shift_id').notNull().references(() => workShifts.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 1 (Segunda) a 6 (Sábado), 0 (Domingo)
  startTime: text('start_time').notNull(), // ex: '00:40' ou '22:00'
  endTime: text('end_time').notNull(), // ex: '06:20' ou '06:45'
  crossesMidnight: integer('crosses_midnight', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'), // ex: 'Abertura da semana com fretado', 'Rotina'
});

export const userShiftAssignments = sqliteTable('user_shift_assignments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  shiftId: text('shift_id').notNull().references(() => workShifts.id),
  assignmentType: text('assignment_type').notNull(), // 'HABITUAL' ou 'TEMPORARY'
  startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
  endsAt: integer('ends_at', { mode: 'timestamp' }), // Nulo se for habitual, data final se temporário
  reason: text('reason'), // ex: 'Cobertura de férias', 'Treinamento'
  createdById: text('created_by_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// -------------------------------------------------------------
// 3. MÓDULOS DO SISTEMA & PERMISSÕES GRANULARES (3 ESTADOS)
// -------------------------------------------------------------

export const systemModules = sqliteTable('system_modules', {
  id: text('id').primaryKey(), // 'DASHBOARD', 'SHIFT_HANDOVER', 'ROUTINE_TASKS', 'WEEKLY_SCHEDULE', 'ADMIN'
  name: text('name').notNull(), // Título da página: 'Caderno de Turno'
  description: text('description').notNull(), // Subtítulo da página: 'Feed de ocorrências e passagem de turno'
  iconName: text('icon_name'), // Ícone Lucide: 'ClipboardList', 'Calendar', etc.
  orderIndex: integer('order_index').notNull().default(0), // Posição na barra superior
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const userModulePermissions = sqliteTable('user_module_permissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId: text('module_id').notNull().references(() => systemModules.id, { onDelete: 'cascade' }),
  accessLevel: text('access_level').notNull(), // 'NO_ACCESS', 'READ_ONLY', 'FULL_ACCESS'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// -------------------------------------------------------------
// 2. PILAR 1: CADERNO DE TURNO & FEED EM TEMPO REAL
// -------------------------------------------------------------

export const shifts = sqliteTable('shifts', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().default('LD2'),
  shiftType: text('shift_type').notNull(), // SHIFT_1_MORNING, SHIFT_2_AFTERNOON, SHIFT_3_NIGHT, ADMINISTRATIVE
  date: integer('date', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('OPEN'), // 'OPEN' ou 'CLOSED' (congelado)
  openedAt: integer('opened_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
  closedById: text('closed_by_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const shiftOccurrences = sqliteTable('shift_occurrences', {
  id: text('id').primaryKey(),
  shiftId: text('shift_id').notNull().references(() => shifts.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  registeredAt: integer('registered_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  executedById: text('executed_by_id').notNull().references(() => users.id),
  createdById: text('created_by_id').notNull().references(() => users.id),
  
  // Auditoria de retificação pelo Supervisor
  isEdited: integer('is_edited', { mode: 'boolean' }).notNull().default(false),
  editedAt: integer('edited_at', { mode: 'timestamp' }),
  editedById: text('edited_by_id').references(() => users.id),
  editReason: text('edit_reason'),

  // Vínculo bidirecional com conclusão de limpeza
  routineTaskLogId: text('routine_task_log_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const pendencies = sqliteTable('pendencies', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().default('LD2'),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').notNull().default('MEDIUM'), // 'HIGH', 'MEDIUM', 'LOW'
  status: text('status').notNull().default('OPEN'), // 'OPEN' ou 'COMPLETED'
  targetType: text('target_type').notNull().default('GENERAL'), // 'GENERAL', 'SHIFT', 'USER'
  targetShift: text('target_shift'),
  targetUserId: text('target_user_id').references(() => users.id),
  orderIndex: integer('order_index').notNull().default(0), // Ordenação no Drag and Drop do Kanban
  createdById: text('created_by_id').notNull().references(() => users.id),
  completedById: text('completed_by_id').references(() => users.id),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const notices = sqliteTable('notices', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().default('LD2'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  targetType: text('target_type').notNull().default('GENERAL'),
  targetShift: text('target_shift'),
  targetUserId: text('target_user_id').references(() => users.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdById: text('created_by_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// -------------------------------------------------------------
// 3. PILAR 2: ATIVIDADES & LIMPEZAS DE ROTINA
// -------------------------------------------------------------

export const routineTasks = sqliteTable('routine_tasks', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().default('LD2'),
  title: text('title').notNull(),
  description: text('description'),
  frequencyDays: integer('frequency_days').notNull(), // Intervalo em dias
  isFlexible: integer('is_flexible', { mode: 'boolean' }).notNull().default(false), // "Quando der"
  primaryResponsibleId: text('primary_responsible_id').notNull().references(() => users.id),
  substituteResponsibleId: text('substitute_responsible_id').references(() => users.id),
  lastCompletedAt: integer('last_completed_at', { mode: 'timestamp' }),
  nextDueDate: integer('next_due_date', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const routineTaskLogs = sqliteTable('routine_task_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => routineTasks.id, { onDelete: 'cascade' }),
  shiftId: text('shift_id').notNull().references(() => shifts.id),
  completedById: text('completed_by_id').notNull().references(() => users.id),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// -------------------------------------------------------------
// 4. PILAR 3: CRONOGRAMA SEMANAL & FERMENTAÇÃO
// -------------------------------------------------------------

export const plants = sqliteTable('plants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  acronym: text('acronym').notNull().unique(), // ex: "P1"
});

export const aminoAcids = sqliteTable('amino_acids', {
  id: text('id').primaryKey(),
  plantId: text('plantId').notNull().references(() => plants.id),
  name: text('name').notNull(),
  acronym: text('acronym').notNull(), // ex: "LYS"
});

export const strains = sqliteTable('strains', {
  id: text('id').primaryKey(),
  aminoAcidId: text('amino_acid_id').notNull().references(() => aminoAcids.id),
  acronym: text('acronym').notNull(), // ex: "C-12"
  description: text('description'),
});

export const weeklySchedules = sqliteTable('weekly_schedules', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().default('LD2'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(), // Segunda 00:40
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(), // Sábado 16:20
  status: text('status').notNull().default('ACTIVE'), // DRAFT, ACTIVE, ARCHIVED
  notesSection: text('notes_section'), // Área descritiva de notas e suportes
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const fermentationTests = sqliteTable('fermentation_tests', {
  id: text('id').primaryKey(),
  weeklyScheduleId: text('weekly_schedule_id').notNull().references(() => weeklySchedules.id, { onDelete: 'cascade' }),
  generatedCode: text('generated_code').notNull(), // Código gerado hierarquicamente
  objective: text('objective').notNull(),
  jarNumber: integer('jar_number').notNull(), // Jars 1 a 6
  currentPhase: text('current_phase').notNull(), // "Inóculo", "Fermentação", "Coleta"
  startDateTime: integer('start_date_time', { mode: 'timestamp' }).notNull(),
  endDateTime: integer('end_date_time', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const supportActivities = sqliteTable('support_activities', {
  id: text('id').primaryKey(),
  weeklyScheduleId: text('weekly_schedule_id').notNull().references(() => weeklySchedules.id, { onDelete: 'cascade' }),
  code: text('code'),
  description: text('description').notNull(),
  deadline: integer('deadline', { mode: 'timestamp' }),
  responsibleName: text('responsible_name'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const weeklyAttentionPoints = sqliteTable('weekly_attention_points', {
  id: text('id').primaryKey(),
  weeklyScheduleId: text('weekly_schedule_id').notNull().references(() => weeklySchedules.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  isGlobal: integer('is_global', { mode: 'boolean' }).notNull().default(true),
  testCodeRef: text('test_code_ref'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// -------------------------------------------------------------
// 5. TRILHA DE AUDITORIA NOMINAL
// -------------------------------------------------------------

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // "SHIFT_OVERRIDE_PAST", "USER_PASSWORD_RESET", etc.
  entityName: text('entity_name').notNull(),
  entityId: text('entity_id').notNull(),
  detailsJson: text('details_json'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

---

## 4. Fluxo de Sincronização Bidirecional (Atividade <-> Turno)

```
[Analista clica em "Concluir Limpeza"]
         │
         ▼
1. Insere registro em `routine_task_logs`
2. Atualiza `routine_tasks.last_completed_at = now()`
3. Recalcula `routine_tasks.next_due_date = now() + frequency_days`
4. Insere ocorrência em `shift_occurrences` com `routine_task_log_id = log.id`
5. Emite evento via WebSocket: `task:completed` & `shift:occurrence_added`
         │
         ▼
[Todos os navegadores da bancada atualizam o feed e o checklist ao vivo]
```

Se o analista desmarcar/remover do feed:
```
[Analista remove linha do feed do turno]
         │
         ▼
1. Remove `shift_occurrences`
2. Deleta o `routine_task_logs` correspondente
3. Restaura `routine_tasks.last_completed_at` para a execução anterior
4. Emite evento via WebSocket: `task:uncompleted` & `shift:occurrence_removed`
         │
         ▼
[Atividade retorna automaticamente para o status Pendente no checklist]
```
