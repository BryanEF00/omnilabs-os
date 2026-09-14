import { describe, it, expect, beforeAll } from 'vitest';
import Database from 'better-sqlite3-multiple-ciphers';
import { config } from '../src/config/env.js';
import { runMigrations } from '../src/db/migrate.js';

// ============================================================================
// SUÍTE DE TESTES: INTEGRIDADE CRIPTOGRÁFICA DO BANCO (SQLCIPHER)
// Valida o isolamento de segurança e a presença física das tabelas da Fase 1
// ============================================================================

describe('Blindagem Criptográfica do Banco de Dados (SQLCipher)', () => {
  beforeAll(() => {
    // Garante determinismo total executando as migrações mesmo em banco zerado
    runMigrations();
  });
  it('Cenário 1: Deve bloquear o acesso e recusar a leitura quando nenhuma chave for fornecida', () => {
    // Tenta abrir o arquivo omnilabs.db sem enviar a chave AES-256
    const unauthDb = new Database(config.DATABASE_PATH);

    // Espera-se que qualquer tentativa de consulta SQL em arquivo cifrado lance erro explícito
    expect(() => {
      unauthDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    }).toThrow(/file is not a database/i);

    unauthDb.close();
  });

  it('Cenário 2: Deve autenticar e listar com sucesso as 6 tabelas relacionais com a chave AES-256 válida', () => {
    // Conecta no banco aplicando a chave configurada no .env
    const authDb = new Database(config.DATABASE_PATH);
    authDb.pragma(`key = '${config.DB_ENCRYPTION_KEY}'`);

    // Consulta todas as tabelas criadas pela aplicação (ignorando tabelas internas de controle de migração)
    const tables = authDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '__drizzle%'")
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);

    // Valida a presença de cada uma das 6 tabelas aprovadas na governança do projeto
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('work_shifts');
    expect(tableNames).toContain('work_shift_schedules');
    expect(tableNames).toContain('user_shift_assignments');
    expect(tableNames).toContain('system_modules');
    expect(tableNames).toContain('user_module_permissions');

    authDb.close();
  });
});
