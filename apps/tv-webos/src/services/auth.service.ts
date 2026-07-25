import apiService from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.login(credentials.email, credentials.password);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiService.register(data.email, data.password, data.full_name);
  }

  async logout(): Promise<void> {
    return apiService.logout();
  }

  async checkAuth(): Promise<any> {
    return apiService.checkAuth();
  }
}

export const authService = new AuthService();
export default authService;
