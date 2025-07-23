export interface Idiom {
  id: number;
  phrase: string;
  meaning: string;
}

export interface LearningRecord {
  uid: string;
  phrase: string;
  status: 'known' | 'unknown' | 'correct' | 'incorrect';
  timestamp: string;
}

export type AppMode = 'study' | 'quiz';

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}