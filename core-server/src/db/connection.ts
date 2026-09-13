import Database from 'better-sqlite3-multiple-ciphers';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { config } from '../config/env.js';
import * as schema from './schema/index.js';

// ============================================================================
// CONEXÃO CRIPTOGRAFADA COM O BANCO DE DADOS (SQLCIPHER + WAL)
// ============================================================================

// 1. Instancia o banco no caminho especificado (omnilabs.db)
const sqlite = new Database(config.DATABASE_PATH);

// 2. Aplica a chave AES-256 para decodificar o arquivo exclusivamente na memória RAM
sqlite.pragma(`key = '${config.DB_ENCRYPTION_KEY}'`);

// 3. Ativa o modo WAL (Write-Ahead Logging) para garantir concorrência fluida na rede local
sqlite.pragma('journal_mode = WAL');

// 4. Garante a ativação de integridade referencial de chaves estrangeiras no SQLite
sqlite.pragma('foreign_keys = ON');

// 5. Instância tipada do Drizzle ORM conectada ao banco cifrado
export const db = drizzle(sqlite, { schema });

// 6. Instância crua do banco para utilitários de sistema e verificações de saúde
export const rawDb = sqlite;
