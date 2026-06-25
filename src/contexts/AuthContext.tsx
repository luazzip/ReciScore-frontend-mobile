import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { login as loginRequest, register as registerRequest, logout as logoutRequest } from '../services/authService';
import { getAccessToken } from '../services/tokenService';
import { LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSession() {
    try {
      const token = await getAccessToken();
      setIsAuthenticated(Boolean(token));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function login(data: LoginRequest) {
    await loginRequest(data);
    setIsAuthenticated(true);
  }

  async function register(data: RegisterRequest) {
    await registerRequest(data);
    setIsAuthenticated(true);
  }

  async function logout() {
    await logoutRequest();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}