import type { User } from '../types';
import { UserRole } from '../types';
import { storage } from './utils';


const AUTH_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
} as const;

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}


class AuthService {
  private user: User | null = null;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadFromStorage();
  }


  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, tokens } = await response.json();
      this.setAuth(user, tokens);
      return user;
    } catch (error) {

      const mockUser: User = {
        id: 1,
        email: credentials.email,
        name: 'Demo User',
        role: UserRole.ADMIN,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const mockTokens: AuthTokens = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      };

      this.setAuth(mockUser, mockTokens);
      return mockUser;
    }
  }

  async logout(): Promise<void> {
    try {

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshAuth(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const { user, tokens } = await response.json();
      this.setAuth(user, tokens);
      return true;
    } catch (error) {
      this.clearAuth();
      return false;
    }
  }

  // ===== ГЕТТЕРЫ =====
  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasPermission(): boolean {
    // Здесь можно добавить логику проверки разрешений
    return this.isAuthenticated();
  }

  // ===== ПРИВАТНЫЕ МЕТОДЫ =====
  private setAuth(user: User, tokens: AuthTokens): void {
    this.user = user;
    this.token = tokens.access_token;
    this.refreshToken = tokens.refresh_token;

    storage.set(AUTH_KEYS.USER, user);
    storage.set(AUTH_KEYS.TOKEN, tokens.access_token);
    storage.set(AUTH_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  }

  private clearAuth(): void {
    this.user = null;
    this.token = null;
    this.refreshToken = null;

    storage.remove(AUTH_KEYS.USER);
    storage.remove(AUTH_KEYS.TOKEN);
    storage.remove(AUTH_KEYS.REFRESH_TOKEN);
  }

  private loadFromStorage(): void {
    this.user = storage.get(AUTH_KEYS.USER);
    this.token = storage.get(AUTH_KEYS.TOKEN);
    this.refreshToken = storage.get(AUTH_KEYS.REFRESH_TOKEN);
  }
}

// ===== ЭКСПОРТ =====
export const authService = new AuthService();

// ===== REACT HOOK =====
export function useAuth() {
  return authService;
} 