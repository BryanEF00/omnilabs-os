import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AuthPage } from '@/modules/auth/pages/AuthPage';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, CheckCircle2 } from 'lucide-react';

/**
 * Shell Provisória da Aplicação Autenticada (Workspace LD2).
 * Exibe a identificação nominal do operador e permite testar o ciclo de logout.
 */
function AuthenticatedApp() {
  const { user, logout, isLoading } = useAuthStore();

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* Barra Superior de Navegação */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse" />
          <span className="font-bold text-sm tracking-tight text-neutral-dark">OmniLabs OS</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-600 font-medium">Laboratório de Desenvolvimento II</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 py-1.5 px-3 rounded-full">
            {user?.isSupervisor ? (
              <Shield className="w-3.5 h-3.5 text-brand-primary" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="font-semibold text-slate-900">{user?.fullName}</span>
            <span className="text-slate-400">•</span>
            <span className="text-[11px] text-slate-500">{user?.isSupervisor ? 'Supervisor' : 'Operador'}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            disabled={isLoading}
            className="text-xs text-slate-600 hover:text-brand-primary flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </Button>
        </div>
      </header>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <h1 className="text-lg font-bold text-neutral-dark">Sessão Ativa com Governança Nominal</h1>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bem-vindo ao sistema, <strong>{user?.fullName}</strong> ({user?.username}). Sua autenticação foi validada via cookie <code>HttpOnly</code> seguro emitido pelo <code>core-server</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block mb-1">Papel no LD2</span>
              <span className="font-semibold text-slate-800">{user?.isSupervisor ? 'Supervisor de Processos' : 'Operador Analista'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block mb-1">E-mail Corporativo</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block mb-1">Conexão Backend</span>
              <span className="font-semibold text-emerald-700">API Operacional (Fastify)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Componente Raiz da Aplicação com Roteamento e Checagem de Sessão.
 */
export function App() {
  const { isInitialized, isAuthenticated, setupRequired, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Loading Screen durante inicialização da sessão
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-300 border-t-brand-primary rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          OmniLabs OS • Carregando...
        </span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<AuthenticatedApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : setupRequired ? (
          <>
            <Route path="/setup" element={<AuthPage initialMode="setup" />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/primeiro-acesso" element={<AuthPage initialMode="first-access" />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
