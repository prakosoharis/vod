/**
 * App Navigator - top-level routing
 *
 * Handles:
 *   - Auth state (login vs main app)
 *   - Subscription check (initial fetch on mount)
 *   - Routes to all screens
 */
import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import LoginScreen from '@/screens/auth/LoginScreen';
import HomeScreen from '@/screens/home/HomeScreen';
import BrowseScreen from '@/screens/browse/BrowseScreen';
import LiveScreen from '@/screens/live/LiveScreen';
import LiveStreamScreen from '@/screens/live/LiveStreamScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import ContentDetailScreen from '@/screens/content/ContentDetailScreen';
import VideoPlayerScreen from '@/screens/player/VideoPlayerScreen';
import PaygateScreen from '@/screens/subscription/PaygateScreen';

export function AppNavigator() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, hasHydrated, checkAuth } = useAuthStore();
  const refreshSubscription = useSubscriptionStore((s) => s.refresh);

  // Initial auth check
  useEffect(() => {
    if (!hasHydrated) {
      checkAuth();
    }
  }, [hasHydrated, checkAuth]);

  // Fetch subscription when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);

  // Listen for forced logout (401 from API)
  useEffect(() => {
    const handleLogout = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  if (!hasHydrated || isLoading) {
    return <LoadingSpinner label="Memuat aplikasi..." />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/browse" element={<BrowseScreen />} />
      <Route path="/live" element={<LiveScreen />} />
      <Route path="/live-stream/:id" element={<LiveStreamScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/content/:id" element={<ContentDetailScreen />} />
      <Route path="/player/:id" element={<VideoPlayerScreen />} />
      <Route path="/paygate" element={<PaygateScreen />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default AppNavigator;
