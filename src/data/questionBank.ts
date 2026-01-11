import { Question } from '@/types/question';
import { linuxEssentialsQuestions } from './questions/linux-essentials';
import { proxmoxVEQuestions } from './questions/proxmox-ve';

// Banco de questões consolidado - Infra Study Lab
export const questionBank: Question[] = [
  ...linuxEssentialsQuestions,
  ...proxmoxVEQuestions,
];

// Alias para compatibilidade com código legado
export const initialQuestionBank = questionBank;

// Exportar questões por trilha para uso individual
export {
  linuxEssentialsQuestions,
  proxmoxVEQuestions,
};

// Estatísticas do banco
export const bankStats = {
  total: questionBank.length,
  byTrack: {
    'Linux Essentials': linuxEssentialsQuestions.length,
    'Proxmox VE': proxmoxVEQuestions.length,
  },
  byDifficulty: {
    Easy: questionBank.filter(q => q.dificuldade === 'Easy').length,
    Medium: questionBank.filter(q => q.dificuldade === 'Medium').length,
    Hard: questionBank.filter(q => q.dificuldade === 'Hard').length,
  },
};

export default questionBank;