import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Flashcard } from '@/components/study/Flashcard';
import { QuestionCard } from '@/components/study/QuestionCard';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Brain, Target, Trophy, Flame, ArrowRight, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, DEFAULT_FILTERS } from '@/types/question';

export default function Index() {
  const { questions, progress, recordAnswer, filterQuestions, isLoading } = useStudyStore();
  const [mode, setMode] = useState<'dashboard' | 'flashcard' | 'questao'>('dashboard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyQuestions, setStudyQuestions] = useState<typeof questions>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const accuracy = progress.totalAnswered > 0 
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) 
    : 0;

  const startStudy = (studyMode: 'flashcard' | 'questao', count: number = 10) => {
    const available = filterQuestions(DEFAULT_FILTERS);
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, count);
    setStudyQuestions(shuffled);
    setCurrentIndex(0);
    setSessionStats({ correct: 0, total: 0 });
    setMode(studyMode);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (studyQuestions[currentIndex]) {
      recordAnswer({
        questionId: studyQuestions[currentIndex].id,
        selectedIndex: isCorrect ? studyQuestions[currentIndex].corretaIndex : -1,
        isCorrect,
        timestamp: Date.now(),
        mode: 'study',
      });
      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    }
  };

  const handleQuestionAnswer = (selectedIndex: number, isCorrect: boolean) => {
    if (studyQuestions[currentIndex]) {
      recordAnswer({
        questionId: studyQuestions[currentIndex].id,
        selectedIndex,
        isCorrect,
        timestamp: Date.now(),
        mode: 'study',
      });
      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    }
  };

  const handleNext = () => {
    if (currentIndex < studyQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setMode('dashboard');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (mode === 'flashcard' && studyQuestions[currentIndex]) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setMode('dashboard')}>← Voltar</Button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {studyQuestions.length}
            </div>
            <div className="text-sm font-medium text-success">
              {sessionStats.correct} acertos
            </div>
          </div>
          <Progress value={((currentIndex + 1) / studyQuestions.length) * 100} className="mb-8" />
          <Flashcard
            question={studyQuestions[currentIndex]}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </div>
      </Layout>
    );
  }

  if (mode === 'questao' && studyQuestions[currentIndex]) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setMode('dashboard')}>← Voltar</Button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {studyQuestions.length}
            </div>
            <div className="text-sm font-medium text-success">
              {sessionStats.correct} acertos
            </div>
          </div>
          <Progress value={((currentIndex + 1) / studyQuestions.length) * 100} className="mb-8" />
          <QuestionCard
            question={studyQuestions[currentIndex]}
            onAnswer={handleQuestionAnswer}
            onNext={handleNext}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Bem-vindo ao MikroTik Study Lab</h1>
          <p className="text-muted-foreground">Prepare-se para a certificação MTCNA</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.totalAnswered}</p>
                  <p className="text-xs text-muted-foreground">Respondidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Target className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{questions.length}</p>
                  <p className="text-xs text-muted-foreground">Questões</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Flame className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.streak}</p>
                  <p className="text-xs text-muted-foreground">Sequência</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Começar a Estudar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="flashcard" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="flashcard">Flashcards</TabsTrigger>
                <TabsTrigger value="questao">Questões</TabsTrigger>
              </TabsList>
              <TabsContent value="flashcard" className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Estude com cartões de memória. Veja a pergunta, pense na resposta e vire o cartão para conferir.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => startStudy('flashcard', 10)} className="gap-2">
                    <Shuffle className="h-4 w-4" /> 10 Questões
                  </Button>
                  <Button onClick={() => startStudy('flashcard', 20)} variant="outline">
                    20 Questões
                  </Button>
                  <Button onClick={() => startStudy('flashcard', 50)} variant="outline">
                    50 Questões
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="questao" className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Responda questões de múltipla escolha com feedback imediato e explicações detalhadas.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => startStudy('questao', 10)} className="gap-2">
                    <ArrowRight className="h-4 w-4" /> 10 Questões
                  </Button>
                  <Button onClick={() => startStudy('questao', 20)} variant="outline">
                    20 Questões
                  </Button>
                  <Button onClick={() => startStudy('questao', 50)} variant="outline">
                    50 Questões
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Categories Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map(cat => {
                const catProgress = progress.categoryProgress[cat] || { correct: 0, total: 0 };
                const catAccuracy = catProgress.total > 0 ? Math.round((catProgress.correct / catProgress.total) * 100) : 0;
                const catQuestions = questions.filter(q => q.categoria === cat).length;
                
                return (
                  <div key={cat} className="p-4 rounded-xl border bg-card/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{cat}</span>
                      <Badge variant="outline" className="text-xs">{catQuestions}q</Badge>
                    </div>
                    <Progress value={catAccuracy} className="h-2 mb-1" />
                    <div className="text-xs text-muted-foreground">
                      {catProgress.correct}/{catProgress.total} corretas ({catAccuracy}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
