import { create } from 'zustand';
import { api } from '@/lib/api';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  isSupervisor: boolean;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setupRequired: boolean;

  // Ações de Governança Nominal
  checkSession: () => Promise<void>;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  firstAccess: (email: string, password: string) => Promise<void>;
  setupFirstSupervisor: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  setupRequired: false,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      // 1. Consulta se o sistema requer inicialização Dia Zero
      const setupRes = await api.get<{ setupRequired: boolean }>('/auth/setup-status');
      if (setupRes.data.setupRequired) {
        set({
          setupRequired: true,
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      // 2. Se já inicializado, verifica a sessão do usuário ativo via Cookie HttpOnly
      const meRes = await api.get<{ user: AuthUser }>('/auth/me');
      set({
        user: meRes.data.user,
        isAuthenticated: true,
        setupRequired: false,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err: any) {
      // Se 401 (não autenticado), apenas desloga sem quebrar a aplicação
      set({
        user: null,
        isAuthenticated: false,
        setupRequired: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  login: async (usernameOrEmail: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: AuthUser; token: string }>('/auth/login', {
        usernameOrEmail: usernameOrEmail.trim(),
        password,
      });
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  firstAccess: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: AuthUser; token: string }>('/auth/first-access', {
        email: email.trim().toLowerCase(),
        password,
      });
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  setupFirstSupervisor: async (fullName: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: AuthUser; token: string }>(
        '/auth/setup-first-supervisor',
        {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );
      set({
        user: res.data.user,
        isAuthenticated: true,
        setupRequired: false,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignora erro no logout para garantir reset do estado cliente
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
