export interface LearningAnalytics {
  overview: OverviewStats;
  progressTrends: ProgressTrend[];
  skillBreakdown: SkillBreakdown;
  timeAnalytics: TimeAnalytics;
  performanceMetrics: PerformanceMetrics;
  recommendations: Recommendation[];
  achievements: AchievementAnalytics;
  streakAnalytics: StreakAnalytics;
  weaknessAnalysis: WeaknessAnalysis;
  studyPatterns: StudyPattern[];
}

export interface OverviewStats {
  totalStudyTime: number; // in minutes
  studyDays: number;
  averageSessionTime: number;
  totalActivities: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  level: string;
  experiencePoints: number;
}

export interface ProgressTrend {
  date: string;
  kanji: number;
  vocabulary: number;
  grammar: number;
  listening: number;
  reading: number;
  writing: number;
  totalActivities: number;
  accuracy: number;
  studyTime: number;
}

export interface SkillBreakdown {
  kanji: SkillMetrics;
  vocabulary: SkillMetrics;
  grammar: SkillMetrics;
  listening: SkillMetrics;
  reading: SkillMetrics;
  writing: SkillMetrics;
  flashcards: SkillMetrics;
}

export interface SkillMetrics {
  totalPracticed: number;
  mastered: number;
  averageAccuracy: number;
  timeSpent: number; // in minutes
  recentProgress: number; // percentage change last 7 days
  strongestAreas: string[];
  weakestAreas: string[];
  nextMilestone: {
    target: number;
    current: number;
    description: string;
  };
}

export interface TimeAnalytics {
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  bestDay: {
    date: string;
    minutes: number;
  };
  studyTimeBySkill: {
    [skill: string]: number;
  };
  studyTimeByHour: {
    [hour: string]: number;
  };
  studyTimeByDay: {
    [day: string]: number;
  };
  efficiency: number; // accuracy per minute
}

export interface PerformanceMetrics {
  accuracyTrend: AccuracyTrend[];
  speedImprovement: SpeedMetric[];
  consistencyScore: number;
  learningVelocity: number;
  retentionRate: number;
  errorPatterns: ErrorPattern[];
  improvementAreas: ImprovementArea[];
}

export interface AccuracyTrend {
  date: string;
  skill: string;
  accuracy: number;
  attempts: number;
}

export interface SpeedMetric {
  date: string;
  skill: string;
  averageTime: number;
  activity: string;
}

export interface ErrorPattern {
  category: string;
  errorType: string;
  frequency: number;
  examples: string[];
  suggestedFocus: string;
}

export interface ImprovementArea {
  skill: string;
  area: string;
  currentLevel: number;
  targetLevel: number;
  suggestions: string[];
  estimatedTime: number; // days to improve
}

export interface Recommendation {
  id: string;
  type: 'skill-focus' | 'time-management' | 'study-method' | 'content-suggestion';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  expectedImprovement: string;
  estimatedTime: string;
  skillArea?: string;
}

export interface AchievementAnalytics {
  totalEarned: number;
  recentAchievements: Achievement[];
  progress: AchievementProgress[];
  categories: {
    [category: string]: {
      earned: number;
      total: number;
    };
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  dateEarned: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  category: string;
}

export interface StreakAnalytics {
  current: number;
  longest: number;
  thisWeek: number;
  thisMonth: number;
  streakHistory: StreakRecord[];
  averageStreakLength: number;
  streakMaintenance: {
    riskLevel: 'low' | 'medium' | 'high';
    suggestion: string;
  };
}

export interface StreakRecord {
  startDate: Date;
  endDate: Date;
  length: number;
  activities: number;
}

export interface WeaknessAnalysis {
  criticalWeaknesses: Weakness[];
  improvingAreas: Weakness[];
  strengthsToLeverage: Strength[];
  focusRecommendations: FocusRecommendation[];
}

export interface Weakness {
  skill: string;
  area: string;
  severity: 'critical' | 'moderate' | 'minor';
  accuracy: number;
  frequency: number;
  examples: string[];
  suggestedExercises: string[];
}

export interface Strength {
  skill: string;
  area: string;
  accuracy: number;
  consistency: number;
  description: string;
}

export interface FocusRecommendation {
  skill: string;
  timeAllocation: number; // percentage
  specificAreas: string[];
  expectedImprovement: string;
}

export interface StudyPattern {
  date: Date;
  timeOfDay: number; // hour
  duration: number; // minutes
  skills: string[];
  accuracy: number;
  productivity: number; // activities per minute
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'paused';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedDate?: Date;
}