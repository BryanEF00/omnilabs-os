import { buildApp } from './app.js';
import { config } from './config/env.js';
import { runMigrations } from './db/migrate.js';

// ============================================================================
// PONTO DE ENTRADA DO SERVIDOR DE PRODUÇÃO (CORE-SERVER)
// Inicializa banco cifrado, executa migrações pendentes e escuta na rede local
// ============================================================================

async function startServer() {
  try {
    console.log('🚀 [OmniLabs OS] Iniciando servidor do LD2...');

    // 1. Garante a execução de migrações no banco SQLCipher
    runMigrations();

    // 2. Instancia a aplicação Fastify
    const app = await buildApp();

    // 3. Escuta na porta e endereço de rede configurados (0.0.0.0 para acesso de toda a LAN)
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    console.log(`✨ [OmniLabs OS] Servidor online e pronto para os analistas em: http://${config.HOST}:${config.PORT}`);
  } catch (error) {
    console.error('❌ [OmniLabs OS] Falha crítica ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
