export interface AudioContent {
  id: string;
  text: string;
  reading?: string; // For kanji/vocabulary
  audioUrl?: string;
  type: 'word' | 'sentence' | 'dialogue' | 'pronunciation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'vocabulary' | 'grammar' | 'conversation' | 'pronunciation';
  translation: string;
  tags: string[];
  createdAt: Date;
}

export interface ListeningExercise {
  id: string;
  uid: string;
  audioContent: AudioContent;
  userResponse: string;
  expectedResponse: string;
  isCorrect: boolean;
  accuracy: number; // 0-100
  completionTime: number; // in seconds
  hints: string[];
  feedback: string;
  attempts: number;
  createdAt: Date;
}

export interface ListeningSession {
  id: string;
  uid: string;
  sessionType: 'listening' | 'pronunciation' | 'dictation';
  exercises: string[]; // AudioContent IDs
  startTime: Date;
  endTime?: Date;
  totalExercises: number;
  correctAnswers: number;
  averageAccuracy: number;
  averageTime: number;
  createdAt: Date;
}

export interface PronunciationAttempt {
  id: string;
  uid: string;
  text: string;
  audioBlob: Blob;
  accuracy: number; // 0-100
  feedback: string;
  issues: string[]; // Common pronunciation issues
  suggestions: string[];
  createdAt: Date;
}

export interface AudioProgress {
  uid: string;
  contentId: string;
  totalListened: number;
  successfulAttempts: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastPracticed: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioStats {
  totalExercises: number;
  totalListeningTime: number; // in minutes
  averageAccuracy: number;
  streak: number;
  vocabularyProgress: {
    total: number;
    mastered: number;
    accuracy: number;
  };
  conversationProgress: {
    total: number;
    mastered: number;
    accuracy: number;
  };
  pronunciationProgress: {
    total: number;
    mastered: number;
    accuracy: number;
  };
}