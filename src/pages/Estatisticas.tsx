import { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Target, 
  Trophy, 
  TrendingUp, 
  BookOpen,
  Flame,
  Calendar,
  Award,
  ChevronRight,
  LineChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, CERTIFICATIONS, Track } from '@/types/question';
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
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--warning))'];

export default function Estatisticas() {
  const { questions, progress, answers, exams } = useStudyStore();
  const [selectedCert, setSelectedCert] = useState<Track | null>(null);

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

    // Track stats (renamed from certification)
    const certificationData = CERTIFICATIONS.map(cert => {
      const certQuestions = questions.filter(q => q.track === cert.id);
      const certProgress = progress.certificationProgress?.[cert.id] || { correct: 0, total: 0 };
      const certAnswered = certQuestions.filter(q => progress.questionsAnswered.includes(q.id)).length;
      const pct = certProgress.total > 0 ? Math.round((certProgress.correct / certProgress.total) * 100) : 0;
      
      return {
        id: cert.id,
        nome: cert.nome,
        cor: cert.cor,
        totalQuestions: certQuestions.length,
        answered: certAnswered,
        correct: certProgress.correct,
        incorrect: certProgress.total - certProgress.correct,
        accuracy: pct,
        coverage: certQuestions.length > 0 ? Math.round((certAnswered / certQuestions.length) * 100) : 0,
      };
    }).filter(c => c.totalQuestions > 0);

    // Evolution data (last 30 days)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const evolutionData: { date: string; accuracy: number; total: number }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      const dayAnswers = answers.filter(a => {
        const ansDate = new Date(a.timestamp).toISOString().split('T')[0];
        return ansDate === key;
      });
      
      if (dayAnswers.length > 0) {
        const dayCorrect = dayAnswers.filter(a => a.isCorrect).length;
        evolutionData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          accuracy: Math.round((dayCorrect / dayAnswers.length) * 100),
          total: dayAnswers.length,
        });
      }
    }

    return {
      accuracy,
      categoryData,
      difficultyData,
      pieData,
      activityData,
      certificationData,
      evolutionData,
      totalQuestions: questions.length,
      answeredQuestions: progress.questionsAnswered.length,
      coverage: questions.length > 0 ? Math.round((progress.questionsAnswered.length / questions.length) * 100) : 0,
    };
  }, [questions, progress, answers]);

  // Stats for selected certification
  const certStats = useMemo(() => {
    if (!selectedCert) return null;

    const certInfo = CERTIFICATIONS.find(c => c.id === selectedCert);
    const certQuestions = questions.filter(q => q.track === selectedCert);
    const certAnswers = answers.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q?.track === selectedCert;
    });

    // Categories for this certification
    const categoriesData = [...new Set(certQuestions.map(q => q.categoria))].map(cat => {
      const catQuestions = certQuestions.filter(q => q.categoria === cat);
      const catAnswers = certAnswers.filter(a => catQuestions.some(q => q.id === a.questionId));
      const correct = catAnswers.filter(a => a.isCorrect).length;
      return {
        name: cat,
        total: catQuestions.length,
        answered: catAnswers.length,
        correct,
        accuracy: catAnswers.length > 0 ? Math.round((correct / catAnswers.length) * 100) : 0,
      };
    });

    // Evolution for this certification (last 14 days)
    const now = Date.now();
    const evolutionData: { date: string; accuracy: number; cumulative: number }[] = [];
    let cumCorrect = 0;
    let cumTotal = 0;
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      const dayAnswers = certAnswers.filter(a => {
        const ansDate = new Date(a.timestamp).toISOString().split('T')[0];
        return ansDate === key;
      });
      
      cumTotal += dayAnswers.length;
      cumCorrect += dayAnswers.filter(a => a.isCorrect).length;
      
      if (cumTotal > 0) {
        evolutionData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          accuracy: dayAnswers.length > 0 ? Math.round((dayAnswers.filter(a => a.isCorrect).length / dayAnswers.length) * 100) : 0,
          cumulative: Math.round((cumCorrect / cumTotal) * 100),
        });
      }
    }

    // Difficulty breakdown
    const difficultyData = ['Easy', 'Medium', 'Hard'].map(diff => {
      const qs = certQuestions.filter(q => q.dificuldade === diff);
      const diffAnswers = certAnswers.filter(a => qs.some(q => q.id === a.questionId));
      const correct = diffAnswers.filter(a => a.isCorrect).length;
      return {
        name: diff === 'Easy' ? 'Fácil' : diff === 'Medium' ? 'Médio' : 'Difícil',
        total: qs.length,
        answered: diffAnswers.length,
        correct,
        accuracy: diffAnswers.length > 0 ? Math.round((correct / diffAnswers.length) * 100) : 0,
      };
    });

    const certProgress = progress.certificationProgress?.[selectedCert] || { correct: 0, total: 0 };
    const answeredCount = certQuestions.filter(q => progress.questionsAnswered.includes(q.id)).length;

    return {
      info: certInfo,
      totalQuestions: certQuestions.length,
      answered: answeredCount,
      correct: certProgress.correct,
      incorrect: certProgress.total - certProgress.correct,
      accuracy: certProgress.total > 0 ? Math.round((certProgress.correct / certProgress.total) * 100) : 0,
      coverage: certQuestions.length > 0 ? Math.round((answeredCount / certQuestions.length) * 100) : 0,
      categoriesData,
      evolutionData,
      difficultyData,
    };
  }, [selectedCert, questions, answers, progress]);

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

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="certificacoes" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Por Certificação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6 mt-6">
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

            {/* Evolution Chart */}
            {stats.evolutionData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Evolução do Desempenho (30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.evolutionData}>
                        <defs>
                          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[0, 100]} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`${value}%`, 'Acerto']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorAccuracy)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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
          </TabsContent>

          <TabsContent value="certificacoes" className="space-y-6 mt-6">
            {!selectedCert ? (
              <>
                {/* Certification Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.certificationData.map((cert, idx) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4"
                        style={{ borderLeftColor: cert.cor }}
                        onClick={() => setSelectedCert(cert.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge 
                              className="font-bold"
                              style={{ backgroundColor: cert.cor, color: 'white' }}
                            >
                              {cert.id}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Acerto</span>
                              <span className={cn(
                                "font-semibold",
                                cert.accuracy >= 60 ? "text-success" : 
                                cert.accuracy >= 40 ? "text-warning" : "text-destructive"
                              )}>
                                {cert.accuracy}%
                              </span>
                            </div>
                            <Progress 
                              value={cert.accuracy} 
                              className="h-2"
                            />
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="block text-foreground font-medium">{cert.answered}</span>
                                de {cert.totalQuestions} questões
                              </div>
                              <div>
                                <span className="block text-foreground font-medium">{cert.coverage}%</span>
                                cobertura
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Overall Certification Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5" />
                      Comparativo de Certificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.certificationData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="id" type="category" width={80} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`${value}%`, 'Taxa de Acerto']}
                          />
                          <Bar 
                            dataKey="accuracy" 
                            fill="hsl(var(--primary))" 
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : certStats && (
              <>
                {/* Back Button and Header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Voltar para todas certificações
                  </button>
                  
                  <Card className="border-l-4" style={{ borderLeftColor: certStats.info?.cor }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge 
                            className="font-bold text-lg px-3 py-1"
                            style={{ backgroundColor: certStats.info?.cor, color: 'white' }}
                          >
                            {selectedCert}
                          </Badge>
                          <h2 className="text-xl font-semibold mt-2">{certStats.info?.nome}</h2>
                          <p className="text-muted-foreground mt-1">{certStats.info?.descricao}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold" style={{ color: certStats.info?.cor }}>{certStats.accuracy}%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-success">{certStats.correct}</p>
                      <p className="text-sm text-muted-foreground">Corretas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-destructive">{certStats.incorrect}</p>
                      <p className="text-sm text-muted-foreground">Incorretas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold">{certStats.coverage}%</p>
                      <p className="text-sm text-muted-foreground">Cobertura</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Evolution Chart for Certification */}
                {certStats.evolutionData.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <LineChart className="h-5 w-5" />
                        Evolução do Desempenho
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart data={certStats.evolutionData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" className="text-xs" />
                            <YAxis domain={[0, 100]} className="text-xs" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="accuracy" 
                              name="Acerto Diário"
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={{ fill: 'hsl(var(--primary))' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="cumulative" 
                              name="Acerto Acumulado"
                              stroke={certStats.info?.cor} 
                              strokeWidth={2}
                              dot={{ fill: certStats.info?.cor }}
                            />
                          </ReLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Categories Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Desempenho por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {certStats.categoriesData.map((cat, idx) => (
                        <motion.div 
                          key={cat.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cat.name}</span>
                              <Badge variant="outline" className="text-xs">{cat.total} questões</Badge>
                            </div>
                            <span className={cn(
                              "font-medium",
                              cat.accuracy >= 60 ? "text-success" : cat.accuracy >= 40 ? "text-warning" : "text-destructive"
                            )}>
                              {cat.correct}/{cat.answered} ({cat.accuracy}%)
                            </span>
                          </div>
                          <Progress value={cat.accuracy} className="h-2" />
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
                      {certStats.difficultyData.map((diff, idx) => (
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
                          <p className="text-3xl font-bold">{diff.accuracy}%</p>
                          <p className="text-sm text-muted-foreground">
                            {diff.correct}/{diff.answered} de {diff.total}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
