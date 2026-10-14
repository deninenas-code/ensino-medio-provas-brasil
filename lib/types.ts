export type ExamSegment = 'medio' | 'fundamental';

export type ExamBanca = 
  | 'enem' 
  | 'fuvest' 
  | 'unicamp' 
  | 'saeb' 
  | 'obmep' 
  | 'prova_paulista' 
  | 'oba' 
  | 'militares';

export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'desafio';

export type SubjectCategory = 
  | 'matematica' 
  | 'portugues' 
  | 'natureza' 
  | 'humanas' 
  | 'redacao' 
  | 'astronomia';

export interface QuestionAlternative {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  number: number;
  examOrigin: string;
  year: number | string;
  subject: string;
  category: SubjectCategory;
  subtopic: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  supportTextTitle?: string;
  supportText?: string;
  supportSource?: string;
  image?: {
    src: string;
    caption: string;
    analysisTitle: string;
    analysisText: string;
  };
  prompt: string;
  alternatives: QuestionAlternative[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  competencyOrDescriptor: string;
}

export interface Simulado {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeType: 'enem' | 'vestibular' | 'obmep' | 'fundamental' | 'tematico' | 'habilidade';
  segment: ExamSegment;
  banca: ExamBanca;
  year: number;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  questionCount: number;
  durationMinutes: number;
  durationFormatted: string;
  averageScorePercent: number;
  studentsCountFormatted: string;
  benchmarkBadge: string;
  curator: {
    name: string;
    role: string;
    avatar: string;
  };
  questions: Question[];
}

export interface ExamAttempt {
  id: string;
  simuladoId: string;
  simuladoTitle: string;
  date: string;
  completedAt: string;
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | 'E' | undefined>;
  flaggedForReview: number[];
  struckAlternatives: Record<number, ('A' | 'B' | 'C' | 'D' | 'E')[]>;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  triScore: number;
}
