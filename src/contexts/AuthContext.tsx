import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthCredentials } from '@/types/game';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const result = await api.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const result = await api.login(credentials);
    if (result.success && result.data) {
      setUser(result.data);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const signup = useCallback(async (credentials: AuthCredentials) => {
    const result = await api.signup(credentials);
    if (result.success && result.data) {
      setUser(result.data);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
