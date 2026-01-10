import { useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Target, 
  Trophy, 
  TrendingUp, 
  Clock,
  BookOpen,
  Flame,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/types/question';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--warning))'];

export default function Estatisticas() {
  const { questions, progress, answers } = useStudyStore();

  const stats = useMemo(() => {
    const accuracy = progress.totalAnswered > 0 
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

    const categoryData = CATEGORIES.map(cat => {
      const catProgress = progress.categoryProgress[cat] || { correct: 0, total: 0 };
      const catQuestions = questions.filter(q => q.categoria === cat).length;
      const pct = catProgress.total > 0 ? Math.round((catProgress.correct / catProgress.total) * 100) : 0;
      return {
        name: cat.length > 12 ? cat.substring(0, 12) + '...' : cat,
        fullName: cat,
        acertos: catProgress.correct,
        erros: catProgress.total - catProgress.correct,
        total: catQuestions,
        pct,
      };
    }).filter(c => c.total > 0);

    const difficultyData = ['Easy', 'Medium', 'Hard'].map(diff => {
      const qs = questions.filter(q => q.dificuldade === diff);
      let correct = 0;
      let total = 0;
      qs.forEach(q => {
        const ans = answers.filter(a => a.questionId === q.id);
        ans.forEach(a => {
          total++;
          if (a.isCorrect) correct++;
        });
      });
      return {
        name: diff === 'Easy' ? 'Fácil' : diff === 'Medium' ? 'Médio' : 'Difícil',
        value: total,
        correct,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    const pieData = [
      { name: 'Corretas', value: progress.totalCorrect },
      { name: 'Incorretas', value: progress.totalIncorrect },
    ].filter(d => d.value > 0);

    // Recent activity (last 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentAnswers = answers.filter(a => a.timestamp > sevenDaysAgo);
    const dailyActivity: Record<string, { date: string; count: number; correct: number }> = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      dailyActivity[key] = { date: dayName, count: 0, correct: 0 };
    }

    recentAnswers.forEach(a => {
      const key = new Date(a.timestamp).toISOString().split('T')[0];
      if (dailyActivity[key]) {
        dailyActivity[key].count++;
        if (a.isCorrect) dailyActivity[key].correct++;
      }
    });

    const activityData = Object.values(dailyActivity);

    return {
      accuracy,
      categoryData,
      difficultyData,
      pieData,
      activityData,
      totalQuestions: questions.length,
      answeredQuestions: progress.questionsAnswered.length,
      coverage: questions.length > 0 ? Math.round((progress.questionsAnswered.length / questions.length) * 100) : 0,
    };
  }, [questions, progress, answers]);

  if (progress.totalAnswered === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sem estatísticas ainda</h1>
          <p className="text-muted-foreground">
            Comece a estudar para ver suas estatísticas aqui.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Estatísticas</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso de estudos</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
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
                    <Trophy className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{progress.totalCorrect}</p>
                    <p className="text-xs text-muted-foreground">Respostas Corretas</p>
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
                    <BookOpen className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.coverage}%</p>
                    <p className="text-xs text-muted-foreground">Cobertura do Banco</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Flame className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{progress.streak}</p>
                    <p className="text-xs text-muted-foreground">Sequência de Dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Atividade Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" name="Questões" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="correct" name="Corretas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Distribuição de Respostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Desempenho por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryData.map((cat, idx) => (
                <motion.div 
                  key={cat.fullName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.fullName}</span>
                      <Badge variant="outline" className="text-xs">{cat.total} questões</Badge>
                    </div>
                    <span className={cn(
                      "font-medium",
                      cat.pct >= 60 ? "text-success" : cat.pct >= 40 ? "text-warning" : "text-destructive"
                    )}>
                      {cat.acertos}/{cat.acertos + cat.erros} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div 
                      className="bg-success rounded-l-full transition-all"
                      style={{ width: `${(cat.acertos / Math.max(cat.acertos + cat.erros, 1)) * 100}%` }}
                    />
                    <div 
                      className="bg-destructive rounded-r-full transition-all"
                      style={{ width: `${(cat.erros / Math.max(cat.acertos + cat.erros, 1)) * 100}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempenho por Dificuldade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.difficultyData.map((diff, idx) => (
                <motion.div
                  key={diff.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-xl border bg-card text-center"
                >
                  <Badge className="mb-2" variant={
                    diff.name === 'Fácil' ? 'default' :
                    diff.name === 'Médio' ? 'secondary' : 'destructive'
                  }>
                    {diff.name}
                  </Badge>
                  <p className="text-3xl font-bold">{diff.pct}%</p>
                  <p className="text-sm text-muted-foreground">
                    {diff.correct}/{diff.value} corretas
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
