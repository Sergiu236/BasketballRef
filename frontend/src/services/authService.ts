import config from '../config';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: TokenPair;
  requiresTwoFactor?: boolean;
  userId?: number;
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

export interface SessionInfo {
  id: number;
  deviceInfo: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastUsedAt: string;
  expiresAt: string;
  isActive: boolean;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Creăm un eveniment custom pentru autentificare
export const AUTH_EVENT = 'auth_state_changed';
export const dispatchAuthEvent = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

/**
 * Get device info for session tracking
 */
const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  return `${platform} - ${userAgent.split(' ')[0]}`;
};

/**
 * Get session info for requests
 */
const getSessionInfo = () => ({
  deviceInfo: getDeviceInfo(),
  userAgent: navigator.userAgent,
});

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${config.API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      sessionInfo: getSessionInfo(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  const authResponse = await response.json();
  
  if (authResponse.success && authResponse.tokens && authResponse.user) {
    // Save tokens and user data
    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    
    // Dispatch event to notify components
    dispatchAuthEvent();
  }
  
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
    body: JSON.stringify({
      ...data,
      sessionInfo: getSessionInfo(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const authResponse = await response.json();
  
  if (authResponse.success && authResponse.tokens && authResponse.user) {
    // Save tokens and user data
    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    
    // Dispatch event to notify components
    dispatchAuthEvent();
  }
  
  return authResponse;
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshTokenValue) {
    return false;
  }

  try {
    const response = await fetch(`${config.API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshTokenValue,
        sessionInfo: getSessionInfo(),
      }),
    });

    if (!response.ok) {
      // Refresh token is invalid, logout user
      logout();
      return false;
    }

    const data = await response.json();
    
    if (data.success && data.tokens) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    return false;
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  // Try to logout on server
  if (refreshTokenValue) {
    try {
      await fetch(`${config.API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          refreshToken: refreshTokenValue,
        }),
      });
    } catch (error) {
      console.error('Error during server logout:', error);
    }
  }
  
  // Clear local storage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  // Dispatch event to notify components
  dispatchAuthEvent();
  
  // Redirect to login
  window.location.href = '/login';
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${config.API_URL}/api/auth/logout-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });

    if (response.ok) {
      // Clear local storage
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // Dispatch event and redirect
      dispatchAuthEvent();
      window.location.href = '/login';
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error logging out from all devices:', error);
    return false;
  }
};

/**
 * Get user's active sessions
 */
export const getUserSessions = async (): Promise<SessionInfo[]> => {
  try {
    const response = await fetch(`${config.API_URL}/api/auth/sessions`, {
      method: 'GET',
      headers: {
        ...authHeader(),
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.sessions || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${config.API_URL}/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        ...authHeader(),
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error revoking session:', error);
    return false;
  }
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
  return !!localStorage.getItem(ACCESS_TOKEN_KEY) && !!localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if a user is an admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'Admin';
};

/**
 * Get the access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get the refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
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
  const token = getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make authenticated API request with automatic token refresh
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Add auth headers
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry with new token
      const newHeaders = {
        'Content-Type': 'application/json',
        ...authHeader(),
        ...options.headers,
      };
      
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    } else {
      // Refresh failed, logout user
      logout();
      throw new Error('Session expired');
    }
  }

  return response;
};

// Backward compatibility
export const getToken = getAccessToken; 