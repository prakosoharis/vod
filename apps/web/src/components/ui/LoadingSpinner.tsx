import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`${sizeClasses[size]} border-4 border-gray-600 border-t-red-600 rounded-full animate-spin`}
        />
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner