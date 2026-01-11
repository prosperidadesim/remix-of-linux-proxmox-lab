import { useOffline } from '@/contexts/OfflineContext';
import { WifiOff, RefreshCw, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const { isOnline, connectionStatus, pendingSyncs, checkConnection, processPendingSyncs } = useOffline();

  return (
    <AnimatePresence>
      {connectionStatus === 'offline' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500/10 border-b border-amber-500/20"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">Modo Offline</span>
              <span className="text-amber-500/70 hidden sm:inline">
                — Suas alterações estão sendo salvas localmente
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {pendingSyncs > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  {pendingSyncs} pendente{pendingSyncs > 1 ? 's' : ''}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={checkConnection}
                className="h-7 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Reconectar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {connectionStatus === 'checking' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-muted/50 border-b"
        >
          <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando conexão...</span>
          </div>
        </motion.div>
      )}

      {isOnline && pendingSyncs > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-blue-500/10 border-b border-blue-500/20"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Cloud className="h-4 w-4" />
              <span>{pendingSyncs} alteração{pendingSyncs > 1 ? 'ões' : ''} aguardando sincronização</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={processPendingSyncs}
              className="h-7 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-500/10"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Sincronizar agora
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
