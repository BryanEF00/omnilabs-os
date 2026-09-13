import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Localiza deterministamente a raiz do monorepo
function findProjectRoot(): string {
  let currentDir = process.cwd();
  // Se executado de dentro de 'core-server', a raiz do monorepo é o diretório pai
  if (path.basename(currentDir) === 'core-server' && fs.existsSync(path.resolve(currentDir, '..', 'package.json'))) {
    return path.resolve(currentDir, '..');
  }
  // Se executado da raiz do monorepo
  if (fs.existsSync(path.resolve(currentDir, 'package.json'))) {
    return currentDir;
  }
  return currentDir;
}

const projectRootDir = findProjectRoot();
const targetEnvPath = path.resolve(projectRootDir, '.env');

// ============================================================================
// FILOSOFIA AUTOBOOT: "Se existe, consome. Se não existe, cria."
// ============================================================================
if (!fs.existsSync(targetEnvPath)) {
  console.log('✨ [Autoboot] Arquivo .env não encontrado. Inicializando auto-provisionamento seguro...');
  
  // Fabricação de chaves criptográficas de padrão militar (AES-256 e HMAC-SHA256)
  const generatedDbKey = crypto.randomBytes(32).toString('hex');
  const generatedJwtSecret = crypto.randomBytes(32).toString('hex');

  const defaultEnvContent = `# ==============================================================
# OmniLabs OS - Ambiente Local Auto-gerado (LD2)
# Gerado automaticamente pelo mecanismo de Autoboot em: ${new Date().toISOString()}
# ==============================================================

PORT=3000
HOST=0.0.0.0

# Banco de Dados SQLite com Criptografia SQLCipher (Chave AES-256 de 32 bytes)
DATABASE_PATH=omnilabs.db
DB_ENCRYPTION_KEY=${generatedDbKey}

# Autenticação e Sessão Nominal
JWT_SECRET=${generatedJwtSecret}
JWT_EXPIRES_IN=12h
`;

  try {
    fs.writeFileSync(targetEnvPath, defaultEnvContent, 'utf8');
    console.log(`✅ [Autoboot] Arquivo .env criado com sucesso em: ${targetEnvPath}`);
  } catch (error) {
    console.error('❌ [Autoboot] Erro ao gravar o arquivo .env automaticamente:', error);
  }
}

// Carrega as variáveis para o ambiente nativo do Node.js
if (fs.existsSync(targetEnvPath)) {
  process.loadEnvFile(targetEnvPath);
}

// Objeto de configuração fortemente tipado para a aplicação
export const config = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  DATABASE_PATH: process.env.DATABASE_PATH || 'omnilabs.db',
  DB_ENCRYPTION_KEY: process.env.DB_ENCRYPTION_KEY || 'default-fallback-key-for-dev-32-bytes!',
  JWT_SECRET: process.env.JWT_SECRET || 'default-fallback-jwt-secret-dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
