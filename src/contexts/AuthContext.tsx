import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL da API - pode ser configurada via localStorage ou usar padrão
const getApiUrl = () => {
  const saved = localStorage.getItem('mikrotik-api-url');
  if (saved) return saved;
  
  // Em desenvolvimento, usa localhost:3001
  // Em produção, assume que a API está no mesmo servidor (via nginx proxy)
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return window.location.origin;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl] = useState(getApiUrl);

  useEffect(() => {
    const savedToken = localStorage.getItem('mikrotik-token');
    if (savedToken) {
      setToken(savedToken);
      validateToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (authToken: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('mikrotik-token');
        setToken(null);
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      // Não remove o token em caso de erro de rede (servidor pode estar offline)
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('mikrotik-token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mikrotik-token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        apiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
