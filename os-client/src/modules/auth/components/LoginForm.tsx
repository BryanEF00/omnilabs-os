import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, LogIn } from 'lucide-react';

interface LoginFormProps {
  onSwitchToFirstAccess?: () => void;
  onSuccess?: () => void;
}

/**
 * Formulário de Login Nominal do Dia a Dia (Operador e Supervisor).
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToFirstAccess, onSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Informe seu usuário ou e-mail corporativo e senha.');
      return;
    }

    try {
      await login(usernameOrEmail, password);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
      <div className="space-y-1 text-left">
        <h2 className="text-xl font-bold tracking-tight text-neutral-dark">Acesso ao Sistema</h2>
        <p className="text-sm text-slate-500">Identificação nominal do operador LD2</p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-tight">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1.5 text-left">
        <Label htmlFor="login-identifier">Usuário ou E-mail Corporativo</Label>
        <Input
          id="login-identifier"
          type="text"
          autoComplete="username"
          placeholder="ex: bryan.fernandes ou @br.ajinomoto.com"
          value={usernameOrEmail}
          onChange={(e) => {
            setUsernameOrEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isLoading}
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2 h-10 font-semibold text-sm flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        <LogIn className="w-4 h-4" />
        {isLoading ? 'Autenticando...' : 'Entrar'}
      </Button>

      {onSwitchToFirstAccess && (
        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={onSwitchToFirstAccess}
            className="text-xs font-medium text-slate-500 hover:text-brand-primary transition-colors focus:outline-none focus:underline"
          >
            Primeiro acesso? <span className="font-semibold text-brand-primary">Ativar conta</span>
          </button>
        </div>
      )}
    </form>
  );
};
