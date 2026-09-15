import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface FirstAccessFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

/**
 * Formulário de Primeiro Acesso e Ativação de Conta do Operador.
 * Valida o domínio corporativo @br.ajinomoto.com e criação de senha inicial.
 */
export const FirstAccessForm: React.FC<FirstAccessFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { firstAccess, isLoading } = useAuthStore();

  const isEmailValidDomain =
    email.includes('@') &&
    email.toLowerCase().endsWith('@br.ajinomoto.com') &&
    email.split('@')[0].trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Informe seu e-mail corporativo.');
      return;
    }

    if (!cleanEmail.endsWith('@br.ajinomoto.com')) {
      setErrorMessage('O e-mail deve pertencer obrigatoriamente ao domínio @br.ajinomoto.com.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('A senha deve conter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere.');
      return;
    }

    try {
      await firstAccess(cleanEmail, password);
      onSuccess?.();
    } catch (err: any) {
      if (err.status === 404 || err.code === 'USER_NOT_INVITED') {
        setErrorMessage('E-mail não autorizado para primeiro acesso. Solicite o cadastro à liderança.');
      } else if (err.code === 'INVALID_EMAIL_DOMAIN') {
        setErrorMessage('O e-mail deve pertencer obrigatoriamente ao domínio @br.ajinomoto.com.');
      } else if (err.code === 'NETWORK_ERROR') {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique a rede do laboratório.');
      } else if (err.incidentId) {
        setErrorMessage(`Instabilidade no servidor (Código: ${err.incidentId}). Contate a liderança.`);
      } else {
        setErrorMessage(err.message || 'Falha ao ativar primeiro acesso.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
      <div className="space-y-1 text-left">
        <h2 className="text-xl font-bold tracking-tight text-neutral-dark">Primeiro acesso</h2>
        <p className="text-sm text-slate-500">Ativação de credencial de operador</p>
      </div>

      {/* Slot reservado para mensagens com Zero Layout Shift (CLS = 0) */}
      <div className="min-h-[44px] flex items-center" aria-live="polite">
        {errorMessage ? (
          <div
            role="alert"
            className="w-full flex items-start gap-2.5 px-3 py-2.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="first-access-email">E-mail corporativo</Label>
          {email && (
            <span className="text-[11px] font-medium flex items-center gap-1">
              {isEmailValidDomain ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Domínio válido
                </span>
              ) : (
                <span className="text-amber-600">Requer @br.ajinomoto.com</span>
              )}
            </span>
          )}
        </div>
        <Input
          id="first-access-email"
          type="email"
          autoComplete="email"
          placeholder="nome.sobrenome@br.ajinomoto.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="first-access-password">Defina sua senha</Label>
        <Input
          id="first-access-password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5 text-left">
        <Label htmlFor="first-access-confirm">Confirme sua senha</Label>
        <Input
          id="first-access-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha criada"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
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
        <KeyRound className="w-4 h-4" />
        {isLoading ? 'Ativando...' : 'Ativar minha conta'}
      </Button>

      {onSwitchToLogin && (
        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-xs font-medium text-slate-500 hover:text-neutral-dark inline-flex items-center gap-1.5 transition-colors focus:outline-none focus:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </button>
        </div>
      )}
    </form>
  );
};
