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

export type AppMode = 'study' | 'quiz' | 'lists' | 'statistics';

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface LearningStats {
  id: number;
  phrase: string;
  meaning: string;
  rememberedCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  status: 'known' | 'unknown' | 'unclassified';
}

export interface QuizRange {
  start: number;
  end: number;
}

export interface WordList {
  known: string[];
  unknown: string[];
}