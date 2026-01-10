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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Download,
  FileSpreadsheet,
  FileText,
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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        const errorData = await statsRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao carregar dados. Verifique se você é administrador.');
      }
      
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      }
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

  // ========== EXPORT FUNCTIONS ==========

  const exportToExcel = () => {
    if (!users.length || !stats) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    // Sheet 1: Resumo Geral
    const summaryData = [
      ['Relatório de Desempenho da Equipe'],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [''],
      ['Métricas Gerais'],
      ['Total de Usuários', stats.totalUsers],
      ['Usuários Ativos (7 dias)', stats.activeUsers],
      ['Total de Respostas', stats.totalAnswers],
      ['Respostas Corretas', stats.correctAnswers],
      ['Taxa de Acerto Global', `${stats.globalAccuracy}%`],
    ];

    // Sheet 2: Usuários
    const usersData = users.map(u => ({
      'Nome': u.displayName,
      'Usuário': u.username,
      'Email': u.email,
      'Função': u.role === 'admin' ? 'Administrador' : 'Usuário',
      'Questões Respondidas': u.stats.totalAnswered,
      'Corretas': u.stats.totalCorrect,
      'Incorretas': u.stats.totalIncorrect,
      'Taxa de Acerto (%)': u.stats.accuracy,
      'Sequência': u.stats.streak,
      'Último Acesso': u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('pt-BR') : 'Nunca',
      'Criado em': new Date(u.createdAt).toLocaleDateString('pt-BR'),
    }));

    // Sheet 3: Ranking
    const rankingData = stats.topUsers.map((u, index) => ({
      'Posição': index + 1,
      'Nome': u.displayName,
      'Usuário': u.username,
      'Total Respondidas': u.totalAnswered,
      'Total Corretas': u.totalCorrect,
      'Taxa de Acerto (%)': u.accuracy,
      'Sequência': u.streak,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');
    
    const ws2 = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Usuários');
    
    const ws3 = XLSX.utils.json_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Ranking');

    // Download
    const fileName = `relatorio-equipe-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Relatório Excel exportado!');
  };

  const exportToPDF = () => {
    if (!users.length || !stats) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Relatório de Desempenho da Equipe', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });

    // Summary Cards
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Métricas Gerais', 14, 42);

    const summaryData = [
      ['Total de Usuários', stats.totalUsers.toString()],
      ['Usuários Ativos (7 dias)', stats.activeUsers.toString()],
      ['Total de Respostas', stats.totalAnswers.toString()],
      ['Respostas Corretas', stats.correctAnswers.toString()],
      ['Taxa de Acerto Global', `${stats.globalAccuracy}%`],
    ];

    autoTable(doc, {
      startY: 46,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204] },
      margin: { left: 14, right: 14 },
    });

    // Users Table
    const finalY1 = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text('Desempenho por Usuário', 14, finalY1 + 12);

    const usersTableData = users.map(u => [
      u.displayName,
      u.stats.totalAnswered.toString(),
      u.stats.totalCorrect.toString(),
      `${u.stats.accuracy}%`,
      u.stats.streak.toString(),
      u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('pt-BR') : 'Nunca',
    ]);

    autoTable(doc, {
      startY: finalY1 + 16,
      head: [['Nome', 'Respondidas', 'Corretas', 'Acerto', 'Sequência', 'Último Acesso']],
      body: usersTableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    // Ranking (new page if needed)
    const finalY2 = (doc as any).lastAutoTable.finalY || 150;
    if (finalY2 > 220) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Top 10 - Ranking', 14, 20);
    } else {
      doc.setFontSize(14);
      doc.text('Top 10 - Ranking', 14, finalY2 + 12);
    }

    const rankingTableData = stats.topUsers.slice(0, 10).map((u, index) => [
      `${index + 1}º`,
      u.displayName,
      u.totalCorrect.toString(),
      `${u.accuracy}%`,
      `${u.streak} 🔥`,
    ]);

    autoTable(doc, {
      startY: finalY2 > 220 ? 24 : finalY2 + 16,
      head: [['Pos.', 'Nome', 'Corretas', 'Acerto', 'Sequência']],
      body: rankingTableData,
      theme: 'striped',
      headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 },
    });

    // ========== CHARTS PAGE ==========
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('Gráficos de Evolução', pageWidth / 2, 20, { align: 'center' });

    // Activity Chart (Bar Chart)
    const chartStartY = 35;
    const chartWidth = pageWidth - 40;
    const chartHeight = 60;
    const chartX = 20;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Atividade Semanal (Questões Respondidas)', 14, chartStartY);

    // Draw chart background
    doc.setFillColor(248, 249, 250);
    doc.rect(chartX, chartStartY + 5, chartWidth, chartHeight, 'F');
    
    // Draw grid lines
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    for (let i = 0; i <= 4; i++) {
      const y = chartStartY + 5 + (chartHeight / 4) * i;
      doc.line(chartX, y, chartX + chartWidth, y);
    }

    // Get max value for scaling
    const activityData = stats.dailyActivity;
    const maxActivity = Math.max(...activityData.map(d => d.count), 1);
    
    // Draw bars
    const barWidth = (chartWidth - 20) / activityData.length - 8;
    activityData.forEach((day, index) => {
      const barHeight = (day.count / maxActivity) * (chartHeight - 15);
      const x = chartX + 10 + index * (barWidth + 8);
      const y = chartStartY + 5 + chartHeight - barHeight - 10;
      
      // Bar
      doc.setFillColor(0, 102, 204);
      if (barHeight > 0) {
        doc.roundedRect(x, y, barWidth, barHeight, 2, 2, 'F');
      }
      
      // Value on top
      doc.setFontSize(8);
      doc.setTextColor(0, 102, 204);
      doc.text(day.count.toString(), x + barWidth / 2, y - 2, { align: 'center' });
      
      // Day label
      doc.setTextColor(100, 100, 100);
      doc.text(day.date, x + barWidth / 2, chartStartY + 5 + chartHeight - 2, { align: 'center' });
    });

    // Performance by User Chart (Horizontal Bar Chart)
    const chart2StartY = chartStartY + chartHeight + 25;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Taxa de Acerto por Usuário (%)', 14, chart2StartY);

    const topUsersForChart = users.slice(0, 8);
    const barChartHeight = topUsersForChart.length * 15 + 10;
    
    // Draw chart background
    doc.setFillColor(248, 249, 250);
    doc.rect(chartX, chart2StartY + 5, chartWidth, barChartHeight, 'F');

    // Draw horizontal bars
    topUsersForChart.forEach((user, index) => {
      const y = chart2StartY + 12 + index * 15;
      const barMaxWidth = chartWidth - 80;
      const barW = (user.stats.accuracy / 100) * barMaxWidth;
      
      // User name
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const displayName = user.displayName.length > 12 
        ? user.displayName.substring(0, 12) + '...' 
        : user.displayName;
      doc.text(displayName, chartX + 5, y + 4);
      
      // Bar
      const barX = chartX + 70;
      const barColor = user.stats.accuracy >= 70 ? [34, 197, 94] : user.stats.accuracy >= 50 ? [251, 191, 36] : [239, 68, 68];
      doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      if (barW > 0) {
        doc.roundedRect(barX, y - 2, barW, 10, 2, 2, 'F');
      }
      
      // Percentage
      doc.setTextColor(barColor[0], barColor[1], barColor[2]);
      doc.text(`${user.stats.accuracy}%`, barX + barW + 5, y + 4);
    });

    // Trend Arrow Indicators
    const chart3StartY = chart2StartY + barChartHeight + 25;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Indicadores de Performance', 14, chart3StartY);

    // Draw performance indicators
    const indicators = [
      { label: 'Taxa de Acerto Global', value: stats.globalAccuracy, suffix: '%', color: stats.globalAccuracy >= 70 ? [34, 197, 94] : [251, 191, 36] },
      { label: 'Usuários Ativos', value: stats.activeUsers, suffix: ` de ${stats.totalUsers}`, color: [0, 102, 204] },
      { label: 'Respostas Corretas', value: Math.round((stats.correctAnswers / Math.max(stats.totalAnswers, 1)) * 100), suffix: '%', color: [34, 197, 94] },
    ];

    const indicatorWidth = (chartWidth - 20) / indicators.length;
    indicators.forEach((ind, index) => {
      const x = chartX + 10 + index * indicatorWidth;
      const y = chart3StartY + 10;
      
      // Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(ind.color[0], ind.color[1], ind.color[2]);
      doc.setLineWidth(1);
      doc.roundedRect(x, y, indicatorWidth - 10, 35, 3, 3, 'FD');
      
      // Value
      doc.setFontSize(18);
      doc.setTextColor(ind.color[0], ind.color[1], ind.color[2]);
      doc.text(`${ind.value}${ind.suffix}`, x + (indicatorWidth - 10) / 2, y + 18, { align: 'center' });
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(ind.label, x + (indicatorWidth - 10) / 2, y + 28, { align: 'center' });
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `MikroTik Study Lab - Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Download
    const fileName = `relatorio-equipe-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success('Relatório PDF exportado!');
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
          <div className="space-y-2">
            <Button onClick={loadData}>Tentar novamente</Button>
            <p className="text-sm text-muted-foreground mt-4">
              Verifique se o backend está rodando: <code className="bg-muted px-2 py-1 rounded">cd backend && npm start</code>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários e acompanhe o desempenho</p>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
