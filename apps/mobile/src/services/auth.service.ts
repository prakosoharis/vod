import apiService from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.login(credentials.identifier, credentials.password);
  }

  async register(data: RegisterRequest): Promise<any> {
    return apiService.startRegistration({
      method: data.method,
      username: data.username,
      fullName: data.full_name,
      destination: data.method === 'email' ? data.email! : data.phone!,
      password: data.password,
    });
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
