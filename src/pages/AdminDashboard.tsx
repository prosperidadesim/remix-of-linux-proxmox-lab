import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  BarChart3,
  Trophy,
  TrendingUp,
  Activity,
  Trash2,
  RotateCcw,
  Eye,
  Edit,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface UserStats {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  stats: {
    totalAnswered: number;
    totalCorrect: number;
    totalIncorrect: number;
    streak: number;
    accuracy: number;
  };
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAnswers: number;
  correctAnswers: number;
  globalAccuracy: number;
  topUsers: {
    id: number;
    displayName: string;
    username: string;
    totalAnswered: number;
    totalCorrect: number;
    streak: number;
    accuracy: number;
  }[];
  dailyActivity: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { fetchApi } = useApi();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New user form
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    role: 'user',
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit user
  const [editingUser, setEditingUser] = useState<UserStats | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', role: '', password: '' });
  
  // User details
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetchApi('/api/admin/stats'),
        fetchApi('/api/admin/users'),
      ]);
      
      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Erro ao carregar dados');
      }
      
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setIsCreating(true);
    try {
      const res = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar usuário');
      }
      
      toast.success('Usuário criado com sucesso!');
      setShowNewUser(false);
      setNewUser({ username: '', email: '', password: '', displayName: '', role: 'user' });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    try {
      const res = await fetchApi(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      
      if (!res.ok) throw new Error('Erro ao atualizar');
      
      toast.success('Usuário atualizado!');
      setEditingUser(null);
      loadData();
    } catch (err) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const res = await fetchApi(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      
      toast.success('Usuário excluído');
      loadData();
    } catch (err) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleResetProgress = async (userId: number) => {
    if (!confirm('Isso irá apagar todo o progresso do usuário. Continuar?')) return;
    
    try {
      const res = await fetchApi(`/api/admin/users/${userId}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao resetar');
      
      toast.success('Progresso resetado');
      loadData();
    } catch (err) {
      toast.error('Erro ao resetar progresso');
    }
  };

  const loadUserDetails = async (userId: number) => {
    setSelectedUser(userId);
    try {
      const res = await fetchApi(`/api/admin/users/${userId}/stats`);
      if (res.ok) {
        setUserDetails(await res.json());
      }
    } catch (err) {
      toast.error('Erro ao carregar detalhes');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData}>Tentar novamente</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários e acompanhe o desempenho</p>
          </div>
          
          <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usuário</Label>
                    <Input
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="joao.silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="joao@empresa.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    placeholder="João Silva"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewUser(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-xs text-muted-foreground">Total Usuários</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Activity className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeUsers}</p>
                      <p className="text-xs text-muted-foreground">Ativos (7 dias)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <BarChart3 className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalAnswers}</p>
                      <p className="text-xs text-muted-foreground">Respostas Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Trophy className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.correctAnswers}</p>
                      <p className="text-xs text-muted-foreground">Corretas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.globalAccuracy}%</p>
                      <p className="text-xs text-muted-foreground">Acerto Global</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Atividade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Veja e gerencie os membros da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="text-center">Respondidas</TableHead>
                      <TableHead className="text-center">Acerto</TableHead>
                      <TableHead className="text-center">Sequência</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{u.displayName}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role === 'admin' ? 'Admin' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {u.stats.totalAnswered}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2">
                            <Progress value={u.stats.accuracy} className="w-16 h-2" />
                            <span className="text-sm">{u.stats.accuracy}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{u.stats.streak} 🔥</span>
                        </TableCell>
                        <TableCell>
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString('pt-BR')
                            : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => loadUserDetails(u.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingUser(u);
                                setEditForm({
                                  displayName: u.displayName,
                                  role: u.role,
                                  password: '',
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResetProgress(u.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            {u.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Top 10 - Melhores Desempenhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topUsers.map((u, index) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{u.displayName}</p>
                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-success">{u.totalCorrect}</p>
                        <p className="text-xs text-muted-foreground">acertos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{u.accuracy}%</p>
                        <p className="text-xs text-muted-foreground">taxa</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{u.streak} 🔥</p>
                        <p className="text-xs text-muted-foreground">sequência</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade da Equipe (Últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.dailyActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Questões respondidas"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nova Senha (deixe em branco para não alterar)</Label>
                <Input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={handleEditUser}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {userDetails?.user?.displayName || 'Carregando...'}
              </DialogTitle>
              <DialogDescription>
                Estatísticas detalhadas do usuário
              </DialogDescription>
            </DialogHeader>
            {userDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold">{userDetails.progress?.totalAnswered || 0}</p>
                    <p className="text-xs text-muted-foreground">Respondidas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold text-success">{userDetails.progress?.totalCorrect || 0}</p>
                    <p className="text-xs text-muted-foreground">Corretas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold text-destructive">{userDetails.progress?.totalIncorrect || 0}</p>
                    <p className="text-xs text-muted-foreground">Incorretas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold">{userDetails.progress?.streak || 0} 🔥</p>
                    <p className="text-xs text-muted-foreground">Sequência</p>
                  </div>
                </div>
                
                {userDetails.exams?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Últimos Simulados</h4>
                    <div className="space-y-2">
                      {userDetails.exams.slice(0, 5).map((exam: any) => (
                        <div key={exam.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">
                            {new Date(exam.startTime).toLocaleDateString('pt-BR')}
                            {exam.certification && ` - ${exam.certification}`}
                          </span>
                          <Badge variant={exam.score >= 70 ? 'default' : 'destructive'}>
                            {exam.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
