export interface StrokeData {
  path: string; // SVG path data
  duration: number; // Animation duration in ms
  delay: number; // Animation delay in ms
}

export interface CharacterData {
  character: string;
  type: 'kanji' | 'hiragana' | 'katakana';
  strokes: StrokeData[];
  meaning?: string;
  reading?: string;
  strokeCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  radicals?: string[];
  components?: string[];
}

export interface WritingAttempt {
  id: string;
  uid: string;
  character: string;
  type: 'kanji' | 'hiragana' | 'katakana';
  userStrokes: Array<{
    path: string;
    timestamp: number;
    duration: number;
  }>;
  accuracy: number; // 0-100
  completionTime: number; // in seconds
  attempts: number;
  isCorrect: boolean;
  feedback: string;
  createdAt: Date;
}

export interface WritingSession {
  id: string;
  uid: string;
  sessionType: 'practice' | 'test' | 'review';
  characters: string[];
  startTime: Date;
  endTime?: Date;
  totalAttempts: number;
  correctAttempts: number;
  averageAccuracy: number;
  averageTime: number;
  createdAt: Date;
}

export interface WritingProgress {
  uid: string;
  character: string;
  type: 'kanji' | 'hiragana' | 'katakana';
  totalPractices: number;
  successfulPractices: number;
  averageAccuracy: number;
  bestAccuracy: number;
  averageTime: number;
  bestTime: number;
  lastPracticed: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingStats {
  totalCharacters: number;
  masteredCharacters: number;
  practiceTime: number; // in minutes
  averageAccuracy: number;
  streak: number;
  kanjiProgress: {
    total: number;
    mastered: number;
    accuracy: number;
  };
  hiraganaProgress: {
    total: number;
    mastered: number;
    accuracy: number;
  };
  katakanaProgress: {
    total: number;
    mastered: number;
    accuracy: number;
  };
}