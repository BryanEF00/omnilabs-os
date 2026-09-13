import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { workShifts, workShiftSchedules, userShiftAssignments } from './shifts.js';
import { systemModules, userModulePermissions } from './modules.js';

// Re-exporta todas as tabelas e tipos
export * from './users.js';
export * from './shifts.js';
export * from './modules.js';

// ============================================================================
// RELACIONAMENTOS DRIZZLE ORM (NAVIGATION & JOINS FORTEMENTE TIPADOS)
// ============================================================================

// Relações da tabela users
export const usersRelations = relations(users, ({ many }) => ({
  assignedShifts: many(userShiftAssignments, { relationName: 'userAssignedShifts' }),
  createdAssignments: many(userShiftAssignments, { relationName: 'supervisorCreatedAssignments' }),
  modulePermissions: many(userModulePermissions),
}));

// Relações da tabela workShifts
export const workShiftsRelations = relations(workShifts, ({ many }) => ({
  schedules: many(workShiftSchedules),
  assignments: many(userShiftAssignments),
}));

// Relações da tabela workShiftSchedules
export const workShiftSchedulesRelations = relations(workShiftSchedules, ({ one }) => ({
  shift: one(workShifts, {
    fields: [workShiftSchedules.shiftId],
    references: [workShifts.id],
  }),
}));

// Relações da tabela userShiftAssignments
export const userShiftAssignmentsRelations = relations(userShiftAssignments, ({ one }) => ({
  user: one(users, {
    fields: [userShiftAssignments.userId],
    references: [users.id],
    relationName: 'userAssignedShifts',
  }),
  shift: one(workShifts, {
    fields: [userShiftAssignments.shiftId],
    references: [workShifts.id],
  }),
  createdBy: one(users, {
    fields: [userShiftAssignments.createdById],
    references: [users.id],
    relationName: 'supervisorCreatedAssignments',
  }),
}));

// Relações da tabela systemModules
export const systemModulesRelations = relations(systemModules, ({ many }) => ({
  permissions: many(userModulePermissions),
}));

// Relações da tabela userModulePermissions
export const userModulePermissionsRelations = relations(userModulePermissions, ({ one }) => ({
  user: one(users, {
    fields: [userModulePermissions.userId],
    references: [users.id],
  }),
  module: one(systemModules, {
    fields: [userModulePermissions.moduleId],
    references: [systemModules.id],
  }),
}));
