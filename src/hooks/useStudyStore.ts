import { useState, useEffect, useCallback } from 'react';
import { Question, StudyProgress, UserAnswer, ExamResult, QuestionFilters, Certification } from '@/types/question';
import { initialQuestionBank } from '@/data/questionBank';
import { useAuth } from '@/contexts/AuthContext';

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
  certificationProgress: {} as Record<Certification, { correct: number; total: number }>,
};

export function useStudyStore() {
  const { token, apiUrl, isAuthenticated } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<StudyProgress>(defaultProgress);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Helper para fazer requests à API
  const fetchApi = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token || !apiUrl) return null;
    
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      setSyncError('Erro ao sincronizar com o servidor');
      return null;
    }
  }, [token, apiUrl]);

  // Carrega dados do backend ou localStorage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setSyncError(null);
      
      // Sempre carrega questões do localStorage/padrão
      const storedQuestions = localStorage.getItem(STORAGE_KEYS.questions);
      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      } else {
        setQuestions(initialQuestionBank);
        localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(initialQuestionBank));
      }
      
      // Se autenticado, busca do backend
      if (isAuthenticated && token) {
        try {
          const [progressRes, answersRes] = await Promise.all([
            fetchApi('/api/progress'),
            fetchApi('/api/answers'),
          ]);
          
          if (progressRes) {
            const serverProgress = await progressRes.json();
            setProgress(serverProgress);
            localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(serverProgress));
          }
          
          if (answersRes) {
            const serverAnswers = await answersRes.json();
            setAnswers(serverAnswers);
            localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(serverAnswers));
          }
        } catch (error) {
          console.error('Failed to load from server, using local data');
          // Fallback para localStorage
          const storedProgress = localStorage.getItem(STORAGE_KEYS.progress);
          if (storedProgress) setProgress(JSON.parse(storedProgress));
          
          const storedAnswers = localStorage.getItem(STORAGE_KEYS.answers);
          if (storedAnswers) setAnswers(JSON.parse(storedAnswers));
        }
      } else {
        // Não autenticado, usa localStorage
        const storedProgress = localStorage.getItem(STORAGE_KEYS.progress);
        if (storedProgress) setProgress(JSON.parse(storedProgress));
        
        const storedAnswers = localStorage.getItem(STORAGE_KEYS.answers);
        if (storedAnswers) setAnswers(JSON.parse(storedAnswers));
      }
      
      const storedExams = localStorage.getItem(STORAGE_KEYS.exams);
      if (storedExams) setExams(JSON.parse(storedExams));
      
      setIsLoading(false);
    };
    
    loadData();
  }, [isAuthenticated, token, fetchApi]);

  // Sincroniza progresso com o backend
  const syncProgress = useCallback(async (newProgress: StudyProgress) => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(newProgress));
    
    if (isAuthenticated && token) {
      setIsSyncing(true);
      setSyncError(null);
      
      try {
        await fetchApi('/api/progress', {
          method: 'PUT',
          body: JSON.stringify(newProgress),
        });
      } catch (error) {
        console.error('Failed to sync progress:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [isAuthenticated, token, fetchApi]);

  // Sincroniza resposta com o backend
  const syncAnswer = useCallback(async (answer: UserAnswer) => {
    if (isAuthenticated && token) {
      try {
        await fetchApi('/api/answers', {
          method: 'POST',
          body: JSON.stringify(answer),
        });
      } catch (error) {
        console.error('Failed to sync answer:', error);
      }
    }
  }, [isAuthenticated, token, fetchApi]);

  const saveProgress = useCallback((newProgress: StudyProgress) => {
    setProgress(newProgress);
    syncProgress(newProgress);
  }, [syncProgress]);

  const recordAnswer = useCallback((answer: UserAnswer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(newAnswers));
    
    // Sincroniza resposta com backend
    syncAnswer(answer);

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
      
      // Category progress
      if (!newProgress.categoryProgress[question.categoria]) {
        newProgress.categoryProgress[question.categoria] = { correct: 0, total: 0 };
      }
      newProgress.categoryProgress[question.categoria].total++;
      if (answer.isCorrect) newProgress.categoryProgress[question.categoria].correct++;
      
      // Certification progress
      if (!newProgress.certificationProgress) {
        newProgress.certificationProgress = {} as Record<Certification, { correct: number; total: number }>;
      }
      if (!newProgress.certificationProgress[question.certificacao]) {
        newProgress.certificationProgress[question.certificacao] = { correct: 0, total: 0 };
      }
      newProgress.certificationProgress[question.certificacao].total++;
      if (answer.isCorrect) newProgress.certificationProgress[question.certificacao].correct++;
      
      saveProgress(newProgress);
    }
  }, [answers, questions, progress, saveProgress, syncAnswer]);

  const toggleMarkForReview = useCallback((questionId: string) => {
    const newProgress = { ...progress };
    const idx = newProgress.markedForReview.indexOf(questionId);
    if (idx > -1) newProgress.markedForReview.splice(idx, 1);
    else newProgress.markedForReview.push(questionId);
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const filterQuestions = useCallback((filters: QuestionFilters): Question[] => {
    return questions.filter(q => {
      if (filters.certificacoes.length && !filters.certificacoes.includes(q.certificacao)) return false;
      if (filters.categorias.length && !filters.categorias.includes(q.categoria)) return false;
      if (filters.dificuldades.length && !filters.dificuldades.includes(q.dificuldade)) return false;
      if (filters.rosVersion !== 'todos' && q.rosVersion !== 'ambos' && q.rosVersion !== filters.rosVersion) return false;
      if (filters.apenasNaoRespondidas && progress.questionsAnswered.includes(q.id)) return false;
      if (filters.apenasErradas) {
        const lastAnswer = [...answers].reverse().find(a => a.questionId === q.id);
        if (!lastAnswer || lastAnswer.isCorrect) return false;
      }
      if (filters.apenasComPythonAPI && !q.pythonAPI) return false;
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
    isSyncing,
    syncError,
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
