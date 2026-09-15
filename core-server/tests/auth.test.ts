import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3-multiple-ciphers';
import { buildApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { runMigrations } from '../src/db/migrate.js';

import { db } from '../src/db/connection.js';
import { users, userModulePermissions, userShiftAssignments } from '../src/db/schema/index.js';

// ============================================================================
// SUÍTE DE TESTES (TDD): AUTENTICAÇÃO, PRIMEIRO ACESSO E OWASP
// ============================================================================

describe('Módulo de Autenticação e Governança Nominal (LD2)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  function cleanDatabase() {
    try {
      db.delete(userModulePermissions).run();
      db.delete(userShiftAssignments).run();
      db.delete(users).run();
    } catch {}
  }

  beforeAll(async () => {
    // 1. Garante que as migrações estão aplicadas
    runMigrations();

    // 2. Limpa dados de execuções anteriores para garantir determinismo total
    cleanDatabase();

    // 3. Inicializa o aplicativo Fastify em memória para testes com app.inject()
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    cleanDatabase();
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 1: BOOTSTRAP / SETUP INICIAL (DIA ZERO)
  // --------------------------------------------------------------------------
  it('Cenário 1: Deve indicar setupRequired=true quando o banco estiver vazio e permitir criar o 1º Supervisor', async () => {
    // 1. Consulta status inicial
    const statusRes = await app.inject({
      method: 'GET',
      url: '/api/auth/setup-status',
    });

    expect(statusRes.statusCode).toBe(200);
    const statusBody = JSON.parse(statusRes.body);
    expect(statusBody.success).toBe(true);
    expect(statusBody.data.setupRequired).toBe(true);

    // 2. Registra o primeiro supervisor com e-mail corporativo usando underscore
    const setupRes = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-first-supervisor',
      payload: {
        fullName: 'Bryan Fernandes',
        email: 'bryan_fernandes@br.ajinomoto.com',
        password: 'Password123!',
      },
    });

    expect(setupRes.statusCode).toBe(201);
    const setupBody = JSON.parse(setupRes.payload);
    expect(setupBody.success).toBe(true);
    expect(setupBody.data.user.username).toBe('bryan_fernandes');
    expect(setupBody.data.user.isSupervisor).toBe(true);

    // 3. Verifica se trancou o modo setup
    const newStatusRes = await app.inject({
      method: 'GET',
      url: '/api/auth/setup-status',
    });
    expect(JSON.parse(newStatusRes.payload).data.setupRequired).toBe(false);
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 2: BLINDAGEM ANTI-INVASÃO DO MODO SETUP
  // --------------------------------------------------------------------------
  it('Cenário 2: Deve recusar com 403 Forbidden qualquer tentativa de executar o setup novamente', async () => {
    const invadeRes = await app.inject({
      method: 'POST',
      url: '/api/auth/setup-first-supervisor',
      payload: {
        fullName: 'Invasor Falso',
        email: 'invasor_falso@br.ajinomoto.com',
        password: 'HackPassword123!',
      },
    });

    expect(invadeRes.statusCode).toBe(403);
    const body = JSON.parse(invadeRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('SETUP_ALREADY_COMPLETED');
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 3: REJEIÇÃO DE E-MAILS NÃO CORPORATIVOS (OWASP VALIDATION)
  // --------------------------------------------------------------------------
  it('Cenário 3: Deve recusar com 400 Bad Request e-mails de fora do domínio @br.ajinomoto.com', async () => {
    const invalidEmailRes = await app.inject({
      method: 'POST',
      url: '/api/auth/first-access',
      payload: {
        email: 'analista_teste@gmail.com',
        password: 'Password123!',
      },
    });

    expect(invalidEmailRes.statusCode).toBe(400);
    const body = JSON.parse(invalidEmailRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVALID_EMAIL_DOMAIN');
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 4: PRIMEIRO ACESSO NÃO AUTORIZADO (NÃO PRÉ-CADASTRADO)
  // --------------------------------------------------------------------------
  it('Cenário 4: Deve recusar com 404 Not Found se o e-mail não tiver sido pré-cadastrado pela liderança', async () => {
    const uninvitedRes = await app.inject({
      method: 'POST',
      url: '/api/auth/first-access',
      payload: {
        email: 'usuario_desconhecido@br.ajinomoto.com',
        password: 'Password123!',
      },
    });

    expect(uninvitedRes.statusCode).toBe(404);
    const body = JSON.parse(uninvitedRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('USER_NOT_INVITED');
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 5: PRIMEIRO ACESSO VÁLIDO (EXTRAÇÃO COM UNDERSCORE E ATIVAÇÃO)
  // --------------------------------------------------------------------------
  it('Cenário 5: Deve ativar o analista pré-cadastrado e extrair o username usando underscore', async () => {
    // 1. Simula o supervisor pré-cadastrando o operador
    const preRegisteredRes = await app.inject({
      method: 'POST',
      url: '/api/auth/invite-user',
      headers: {
        // Será autenticado com a sessão do supervisor
      },
      payload: {
        fullName: 'Carlos Silva',
        email: 'carlos_silva@br.ajinomoto.com',
        isSupervisor: false,
      },
    });

    // 2. Operador ativa o primeiro acesso
    const firstAccessRes = await app.inject({
      method: 'POST',
      url: '/api/auth/first-access',
      payload: {
        email: 'carlos_silva@br.ajinomoto.com',
        password: 'NewOperatorPassword123!',
      },
    });

    expect(firstAccessRes.statusCode).toBe(200);
    const body = JSON.parse(firstAccessRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.username).toBe('carlos_silva');
    expect(body.data.user.isActive).toBe(true);
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 6: LOGIN NOMINAL & EMISSÃO DE COOKIE HTTPONLY SEGURO
  // --------------------------------------------------------------------------
  it('Cenário 6: Deve realizar login nominal e emitir Cookie HttpOnly com SameSite=Lax', async () => {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        usernameOrEmail: 'bryan_fernandes',
        password: 'Password123!',
      },
    });

    expect(loginRes.statusCode).toBe(200);
    const body = JSON.parse(loginRes.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.username).toBe('bryan_fernandes');
    expect(body.data.token).toBeDefined();

    // Valida a presença do Cookie HttpOnly seguro no cabeçalho Set-Cookie
    const setCookie = loginRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toMatch(/token=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 7: REJEIÇÃO DE CREDENCIAIS INVÁLIDAS (ANTI-ENUMERAÇÃO OWASP)
  // --------------------------------------------------------------------------
  it('Cenário 7: Deve retornar a mesma mensagem uniforme 401 para senha incorreta ou usuário inexistente', async () => {
    // 1. Senha errada para usuário existente
    const wrongPassRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        usernameOrEmail: 'bryan_fernandes',
        password: 'WrongPassword!',
      },
    });

    expect(wrongPassRes.statusCode).toBe(401);
    const wrongPassBody = JSON.parse(wrongPassRes.payload);
    expect(wrongPassBody.success).toBe(false);
    expect(wrongPassBody.error.code).toBe('INVALID_CREDENTIALS');

    // 2. Usuário que não existe no sistema
    const nonExistentRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        usernameOrEmail: 'usuario_fantasma',
        password: 'AnyPassword!',
      },
    });

    expect(nonExistentRes.statusCode).toBe(401);
    const nonExistentBody = JSON.parse(nonExistentRes.payload);
    expect(nonExistentBody.success).toBe(false);
    // Deve ser rigorosamente idêntico para não permitir enumeração de contas
    expect(nonExistentBody.error.code).toBe('INVALID_CREDENTIALS');
    expect(nonExistentBody.error.message).toBe(wrongPassBody.error.message);
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 8: CONSULTA DE SESSÃO (/me) & REJEIÇÃO DE TOKEN EXPIRADO / INVÁLIDO
  // --------------------------------------------------------------------------
  it('Cenário 8: Deve autenticar sessão legítima via /me e recusar token expirado ou adulterado', async () => {
    // 1. Faz login para obter o token e o cookie
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        usernameOrEmail: 'bryan_fernandes',
        password: 'Password123!',
      },
    });
    const token = JSON.parse(loginRes.payload).data.token;

    // 2. Consulta de sessão legítima usando o header Bearer
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(meRes.statusCode).toBe(200);
    const meBody = JSON.parse(meRes.payload);
    expect(meBody.success).toBe(true);
    expect(meBody.data.user.username).toBe('bryan_fernandes');

    // 3. Consulta enviando token adulterado
    const fakeMeRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: 'Bearer token_adulterado_falso',
      },
    });

    expect(fakeMeRes.statusCode).toBe(401);
    const fakeBody = JSON.parse(fakeMeRes.payload);
    expect(fakeBody.success).toBe(false);
    expect(fakeBody.error.code).toBe('UNAUTHORIZED');
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 9: MASCARAMENTO SEGURO DE ERROS (OWASP A05 - ZERO STACK TRACE)
  // --------------------------------------------------------------------------
  it('Cenário 9: Erros inesperados 500 devem ser mascarados sem expor caminhos de arquivo ou stack traces', async () => {
    const errorRes = await app.inject({
      method: 'GET',
      url: '/api/test-simulated-crash', // Rota de teste que força um erro inesperado
    });

    expect(errorRes.statusCode).toBe(500);
    const errorBody = JSON.parse(errorRes.payload);
    expect(errorBody.success).toBe(false);
    expect(errorBody.error.code).toBe('UNEXPECTED_ERROR');
    expect(errorBody.error.message).toContain('instabilidade inesperada no servidor');
    
    // Asserção estrita de segurança: nenhuma menção a caminhos do Windows ou código-fonte
    const rawPayload = errorRes.payload;
    expect(rawPayload).not.toMatch(/[D-Z]:\\/);
    expect(rawPayload).not.toMatch(/node_modules/);
    expect(rawPayload).not.toMatch(/stack/i);
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 10: MASCARAMENTO SEGURO DE ROTAS 404 (OWASP A05 - ZERO ROUTE LEAK)
  // --------------------------------------------------------------------------
  it('Cenário 10: Rotas inexistentes devem retornar 404 mascarado sem expor nomes de rota ou métodos internos', async () => {
    const notFoundRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login', // Tentativa de rota inexistente
    });

    expect(notFoundRes.statusCode).toBe(404);
    const body = JSON.parse(notFoundRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Recurso não encontrado.');

    // Asserção rigorosa de segurança: zero vazamento de métodos HTTP internos ou "Route POST:"
    expect(notFoundRes.payload).not.toMatch(/Route POST/i);
    expect(notFoundRes.payload).not.toMatch(/Route GET/i);
    expect(notFoundRes.payload).not.toMatch(/not found/i);
  });

  // --------------------------------------------------------------------------
  // CENÁRIO 11: FALLBACK UNIVERSAL DE ERRO E CÓDIGO DE RASTREIO DE INCIDENTE
  // --------------------------------------------------------------------------
  it('Cenário 11: Erro inesperado deve gerar código de rastreio de incidente sem vazar stack trace ou caminhos de disco', async () => {
    const crashRes = await app.inject({
      method: 'GET',
      url: '/api/test-simulated-crash',
    });

    expect(crashRes.statusCode).toBe(500);
    const body = JSON.parse(crashRes.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNEXPECTED_ERROR');
    expect(body.error.incidentId).toBeDefined();
    expect(body.error.incidentId).toMatch(/^INC-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(body.error.message).toContain(body.error.incidentId);

    // Asserção rigorosa: zero vazamento de arquivos do Windows ou nomes de pastas
    expect(crashRes.payload).not.toMatch(/D:\\Projetos/i);
    expect(crashRes.payload).not.toMatch(/node_modules/i);
    expect(crashRes.payload).not.toMatch(/secret\.ts/i);
    expect(crashRes.payload).not.toMatch(/at /i);
  });
});
