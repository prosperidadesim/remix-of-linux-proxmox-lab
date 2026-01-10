import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export function useApi() {
  const { token, apiUrl, logout } = useAuth();

  const fetchApi = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }

      return response;
    } catch (error) {
      // Se for erro de rede, propaga para o caller decidir o que fazer
      throw error;
    }
  }, [token, apiUrl, logout]);

  return { fetchApi, apiUrl };
}
