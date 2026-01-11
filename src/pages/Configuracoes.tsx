import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Palette, 
  RotateCcw, 
  Trash2,
  Moon,
  Sun,
  Info,
  Lock,
  Loader2,
  User,
  CheckCircle2,
  Server,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Configuracoes() {
  const { theme, toggleTheme } = useTheme();
  const { progress, questions } = useStudyStore();
  const { user, apiUrl } = useAuth();
  const { fetchApi } = useApi();
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // API config state
  const [customApiUrl, setCustomApiUrl] = useState(
    localStorage.getItem('mikrotik-api-url') || ''
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { status, serverInfo, checkConnection } = useConnectionStatus(apiUrl);

  const handleTestConnection = async () => {
    const urlToTest = customApiUrl.trim() || apiUrl;
    setIsTestingConnection(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${urlToTest}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        toast.success('Conexão bem-sucedida!', {
          description: `Servidor respondendo em ${urlToTest}`
        });
      } else {
        toast.warning('Servidor respondeu com erro', {
          description: `Status: ${response.status}`
        });
      }
    } catch (error) {
      toast.error('Falha na conexão', {
        description: 'Não foi possível conectar ao servidor'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveApiUrl = () => {
    if (customApiUrl.trim()) {
      localStorage.setItem('mikrotik-api-url', customApiUrl.trim());
      toast.success('URL salva!', { description: 'A página será recarregada' });
    } else {
      localStorage.removeItem('mikrotik-api-url');
      toast.success('URL resetada para padrão');
    }
    setTimeout(() => window.location.reload(), 500);
  };

  const handleClearApiUrl = () => {
    localStorage.removeItem('mikrotik-api-url');
    setCustomApiUrl('');
    toast.success('URL resetada para padrão');
    setTimeout(() => window.location.reload(), 500);
  };

  const clearProgress = () => {
    localStorage.removeItem('mikrotik-progress');
    localStorage.removeItem('mikrotik-answers');
    localStorage.removeItem('mikrotik-exams');
    toast.success('Progresso resetado com sucesso!');
    window.location.reload();
  };

  const clearAllData = () => {
    localStorage.removeItem('mikrotik-questions');
    localStorage.removeItem('mikrotik-progress');
    localStorage.removeItem('mikrotik-answers');
    localStorage.removeItem('mikrotik-exams');
    toast.success('Todos os dados foram limpos!');
    window.location.reload();
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const res = await fetchApi('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao alterar senha');
      }
      
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência de estudo</p>
        </div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Minha Conta
              </CardTitle>
              <CardDescription>Informações da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{user?.displayName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usuário</p>
                    <p className="font-medium">{user?.username || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Função</p>
                    <p className="font-medium">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>Atualize sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>
                
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Server Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Servidor Backend
                  </CardTitle>
                  <CardDescription>Configure a conexão com o servidor da API</CardDescription>
                </div>
                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={checkConnection}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    title="Testar conexão"
                  >
                    {status === 'checking' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'connected' 
                      ? 'bg-green-500/10 text-green-500' 
                      : status === 'disconnected' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {status === 'connected' ? (
                      <><Wifi className="h-3 w-3" /> Online</>
                    ) : status === 'disconnected' ? (
                      <><WifiOff className="h-3 w-3" /> Offline</>
                    ) : (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Verificando</>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current connection info */}
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">URL atual:</span>
                  <code className="bg-background px-2 py-0.5 rounded text-xs">{apiUrl || 'Padrão (mesma origem)'}</code>
                </div>
                {serverInfo && status === 'connected' && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-500 text-xs">{serverInfo}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Custom URL input */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">URL personalizada da API</Label>
                  <Input
                    id="apiUrl"
                    type="text"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    placeholder="Ex: http://localhost:3001 ou https://xxx.ngrok.io"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para usar a URL padrão. Use ngrok para expor seu backend local.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="flex-1"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wifi className="h-4 w-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveApiUrl}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Salvar URL
                  </Button>
                </div>

                {localStorage.getItem('mikrotik-api-url') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearApiUrl}
                    className="w-full text-muted-foreground"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar para padrão
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize o visual do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <Label className="text-base">Tema Escuro</Label>
                    <p className="text-sm text-muted-foreground">Alterne entre tema claro e escuro</p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Gerenciar Dados
              </CardTitle>
              <CardDescription>Gerencie seu progresso e banco de questões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">{questions.length}</p>
                    <p className="text-muted-foreground">Questões no banco</p>
                  </div>
                  <div>
                    <p className="font-medium">{progress.totalAnswered}</p>
                    <p className="text-muted-foreground">Respostas registradas</p>
                  </div>
                  <div>
                    <p className="font-medium">{progress.questionsAnswered.length}</p>
                    <p className="text-muted-foreground">Questões únicas estudadas</p>
                  </div>
                  <div>
                    <p className="font-medium">{progress.markedForReview.length}</p>
                    <p className="text-muted-foreground">Marcadas para revisão</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Resetar Progresso Local
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Resetar Progresso Local?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá apagar o cache local. O progresso no servidor será mantido.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={clearProgress}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="h-4 w-4" />
                      Limpar Cache Local
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar Cache Local?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá limpar os dados em cache no navegador. 
                        O progresso no servidor será mantido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllData} className="bg-destructive hover:bg-destructive/90">
                        Limpar Cache
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Sobre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gradient">MikroTik Study Lab</h3>
                <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
                <p className="text-sm text-muted-foreground">
                  Plataforma de estudos para certificações MikroTik
                </p>
              </div>
              
              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suporte RouterOS</span>
                  <span>v6 & v7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Armazenamento</span>
                  <span>Servidor Local + Cache</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idioma</span>
                  <span>Português (BR)</span>
                </div>
              </div>

              <Separator />

              <div className="text-center text-xs text-muted-foreground">
                <p>
                  Links oficiais: {' '}
                  <a 
                    href="https://help.mikrotik.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    help.mikrotik.com
                  </a>
                  {' '} • {' '}
                  <a 
                    href="https://wiki.mikrotik.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    wiki.mikrotik.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
