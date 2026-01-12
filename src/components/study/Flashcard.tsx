import { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, X, RotateCcw, Terminal, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  question: Question;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

export function Flashcard({ question, onAnswer, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    onAnswer(correct);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setAnswered(false);
    onNext();
  };

  const difficultyClass = {
    Easy: 'difficulty-easy',
    Medium: 'difficulty-medium',
    Hard: 'difficulty-hard',
  }[question.dificuldade];

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <motion.div
        className="relative w-full min-h-[400px] cursor-pointer"
        onClick={() => !isFlipped && setIsFlipped(true)}
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border bg-card p-8 shadow-elevated backface-hidden",
            !isFlipped && "z-10"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">{question.categoria}</Badge>
            <Badge className={difficultyClass}>{question.dificuldade}</Badge>
            <Badge variant="outline">{question.track}</Badge>
          </div>
          
          <h2 className="text-xl font-semibold mb-6 leading-relaxed">{question.pergunta}</h2>
          
          {question.comandoRelacionado && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
              <Terminal className="h-4 w-4 text-primary" />
              <code>{question.comandoRelacionado}</code>
            </div>
          )}

          <p className="absolute bottom-6 left-0 right-0 text-center text-muted-foreground text-sm">
            Clique para ver a resposta
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border bg-card p-8 shadow-elevated"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-lg font-semibold text-success mb-4">Resposta Correta:</h3>
          <p className="text-lg mb-4">{question.opcoes[typeof question.corretaIndex === 'number' ? question.corretaIndex : question.corretaIndex[0]]}</p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Explicação:</h4>
            <p className="text-muted-foreground text-sm">{question.explicacaoCorreta}</p>
          </div>

          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-sm">Links Oficiais:</h4>
            {question.linksOficiais.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
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
              className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              <PlayCircle className="h-4 w-4" />
              {question.videoExplicativo.titulo}
            </a>
          )}

          {!answered ? (
            <div className="flex gap-3 justify-center">
              <Button onClick={(e) => { e.stopPropagation(); handleAnswer(false); }} variant="destructive" className="gap-2">
                <X className="h-4 w-4" /> Errei
              </Button>
              <Button onClick={(e) => { e.stopPropagation(); handleAnswer(true); }} className="gap-2 bg-success hover:bg-success/90">
                <Check className="h-4 w-4" /> Eu sabia
              </Button>
            </div>
          ) : (
            <Button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" /> Próxima Questão
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
