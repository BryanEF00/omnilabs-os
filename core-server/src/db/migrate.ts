import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, rawDb } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// EXECUTOR DE MIGRAÇÕES NO BANCO CRIPTOGRAFADO (SQLCIPHER)
// Aplica as tabelas e índices diretamente no arquivo cifrado .db
// ============================================================================

export function runMigrations(): void {
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  console.log(`🔄 [Migrate] Aplicando migrações da pasta: ${migrationsFolder}`);

  try {
    migrate(db, { migrationsFolder });
    console.log('✅ [Migrate] Todas as migrações foram aplicadas com sucesso no banco criptografado!');
  } catch (error) {
    console.error('❌ [Migrate] Erro ao aplicar migrações:', error);
    throw error;
  }
}

// Execução direta via CLI (npm run db:migrate)
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    runMigrations();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}
