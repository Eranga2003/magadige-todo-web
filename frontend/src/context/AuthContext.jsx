import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage on mount to restore user session
    const initializeAuth = async () => {
      const token = localStorage.getItem('magadige_auth_token');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data.user);
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          localStorage.removeItem('magadige_auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('magadige_auth_token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      localStorage.setItem('magadige_auth_token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.socialLogin(payload);
      localStorage.setItem('magadige_auth_token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
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
