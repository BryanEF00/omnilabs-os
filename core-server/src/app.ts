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

  // 2. TRATADOR GLOBAL DE ERROS (OWASP A05 & FALLBACK UNIVERSAL DE INCIDENTES)
  app.setErrorHandler((error, _request, reply) => {
    // Caso A: Erro Operacional / Regra de Negócio conhecida (AppError)
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

    // Caso C: Erro HTTP nativo do Fastify com statusCode reconhecido (ex: 400, 429)
    const httpError = error as { statusCode?: number; code?: string; message?: string };
    if (typeof httpError.statusCode === 'number' && httpError.statusCode >= 400 && httpError.statusCode < 500) {
      return reply.status(httpError.statusCode).send({
        success: false,
        error: {
          code: httpError.code || 'HTTP_ERROR',
          message: httpError.message || 'Requisição inválida.',
        },
      });
    }

    // Caso D: Fallback Universal para Falhas Não Mapeadas / Erro Inesperado (Status 500)
    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const incidentId = `INC-${timestampPart}-${randomPart}`;

    // Registra log completo no servidor para auditoria interna
    console.error(`🚨 [OmniLabs OS - Incidente ${incidentId}]:`, error);

    // Mascara 100% dos dados técnicos para o cliente
    return reply.status(500).send({
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        incidentId,
        message: `Ocorreu uma instabilidade inesperada no servidor. Se o problema persistir, informe a liderança com o código de rastreio ${incidentId}.`,
      },
    });
  });

  // 3. TRATADOR GLOBAL DE ROTAS NÃO ENCONTRADAS (OWASP A05 - PREVENÇÃO DE VAZAMENTO DE ROTAS)
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado.',
      },
    });
  });

  // 4. Rota de teste para verificação do mascaramento seguro de erros
  app.get('/api/test-simulated-crash', async () => {
    throw new Error('Falha catastrófica interna simulada em D:\\Projetos\\omnilabs-os\\node_modules\\secret.ts');
  });

  // 5. Registro dos Módulos da Aplicação
  await app.register(authRoutes, { prefix: '/api/auth' });

  return app;
}
