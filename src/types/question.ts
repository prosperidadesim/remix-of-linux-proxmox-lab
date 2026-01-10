export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ROSVersion = 'v6' | 'v7' | 'ambos';

export interface OfficialLink {
  titulo: string;
  url: string;
}

export interface Question {
  id: string;
  categoria: string;
  dificuldade: Difficulty;
  pergunta: string;
  opcoes: string[];
  corretaIndex: number;
  explicacaoCorreta: string;
  explicacoesPorOpcao: string[];
  linksOficiais: OfficialLink[];
  tags: string[];
  rosVersion: ROSVersion;
  comandoRelacionado?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timestamp: number;
  mode: 'study' | 'exam';
  examId?: string;
}

export interface StudyProgress {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  questionsAnswered: string[];
  markedForReview: string[];
  lastStudyDate: number;
  streak: number;
  categoryProgress: Record<string, { correct: number; total: number }>;
}

export interface ExamResult {
  id: string;
  startTime: number;
  endTime: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: UserAnswer[];
  mode: 'prova' | 'treino';
  timeLimit?: number;
}

export interface StudySession {
  currentIndex: number;
  questionIds: string[];
  mode: 'flashcard' | 'questao';
  filters: QuestionFilters;
  goal: number;
}

export interface QuestionFilters {
  categorias: string[];
  dificuldades: Difficulty[];
  tags: string[];
  rosVersion: ROSVersion | 'todos';
  apenasNaoRespondidas: boolean;
  apenasErradas: boolean;
}

export const CATEGORIES = [
  'Introdução ao MikroTik',
  'DHCP',
  'Bridging',
  'Routing',
  'Wireless',
  'Firewall',
  'QoS',
  'Tunnels',
  'Misc',
  'Hotspot',
  'Ferramentas',
] as const;

export const DEFAULT_FILTERS: QuestionFilters = {
  categorias: [],
  dificuldades: [],
  tags: [],
  rosVersion: 'todos',
  apenasNaoRespondidas: false,
  apenasErradas: false,
};
