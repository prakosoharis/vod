import React, { forwardRef } from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-accent-500 text-primary-950 hover:bg-accent-600',
      secondary: 'bg-white text-primary-950 hover:bg-primary-50',
      outline: 'border-2 border-primary-50 text-primary-50 hover:bg-primary-50 hover:text-primary-950',
      ghost: 'text-secondary hover:text-primary-50 hover:bg-primary-500/10',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className, 'tv-button')}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
