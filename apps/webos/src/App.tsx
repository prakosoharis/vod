import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './stores';
import { useKeyboardNavigation } from './hooks';
import './styles/index.css';

import HomePage from './pages/home/HomePage';
import BrowsePage from './pages/browse/BrowsePage';
import LivePage from './pages/live/LivePage';
import ProfilePage from './pages/profile/ProfilePage';
import ContentDetailPage from './pages/content/ContentDetailPage';
import VideoPlayerPage from './pages/player/VideoPlayerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PricingPage from './pages/payment/PricingPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!hasHydrated) {
      useAuthStore.getState().checkAuth();
    }
  }, [hasHydrated]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) {
      useAuthStore.getState().checkAuth();
    }
  }, [hasHydrated]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  useKeyboardNavigation(true);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/live" element={<LivePage />} />
      <Route path="/content/:id" element={<ContentDetailPage />} />
      <Route path="/player/:id" element={<VideoPlayerPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
