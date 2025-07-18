export interface UserProgress {
  uid: string;
  totalStudyTime: number; // in minutes
  dailyGoal: number; // in minutes
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastStudyDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleProgress {
  uid: string;
  moduleId: string;
  moduleName: string;
  moduleType: 'kanji' | 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing';
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyProgress {
  uid: string;
  date: string; // YYYY-MM-DD format
  studyTime: number; // in minutes
  lessonsCompleted: number;
  kanjiLearned: number;
  vocabularyLearned: number;
  quizzesCompleted: number;
  createdAt: Date;
}

export interface LearningSession {
  uid: string;
  sessionId: string;
  moduleType: 'kanji' | 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'quiz';
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  itemsStudied: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number; // percentage
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'study_time' | 'lessons' | 'accuracy' | 'milestone';
  requirement: number;
  earned: boolean;
  earnedAt?: Date;
}

export interface StudyStats {
  totalStudyTime: number;
  totalLessons: number;
  totalKanji: number;
  totalVocabulary: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoalProgress: number;
  weeklyProgress: DailyProgress[];
  achievements: Achievement[];
}