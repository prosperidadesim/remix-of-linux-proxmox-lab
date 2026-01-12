import { useState } from 'react';
import { Question } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, ArrowRight, ExternalLink, Terminal, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  onNext: () => void;
  showFeedback?: boolean;
}

export function QuestionCard({ question, onAnswer, onNext, showFeedback = true }: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    if (showFeedback) {
      setIsAnswered(true);
      onAnswer(index, index === question.corretaIndex);
    }
  };

  const handleConfirm = () => {
    if (selectedIndex === null || isAnswered) return;
    setIsAnswered(true);
    onAnswer(selectedIndex, selectedIndex === question.corretaIndex);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setIsAnswered(false);
    onNext();
  };

  const difficultyClass = {
    Easy: 'difficulty-easy',
    Medium: 'difficulty-medium',
    Hard: 'difficulty-hard',
  }[question.dificuldade];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-6 md:p-8 shadow-soft"
      >
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary">{question.categoria}</Badge>
          <Badge className={difficultyClass}>{question.dificuldade}</Badge>
          <Badge variant="outline">{question.track}</Badge>
        </div>

        <h2 className="text-lg md:text-xl font-semibold mb-6">{question.pergunta}</h2>

        {question.comandoRelacionado && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm mb-6">
            <Terminal className="h-4 w-4 text-primary" />
            <code>{question.comandoRelacionado}</code>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {question.opcoes.map((opcao, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = index === question.corretaIndex;
            const showResult = isAnswered && showFeedback;

            return (
              <motion.button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                  "hover:border-primary/50 hover:bg-accent/50",
                  isSelected && !showResult && "border-primary bg-accent",
                  showResult && isCorrect && "border-success bg-success-muted",
                  showResult && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                  !isSelected && !showResult && "border-border"
                )}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <span>{opcao}</span>
                  {showResult && (
                    <span>
                      {isCorrect ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : isSelected ? (
                        <X className="h-5 w-5 text-destructive" />
                      ) : null}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className={cn(
                "p-4 rounded-xl",
                selectedIndex === question.corretaIndex ? "bg-success-muted" : "bg-destructive/10"
              )}>
                <p className="font-medium mb-2">
                  {selectedIndex === question.corretaIndex ? '✓ Correto!' : '✗ Incorreto'}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {question.explicacoesPorOpcao[selectedIndex!]}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {question.linksOficiais.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.titulo}
                    </a>
                  ))}
                </div>
                {question.videoExplicativo && (
                  <a
                    href={question.videoExplicativo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {question.videoExplicativo.titulo}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-3">
          {!showFeedback && !isAnswered && selectedIndex !== null && (
            <Button onClick={handleConfirm}>Confirmar</Button>
          )}
          {isAnswered && (
            <Button onClick={handleNext} className="gap-2">
              Próxima <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
