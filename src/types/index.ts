export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Kanji {
  id: string;
  character: string;
  meaning: string;
  meaningIndonesian?: string;
  grade: number;
  strokeCount: number;
  onyomi: string[];
  kunyomi: string[];
  strokeOrder?: string;
  examples: KanjiExample[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
  audioUrl?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  meaningIndonesian?: string;
  jlptLevel?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  chapter?: number;
  audioUrl?: string;
  examples: VocabularyExample[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyExample {
  sentence: string;
  reading: string;
  meaning: string;
  audioUrl?: string;
}

export interface Grammar {
  id: string;
  title: string;
  chapter: number;
  structure: string;
  explanation: string;
  examples: GrammarExample[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GrammarExample {
  sentence: string;
  reading: string;
  meaning: string;
  audioUrl?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  grammarTopics: string[];
  vocabulary: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  uid: string;
  kanjiProgress: {
    [kanjiId: string]: {
      learned: boolean;
      lastReviewed: Date;
      reviewCount: number;
    };
  };
  grammarProgress: {
    [grammarId: string]: {
      learned: boolean;
      lastReviewed: Date;
      reviewCount: number;
    };
  };
  vocabularyProgress: {
    [vocabularyId: string]: {
      learned: boolean;
      lastReviewed: Date;
      reviewCount: number;
    };
  };
  currentChapter: number;
  totalStudyTime: number;
  lastActivity: Date;
}