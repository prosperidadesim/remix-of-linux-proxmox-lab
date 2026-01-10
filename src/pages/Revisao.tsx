import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Bookmark, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';

export default function Revisao() {
  const { questions, answers, progress, getWrongAnswers, toggleMarkForReview } = useStudyStore();
  
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todas' | 'erradas' | 'marcadas'>('todas');

  const answeredQuestions = useMemo(() => {
    const answered = new Map<string, { question: Question; lastAnswer: typeof answers[0] }>();
    
    answers.forEach(a => {
      const q = questions.find(q => q.id === a.questionId);
      if (q) {
        const existing = answered.get(q.id);
        if (!existing || a.timestamp > existing.lastAnswer.timestamp) {
          answered.set(q.id, { question: q, lastAnswer: a });
        }
      }
    });
    
    return Array.from(answered.values()).sort((a, b) => b.lastAnswer.timestamp - a.lastAnswer.timestamp);
  }, [questions, answers]);

  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case 'erradas':
        return answeredQuestions.filter(q => !q.lastAnswer.isCorrect);
      case 'marcadas':
        return answeredQuestions.filter(q => progress.markedForReview.includes(q.question.id));
      default:
        return answeredQuestions;
    }
  }, [answeredQuestions, filter, progress.markedForReview]);

  const wrongCount = answeredQuestions.filter(q => !q.lastAnswer.isCorrect).length;
  const markedCount = progress.markedForReview.length;

  if (answeredQuestions.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nenhuma questão respondida</h1>
          <p className="text-muted-foreground mb-6">
            Comece a estudar para ver seu histórico de revisão aqui.
          </p>
          <Button asChild>
            <a href="/">Ir para Estudar</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Revisão</h1>
          <p className="text-muted-foreground">Revise suas respostas e aprenda com os erros</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilter('todas')}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{answeredQuestions.length}</p>
              <p className="text-xs text-muted-foreground">Total Respondidas</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-destructive transition-colors" onClick={() => setFilter('erradas')}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{wrongCount}</p>
              <p className="text-xs text-muted-foreground">Erradas</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-warning transition-colors" onClick={() => setFilter('marcadas')}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{markedCount}</p>
              <p className="text-xs text-muted-foreground">Marcadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="erradas" className="gap-1">
              <XCircle className="h-4 w-4" /> Erradas
            </TabsTrigger>
            <TabsTrigger value="marcadas" className="gap-1">
              <Bookmark className="h-4 w-4" /> Marcadas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Questions List */}
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-4 pr-4">
            <AnimatePresence>
              {filteredQuestions.map(({ question, lastAnswer }) => {
                const isExpanded = expandedQuestion === question.id;
                const isMarked = progress.markedForReview.includes(question.id);
                
                return (
                  <motion.div
                    key={question.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className={cn(
                      "overflow-hidden transition-all",
                      isExpanded && "ring-2 ring-primary"
                    )}>
                      <CardHeader 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {lastAnswer.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                              )}
                              <Badge variant="outline">{question.categoria}</Badge>
                              <Badge variant="secondary">{question.dificuldade}</Badge>
                              {isMarked && <Bookmark className="h-4 w-4 text-warning" />}
                            </div>
                            <p className="font-medium leading-relaxed">{question.pergunta}</p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="border-t space-y-6">
                              {/* Options with explanations */}
                              <div className="space-y-3 pt-4">
                                {question.opcoes.map((opcao, idx) => {
                                  const isCorrect = idx === question.corretaIndex;
                                  const wasSelected = idx === lastAnswer.selectedIndex;
                                  
                                  return (
                                    <div 
                                      key={idx}
                                      className={cn(
                                        "p-4 rounded-xl border-2 space-y-2",
                                        isCorrect && "border-success bg-success/5",
                                        wasSelected && !isCorrect && "border-destructive bg-destructive/5",
                                        !isCorrect && !wasSelected && "border-border"
                                      )}
                                    >
                                      <div className="flex items-start gap-3">
                                        <span className={cn(
                                          "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium shrink-0",
                                          isCorrect ? "bg-success text-success-foreground" : 
                                          wasSelected ? "bg-destructive text-destructive-foreground" : "bg-muted"
                                        )}>
                                          {String.fromCharCode(65 + idx)}
                                        </span>
                                        <div className="flex-1 space-y-2">
                                          <p className="font-medium">{opcao}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {question.explicacoesPorOpcao[idx]}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Correct explanation */}
                              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <h4 className="font-medium text-primary mb-2">Explicação da Resposta Correta</h4>
                                <p className="text-sm">{question.explicacaoCorreta}</p>
                              </div>

                              {/* Official Links */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Links Oficiais</h4>
                                <div className="flex flex-wrap gap-2">
                                  {question.linksOficiais.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {link.titulo}
                                    </a>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant={isMarked ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMarkForReview(question.id);
                                  }}
                                  className="gap-1"
                                >
                                  <Bookmark className="h-4 w-4" />
                                  {isMarked ? 'Remover Marcação' : 'Marcar para Revisar'}
                                </Button>
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma questão encontrada com este filtro.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
}
