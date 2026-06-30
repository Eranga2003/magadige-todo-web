const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  usageType: 'OWN' | 'TEAM' | null;
  currentManagementMethod: 'PAPER' | 'APP' | null;
  createdAt: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    token: string;
    user: UserProfile;
  };
}

export interface RegisterPayload {
  email: string;
  password?: string;
  name: string;
  usageType: 'OWN' | 'TEAM';
  currentManagementMethod: 'PAPER' | 'APP';
}

export interface SocialLoginPayload {
  provider: 'GOOGLE' | 'FACEBOOK';
  token: string;
  name: string;
  email?: string;
  usageType?: 'OWN' | 'TEAM';
  currentManagementMethod?: 'PAPER' | 'APP';
}

/**
 * Reusable fetch wrapper to set headers, content types, and Authorization token
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('magadige_auth_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData.message || `API error (${response.status})`;
    const error: any = new Error(errorMsg);
    error.errors = responseData.errors; // Zod validation issues
    throw error;
  }

  return responseData as T;
}

/**
 * Authentication service module
 */
export const authService = {
  /**
   * Register a new user with onboarding details
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return fetchAPI<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Log in a user with credentials
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return fetchAPI<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Log in or Register via Google or Facebook
   */
  async socialLogin(payload: SocialLoginPayload): Promise<AuthResponse> {
    return fetchAPI<AuthResponse>('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch authenticated user details
   */
  async getMe(): Promise<{ status: string; data: { user: UserProfile } }> {
    return fetchAPI<{ status: string; data: { user: UserProfile } }>('/auth/me');
  },
};
