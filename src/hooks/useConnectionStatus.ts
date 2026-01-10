import { useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

export function useConnectionStatus(apiUrl: string) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [serverInfo, setServerInfo] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    
    try {
      // Tenta fazer uma requisição simples ao backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout de 5 segundos
      
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setServerInfo(data.message || 'Servidor online');
        setStatus('connected');
      } else {
        // Servidor respondeu mas com erro - ainda está online
        setStatus('connected');
        setServerInfo('Servidor respondendo');
      }
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
        setStatus('disconnected');
        setServerInfo(null);
      } else {
        setStatus('disconnected');
        setServerInfo(null);
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    checkConnection();
    
    // Verifica a conexão a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return { status, serverInfo, checkConnection };
}
