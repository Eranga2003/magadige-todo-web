import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, UserProfile, RegisterPayload, SocialLoginPayload } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  socialLogin: (payload: SocialLoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage on mount to restore user session
    const initializeAuth = async () => {
      const token = localStorage.getItem('magadige_auth_token');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data.user);
        } catch (err: any) {
          console.warn('Session restoration failed:', err.message);
          localStorage.removeItem('magadige_auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('magadige_auth_token', response.data.token);
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      localStorage.setItem('magadige_auth_token', response.data.token);
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (payload: SocialLoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.socialLogin(payload);
      localStorage.setItem('magadige_auth_token', response.data.token);
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.message || `${payload.provider} authentication failed`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('magadige_auth_token');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        socialLogin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
