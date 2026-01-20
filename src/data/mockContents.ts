// Mock data for Content Hub when backend is offline

export interface Content {
  id: number;
  title: string;
  description: string;
  type: 'pdf' | 'video';
  track: string;
  tags: string[];
  level: 'iniciante' | 'intermediario' | 'avancado';
  status: 'rascunho' | 'publicado';
  featured: boolean;
  sortOrder: number;
  filePath?: string;
  fileSize?: number;
  duration?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentProgress {
  contentId: number;
  status: 'em_andamento' | 'concluido';
  lastPosition: number;
  completedAt?: string;
}

export const mockContents: Content[] = [
  {
    id: 1,
    title: 'Introdução ao Linux - Primeiros Passos',
    description: 'Aprenda os fundamentos do sistema operacional Linux, incluindo navegação de diretórios, comandos básicos e estrutura de arquivos.',
    type: 'pdf',
    track: 'Linux Essentials',
    tags: ['linux', 'básico', 'comandos'],
    level: 'iniciante',
    status: 'publicado',
    featured: true,
    sortOrder: 1,
    fileSize: 2500000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Gerenciamento de Usuários e Permissões',
    description: 'Domine o sistema de permissões do Linux, incluindo chmod, chown, e gerenciamento de grupos.',
    type: 'video',
    track: 'Linux Essentials',
    tags: ['linux', 'permissões', 'segurança'],
    level: 'intermediario',
    status: 'publicado',
    featured: false,
    sortOrder: 2,
    duration: 1800,
    fileSize: 150000000,
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
  },
  {
    id: 3,
    title: 'Proxmox VE - Instalação e Configuração Inicial',
    description: 'Guia completo de instalação do Proxmox VE, configuração de rede e primeiros passos com virtualização.',
    type: 'video',
    track: 'Proxmox VE',
    tags: ['proxmox', 'virtualização', 'instalação'],
    level: 'iniciante',
    status: 'publicado',
    featured: true,
    sortOrder: 1,
    duration: 2700,
    fileSize: 280000000,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 4,
    title: 'Containers LXC no Proxmox',
    description: 'Aprenda a criar e gerenciar containers Linux (LXC) no Proxmox VE para isolar serviços.',
    type: 'pdf',
    track: 'Proxmox VE',
    tags: ['proxmox', 'lxc', 'containers'],
    level: 'intermediario',
    status: 'publicado',
    featured: false,
    sortOrder: 2,
    fileSize: 3200000,
    createdAt: '2024-01-22T11:15:00Z',
    updatedAt: '2024-01-22T11:15:00Z',
  },
  {
    id: 5,
    title: 'Shell Scripting Avançado',
    description: 'Técnicas avançadas de scripting bash incluindo arrays, funções, e automação de tarefas.',
    type: 'pdf',
    track: 'Linux Essentials',
    tags: ['linux', 'bash', 'scripting', 'automação'],
    level: 'avancado',
    status: 'publicado',
    featured: false,
    sortOrder: 3,
    fileSize: 4100000,
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
  },
  {
    id: 6,
    title: 'Alta Disponibilidade com Proxmox Cluster',
    description: 'Configure clusters Proxmox para alta disponibilidade com migração live de VMs.',
    type: 'video',
    track: 'Proxmox VE',
    tags: ['proxmox', 'cluster', 'ha', 'avançado'],
    level: 'avancado',
    status: 'publicado',
    featured: true,
    sortOrder: 3,
    duration: 3600,
    fileSize: 420000000,
    createdAt: '2024-01-28T08:30:00Z',
    updatedAt: '2024-01-28T08:30:00Z',
  },
  {
    id: 7,
    title: 'Backup e Restauração no Proxmox',
    description: 'Estratégias de backup com Proxmox Backup Server, agendamento e restauração de VMs.',
    type: 'pdf',
    track: 'Proxmox VE',
    tags: ['proxmox', 'backup', 'pbs'],
    level: 'intermediario',
    status: 'rascunho',
    featured: false,
    sortOrder: 4,
    fileSize: 2800000,
    createdAt: '2024-01-30T13:00:00Z',
    updatedAt: '2024-01-30T13:00:00Z',
  },
];

// Simulate user progress
export const mockProgress: Record<number, ContentProgress> = {
  1: { contentId: 1, status: 'concluido', lastPosition: 100, completedAt: '2024-02-01T10:00:00Z' },
  2: { contentId: 2, status: 'em_andamento', lastPosition: 65 },
  3: { contentId: 3, status: 'em_andamento', lastPosition: 30 },
};

// LocalStorage keys for persisting mock data
export const STORAGE_KEYS = {
  CONTENTS: 'infra-study-contents',
  PROGRESS: 'infra-study-content-progress',
};

// Helper functions for localStorage persistence
export function loadContentsFromStorage(): Content[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENTS);
    return saved ? JSON.parse(saved) : mockContents;
  } catch {
    return mockContents;
  }
}

export function saveContentsToStorage(contents: Content[]): void {
  localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(contents));
}

export function loadProgressFromStorage(): Record<number, ContentProgress> {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return saved ? JSON.parse(saved) : mockProgress;
  } catch {
    return mockProgress;
  }
}

export function saveProgressToStorage(progress: Record<number, ContentProgress>): void {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}
