// ============================================================================
// CLASSE DE ERROS OPERACIONAIS PADRONIZADA (OWASP SAFE ERROR HANDLING)
// Garante respostas com mensagens humanas sem vazar stack traces ou caminhos
// ============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;

    // Mantém o rastreamento interno para debug no servidor, sem expor ao cliente
    Error.captureStackTrace(this, this.constructor);
  }
}
