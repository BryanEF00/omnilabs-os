import { z } from 'zod';

// ============================================================================
// VALIDAÇÃO ESTRITA DE ENTRADA COM ZOD (OWASP INPUT VALIDATION)
// Valida formatos, regras de negócio e restringe ao domínio corporativo
// ============================================================================

// Validador customizado para o domínio oficial da Ajinomoto
export const corporateEmailSchema = z
  .string({ required_error: 'O e-mail corporativo é obrigatório.' })
  .email('Formato de e-mail inválido.')
  .refine(
    (email) => email.toLowerCase().endsWith('@br.ajinomoto.com'),
    {
      message: 'O e-mail deve pertencer obrigatoriamente ao domínio @br.ajinomoto.com',
      params: { code: 'INVALID_EMAIL_DOMAIN' },
    }
  );

// Schema para o Setup Inicial do Primeiro Supervisor
export const setupSupervisorSchema = z.object({
  fullName: z
    .string({ required_error: 'O nome completo é obrigatório.' })
    .min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  email: corporateEmailSchema,
  password: z
    .string({ required_error: 'A senha é obrigatória.' })
    .min(8, 'A senha deve conter no mínimo 8 caracteres.'),
});

// Schema para convidar um novo operador (pelo Supervisor)
export const inviteUserSchema = z.object({
  fullName: z
    .string({ required_error: 'O nome completo é obrigatório.' })
    .min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  email: corporateEmailSchema,
  isSupervisor: z.boolean().optional().default(false),
});

// Schema para o Primeiro Acesso do Operador
export const firstAccessSchema = z.object({
  email: corporateEmailSchema,
  password: z
    .string({ required_error: 'A senha é obrigatória.' })
    .min(8, 'A senha deve conter no mínimo 8 caracteres.'),
});

// Schema para Login Nominal
export const loginSchema = z.object({
  usernameOrEmail: z
    .string({ required_error: 'O usuário ou e-mail é obrigatório.' })
    .min(1, 'Informe seu usuário ou e-mail.'),
  password: z
    .string({ required_error: 'A senha é obrigatória.' })
    .min(1, 'Informe sua senha.'),
});

export type SetupSupervisorInput = z.infer<typeof setupSupervisorSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type FirstAccessInput = z.infer<typeof firstAccessSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
