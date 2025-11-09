import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import type { LoginCredentials, RegisterCredentials } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, setToken, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setUser(response.user);
      setToken(response.token);
      navigate('/browse');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(credentials);
      setUser(response.user);
      setToken(response.token);
      navigate('/browse');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      navigate('/');
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };
};

