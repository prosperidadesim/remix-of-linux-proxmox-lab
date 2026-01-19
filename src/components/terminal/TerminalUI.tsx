import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Circle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@xterm/xterm/css/xterm.css';

interface TerminalUIProps {
  wsUrl?: string;
  className?: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'unavailable';

export function TerminalUI({ wsUrl, className, onSessionStart, onSessionEnd }: TerminalUIProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [sandboxAvailable, setSandboxAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const connect = useCallback(() => {
    if (!wsUrl) {
      setStatus('unavailable');
      setErrorMessage('URL do WebSocket não configurada');
      return;
    }

    setStatus('connecting');
    setErrorMessage('');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        terminalInstance.current?.write('\r\n\x1b[32m✓ Conectado ao sandbox\x1b[0m\r\n\r\n');
        terminalInstance.current?.write('\x1b[33mDigite "help" para ver os comandos disponíveis.\x1b[0m\r\n\r\n');
        terminalInstance.current?.write('\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'session') {
            onSessionStart?.(data.sessionId);
            setSandboxAvailable(data.sandboxType === 'docker');
          } else if (data.type === 'output') {
            terminalInstance.current?.write(data.data);
          } else if (data.type === 'error') {
            terminalInstance.current?.write(`\r\n\x1b[31mErro: ${data.message}\x1b[0m\r\n`);
            terminalInstance.current?.write('\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
          } else if (data.type === 'unavailable') {
            setSandboxAvailable(false);
            setErrorMessage(data.message || 'Sandbox não disponível');
          }
        } catch {
          // Raw output
          terminalInstance.current?.write(event.data);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        terminalInstance.current?.write('\r\n\x1b[31m✗ Desconectado\x1b[0m\r\n');
        onSessionEnd?.();
      };

      ws.onerror = () => {
        setStatus('error');
        setErrorMessage('Erro de conexão com o servidor');
        terminalInstance.current?.write('\r\n\x1b[31m✗ Erro de conexão\x1b[0m\r\n');
      };
    } catch (err) {
      setStatus('error');
      setErrorMessage('Não foi possível conectar ao servidor');
    }
  }, [wsUrl, onSessionStart, onSessionEnd]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      theme: {
        background: '#0a0a0f',
        foreground: '#e4e4e7',
        cursor: '#E57000',
        cursorAccent: '#0a0a0f',
        selectionBackground: '#E5700040',
        black: '#18181b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
      convertEol: true,
      scrollback: 1000,
    });

    const fit = new FitAddon();
    fitAddon.current = fit;
    term.loadAddon(fit);
    term.open(terminalRef.current);
    fit.fit();

    terminalInstance.current = term;

    // Welcome message
    term.writeln('\x1b[1;33m╔════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;33m║           \x1b[1;37mInfra Study Lab - Terminal Sandbox\x1b[1;33m           ║\x1b[0m');
    term.writeln('\x1b[1;33m║          \x1b[0;36mPratique comandos Linux com segurança\x1b[1;33m         ║\x1b[0m');
    term.writeln('\x1b[1;33m╚════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');

    // Input handling
    let currentLine = '';
    term.onData((data) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      if (data === '\r') {
        // Enter key
        wsRef.current.send(JSON.stringify({ type: 'command', data: currentLine }));
        term.write('\r\n');
        currentLine = '';
      } else if (data === '\x7f') {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === '\x03') {
        // Ctrl+C
        wsRef.current.send(JSON.stringify({ type: 'signal', data: 'SIGINT' }));
        term.write('^C\r\n');
        term.write('\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
        currentLine = '';
      } else if (data.charCodeAt(0) >= 32) {
        // Printable characters
        currentLine += data;
        term.write(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fit.fit();
    };
    window.addEventListener('resize', handleResize);

    // Connect automatically if URL provided
    if (wsUrl) {
      setTimeout(connect, 500);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      wsRef.current?.close();
      term.dispose();
    };
  }, [wsUrl, connect]);

  const handleClear = () => {
    terminalInstance.current?.clear();
    terminalInstance.current?.write('\x1b[36muser@sandbox\x1b[0m:\x1b[34m~\x1b[0m$ ');
  };

  const handleReconnect = () => {
    wsRef.current?.close();
    setTimeout(connect, 100);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning animate-pulse';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      case 'unavailable': return 'Indisponível';
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-[#0a0a0f]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="w-3 h-3 rounded-full bg-success" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">terminal@sandbox</span>
        </div>

        <div className="flex items-center gap-2">
          {sandboxAvailable === true && (
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
              Docker Sandbox
            </Badge>
          )}
          {sandboxAvailable === false && (
            <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
              Modo Restrito
            </Badge>
          )}
          
          <div className="flex items-center gap-1.5 text-sm">
            <Circle className={cn("h-2 w-2 fill-current", getStatusColor())} />
            <span className={getStatusColor()}>{getStatusText()}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReconnect}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sandbox warning */}
      {sandboxAvailable === false && (
        <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/20 text-warning text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Sandbox Docker não disponível. Apenas comandos da whitelist são permitidos.</span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && status !== 'connected' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Terminal */}
      <div 
        ref={terminalRef} 
        className="flex-1 bg-[#0a0a0f] p-2"
        style={{ minHeight: '400px' }}
      />

      {/* Footer hint */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+C</kbd> para cancelar • 
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">↑</kbd>/<kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd> para histórico
      </div>
    </div>
  );
}
