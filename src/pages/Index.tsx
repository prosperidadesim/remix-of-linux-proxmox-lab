import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Flashcard } from '@/components/study/Flashcard';
import { QuestionCard } from '@/components/study/QuestionCard';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Brain, Target, Trophy, Flame, ArrowRight, Shuffle, Filter, Check, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, DEFAULT_FILTERS, CERTIFICATIONS, Track, CATEGORIES_BY_TRACK } from '@/types/question';

export default function Index() {
  const { questions, progress, recordAnswer, filterQuestions, isLoading } = useStudyStore();
  const [mode, setMode] = useState<'dashboard' | 'flashcard' | 'questao'>('dashboard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyQuestions, setStudyQuestions] = useState<typeof questions>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);

  const accuracy = progress.totalAnswered > 0 
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) 
    : 0;

  // Filter questions based on selected tracks
  const availableQuestions = useMemo(() => {
    if (selectedTracks.length === 0) {
      return questions;
    }
    return questions.filter(q => selectedTracks.includes(q.track));
  }, [questions, selectedTracks]);

  // Get categories for selected tracks
  const relevantCategories = useMemo(() => {
    if (selectedTracks.length === 0) {
      return CATEGORIES;
    }
    const cats = new Set<string>();
    selectedTracks.forEach(track => {
      CATEGORIES_BY_TRACK[track]?.forEach(cat => cats.add(cat));
    });
    return Array.from(cats);
  }, [selectedTracks]);

  const toggleTrack = (track: Track) => {
    setSelectedTracks(prev => 
      prev.includes(track) 
        ? prev.filter(t => t !== track)
        : [...prev, track]
    );
  };

  const startStudy = (studyMode: 'flashcard' | 'questao', count: number = 10) => {
    const filters = {
      ...DEFAULT_FILTERS,
      tracks: selectedTracks,
    };
    const available = selectedTracks.length > 0 
      ? filterQuestions(filters)
      : filterQuestions(DEFAULT_FILTERS);
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, count);
    setStudyQuestions(shuffled);
    setCurrentIndex(0);
    setSessionStats({ correct: 0, total: 0 });
    setMode(studyMode);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (studyQuestions[currentIndex]) {
      const correctIdx = typeof studyQuestions[currentIndex].corretaIndex === 'number' 
        ? studyQuestions[currentIndex].corretaIndex as number
        : (studyQuestions[currentIndex].corretaIndex as number[])[0];
      recordAnswer({
        questionId: studyQuestions[currentIndex].id,
        selectedIndex: isCorrect ? correctIdx : -1,
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
            <div className="flex items-center gap-2">
              <Badge variant="outline">{studyQuestions[currentIndex].track}</Badge>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {studyQuestions.length}
              </span>
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
            <div className="flex items-center gap-2">
              <Badge variant="outline">{studyQuestions[currentIndex].track}</Badge>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {studyQuestions.length}
              </span>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Bem-vindo ao Infra Study Lab</h1>
          <p className="text-muted-foreground">
            {selectedTracks.length > 0 
              ? `Estudando: ${selectedTracks.join(', ')}`
              : 'Selecione uma trilha para começar'}
          </p>
        </motion.div>

        {/* Track Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" />
              Filtrar por Trilha
            </CardTitle>
            <CardDescription>
              Selecione as trilhas que deseja estudar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CERTIFICATIONS.map((cert) => {
                const isSelected = selectedTracks.includes(cert.id);
                const trackQuestions = questions.filter(q => q.track === cert.id).length;
                
                return (
                  <motion.button
                    key={cert.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleTrack(cert.id)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                    <div className="font-bold text-lg">{cert.id}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cert.descricao}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="mt-3"
                    >
                      {trackQuestions} questões
                    </Badge>
                  </motion.button>
                );
              })}
            </div>
            {selectedTracks.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {availableQuestions.length} questões disponíveis
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTracks([])}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
                  <p className="text-2xl font-bold">{availableQuestions.length}</p>
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
            {selectedTracks.length > 0 && (
              <CardDescription>
                Estudando {selectedTracks.length} trilha(s) • {availableQuestions.length} questões
              </CardDescription>
            )}
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
                  <Button 
                    onClick={() => startStudy('flashcard', 10)} 
                    className="gap-2"
                    disabled={availableQuestions.length === 0}
                  >
                    <Shuffle className="h-4 w-4" /> 10 Questões
                  </Button>
                  <Button 
                    onClick={() => startStudy('flashcard', 20)} 
                    variant="outline"
                    disabled={availableQuestions.length < 20}
                  >
                    20 Questões
                  </Button>
                  <Button 
                    onClick={() => startStudy('flashcard', 50)} 
                    variant="outline"
                    disabled={availableQuestions.length < 50}
                  >
                    50 Questões
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="questao" className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Responda questões de múltipla escolha com feedback imediato e explicações detalhadas.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => startStudy('questao', 10)} 
                    className="gap-2"
                    disabled={availableQuestions.length === 0}
                  >
                    <ArrowRight className="h-4 w-4" /> 10 Questões
                  </Button>
                  <Button 
                    onClick={() => startStudy('questao', 20)} 
                    variant="outline"
                    disabled={availableQuestions.length < 20}
                  >
                    20 Questões
                  </Button>
                  <Button 
                    onClick={() => startStudy('questao', 50)} 
                    variant="outline"
                    disabled={availableQuestions.length < 50}
                  >
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
            {selectedTracks.length > 0 && (
              <CardDescription>
                Mostrando categorias das trilhas selecionadas
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantCategories.map(cat => {
                const catProgress = progress.categoryProgress[cat] || { correct: 0, total: 0 };
                const catAccuracy = catProgress.total > 0 ? Math.round((catProgress.correct / catProgress.total) * 100) : 0;
                const catQuestions = availableQuestions.filter(q => q.categoria === cat).length;
                
                if (catQuestions === 0) return null;
                
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

        {/* Track Progress */}
        {selectedTracks.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Progresso por Trilha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CERTIFICATIONS.map(cert => {
                  const trackProgress = progress.trackProgress?.[cert.id] || { correct: 0, total: 0 };
                  const trackAccuracy = trackProgress.total > 0 ? Math.round((trackProgress.correct / trackProgress.total) * 100) : 0;
                  const trackQuestions = questions.filter(q => q.track === cert.id).length;
                  
                  return (
                    <div 
                      key={cert.id} 
                      className="p-4 rounded-xl border bg-card/50 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => toggleTrack(cert.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-sm">{cert.id}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cert.nome}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{trackQuestions}q</Badge>
                      </div>
                      <Progress value={trackAccuracy} className="h-2 mb-1" />
                      <div className="text-xs text-muted-foreground">
                        {trackProgress.correct}/{trackProgress.total} corretas ({trackAccuracy}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}