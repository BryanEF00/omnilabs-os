import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { count, eq, or } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { users, type User } from '../../db/schema/users.js';
import { config } from '../../config/env.js';
import { AppError } from '../../errors/app-error.js';
import type {
  SetupSupervisorInput,
  InviteUserInput,
  FirstAccessInput,
  LoginInput,
} from './auth.schemas.js';

// ============================================================================
// SERVIÇO DE AUTENTICAÇÃO E GOVERNANÇA NOMINAL (LD2)
// ============================================================================

export class AuthService {
  // Extrai o username corporativo a partir do e-mail oficial (ex: bryan_fernandes@br.ajinomoto.com -> bryan_fernandes)
  public static extractUsername(email: string): string {
    const [username] = email.toLowerCase().split('@');
    return username;
  }

  // Remove campos sensíveis como o hash da senha antes de retornar os dados
  public static sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // Consulta se o sistema ainda necessita do setup inicial (Dia Zero)
  public static async getSetupStatus(): Promise<{ setupRequired: boolean }> {
    const [result] = await db.select({ total: count() }).from(users);
    return {
      setupRequired: (result?.total || 0) === 0,
    };
  }

  // Cadastra o Primeiro Supervisor durante o setup inicial
  public static async setupFirstSupervisor(input: SetupSupervisorInput) {
    // 1. Garante que o setup só possa ser executado se não existir nenhum usuário
    const [existing] = await db.select({ total: count() }).from(users);
    if ((existing?.total || 0) > 0) {
      throw new AppError('O sistema já foi inicializado.', 403, 'SETUP_ALREADY_COMPLETED');
    }

    const username = this.extractUsername(input.email);
    const passwordHash = await bcrypt.hash(input.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        passwordHash,
        isSupervisor: true,
        isActive: true,
      })
      .returning();

    const token = jwt.sign(
      {
        userId: newUser.id,
        username: newUser.username,
        isSupervisor: newUser.isSupervisor,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  // Supervisor pré-cadastra um analista no sistema
  public static async inviteUser(input: InviteUserInput) {
    const email = input.email.toLowerCase();

    // Verifica duplicidade de e-mail corporativo
    const [alreadyExists] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (alreadyExists) {
      throw new AppError('Este e-mail corporativo já está cadastrado.', 409, 'USER_ALREADY_EXISTS');
    }

    const username = this.extractUsername(email);

    // Salva o operador inativo até que ele complete o primeiro acesso
    const [invited] = await db
      .insert(users)
      .values({
        username,
        fullName: input.fullName,
        email,
        passwordHash: '',
        isSupervisor: input.isSupervisor || false,
        isActive: false,
      })
      .returning();

    return {
      user: this.sanitizeUser(invited),
    };
  }

  // Operador ativa sua conta no Primeiro Acesso
  public static async firstAccess(input: FirstAccessInput) {
    const email = input.email.toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new AppError(
        'Usuário não encontrado ou não convidado para acesso ao laboratório.',
        404,
        'USER_NOT_INVITED'
      );
    }

    // Se já estiver ativo e possuir senha, bloqueia primeiro acesso duplicado
    if (user.isActive && user.passwordHash) {
      throw new AppError(
        'Este usuário já concluiu o primeiro acesso. Por favor, realize o login normal.',
        400,
        'ALREADY_ACTIVATED'
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const [activatedUser] = await db
      .update(users)
      .set({
        passwordHash,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    const token = jwt.sign(
      {
        userId: activatedUser.id,
        username: activatedUser.username,
        isSupervisor: activatedUser.isSupervisor,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return {
      user: this.sanitizeUser(activatedUser),
      token,
    };
  }

  // Login nominal com proteção anti-enumeração de usuários (OWASP)
  public static async login(input: LoginInput) {
    const identifier = input.usernameOrEmail.toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1);

    // Mensagem idêntica caso o usuário não exista, esteja desativado ou não tenha senha
    if (!user || !user.isActive || !user.passwordHash) {
      throw new AppError('Usuário ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Usuário ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        isSupervisor: user.isSupervisor,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  // Validação segura de token de sessão
  public static async verifySession(token: string) {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user || !user.isActive) {
        throw new AppError('Sessão inválida ou expirada.', 401, 'UNAUTHORIZED');
      }

      return this.sanitizeUser(user);
    } catch {
      throw new AppError('Sessão inválida ou expirada.', 401, 'UNAUTHORIZED');
    }
  }
}
