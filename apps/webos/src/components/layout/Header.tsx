import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { cn } from '../../utils';
import { LOGO_URL } from '../../utils/constants';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const isAuthPage = location.pathname.startsWith('/auth');

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1A1614]/95 to-transparent">
      <div className="container mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={LOGO_URL}
              alt="Mostara Logo"
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-2xl font-bold text-primary-50 hidden sm:block group-hover:text-accent-500 transition-colors">
              Mostara
            </h1>
          </div>

          {!isAuthPage && (
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => navigate('/')}
                className={cn(
                  'text-base font-medium transition-colors',
                  location.pathname === '/' ? 'text-primary-50' : 'text-secondary hover:text-primary-50'
                )}
              >
                Beranda
              </button>
              <button
                onClick={() => navigate('/browse')}
                className={cn(
                  'text-base font-medium transition-colors',
                  location.pathname === '/browse' ? 'text-primary-50' : 'text-secondary hover:text-primary-50'
                )}
              >
                Jelajah
              </button>
              <button
                onClick={() => navigate('/live')}
                className={cn(
                  'text-base font-medium transition-colors',
                  location.pathname === '/live' ? 'text-primary-50' : 'text-secondary hover:text-primary-50'
                )}
              >
                Live
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={cn(
                  'text-base font-medium transition-colors',
                  location.pathname === '/profile' ? 'text-primary-50' : 'text-secondary hover:text-primary-50'
                )}
              >
                Profil
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary-50 hover:text-accent-500 transition-colors"
            >
              <span className="text-lg">← Kembali</span>
            </button>
          )}

          {isAuthenticated && !isAuthPage && (
            <>
              <span className="text-primary-50 text-base hidden sm:block">{user?.full_name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated && !isAuthPage && (
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
