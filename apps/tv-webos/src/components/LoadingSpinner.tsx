/**
 * Loading Spinner
 */
import { COLORS } from '@/constants';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 80,
  label = 'Loading...',
  fullScreen = true,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      style={{
        width: size,
        height: size,
        border: `${Math.max(4, size / 20)}px solid rgba(198, 125, 75, 0.2)`,
        borderTopColor: COLORS.accent[500],
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }}
    />
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          background: COLORS.warmCharcoal[100],
          zIndex: 9999,
        }}
      >
        {spinner}
        {label && (
          <p style={{ color: COLORS.cream[200], fontSize: 24 }}>{label}</p>
        )}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
