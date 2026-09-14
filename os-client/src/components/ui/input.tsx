import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Primitiva de Input com altura padrão de 38px e foco vermelho Ajinomoto.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[38px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-dark placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
