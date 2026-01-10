export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ROSVersion = 'v6' | 'v7' | 'ambos';

// Todas as certificações MikroTik
export type Certification = 
  | 'MTCNA'   // MikroTik Certified Network Associate
  | 'MTCRE'   // MikroTik Certified Routing Engineer
  | 'MTCWE'   // MikroTik Certified Wireless Engineer
  | 'MTCTCE'  // MikroTik Certified Traffic Control Engineer
  | 'MTCUME'  // MikroTik Certified User Management Engineer
  | 'MTCSE'   // MikroTik Certified Security Engineer
  | 'MTCIPv6' // MikroTik Certified IPv6 Engineer
  | 'MTCINE'  // MikroTik Certified Inter-networking Engineer
  | 'MTCEWE'  // MikroTik Certified Enterprise Wireless Engineer
  | 'MTCSWE'; // MikroTik Certified Switching Engineer

export interface CertificationInfo {
  id: Certification;
  nome: string;
  descricao: string;
  prerequisito: Certification | null;
  duracao: string;
  topicos: string[];
  cor: string;
}

export const CERTIFICATIONS: CertificationInfo[] = [
  {
    id: 'MTCNA',
    nome: 'MikroTik Certified Network Associate',
    descricao: 'Certificação básica que cobre os fundamentos do RouterOS e configuração de redes.',
    prerequisito: null,
    duracao: '3 dias',
    topicos: ['RouterOS Basics', 'DHCP', 'Bridging', 'Routing', 'Wireless', 'Firewall', 'QoS', 'Tunnels', 'Misc'],
    cor: 'hsl(200, 80%, 50%)',
  },
  {
    id: 'MTCRE',
    nome: 'MikroTik Certified Routing Engineer',
    descricao: 'Foco em roteamento estático e dinâmico (OSPF, BGP, RIP).',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['Static Routing', 'OSPF', 'BGP', 'RIP', 'MME', 'Routing Filters', 'VRF'],
    cor: 'hsl(280, 70%, 50%)',
  },
  {
    id: 'MTCWE',
    nome: 'MikroTik Certified Wireless Engineer',
    descricao: 'Especialização em redes wireless 802.11 com equipamentos MikroTik.',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['Wireless Fundamentals', '802.11 Standards', 'WDS', 'Nstreme', 'NV2', 'CAPsMAN', 'Wireless Security'],
    cor: 'hsl(170, 70%, 45%)',
  },
  {
    id: 'MTCTCE',
    nome: 'MikroTik Certified Traffic Control Engineer',
    descricao: 'Controle de tráfego, QoS, filas e gerenciamento de banda.',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['HTB', 'Simple Queues', 'Queue Tree', 'Mangle', 'Burst', 'PCQ', 'Traffic Prioritization'],
    cor: 'hsl(30, 80%, 55%)',
  },
  {
    id: 'MTCUME',
    nome: 'MikroTik Certified User Management Engineer',
    descricao: 'Gerenciamento de usuários, Hotspot, RADIUS e autenticação.',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['User Manager', 'RADIUS', 'Hotspot', 'PPPoE', 'Profiles', 'Accounting', 'Walled Garden'],
    cor: 'hsl(340, 70%, 55%)',
  },
  {
    id: 'MTCSE',
    nome: 'MikroTik Certified Security Engineer',
    descricao: 'Segurança de rede, firewall avançado, VPNs e proteção contra ataques.',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['Firewall Advanced', 'Attack Prevention', 'VPN Security', 'IPsec', 'Certificates', 'Port Knocking', 'Secure Protocols'],
    cor: 'hsl(0, 70%, 55%)',
  },
  {
    id: 'MTCIPv6',
    nome: 'MikroTik Certified IPv6 Engineer',
    descricao: 'Implementação e gerenciamento de redes IPv6.',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['IPv6 Fundamentals', 'DHCPv6', 'SLAAC', 'IPv6 Routing', 'Dual Stack', 'Tunneling 6to4', 'IPv6 Firewall'],
    cor: 'hsl(220, 70%, 55%)',
  },
  {
    id: 'MTCINE',
    nome: 'MikroTik Certified Inter-networking Engineer',
    descricao: 'Integração avançada de redes, MPLS, Traffic Engineering.',
    prerequisito: 'MTCRE',
    duracao: '2 dias',
    topicos: ['MPLS', 'VPLS', 'Traffic Engineering', 'BGP Advanced', 'Route Reflection', 'ECMP', 'Load Balancing'],
    cor: 'hsl(260, 70%, 55%)',
  },
  {
    id: 'MTCEWE',
    nome: 'MikroTik Certified Enterprise Wireless Engineer',
    descricao: 'Wireless empresarial com WiFi 6 (802.11ax) e alta densidade.',
    prerequisito: 'MTCWE',
    duracao: '2 dias',
    topicos: ['WiFi 6', '802.11ax', 'High Density', 'Enterprise CAPsMAN', 'Roaming', 'Band Steering', 'Wireless Optimization'],
    cor: 'hsl(150, 70%, 45%)',
  },
  {
    id: 'MTCSWE',
    nome: 'MikroTik Certified Switching Engineer',
    descricao: 'Switching L2/L3, VLANs, STP, LACP com switches MikroTik.',
    prerequisito: 'MTCNA',
    duracao: '2 dias',
    topicos: ['VLANs', 'STP/RSTP', 'LACP', 'Port Isolation', 'Switch Chip', 'L3 Switching', 'IGMP Snooping'],
    cor: 'hsl(45, 80%, 50%)',
  },
];

export interface PythonAPIExample {
  titulo: string;
  descricao: string;
  codigo: string;
  saida?: string;
}

export interface OfficialLink {
  titulo: string;
  url: string;
}

export interface Question {
  id: string;
  certificacao: Certification;
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
  pythonAPI?: PythonAPIExample;
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
  certificationProgress: Record<Certification, { correct: number; total: number }>;
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
  certification?: Certification;
}

export interface StudySession {
  currentIndex: number;
  questionIds: string[];
  mode: 'flashcard' | 'questao';
  filters: QuestionFilters;
  goal: number;
}

export interface QuestionFilters {
  certificacoes: Certification[];
  categorias: string[];
  dificuldades: Difficulty[];
  tags: string[];
  rosVersion: ROSVersion | 'todos';
  apenasNaoRespondidas: boolean;
  apenasErradas: boolean;
  apenasComPythonAPI: boolean;
}

// Categorias por certificação
export const CATEGORIES_BY_CERTIFICATION: Record<Certification, string[]> = {
  MTCNA: [
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
  ],
  MTCRE: [
    'Static Routing',
    'OSPF',
    'BGP',
    'RIP',
    'MME',
    'Routing Filters',
    'VRF',
    'Route Redistribution',
  ],
  MTCWE: [
    'Wireless Fundamentals',
    '802.11 Standards',
    'WDS',
    'Nstreme',
    'NV2',
    'CAPsMAN',
    'Wireless Security',
    'Troubleshooting',
  ],
  MTCTCE: [
    'HTB',
    'Simple Queues',
    'Queue Tree',
    'Mangle',
    'Burst',
    'PCQ',
    'Traffic Prioritization',
    'Connection Tracking',
  ],
  MTCUME: [
    'User Manager',
    'RADIUS',
    'Hotspot Advanced',
    'PPPoE',
    'Profiles',
    'Accounting',
    'Walled Garden',
    'Vouchers',
  ],
  MTCSE: [
    'Firewall Advanced',
    'Attack Prevention',
    'VPN Security',
    'IPsec',
    'Certificates',
    'Port Knocking',
    'Secure Protocols',
    'Intrusion Detection',
  ],
  MTCIPv6: [
    'IPv6 Fundamentals',
    'DHCPv6',
    'SLAAC',
    'IPv6 Routing',
    'Dual Stack',
    'Tunneling',
    'IPv6 Firewall',
    'IPv6 DNS',
  ],
  MTCINE: [
    'MPLS',
    'VPLS',
    'Traffic Engineering',
    'BGP Advanced',
    'Route Reflection',
    'ECMP',
    'Load Balancing',
    'L2VPN/L3VPN',
  ],
  MTCEWE: [
    'WiFi 6',
    '802.11ax',
    'High Density',
    'Enterprise CAPsMAN',
    'Roaming',
    'Band Steering',
    'Wireless Optimization',
    'Enterprise Security',
  ],
  MTCSWE: [
    'VLANs',
    'STP/RSTP',
    'LACP',
    'Port Isolation',
    'Switch Chip',
    'L3 Switching',
    'IGMP Snooping',
    'Port Security',
  ],
};

// Todas as categorias únicas
export const CATEGORIES = [...new Set(Object.values(CATEGORIES_BY_CERTIFICATION).flat())];

export const DEFAULT_FILTERS: QuestionFilters = {
  certificacoes: [],
  categorias: [],
  dificuldades: [],
  tags: [],
  rosVersion: 'todos',
  apenasNaoRespondidas: false,
  apenasErradas: false,
  apenasComPythonAPI: false,
};
