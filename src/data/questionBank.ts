import { Question } from '@/types/question';
import { mtcnaQuestions } from './questions/mtcna';
import { mtcreQuestions } from './questions/mtcre';
import { mtcweQuestions } from './questions/mtcwe';
import { mtctceQuestions } from './questions/mtctce';
import { mtcumeQuestions } from './questions/mtcume';
import { mtcseQuestions } from './questions/mtcse';
import { mtcipv6Questions } from './questions/mtcipv6';
import { mtcineQuestions } from './questions/mtcine';
import { mtceweQuestions } from './questions/mtcewe';
import { mtcsweQuestions } from './questions/mtcswe';

// Combinar todas as questões de todos os módulos
export const initialQuestionBank: Question[] = [
  ...mtcnaQuestions,
  ...mtcreQuestions,
  ...mtcweQuestions,
  ...mtctceQuestions,
  ...mtcumeQuestions,
  ...mtcseQuestions,
  ...mtcipv6Questions,
  ...mtcineQuestions,
  ...mtceweQuestions,
  ...mtcsweQuestions,
];

// Exportar questões por certificação para uso individual
export {
  mtcnaQuestions,
  mtcreQuestions,
  mtcweQuestions,
  mtctceQuestions,
  mtcumeQuestions,
  mtcseQuestions,
  mtcipv6Questions,
  mtcineQuestions,
  mtceweQuestions,
  mtcsweQuestions,
};
