/**
 * Focusable wrapper component for spatial navigation
 */
import { forwardRef, ReactNode, useCallback } from 'react';
import { useFocusable, useIsFocused } from '@/lib/spatialNavigation';
import { THEME } from '@/constants';
import clsx from 'clsx';

interface FocusableProps {
  focusKey: string;
  children: ReactNode;
  onEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  row?: number;
  col?: number;
  className?: string;
  style?: React.CSSProperties;
  focusScale?: number;
  focusGlow?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const Focusable = forwardRef<HTMLElement, FocusableProps>(
  (
    {
      focusKey,
      children,
      onEnter,
      onFocus,
      onBlur,
      disabled = false,
      row,
      col,
      className,
      style,
      focusScale = 1.05,
      focusGlow = true,
      as: Component = 'div',
    },
    _outerRef
  ) => {
    const ref = useFocusable(focusKey, {
      onEnter,
      onFocus,
      onBlur,
      disabled,
      row,
      col,
    });
    const isFocused = useIsFocused(focusKey);

    const combinedStyle: React.CSSProperties = {
      transform: isFocused && !disabled ? `scale(${focusScale})` : undefined,
      boxShadow: isFocused && focusGlow && !disabled ? THEME.shadows.focusGlow : undefined,
      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
      zIndex: isFocused ? 10 : undefined,
      ...style,
    };

    const Tag = Component as any;

    return (
      <Tag
        ref={ref as any}
        className={clsx('focusable', className, { 'is-focused': isFocused })}
        style={combinedStyle}
        data-disabled={disabled}
      >
        {children}
      </Tag>
    );
  }
);

Focusable.displayName = 'Focusable';

// Default export of clsx is from clsx package
export default Focusable;
