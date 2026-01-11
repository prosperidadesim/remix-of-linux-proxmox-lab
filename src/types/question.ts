export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// Novas trilhas: Linux Essentials + Proxmox VE
export type Track = 'Linux Essentials' | 'Proxmox VE';

// Informações das trilhas
export interface TrackInfo {
  id: Track;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
}

export const TRACKS: TrackInfo[] = [
  {
    id: 'Linux Essentials',
    nome: 'Linux Essentials',
    descricao: 'Fundamentos do Linux: linha de comando, sistema de arquivos, permissões e administração básica.',
    cor: 'hsl(45, 90%, 50%)', // Amarelo/Dourado Linux
    icone: 'Terminal',
  },
  {
    id: 'Proxmox VE',
    nome: 'Proxmox Virtual Environment',
    descricao: 'Virtualização com Proxmox: KVM, LXC, storage, networking, backup e alta disponibilidade.',
    cor: 'hsl(27, 100%, 45%)', // Proxmox Orange
    icone: 'Server',
  },
];

// Domínios por trilha (baseados nos syllabus oficiais)
export const DOMAINS_BY_TRACK: Record<Track, { code: string; name: string; weight: number }[]> = {
  'Linux Essentials': [
    { code: '1', name: 'The Linux Community and a Career in Open Source', weight: 7 },
    { code: '2', name: 'Finding Your Way on a Linux System', weight: 9 },
    { code: '3', name: 'The Power of the Command Line', weight: 9 },
    { code: '4', name: 'The Linux Operating System', weight: 8 },
    { code: '5', name: 'Security and File Permissions', weight: 7 },
  ],
  'Proxmox VE': [
    { code: '1', name: 'Installation and Configuration', weight: 10 },
    { code: '2', name: 'Virtual Machines (KVM)', weight: 15 },
    { code: '3', name: 'Containers (LXC)', weight: 12 },
    { code: '4', name: 'Storage Management', weight: 12 },
    { code: '5', name: 'Networking', weight: 10 },
    { code: '6', name: 'Backup and Restore', weight: 12 },
    { code: '7', name: 'High Availability and Clustering', weight: 10 },
    { code: '8', name: 'Proxmox Backup Server', weight: 9 },
  ],
};

// Categorias por trilha (para compatibilidade)
export const CATEGORIES_BY_TRACK: Record<Track, string[]> = {
  'Linux Essentials': [
    'Comunidade Linux',
    'Navegação no Sistema',
    'Linha de Comando',
    'Sistema Operacional',
    'Segurança e Permissões',
    'Shell Scripting',
    'Gerenciamento de Arquivos',
    'Processos',
    'Editores de Texto',
    'Rede Básica',
  ],
  'Proxmox VE': [
    'Instalação e Configuração',
    'Máquinas Virtuais (KVM)',
    'Containers (LXC)',
    'Storage',
    'Networking',
    'Backup e Restore',
    'Alta Disponibilidade',
    'Proxmox Backup Server',
    'CLI e API',
    'Troubleshooting',
  ],
};

// Todas as categorias únicas
export const CATEGORIES = [...new Set(Object.values(CATEGORIES_BY_TRACK).flat())];

export interface OfficialLink {
  titulo: string;
  url: string;
}

export interface Question {
  id: string;
  track: Track;
  domain: string;           // Código do domínio "1", "2", etc.
  domainName: string;       // Nome do domínio
  objective: string;        // Código do objetivo "1.1", "1.2", etc.
  objectiveTitle: string;   // Título do objetivo
  categoria: string;        // Categoria para filtros
  dificuldade: Difficulty;
  pergunta: string;
  tipo: 'single' | 'multiple' | 'drag-drop';
  opcoes: string[];
  corretaIndex: number | number[];  // Suporte a múltiplas respostas
  explicacaoCorreta: string;
  explicacoesPorOpcao: string[];
  linksOficiais: OfficialLink[];
  tags: string[];
  comandoRelacionado?: string;
}

// Tipos legados para compatibilidade
export type Certification = Track;
export type ROSVersion = 'v6' | 'v7' | 'ambos';

export interface CertificationInfo {
  id: Track;
  nome: string;
  descricao: string;
  prerequisito: Track | null;
  duracao: string;
  topicos: string[];
  cor: string;
}

export const CERTIFICATIONS: CertificationInfo[] = TRACKS.map(t => ({
  id: t.id,
  nome: t.nome,
  descricao: t.descricao,
  prerequisito: null,
  duracao: 'Self-paced',
  topicos: CATEGORIES_BY_TRACK[t.id],
  cor: t.cor,
}));

export const CATEGORIES_BY_CERTIFICATION = CATEGORIES_BY_TRACK as Record<Track, string[]>;

export interface UserAnswer {
  questionId: string;
  selectedIndex: number | number[];
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
  xp: number;
  level: number;
  categoryProgress: Record<string, { correct: number; total: number }>;
  trackProgress: Record<Track, { correct: number; total: number }>;
  domainProgress: Record<string, { correct: number; total: number }>;
  // Legacy compatibility
  certificationProgress?: Record<Track, { correct: number; total: number }>;
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
  track?: Track;
}

export interface StudySession {
  currentIndex: number;
  questionIds: string[];
  mode: 'flashcard' | 'questao';
  filters: QuestionFilters;
  goal: number;
}

export interface QuestionFilters {
  tracks: Track[];
  categorias: string[];
  dificuldades: Difficulty[];
  tags: string[];
  domains: string[];
  apenasNaoRespondidas: boolean;
  apenasErradas: boolean;
  // Legacy compatibility
  certificacoes?: Track[];
  rosVersion?: string;
  apenasComPythonAPI?: boolean;
}

export const DEFAULT_FILTERS: QuestionFilters = {
  tracks: [],
  categorias: [],
  dificuldades: [],
  tags: [],
  domains: [],
  apenasNaoRespondidas: false,
  apenasErradas: false,
  certificacoes: [],
};

// Gamification
export const LEVELS = [
  { level: 1, title: 'Iniciante', xpRequired: 0, icon: '🌱' },
  { level: 2, title: 'Aprendiz', xpRequired: 100, icon: '📚' },
  { level: 3, title: 'Junior Sysadmin', xpRequired: 300, icon: '💻' },
  { level: 4, title: 'Sysadmin', xpRequired: 600, icon: '🖥️' },
  { level: 5, title: 'Senior Sysadmin', xpRequired: 1000, icon: '⚙️' },
  { level: 6, title: 'DevOps Engineer', xpRequired: 1500, icon: '🚀' },
  { level: 7, title: 'Arquiteto de Infraestrutura', xpRequired: 2500, icon: '🏗️' },
  { level: 8, title: 'Mestre da Infraestrutura', xpRequired: 4000, icon: '👑' },
];

export const XP_REWARDS = {
  questionCorrect: 10,
  questionFirstTry: 5,
  labComplete: 50,
  labFirstTry: 25,
  streakDay: 20,
  perfectExam: 100,
};

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  const nextLevel = LEVELS.find(l => l.xpRequired > xp) || currentLevel;
  const xpToNext = nextLevel.xpRequired - xp;
  const xpInLevel = xp - currentLevel.xpRequired;
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = xpForLevel > 0 ? (xpInLevel / xpForLevel) * 100 : 100;
  
  return {
    ...currentLevel,
    nextLevel,
    xpToNext,
    progress,
  };
}