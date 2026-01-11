import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Brain, Clock, Target, Trophy, ArrowRight, RotateCcw, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, ExamResult, CATEGORIES, Track, CERTIFICATIONS } from '@/types/question';
import { cn } from '@/lib/utils';

type ExamMode = 'setup' | 'running' | 'result';
type ExamType = 'prova' | 'treino';

export default function Simulado() {
  const { questions, recordAnswer } = useStudyStore();
  
  const [mode, setMode] = useState<ExamMode>('setup');
  const [examType, setExamType] = useState<ExamType>('prova');
  const [selectedTrack, setSelectedTrack] = useState<Track | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(30);
  const [timeLimit, setTimeLimit] = useState(30);
  const [useTimer, setUseTimer] = useState(true);

  // Filter questions by track
  const filteredQuestions = useMemo(() => {
    if (selectedTrack === 'all') return questions;
    return questions.filter(q => q.track === selectedTrack);
  }, [questions, selectedTrack]);

  // Count questions by track
  const questionCountByTrack = useMemo(() => {
    const counts: Record<string, number> = { all: questions.length };
    CERTIFICATIONS.forEach(cert => {
      counts[cert.id] = questions.filter(q => q.track === cert.id).length;
    });
    return counts;
  }, [questions]);
  
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Timer
  useEffect(() => {
    if (mode !== 'running' || !useTimer || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, useTimer, timeRemaining]);

  const startExam = () => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setExamQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowFeedback(null);
    setTimeRemaining(timeLimit * 60);
    setStartTime(Date.now());
    setMode('running');
  };

  const selectAnswer = (questionId: string, index: number) => {
    if (showFeedback && examType === 'treino') return;
    
    setSelectedAnswers(prev => ({ ...prev, [questionId]: index }));
    
    if (examType === 'treino') {
      setShowFeedback(questionId);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(null);
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    const endTime = Date.now();
    let correct = 0;
    const answers = examQuestions.map(q => {
      const selected = selectedAnswers[q.id] ?? -1;
      const isCorrect = selected === q.corretaIndex;
      if (isCorrect) correct++;
      
      recordAnswer({
        questionId: q.id,
        selectedIndex: selected,
        isCorrect,
        timestamp: endTime,
        mode: 'exam',
      });
      
      return {
        questionId: q.id,
        selectedIndex: selected,
        isCorrect,
        timestamp: endTime,
        mode: 'exam' as const,
      };
    });

    const examResult: ExamResult = {
      id: `exam-${Date.now()}`,
      startTime,
      endTime,
      totalQuestions: examQuestions.length,
      correctAnswers: correct,
      score: Math.round((correct / examQuestions.length) * 100),
      answers,
      mode: examType,
      timeLimit: useTimer ? timeLimit : undefined,
    };

    setResult(examResult);
    setMode('result');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = examQuestions[currentIndex];

  const categoryStats = useMemo(() => {
    if (!result) return {};
    const stats: Record<string, { correct: number; total: number }> = {};
    
    examQuestions.forEach(q => {
      if (!stats[q.categoria]) stats[q.categoria] = { correct: 0, total: 0 };
      stats[q.categoria].total++;
      const answer = result.answers.find(a => a.questionId === q.id);
      if (answer?.isCorrect) stats[q.categoria].correct++;
    });
    
    return stats;
  }, [result, examQuestions]);

  if (mode === 'setup') {
    const selectedCertInfo = selectedTrack !== 'all' 
      ? CERTIFICATIONS.find(c => c.id === selectedTrack) 
      : null;

    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Simulado {selectedCertInfo ? selectedCertInfo.nome : 'MikroTik'}
            </h1>
            <p className="text-muted-foreground">Configure seu simulado e teste seus conhecimentos</p>
          </div>

          {/* Certification Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Certificação
              </CardTitle>
              <CardDescription>Selecione uma certificação para focar seus estudos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <Button
                  variant={selectedTrack === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTrack('all')}
                  className="justify-between"
                >
                  <span>Todas</span>
                  <Badge variant="secondary" className="ml-1">{questionCountByTrack.all}</Badge>
                </Button>
                {CERTIFICATIONS.map(cert => (
                  <Button
                    key={cert.id}
                    variant={selectedTrack === cert.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTrack(cert.id)}
                    className="justify-between"
                    disabled={questionCountByTrack[cert.id] === 0}
                  >
                    <span>{cert.id}</span>
                    <Badge variant="secondary" className="ml-1">{questionCountByTrack[cert.id]}</Badge>
                  </Button>
                ))}
              </div>
              {selectedCertInfo && (
                <div className="mt-4 p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{selectedCertInfo.nome}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedCertInfo.descricao}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Configurações do Simulado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modo */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Modo</Label>
                <RadioGroup value={examType} onValueChange={(v) => setExamType(v as ExamType)} className="grid grid-cols-2 gap-4">
                  <Label
                    htmlFor="prova"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all",
                      examType === 'prova' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="prova" id="prova" className="sr-only" />
                    <Target className="h-8 w-8 mb-2 text-primary" />
                    <span className="font-medium">Modo Prova</span>
                    <span className="text-xs text-muted-foreground text-center">Sem feedback até o final</span>
                  </Label>
                  <Label
                    htmlFor="treino"
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all",
                      examType === 'treino' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="treino" id="treino" className="sr-only" />
                    <CheckCircle2 className="h-8 w-8 mb-2 text-success" />
                    <span className="font-medium">Modo Treino</span>
                    <span className="text-xs text-muted-foreground text-center">Feedback imediato</span>
                  </Label>
                </RadioGroup>
              </div>

              {/* Número de questões */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-base font-medium">Número de Questões</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{questionCount}</span>
                </div>
                <Slider
                  value={[questionCount]}
                  onValueChange={([v]) => setQuestionCount(v)}
                  min={5}
                  max={Math.min(60, filteredQuestions.length)}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {filteredQuestions.length} questões disponíveis
                </p>
              </div>

              {/* Timer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Tempo Limite</Label>
                  <Switch checked={useTimer} onCheckedChange={setUseTimer} />
                </div>
                {useTimer && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duração</span>
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{timeLimit} min</span>
                    </div>
                    <Slider
                      value={[timeLimit]}
                      onValueChange={([v]) => setTimeLimit(v)}
                      min={10}
                      max={120}
                      step={5}
                    />
                  </div>
                )}
              </div>

              <Button onClick={startExam} size="lg" className="w-full gap-2">
                <ArrowRight className="h-5 w-5" />
                Iniciar Simulado
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (mode === 'running' && currentQuestion) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setMode('setup')}>← Sair</Button>
            <div className="flex items-center gap-4">
              {useTimer && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm",
                  timeRemaining < 300 ? "bg-destructive/10 text-destructive" : "bg-muted"
                )}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              )}
              <Badge variant="outline">
                {currentIndex + 1} / {examQuestions.length}
              </Badge>
            </div>
          </div>

          <Progress value={((currentIndex + 1) / examQuestions.length) * 100} className="mb-8" />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{currentQuestion.categoria}</Badge>
                <Badge variant="outline">{currentQuestion.dificuldade}</Badge>
              </div>
              <CardTitle className="text-lg leading-relaxed">{currentQuestion.pergunta}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.opcoes.map((opcao, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                const isCorrect = idx === currentQuestion.corretaIndex;
                const showResult = showFeedback === currentQuestion.id;
                
                return (
                  <motion.button
                    key={idx}
                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                    disabled={showResult}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      isSelected && !showResult && "border-primary bg-primary/5",
                      !isSelected && !showResult && "border-border hover:border-primary/50",
                      showResult && isCorrect && "border-success bg-success/10",
                      showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10"
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="pt-1">{opcao}</span>
                    </div>
                  </motion.button>
                );
              })}

              {showFeedback === currentQuestion.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-muted space-y-3"
                >
                  <h4 className="font-medium flex items-center gap-2">
                    {selectedAnswers[currentQuestion.id] === currentQuestion.corretaIndex ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Correto!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        Incorreto
                      </>
                    )}
                  </h4>
                  <p className="text-sm">{currentQuestion.explicacaoCorreta}</p>
                </motion.div>
              )}

              <div className="flex justify-end pt-4">
                {examType === 'prova' ? (
                  <Button 
                    onClick={nextQuestion} 
                    disabled={selectedAnswers[currentQuestion.id] === undefined}
                  >
                    {currentIndex < examQuestions.length - 1 ? 'Próxima' : 'Finalizar'}
                  </Button>
                ) : (
                  showFeedback === currentQuestion.id ? (
                    <Button onClick={nextQuestion}>
                      {currentIndex < examQuestions.length - 1 ? 'Próxima' : 'Finalizar'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => selectedAnswers[currentQuestion.id] !== undefined && selectAnswer(currentQuestion.id, selectedAnswers[currentQuestion.id])}
                      disabled={selectedAnswers[currentQuestion.id] === undefined}
                    >
                      Confirmar
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (mode === 'result' && result) {
    const passed = result.score >= 60;
    
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-full mb-4",
              passed ? "bg-success/10" : "bg-destructive/10"
            )}>
              <Trophy className={cn("h-12 w-12", passed ? "text-success" : "text-destructive")} />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Parabéns!' : 'Continue Estudando!'}
            </h1>
            <p className="text-muted-foreground">
              {passed ? 'Você atingiu a nota mínima de aprovação!' : 'Você precisa de pelo menos 60% para ser aprovado.'}
            </p>
          </motion.div>

          {/* Score Card */}
          <Card className="overflow-hidden">
            <div className={cn("h-2", passed ? "bg-success" : "bg-destructive")} />
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary">{result.score}%</p>
                  <p className="text-sm text-muted-foreground">Nota Final</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-success">{result.correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Acertos</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-destructive">{result.totalQuestions - result.correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Erros</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">{formatTime(Math.floor((result.endTime - result.startTime) / 1000))}</p>
                  <p className="text-sm text-muted-foreground">Tempo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(categoryStats).map(([cat, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{cat}</span>
                      <span className={cn(
                        "font-medium",
                        pct >= 60 ? "text-success" : "text-destructive"
                      )}>
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className={cn("h-2", pct < 60 && "[&>div]:bg-destructive")} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setMode('setup')} size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Novo Simulado
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}
