import React, { useState, useEffect } from 'react';
import { LoginHeroPanel } from '../components/LoginHeroPanel';
import { LoginForm } from '../components/LoginForm';
import { FirstAccessForm } from '../components/FirstAccessForm';
import { SetupInitialForm } from '../components/SetupInitialForm';
import { useAuthStore } from '@/stores/authStore';

export type AuthMode = 'login' | 'first-access' | 'setup';

interface AuthPageProps {
  initialMode?: AuthMode;
}

/**
 * Página de Acesso em Arquitetura Split-Screen Dual-Panel.
 * Coluna Esquerda: Hero com Logotipo Ajinomoto e 3 Animações Biológicas com Sleep Guard.
 * Coluna Direita: Formulário de Governança Nominal (Login, Primeiro Acesso ou Setup Dia Zero).
 */
export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { setupRequired } = useAuthStore();

  // Força o modo de setup caso o sistema esteja no Dia Zero
  useEffect(() => {
    if (setupRequired) {
      setMode('setup');
    }
  }, [setupRequired]);

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8 select-none">
      <div className="w-full max-w-[800px] h-[520px] bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200/80 flex flex-col md:flex-row overflow-hidden transition-all duration-300">
        {/* Coluna Esquerda: Painel Hero Ajinomoto */}
        <div className="hidden md:flex md:w-[280px] md:min-w-[280px] h-full shrink-0">
          <LoginHeroPanel className="w-full h-full" />
        </div>

        {/* Coluna Direita: Formulários de Governança */}
        <div className="flex-1 h-full bg-white flex flex-col justify-center items-center px-6 sm:px-12 py-8 overflow-y-auto">
          <div className="w-full max-w-[340px] my-auto">
            {mode === 'setup' || setupRequired ? (
              <SetupInitialForm />
            ) : mode === 'first-access' ? (
              <FirstAccessForm onSwitchToLogin={() => setMode('login')} />
            ) : (
              <LoginForm onSwitchToFirstAccess={() => setMode('first-access')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
