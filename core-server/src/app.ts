import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { ZodError } from 'zod';
import { config } from './config/env.js';
import { AppError } from './errors/app-error.js';
import { authRoutes } from './modules/auth/auth.routes.js';

// ============================================================================
// CONSTRUÇÃO E CONFIGURAÇÃO CENTRAL DO APLICATIVO FASTIFY (APP FACTORY)
// Implementa Tratamento Global de Erros OWASP, Cabeçalhos Helmet e Cookies
// ============================================================================

export async function buildApp() {
  const app = Fastify({
    logger: false, // Pode ser ativado via config em produção
  });

  // 1. Plugins de Segurança e Infraestrutura HTTP
  await app.register(fastifyCookie, {
    secret: config.JWT_SECRET,
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Ajustado para ambiente de rede local
  });

  await app.register(fastifyCors, {
    origin: true,
    credentials: true, // Permite o tráfego seguro de Cookies HttpOnly entre portas locais
  });

  // 2. TRATADOR GLOBAL DE ERROS (OWASP A05 - PREVENÇÃO DE VAZAMENTO DE DADOS)
  app.setErrorHandler((error, _request, reply) => {
    // Caso A: Erro Operacional / Regra de Negócio conhecida
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Caso B: Erro de Validação de Dados (Zod Schema)
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const params = (firstIssue as { params?: Record<string, unknown> } | undefined)?.params;
      const customCode = typeof params?.code === 'string' ? params.code : 'VALIDATION_ERROR';
      return reply.status(400).send({
        success: false,
        error: {
          code: customCode,
          message: firstIssue?.message || 'Dados inválidos.',
        },
      });
    }

    // Caso C: Erro Inesperado de Sistema / Falha Crítica (Status 500)
    // Mascara 100% dos dados técnicos: zero stack traces, zero caminhos de disco no Windows
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu uma instabilidade interna no servidor. Se o problema persistir, notifique a liderança do LD2.',
      },
    });
  });

  // 3. Rota de teste para verificação do mascaramento seguro de erros
  app.get('/api/test-simulated-crash', async () => {
    throw new Error('Falha catastrófica interna simulada em D:\\Projetos\\omnilabs-os\\node_modules\\secret.ts');
  });

  // 4. Registro dos Módulos da Aplicação
  await app.register(authRoutes, { prefix: '/api/auth' });

  return app;
}
