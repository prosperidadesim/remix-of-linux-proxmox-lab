import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { TerminalUI } from '@/components/terminal/TerminalUI';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Terminal,
  Info,
  ShieldCheck,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TerminalLab() {
  const { apiUrl } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Convert HTTP URL to WebSocket URL
  const wsUrl = apiUrl?.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/terminal';

  const handleSessionStart = (id: string) => {
    setSessionId(id);
    setSessionStartTime(new Date());
  };

  const handleSessionEnd = () => {
    setSessionId(null);
    setSessionStartTime(null);
  };

  const quickCommands = [
    { cmd: 'ls -la', desc: 'Listar arquivos com detalhes' },
    { cmd: 'pwd', desc: 'Mostrar diretório atual' },
    { cmd: 'uname -a', desc: 'Informações do sistema' },
    { cmd: 'df -h', desc: 'Uso de disco' },
    { cmd: 'free -h', desc: 'Uso de memória' },
    { cmd: 'ps aux', desc: 'Processos em execução' },
    { cmd: 'cat /etc/os-release', desc: 'Versão do sistema' },
    { cmd: 'whoami', desc: 'Usuário atual' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Terminal className="h-8 w-8 text-primary" />
              Terminal de Estudos
            </h1>
            <p className="text-muted-foreground mt-1">
              Pratique comandos Linux em um ambiente seguro e isolado
            </p>
          </div>
          
          {sessionId && sessionStartTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Sessão iniciada: {sessionStartTime.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Security notice */}
        <Card className="border-info/50 bg-info/5">
          <CardContent className="flex items-start gap-3 py-4">
            <ShieldCheck className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-info">Ambiente Sandbox Seguro</p>
              <p className="text-muted-foreground">
                Este terminal roda em um container Docker isolado. Seus comandos não afetam o sistema real.
                O ambiente é reiniciado automaticamente após inatividade.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Terminal */}
          <div className="lg:col-span-3">
            <TerminalUI
              wsUrl={wsUrl}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionEnd}
              className="h-[600px]"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Environment info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Ambiente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> CPU
                  </span>
                  <span>0.5 cores</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <HardDrive className="h-4 w-4" /> RAM
                  </span>
                  <span>256 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Timeout
                  </span>
                  <span>30s/cmd</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick commands */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Comandos Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickCommands.map((item, i) => (
                  <div key={i} className="group">
                    <code className="text-xs bg-muted px-2 py-1 rounded block font-mono text-primary">
                      {item.cmd}
                    </code>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-warning/30 bg-warning/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Limitações
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Rede desabilitada por segurança</p>
                <p>• Arquivos são temporários</p>
                <p>• Alguns comandos podem estar bloqueados</p>
                <p>• Sessão expira após 30 min de inatividade</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recursos de Aprendizado
            </CardTitle>
            <CardDescription>
              Use estes exercícios para praticar comandos Linux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="files">Arquivos</TabsTrigger>
                <TabsTrigger value="process">Processos</TabsTrigger>
                <TabsTrigger value="network">Rede</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Navegação</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Aprenda a navegar pelo sistema de arquivos
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      cd, pwd, ls, tree
                    </code>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Ajuda</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Como obter ajuda sobre comandos
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      man, --help, info, whatis
                    </code>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="mt-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Manipulação</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Criar, copiar, mover e deletar arquivos
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      touch, cp, mv, rm, mkdir
                    </code>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Visualização</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ler e buscar em arquivos
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      cat, less, head, tail, grep
                    </code>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="process" className="mt-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Monitoramento</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Visualizar processos em execução
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      ps, top, htop, pgrep
                    </code>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Controle</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Gerenciar processos
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">
                      kill, killall, bg, fg, jobs
                    </code>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="network" className="mt-4">
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm text-warning flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Comandos de rede estão desabilitados neste sandbox por segurança.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Para praticar comandos de rede, utilize uma VM ou ambiente local.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
