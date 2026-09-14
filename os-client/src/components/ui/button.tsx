import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Variantes de botão baseadas nas diretrizes visuais do OmniDS.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-primary text-white shadow-xs hover:bg-brand-hover focus-visible:ring-brand-primary/30 active:scale-[0.99]',
        secondary:
          'bg-white border border-neutral-300 text-neutral-700 shadow-xs hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-950',
        outline:
          'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950',
        ghost:
          'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950',
        destructive:
          'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white',
        link:
          'text-neutral-500 underline-offset-4 hover:underline hover:text-neutral-950 p-0 h-auto',
        icon:
          'h-8 w-8 p-0 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950',
        contextualHelp:
          'h-4 w-4 rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-800 hover:text-white text-[10px] font-bold p-0',
      },
      size: {
        default: 'h-[38px] px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 text-base',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
