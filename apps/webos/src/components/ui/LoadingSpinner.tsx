import React from 'react';
import { cn } from '../../utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', fullScreen = false, className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className={cn('border-white/20 border-t-accent-500 rounded-full animate-spin', sizes.lg)} />
      </div>
    );
  }

  return (
    <div className={cn('border-white/20 border-t-accent-500 rounded-full animate-spin', sizes[size], className)} />
  );
};

export default LoadingSpinner;
