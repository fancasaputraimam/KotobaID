export interface Flashcard {
  id: string;
  uid: string;
  front: string; // Question/Kanji/Word
  back: string; // Answer/Meaning/Reading
  type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence';
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // Difficulty level (1 = easiest, 5 = hardest)
  
  // SRS Algorithm fields
  interval: number; // Days until next review
  easeFactor: number; // How easy/hard the card is (default 2.5)
  repetitions: number; // Number of times reviewed successfully
  nextReviewDate: Date;
  lastReviewDate: Date;
  
  // Performance tracking
  totalReviews: number;
  correctAnswers: number;
  accuracy: number; // Percentage of correct answers
  averageResponseTime: number; // In seconds
  
  // Additional data
  hints?: string[];
  tags: string[];
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSession {
  id: string;
  uid: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  sessionType: 'review' | 'learning' | 'practice';
  createdAt: Date;
}

export interface SRSStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  todayReviews: number;
  streakDays: number;
  averageAccuracy: number;
  totalReviewTime: number; // In minutes
}

// SRS Algorithm levels
export enum SRSLevel {
  NEW = 0,          // New card, never studied
  LEARNING_1 = 1,   // First learning step (1 minute)
  LEARNING_2 = 2,   // Second learning step (10 minutes)
  LEARNING_3 = 3,   // Third learning step (1 day)
  YOUNG = 4,        // Young card (< 21 days interval)
  MATURE = 5,       // Mature card (≥ 21 days interval)
  MASTERED = 6      // Mastered card (> 100 days interval)
}

export interface StudyDeck {
  id: string;
  uid: string;
  name: string;
  description?: string;
  category: 'kanji' | 'vocabulary' | 'grammar' | 'mixed';
  cardCount: number;
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}