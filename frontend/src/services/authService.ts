import config from '../config';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  role?: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${config.API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }

  const authResponse = await response.json();
  
  // Save token and user data
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  
  return authResponse;
};

/**
 * Login a user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${config.API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  const authResponse = await response.json();
  
  // Save token and user data
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  
  return authResponse;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Check if a user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if a user is an admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'Admin';
};

/**
 * Get the auth token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if a user is authorized based on role
 */
export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  return user?.role === requiredRole;
};

/**
 * Add auth headers to a fetch request
 */
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 