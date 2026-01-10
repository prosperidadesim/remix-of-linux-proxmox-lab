import { useState, useEffect, useCallback } from 'react';
import { Question, StudyProgress, UserAnswer, ExamResult, QuestionFilters, DEFAULT_FILTERS } from '@/types/question';
import { initialQuestionBank } from '@/data/questionBank';

const STORAGE_KEYS = {
  questions: 'mikrotik-questions',
  progress: 'mikrotik-progress',
  answers: 'mikrotik-answers',
  exams: 'mikrotik-exams',
};

const defaultProgress: StudyProgress = {
  totalAnswered: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  questionsAnswered: [],
  markedForReview: [],
  lastStudyDate: Date.now(),
  streak: 0,
  categoryProgress: {},
};

export function useStudyStore() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<StudyProgress>(defaultProgress);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.questions);
    if (stored) {
      setQuestions(JSON.parse(stored));
    } else {
      setQuestions(initialQuestionBank);
      localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(initialQuestionBank));
    }

    const storedProgress = localStorage.getItem(STORAGE_KEYS.progress);
    if (storedProgress) setProgress(JSON.parse(storedProgress));

    const storedAnswers = localStorage.getItem(STORAGE_KEYS.answers);
    if (storedAnswers) setAnswers(JSON.parse(storedAnswers));

    const storedExams = localStorage.getItem(STORAGE_KEYS.exams);
    if (storedExams) setExams(JSON.parse(storedExams));

    setIsLoading(false);
  }, []);

  const saveProgress = useCallback((newProgress: StudyProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(newProgress));
  }, []);

  const recordAnswer = useCallback((answer: UserAnswer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(newAnswers));

    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      const newProgress = { ...progress };
      newProgress.totalAnswered++;
      if (answer.isCorrect) newProgress.totalCorrect++;
      else newProgress.totalIncorrect++;
      if (!newProgress.questionsAnswered.includes(answer.questionId)) {
        newProgress.questionsAnswered.push(answer.questionId);
      }
      newProgress.lastStudyDate = Date.now();
      
      if (!newProgress.categoryProgress[question.categoria]) {
        newProgress.categoryProgress[question.categoria] = { correct: 0, total: 0 };
      }
      newProgress.categoryProgress[question.categoria].total++;
      if (answer.isCorrect) newProgress.categoryProgress[question.categoria].correct++;
      
      saveProgress(newProgress);
    }
  }, [answers, questions, progress, saveProgress]);

  const toggleMarkForReview = useCallback((questionId: string) => {
    const newProgress = { ...progress };
    const idx = newProgress.markedForReview.indexOf(questionId);
    if (idx > -1) newProgress.markedForReview.splice(idx, 1);
    else newProgress.markedForReview.push(questionId);
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const filterQuestions = useCallback((filters: QuestionFilters): Question[] => {
    return questions.filter(q => {
      if (filters.categorias.length && !filters.categorias.includes(q.categoria)) return false;
      if (filters.dificuldades.length && !filters.dificuldades.includes(q.dificuldade)) return false;
      if (filters.rosVersion !== 'todos' && q.rosVersion !== 'ambos' && q.rosVersion !== filters.rosVersion) return false;
      if (filters.apenasNaoRespondidas && progress.questionsAnswered.includes(q.id)) return false;
      if (filters.apenasErradas) {
        const lastAnswer = [...answers].reverse().find(a => a.questionId === q.id);
        if (!lastAnswer || lastAnswer.isCorrect) return false;
      }
      return true;
    });
  }, [questions, answers, progress]);

  const importQuestions = useCallback((newQuestions: Question[]) => {
    const merged = [...questions];
    newQuestions.forEach(q => {
      const idx = merged.findIndex(m => m.id === q.id);
      if (idx > -1) merged[idx] = q;
      else merged.push(q);
    });
    setQuestions(merged);
    localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(merged));
  }, [questions]);

  const exportQuestions = useCallback(() => {
    return JSON.stringify(questions, null, 2);
  }, [questions]);

  const getWrongAnswers = useCallback(() => {
    const wrongIds = new Set<string>();
    answers.forEach(a => { if (!a.isCorrect) wrongIds.add(a.questionId); });
    return questions.filter(q => wrongIds.has(q.id));
  }, [answers, questions]);

  const getAnswerForQuestion = useCallback((questionId: string) => {
    return [...answers].reverse().find(a => a.questionId === questionId);
  }, [answers]);

  return {
    questions,
    progress,
    answers,
    exams,
    isLoading,
    recordAnswer,
    toggleMarkForReview,
    filterQuestions,
    importQuestions,
    exportQuestions,
    getWrongAnswers,
    getAnswerForQuestion,
    saveProgress,
  };
}
