import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';

interface SetupInitialFormProps {
  onSuccess?: () => void;
}

/**
 * Formulário Exclusivo do Dia Zero (Setup Inicial do Sistema).
 * Cadastra o primeiro Supervisor mestre que terá controle do LD2.
 */
export const SetupInitialForm: React.FC<SetupInitialFormProps> = ({ onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setupFirstSupervisor, isLoading } = useAuthStore();

  const isEmailValidDomain =
    email.includes('@') &&
    email.toLowerCase().endsWith('@br.ajinomoto.com') &&
    email.split('@')[0].trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Informe o nome completo do supervisor.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Informe o e-mail corporativo.');
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
      setErrorMessage('A confirmação da senha não confere.');
      return;
    }

    try {
      await setupFirstSupervisor(fullName, cleanEmail, password);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao inicializar o supervisor mestre.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full">
            Dia Zero
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-dark">Configuração Inicial</h2>
        <p className="text-sm text-slate-500">Cadastro do primeiro supervisor mestre</p>
      </div>

      <div className="p-3 text-xs bg-amber-50/80 border border-amber-200/80 rounded-md text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          O banco de dados está virgem. O usuário criado aqui receberá privilégios administrativos
          totais e este assistente de configuração será <strong>trancado permanentemente</strong>.
        </span>
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
        <Label htmlFor="setup-fullname">Nome Completo do Supervisor</Label>
        <Input
          id="setup-fullname"
          type="text"
          placeholder="ex: Bryan E. Fernandes"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="setup-email">E-mail Corporativo</Label>
          {email && (
            <span className="text-[11px] font-medium flex items-center gap-1">
              {isEmailValidDomain ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Válido
                </span>
              ) : (
                <span className="text-amber-600">Requer @br.ajinomoto.com</span>
              )}
            </span>
          )}
        </div>
        <Input
          id="setup-email"
          type="email"
          autoComplete="email"
          placeholder="bryan_fernandes@br.ajinomoto.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="setup-password">Senha Mestra</Label>
          <Input
            id="setup-password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 dígitos"
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
          <Label htmlFor="setup-confirm">Confirmar Senha</Label>
          <Input
            id="setup-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2 h-10 font-semibold text-sm flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4" />
        {isLoading ? 'Configurando...' : 'Inicializar Sistema e Entrar'}
      </Button>
    </form>
  );
};
