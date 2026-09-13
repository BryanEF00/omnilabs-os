import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';
import { users } from './users.js';

// ============================================================================
// 3. MÓDULOS DO SISTEMA & PERMISSÕES GRANULARES (3 ESTADOS)
// Governa a visibilidade das abas superiores e os níveis de permissão por usuário
// ============================================================================

// Definição mestre dos módulos/abas do OmniLabs OS
export const systemModules = sqliteTable('system_modules', {
  // Identificador mestre do módulo (ex: 'DASHBOARD', 'SHIFT_HANDOVER', 'ROUTINE_TASKS', 'WEEKLY_SCHEDULE', 'ADMIN')
  id: text('id').primaryKey(),
  
  // Nome amigável do módulo exibido na barra superior (ex: 'Caderno de Turno')
  name: text('name').notNull(),
  
  // Descrição/subtítulo funcional exibido no topo da página (ex: 'Feed de ocorrências e passagem de turno')
  description: text('description').notNull(),
  
  // Nome do ícone da biblioteca Lucide React a ser renderizado na interface (ex: 'ClipboardList')
  iconName: text('icon_name'),
  
  // Ordem de apresentação do módulo na barra de navegação superior
  orderIndex: integer('order_index').notNull().default(0),
  
  // Flag que permite ocultar temporariamente o módulo em todo o sistema
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// Permissão de acesso nominal de cada usuário para cada módulo do sistema
export const userModulePermissions = sqliteTable('user_module_permissions', {
  // Identificador único da permissão
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Usuário ao qual a permissão se aplica
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Módulo ao qual o usuário possui acesso
  moduleId: text('module_id')
    .notNull()
    .references(() => systemModules.id, { onDelete: 'cascade' }),
  
  // Nível de autorização estrito de 3 estados:
  // - 'NO_ACCESS': Oculta o módulo completamente do menu de navegação
  // - 'READ_ONLY': Permite apenas visualização (bloqueia formulários e ações de gravação)
  // - 'FULL_ACCESS': Permite todas as operações de leitura, criação e edição
  accessLevel: text('access_level').notNull(),
  
  // Carimbos de auditoria
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type SystemModule = typeof systemModules.$inferSelect;
export type NewSystemModule = typeof systemModules.$inferInsert;

export type UserModulePermission = typeof userModulePermissions.$inferSelect;
export type NewUserModulePermission = typeof userModulePermissions.$inferInsert;
