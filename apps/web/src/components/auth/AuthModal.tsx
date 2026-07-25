import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title = 'Login',
  subtitle = 'Masuk untuk mengakses semua fitur'
}) => {
  const [isLogin, setIsLogin] = React.useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-warm-charcoal-100 to-warm-charcoal-90 p-8 shadow-2xl border border-warm-charcoal-50">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-cream-200 hover:text-cream-50 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-cream-50">{title}</h2>
          <p className="mt-2 text-sm text-cream-200">{subtitle}</p>
        </div>

        {/* Forms */}
        {isLogin ? (
          <>
            <LoginForm
              onSuccess={onClose}
              isModal
            />
            <Link
              to="/forgot-password"
              onClick={onClose}
              className="mt-4 block text-center text-sm text-cream-200 transition-colors hover:text-accent-400"
            >
              Lupa password?
            </Link>
          </>
        ) : (
          <RegisterForm
            onSuccess={onClose}
            isModal
          />
        )}

        {/* Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-accent-500 hover:text-accent-400 transition-colors"
          >
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
