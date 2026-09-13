import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AuthService } from './auth.service.js';
import {
  setupSupervisorSchema,
  inviteUserSchema,
  firstAccessSchema,
  loginSchema,
} from './auth.schemas.js';
import { AppError } from '../../errors/app-error.js';

// ============================================================================
// ROTAS DE AUTENTICAÇÃO E GOVERNANÇA NOMINAL (FASTIFY PLUGIN)
// Suporta Cookie HttpOnly blindado contra XSS e fallback para Header Bearer
// ============================================================================

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 1. Consulta se o sistema requer setup inicial (Dia Zero)
  fastify.get('/setup-status', async (_request, reply) => {
    const status = await AuthService.getSetupStatus();
    return reply.status(200).send({
      success: true,
      data: status,
    });
  });

  // 2. Cadastro do Primeiro Supervisor (Tranca o setup após a execução)
  fastify.post('/setup-first-supervisor', async (request, reply) => {
    const input = setupSupervisorSchema.parse(request.body);
    const result = await AuthService.setupFirstSupervisor(input);

    // Emite o cookie HttpOnly seguro para a sessão do navegador
    reply.setCookie('token', result.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // HTTP na rede local do LD2
      maxAge: 12 * 60 * 60, // 12 horas
    });

    return reply.status(201).send({
      success: true,
      data: result,
    });
  });

  // 3. Supervisor convida / pré-cadastra um operador
  fastify.post('/invite-user', async (request, reply) => {
    const input = inviteUserSchema.parse(request.body);
    const result = await AuthService.inviteUser(input);

    return reply.status(201).send({
      success: true,
      data: result,
    });
  });

  // 4. Operador realiza o Primeiro Acesso
  fastify.post('/first-access', async (request, reply) => {
    const input = firstAccessSchema.parse(request.body);
    const result = await AuthService.firstAccess(input);

    reply.setCookie('token', result.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 12 * 60 * 60,
    });

    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  // 5. Login Nominal (Operador ou Supervisor)
  fastify.post('/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const result = await AuthService.login(input);

    reply.setCookie('token', result.token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 12 * 60 * 60,
    });

    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  // 6. Encerramento de Sessão (Logout)
  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.status(200).send({
      success: true,
      data: { message: 'Sessão encerrada com sucesso.' },
    });
  });

  // 7. Consulta dos Dados do Usuário Autenticado (/me)
  fastify.get('/me', async (request, reply) => {
    // Extrai o token do Cookie HttpOnly ou do Header Authorization (Bearer)
    const cookieToken = request.cookies?.token;
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      throw new AppError('Sessão inválida ou expirada.', 401, 'UNAUTHORIZED');
    }

    const user = await AuthService.verifySession(token);

    return reply.status(200).send({
      success: true,
      data: { user },
    });
  });
};
