import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';

// ============================================================================
// 1. USUÁRIOS & GOVERNANÇA NOMINAL
// Armazena credenciais, papéis de supervisão e auditoria nominal dos operadores do LD2
// ============================================================================
export const users = sqliteTable('users', {
  // Identificador único UUIDv4
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Login derivado do e-mail corporativo (ex: "bryan.fernandes")
  username: text('username').notNull().unique(),
  
  // Nome completo para exibição nominal na UI e logs de auditoria
  fullName: text('full_name').notNull(),
  
  // E-mail corporativo restrito ao domínio @br.ajinomoto.com
  email: text('email').notNull().unique(),
  
  // Senha com hash criptográfico bcrypt (salt rounds = 10)
  passwordHash: text('password_hash').notNull(),
  
  // Indicador de papel de liderança com privilégios administrativos
  isSupervisor: integer('is_supervisor', { mode: 'boolean' }).notNull().default(false),
  
  // Status de ativação da conta (permite desativação sem deleção de histórico)
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  
  // Carimbos de data/hora para auditoria de criação e atualização
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
