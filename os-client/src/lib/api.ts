/**
 * Cliente HTTP da aplicação os-client.
 * Opera exclusivamente com caminhos relativos e credentials: 'include' para tráfego seguro de cookies HttpOnly.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
    incidentId?: string;
  };
}

export class ApiError extends Error {
  public code?: string;
  public status: number;
  public incidentId?: string;

  constructor(message: string, status: number, code?: string, incidentId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.incidentId = incidentId;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Garante que o endpoint inicie com /api canônico (sem versionamento /v1 na URI)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Envia e recebe cookies HttpOnly de sessão
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        (response.status === 404
          ? 'Recurso não encontrado.'
          : `Erro de comunicação com o servidor (${response.status}).`);
      const errorCode = data?.error?.code || (response.status === 404 ? 'NOT_FOUND' : 'API_ERROR');
      const incidentId = data?.error?.incidentId;
      throw new ApiError(errorMessage, response.status, errorCode, incidentId);
    }

    return data as ApiResponse<T>;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Falha de comunicação com o servidor. Verifique a rede.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
