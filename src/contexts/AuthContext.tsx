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
  if (saved) return saved.replace(/\/+$/, '');

  // No preview hospedado, a API (quando existir) está na mesma origem
  if (window.location.hostname.includes('lovableproject.com')) {
    return window.location.origin;
  }

  // Em desenvolvimento local com Vite proxy, usamos a mesma origem ("/api")
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '';
  }

  // Produção: assume /api na mesma origem (via proxy/reverse-proxy)
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
      console.log('Validando token em:', `${apiUrl}/api/auth/me`);
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Usuário validado:', userData);
        setUser(userData);
      } else {
        console.log('Token inválido, removendo...');
        localStorage.removeItem('mikrotik-token');
        setToken(null);
      }
    } catch (error) {
      console.error('Erro ao validar token (backend offline?):', error);
      // Em caso de erro de rede, tenta usar os dados salvos do usuário
      // para permitir navegação enquanto o backend está offline
      const savedUser = localStorage.getItem('mikrotik-user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // Ignora erro de parse
        }
      }
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
    localStorage.setItem('mikrotik-user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mikrotik-token');
    localStorage.removeItem('mikrotik-user');
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
