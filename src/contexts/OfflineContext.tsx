import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

type ConnectionStatus = 'online' | 'offline' | 'checking';

interface PendingSync {
  id: string;
  endpoint: string;
  method: string;
  body: string;
  timestamp: number;
}

interface OfflineContextType {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  pendingSyncs: number;
  lastSyncTime: number | null;
  checkConnection: () => Promise<boolean>;
  queueSync: (endpoint: string, method: string, body: object) => void;
  processPendingSyncs: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const STORAGE_KEY = 'mikrotik-pending-syncs';
const LAST_SYNC_KEY = 'mikrotik-last-sync';

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { apiUrl, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [pendingSyncs, setPendingSyncs] = useState<PendingSync[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [wasOffline, setWasOffline] = useState(false);

  // Load pending syncs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPendingSyncs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse pending syncs');
      }
    }

    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
      setLastSyncTime(parseInt(lastSync, 10));
    }
  }, []);

  // Save pending syncs to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingSyncs));
  }, [pendingSyncs]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setConnectionStatus('checking');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const isOnline = response.ok || response.status < 500;
      setConnectionStatus(isOnline ? 'online' : 'offline');
      
      // If we were offline and now online, show toast and sync
      if (wasOffline && isOnline) {
        toast.success('Conexão restaurada!', {
          description: pendingSyncs.length > 0 
            ? `${pendingSyncs.length} alterações pendentes serão sincronizadas` 
            : 'Você está online novamente'
        });
      }
      
      setWasOffline(!isOnline);
      return isOnline;
    } catch (error) {
      setConnectionStatus('offline');
      if (!wasOffline) {
        toast.warning('Modo offline ativado', {
          description: 'Suas alterações serão salvas localmente'
        });
      }
      setWasOffline(true);
      return false;
    }
  }, [apiUrl, wasOffline, pendingSyncs.length]);

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 30000);
    
    // Also listen to browser online/offline events
    const handleOnline = () => checkConnection();
    const handleOffline = () => {
      setConnectionStatus('offline');
      setWasOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Queue a sync operation for when we're back online
  const queueSync = useCallback((endpoint: string, method: string, body: object) => {
    const newSync: PendingSync = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      body: JSON.stringify(body),
      timestamp: Date.now(),
    };
    
    setPendingSyncs(prev => [...prev, newSync]);
  }, []);

  // Process all pending syncs
  const processPendingSyncs = useCallback(async () => {
    if (!token || pendingSyncs.length === 0) return;
    
    const isOnline = await checkConnection();
    if (!isOnline) return;

    const syncsToProcess = [...pendingSyncs];
    const failed: PendingSync[] = [];
    let successCount = 0;

    for (const sync of syncsToProcess) {
      try {
        const response = await fetch(`${apiUrl}${sync.endpoint}`, {
          method: sync.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: sync.body,
        });

        if (response.ok) {
          successCount++;
        } else {
          failed.push(sync);
        }
      } catch (error) {
        failed.push(sync);
      }
    }

    setPendingSyncs(failed);
    
    if (successCount > 0) {
      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      
      toast.success(`${successCount} alterações sincronizadas!`);
    }

    if (failed.length > 0) {
      toast.error(`${failed.length} alterações falharam ao sincronizar`);
    }
  }, [token, apiUrl, pendingSyncs, checkConnection]);

  // Auto-process pending syncs when coming back online
  useEffect(() => {
    if (connectionStatus === 'online' && pendingSyncs.length > 0) {
      processPendingSyncs();
    }
  }, [connectionStatus, pendingSyncs.length, processPendingSyncs]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline: connectionStatus === 'online',
        connectionStatus,
        pendingSyncs: pendingSyncs.length,
        lastSyncTime,
        checkConnection,
        queueSync,
        processPendingSyncs,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
