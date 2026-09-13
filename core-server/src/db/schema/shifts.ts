import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';
import { users } from './users.js';

// ============================================================================
// 2. TURNOS & GRADE HORÁRIA DIÁRIA (ESCALA 6x1 CUSTOMIZÁVEL)
// Modela turnos flexíveis sem hardcoding, suportando variações de horários por dia da semana
// ============================================================================

// Definição mestre do turno de trabalho (ex: 1º Turno, 2º Turno, 3º Turno, Administrativo)
export const workShifts = sqliteTable('work_shifts', {
  // Identificador do turno (ex: 'SHIFT_1', 'SHIFT_2', 'SHIFT_3', 'ADMINISTRATIVE')
  id: text('id').primaryKey(),
  
  // Nome descritivo do turno (ex: '3º Turno (Madrugada)')
  name: text('name').notNull(),
  
  // Flag indicando se o turno está ativo para alocações
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// Grade horária diária do turno (permite horários diferentes para cada dia da semana na escala 6x1)
export const workShiftSchedules = sqliteTable('work_shift_schedules', {
  // Identificador único da linha de grade
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Vínculo com o turno pai
  shiftId: text('shift_id')
    .notNull()
    .references(() => workShifts.id, { onDelete: 'cascade' }),
  
  // Dia da semana: 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  dayOfWeek: integer('day_of_week').notNull(),
  
  // Horário planejado de início no formato 'HH:mm' (ex: '00:40' ou '22:00')
  startTime: text('start_time').notNull(),
  
  // Horário planejado de término no formato 'HH:mm' (ex: '06:20' ou '06:45')
  endTime: text('end_time').notNull(),
  
  // Indica se a jornada atravessa a meia-noite (inicia em um dia civil e termina no seguinte)
  crossesMidnight: integer('crosses_midnight', { mode: 'boolean' }).notNull().default(false),
  
  // Observação operacional opcional (ex: 'Abertura da semana com fretado', 'Fechamento semanal')
  notes: text('notes'),
});

// Alocação nominal de um operador a um turno (habitual ou temporária)
export const userShiftAssignments = sqliteTable('user_shift_assignments', {
  // Identificador único da alocação
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Usuário/operador alocado
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Turno de trabalho atribuído
  shiftId: text('shift_id')
    .notNull()
    .references(() => workShifts.id),
  
  // Tipo de alocação: 'HABITUAL' (fixo na rotina) ou 'TEMPORARY' (cobertura/revezamento)
  assignmentType: text('assignment_type').notNull(),
  
  // Data e hora de início de vigência da alocação
  startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
  
  // Data e hora de término da alocação (nulo se for HABITUAL; preenchido se for TEMPORARY)
  endsAt: integer('ends_at', { mode: 'timestamp' }),
  
  // Motivo operacional da alocação (ex: 'Lotação habitual', 'Cobertura de férias', 'Treinamento')
  reason: text('reason'),
  
  // Supervisor responsável pela criação da escala
  createdById: text('created_by_id')
    .notNull()
    .references(() => users.id),
  
  // Data e hora do registro da alocação no sistema
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type WorkShift = typeof workShifts.$inferSelect;
export type NewWorkShift = typeof workShifts.$inferInsert;

export type WorkShiftSchedule = typeof workShiftSchedules.$inferSelect;
export type NewWorkShiftSchedule = typeof workShiftSchedules.$inferInsert;

export type UserShiftAssignment = typeof userShiftAssignments.$inferSelect;
export type NewUserShiftAssignment = typeof userShiftAssignments.$inferInsert;
