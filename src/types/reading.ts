export interface ReadingText {
  id: string;
  title: string;
  content: string;
  furiganaContent: string; // Content with furigana annotations
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'story' | 'news' | 'dialogue' | 'essay' | 'culture';
  estimatedReadingTime: number; // in minutes
  vocabulary: VocabularyItem[];
  grammarPoints: GrammarPoint[];
  comprehensionQuestions: ComprehensionQuestion[];
  tags: string[];
  createdAt: Date;
}

export interface VocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
}

export interface GrammarPoint {
  pattern: string;
  explanation: string;
  example: string;
  translation: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

export interface ReadingAttempt {
  id: string;
  uid: string;
  textId: string;
  startTime: Date;
  endTime: Date;
  readingTime: number; // in seconds
  comprehensionScore: number; // 0-100
  questionsAnswered: number;
  correctAnswers: number;
  answers: { questionId: string; answer: string; isCorrect: boolean }[];
  usesFurigana: boolean;
  feedback: string;
  createdAt: Date;
}

export interface ReadingSession {
  id: string;
  uid: string;
  sessionType: 'practice' | 'test' | 'speed-reading';
  texts: string[]; // ReadingText IDs
  startTime: Date;
  endTime?: Date;
  totalTexts: number;
  completedTexts: number;
  averageScore: number;
  averageTime: number;
  createdAt: Date;
}

export interface ReadingProgress {
  uid: string;
  textId: string;
  difficulty: string;
  totalReads: number;
  bestScore: number;
  averageScore: number;
  bestTime: number;
  averageTime: number;
  lastRead: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingStats {
  totalTextsRead: number;
  totalReadingTime: number; // in minutes
  averageScore: number;
  averageReadingSpeed: number; // characters per minute
  streak: number;
  difficultyProgress: {
    beginner: {
      total: number;
      mastered: number;
      averageScore: number;
    };
    intermediate: {
      total: number;
      mastered: number;
      averageScore: number;
    };
    advanced: {
      total: number;
      mastered: number;
      averageScore: number;
    };
  };
  categoryProgress: {
    [key: string]: {
      total: number;
      mastered: number;
      averageScore: number;
    };
  };
}