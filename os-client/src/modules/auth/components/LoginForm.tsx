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
 * Formulário de login nominal do dia a dia (operador e supervisor).
 * Autenticação estritamente por nome de usuário e senha.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToFirstAccess, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Informe seu usuário e senha.');
      return;
    }

    try {
      await login(username.trim(), password);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    }
  };

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
      {/* Cabeçalho com Título e Subtítulo */}
      <div className="text-left">
        <h2 className="text-xl font-bold tracking-tight text-neutral-dark">Acesso ao Sistema</h2>
        <p className="text-xs text-slate-500 mt-1">Insira suas credenciais para continuar.</p>
      </div>

      {/* Exibição condicional de erro sem espaço reservado prévio */}
      {errorMessage && (
        <div
          role="alert"
          className="w-full flex items-start gap-2.5 px-3 py-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-tight">{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1.5 text-left">
        <Label htmlFor="login-username">Usuário</Label>
        <Input
          id="login-username"
          type="text"
          autoComplete="username"
          placeholder="nome_sobrenome"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
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
        className="w-full mt-2 h-10 font-semibold text-sm flex items-center justify-center gap-2 disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:pointer-events-auto disabled:opacity-100 disabled:shadow-none transition-all duration-200"
        disabled={!isFormValid || isLoading}
      >
        <LogIn className="w-4 h-4" />
        {isLoading ? 'Autenticando...' : 'Entrar'}
      </Button>

      {onSwitchToFirstAccess && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onSwitchToFirstAccess}
            className="text-xs font-medium text-slate-500 hover:text-brand-primary hover:underline transition-colors focus:outline-none focus:underline"
          >
            Primeiro acesso? <span className="font-semibold text-brand-primary">Ativar conta</span>
          </button>
        </div>
      )}
    </form>
  );
};
