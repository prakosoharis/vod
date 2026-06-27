/**
 * TV Button Component
 * Variants: primary, secondary, ghost, danger
 */
import { ReactNode } from 'react';
import { Focusable } from './Focusable';
import { COLORS, THEME } from '@/constants';

interface ButtonProps {
  focusKey: string;
  children: ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  row?: number;
  col?: number;
  style?: React.CSSProperties;
  icon?: ReactNode;
}

export function Button({
  focusKey,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  row,
  col,
  style,
  icon,
}: ButtonProps) {
  const sizeStyles = {
    sm: {
      padding: `${THEME.spacing.sm}px ${THEME.spacing.lg}px`,
      fontSize: THEME.typography.fontSize.sm,
      minWidth: 140,
    },
    md: {
      padding: `${THEME.spacing.md}px ${THEME.spacing.xl}px`,
      fontSize: THEME.typography.fontSize.md,
      minWidth: 200,
    },
    lg: {
      padding: `${THEME.spacing.lg}px ${THEME.spacing.xxl}px`,
      fontSize: THEME.typography.fontSize.lg,
      minWidth: 260,
    },
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${COLORS.accent[500]} 0%, ${COLORS.accent[600]} 100%)`,
      color: COLORS.cream[50],
      border: 'none',
      fontWeight: THEME.typography.fontWeight.bold,
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: COLORS.cream[50],
      border: `2px solid ${COLORS.accent[500]}`,
      fontWeight: THEME.typography.fontWeight.semibold,
    },
    ghost: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: COLORS.cream[50],
      border: `1px solid ${COLORS.warmCharcoal[50]}`,
      fontWeight: THEME.typography.fontWeight.medium,
    },
    danger: {
      background: COLORS.error,
      color: '#fff',
      border: 'none',
      fontWeight: THEME.typography.fontWeight.bold,
    },
  };

  return (
    <Focusable
      focusKey={focusKey}
      onEnter={onPress}
      disabled={disabled}
      row={row}
      col={col}
      focusScale={1.05}
    >
      <button
        style={{
          ...sizeStyles[size],
          ...variantStyles[variant],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: THEME.spacing.sm,
          borderRadius: THEME.borderRadius.lg,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? THEME.opacity.disabled : 1,
          transition: 'background 0.2s',
          fontFamily: 'inherit',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onPress();
        }}
      >
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        <span>{children}</span>
      </button>
    </Focusable>
  );
}

export default Button;
