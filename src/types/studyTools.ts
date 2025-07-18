export interface DictionaryEntry {
  id: string;
  word: string;
  reading: string;
  meanings: Meaning[];
  kanji?: KanjiInfo[];
  partOfSpeech: string[];
  jlptLevel?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  frequency: number; // 1-5 scale
  examples: ExampleSentence[];
  audio?: string;
  tags: string[];
  source: 'internal' | 'jisho' | 'ai-generated';
  createdAt: Date;
  updatedAt: Date;
}

export interface Meaning {
  id: string;
  definition: string;
  indonesian: string;
  english?: string;
  context?: string;
  domain?: string; // e.g., "formal", "casual", "business"
}

export interface KanjiInfo {
  character: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  strokeCount: number;
  jlptLevel?: string;
  frequency: number;
}

export interface ExampleSentence {
  id: string;
  japanese: string;
  reading: string;
  indonesian: string;
  english?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  tags: string[];
}

export interface SentenceAnalysis {
  original: string;
  tokens: Token[];
  grammar: GrammarAnalysis[];
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  breakdown: SentenceBreakdown;
  suggestions: StudySuggestion[];
}

export interface Token {
  id: string;
  surface: string; // Original form
  reading: string;
  baseForm: string;
  partOfSpeech: string;
  meaning: string;
  indonesian: string;
  isKnown: boolean;
  difficulty: number; // 1-5 scale
  jlptLevel?: string;
  conjugationInfo?: ConjugationInfo;
}

export interface GrammarAnalysis {
  id: string;
  pattern: string;
  explanation: string;
  indonesian: string;
  example: string;
  level: 'basic' | 'intermediate' | 'advanced';
  category: string;
  relatedPatterns: string[];
}

export interface SentenceBreakdown {
  structure: string;
  parts: SentencePart[];
  keyGrammar: string[];
  culturalNotes?: string[];
  formalityLevel: 'casual' | 'polite' | 'formal';
}

export interface SentencePart {
  id: string;
  text: string;
  reading: string;
  function: string; // subject, object, verb, etc.
  explanation: string;
  indonesian: string;
  importance: 'high' | 'medium' | 'low';
}

export interface ConjugationInfo {
  form: string;
  tense: string;
  polarity: 'positive' | 'negative';
  politeness: 'casual' | 'polite';
  explanation: string;
}

export interface StudySuggestion {
  id: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'culture';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: string[];
}

export interface SearchFilters {
  partOfSpeech?: string[];
  jlptLevel?: string[];
  difficulty?: string[];
  hasAudio?: boolean;
  hasExamples?: boolean;
  source?: string[];
  tags?: string[];
}

export interface SearchResult {
  entries: DictionaryEntry[];
  total: number;
  page: number;
  limit: number;
  suggestions: string[];
  relatedTerms: string[];
}

export interface UserDictionary {
  id: string;
  uid: string;
  name: string;
  description: string;
  entries: string[]; // DictionaryEntry IDs
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  uid: string;
  type: 'dictionary' | 'sentence-analysis' | 'grammar-lookup';
  startTime: Date;
  endTime?: Date;
  itemsStudied: string[];
  newWordsLearned: number;
  grammarPointsReviewed: number;
  totalTime: number; // in seconds
  efficiency: number; // items per minute
  createdAt: Date;
}

export interface BookmarkItem {
  id: string;
  uid: string;
  type: 'word' | 'sentence' | 'grammar';
  itemId: string;
  content: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface StudyHistory {
  id: string;
  uid: string;
  action: 'lookup' | 'analyze' | 'bookmark' | 'practice';
  itemType: 'word' | 'sentence' | 'grammar';
  itemId: string;
  content: string;
  context?: string;
  timestamp: Date;
  metadata: {
    [key: string]: any;
  };
}

export interface LearningCard {
  id: string;
  type: 'vocabulary' | 'grammar' | 'kanji';
  content: string;
  reading?: string;
  meaning: string;
  explanation: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  relatedItems: string[];
  multimedia?: {
    audio?: string;
    image?: string;
    video?: string;
  };
  createdAt: Date;
}