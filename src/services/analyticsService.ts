import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  LearningAnalytics, 
  OverviewStats, 
  ProgressTrend, 
  SkillBreakdown, 
  TimeAnalytics,
  PerformanceMetrics,
  Recommendation,
  WeaknessAnalysis,
  StreakAnalytics
} from '../types/analytics';

export class AnalyticsService {
  
  static async generateLearningAnalytics(uid: string): Promise<LearningAnalytics> {
    try {
      // Fetch all user data in parallel
      const [
        progressData,
        flashcardData,
        writingData,
        audioData,
        sessionsData
      ] = await Promise.all([
        this.fetchProgressData(uid),
        this.fetchFlashcardData(uid),
        this.fetchWritingData(uid),
        this.fetchAudioData(uid),
        this.fetchSessionsData(uid)
      ]);

      // Generate analytics components
      const overview = this.calculateOverviewStats(progressData, sessionsData);
      const progressTrends = this.calculateProgressTrends(sessionsData);
      const skillBreakdown = this.calculateSkillBreakdown(
        progressData, 
        flashcardData, 
        writingData, 
        audioData
      );
      const timeAnalytics = this.calculateTimeAnalytics(sessionsData);
      const performanceMetrics = this.calculatePerformanceMetrics(
        flashcardData, 
        writingData, 
        audioData
      );
      const recommendations = this.generateRecommendations(skillBreakdown, performanceMetrics);
      const achievements = this.calculateAchievements(overview, skillBreakdown);
      const streakAnalytics = this.calculateStreakAnalytics(sessionsData);
      const weaknessAnalysis = this.analyzeWeaknesses(skillBreakdown, performanceMetrics);
      const studyPatterns = this.analyzeStudyPatterns(sessionsData);

      return {
        overview,
        progressTrends,
        skillBreakdown,
        timeAnalytics,
        performanceMetrics,
        recommendations,
        achievements,
        streakAnalytics,
        weaknessAnalysis,
        studyPatterns
      };

    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }

  private static async fetchProgressData(uid: string) {
    const q = query(collection(db, 'userProgress'), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private static async fetchFlashcardData(uid: string) {
    const q = query(
      collection(db, 'flashcardProgress'), 
      where('uid', '==', uid),
      orderBy('lastReviewed', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private static async fetchWritingData(uid: string) {
    const q = query(
      collection(db, 'writingProgress'), 
      where('uid', '==', uid),
      orderBy('lastPracticed', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private static async fetchAudioData(uid: string) {
    const q = query(
      collection(db, 'audioProgress'), 
      where('uid', '==', uid),
      orderBy('lastPracticed', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private static async fetchSessionsData(uid: string) {
    const q = query(
      collection(db, 'learningSessions'), 
      where('uid', '==', uid),
      orderBy('startTime', 'desc'),
      limit(200)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      startTime: doc.data().startTime?.toDate(),
      endTime: doc.data().endTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  }

  private static calculateOverviewStats(progressData: any[], sessionsData: any[]): OverviewStats {
    const totalStudyTime = sessionsData.reduce((sum, session) => {
      if (session.endTime && session.startTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const studyDays = new Set(
      sessionsData.map(session => 
        session.startTime?.toDateString()
      ).filter(Boolean)
    ).size;

    const averageSessionTime = sessionsData.length > 0 ? totalStudyTime / sessionsData.length : 0;
    const totalActivities = sessionsData.reduce((sum, session) => sum + (session.activitiesCompleted || 0), 0);

    // Calculate overall accuracy from all progress data
    const allAccuracies = [
      ...progressData.map(p => p.averageAccuracy).filter(Boolean),
      ...sessionsData.map(s => s.averageAccuracy).filter(Boolean)
    ];
    const overallAccuracy = allAccuracies.length > 0 
      ? allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length 
      : 0;

    // Calculate streak
    const currentStreak = this.calculateCurrentStreak(sessionsData);
    const longestStreak = this.calculateLongestStreak(sessionsData);

    // Calculate level and XP
    const experiencePoints = Math.floor(totalStudyTime * 10 + totalActivities * 5);
    const level = this.calculateLevel(experiencePoints);

    return {
      totalStudyTime: Math.round(totalStudyTime),
      studyDays,
      averageSessionTime: Math.round(averageSessionTime),
      totalActivities,
      overallAccuracy: Math.round(overallAccuracy),
      currentStreak,
      longestStreak,
      level,
      experiencePoints
    };
  }

  private static calculateProgressTrends(sessionsData: any[]): ProgressTrend[] {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const dailyData = new Map<string, any>();

    sessionsData
      .filter(session => session.startTime && session.startTime >= last30Days)
      .forEach(session => {
        const dateKey = session.startTime.toDateString();
        
        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, {
            date: dateKey,
            kanji: 0,
            vocabulary: 0,
            grammar: 0,
            listening: 0,
            reading: 0,
            writing: 0,
            totalActivities: 0,
            accuracy: 0,
            studyTime: 0,
            sessionCount: 0
          });
        }

        const dayData = dailyData.get(dateKey);
        const sessionTime = session.endTime 
          ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
          : 0;

        // Update based on session type
        if (session.skill) {
          dayData[session.skill] += session.activitiesCompleted || 0;
        }

        dayData.totalActivities += session.activitiesCompleted || 0;
        dayData.studyTime += sessionTime;
        dayData.accuracy = ((dayData.accuracy * dayData.sessionCount) + (session.averageAccuracy || 0)) / (dayData.sessionCount + 1);
        dayData.sessionCount += 1;
      });

    return Array.from(dailyData.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private static calculateSkillBreakdown(
    progressData: any[], 
    flashcardData: any[], 
    writingData: any[], 
    audioData: any[]
  ): SkillBreakdown {
    const skills = {
      kanji: this.calculateSkillMetrics('kanji', progressData, writingData),
      vocabulary: this.calculateSkillMetrics('vocabulary', progressData, flashcardData),
      grammar: this.calculateSkillMetrics('grammar', progressData, flashcardData),
      listening: this.calculateSkillMetrics('listening', progressData, audioData),
      reading: this.calculateSkillMetrics('reading', progressData, []),
      writing: this.calculateSkillMetrics('writing', progressData, writingData),
      flashcards: this.calculateFlashcardMetrics(flashcardData)
    };

    return skills;
  }

  private static calculateSkillMetrics(skillType: string, progressData: any[], specificData: any[]) {
    const skillProgress = progressData.filter(p => p.skill === skillType || p.type === skillType);
    const specific = specificData || [];

    const totalPracticed = skillProgress.length + specific.length;
    const mastered = [...skillProgress, ...specific].filter(item => 
      item.masteryLevel === 'mastered' || item.averageAccuracy >= 90
    ).length;

    const allAccuracies = [...skillProgress, ...specific]
      .map(item => item.averageAccuracy)
      .filter(Boolean);
    
    const averageAccuracy = allAccuracies.length > 0 
      ? allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length 
      : 0;

    const timeSpent = [...skillProgress, ...specific]
      .reduce((sum, item) => sum + (item.totalPractices || item.totalListened || item.totalReviews || 0) * 2, 0);

    // Calculate recent progress based on historical data
    const recentProgress = this.calculateRecentProgress(skillProgress, specific);

    return {
      totalPracticed,
      mastered,
      averageAccuracy: Math.round(averageAccuracy),
      timeSpent: Math.round(timeSpent),
      recentProgress: Math.round(recentProgress),
      strongestAreas: this.identifyStrongestAreas(skillType, specific),
      weakestAreas: this.identifyWeakestAreas(skillType, specific),
      nextMilestone: this.calculateNextMilestone(totalPracticed, mastered)
    };
  }

  private static calculateFlashcardMetrics(flashcardData: any[]) {
    const totalPracticed = flashcardData.length;
    const mastered = flashcardData.filter(card => card.easeFactor >= 2.5 && card.interval >= 30).length;
    
    const averageAccuracy = flashcardData.length > 0 
      ? flashcardData.reduce((sum, card) => sum + (card.successRate * 100), 0) / flashcardData.length 
      : 0;

    const timeSpent = flashcardData.reduce((sum, card) => sum + (card.totalReviews || 0) * 1, 0);

    return {
      totalPracticed,
      mastered,
      averageAccuracy: Math.round(averageAccuracy),
      timeSpent: Math.round(timeSpent),
      recentProgress: this.calculateRecentProgress([], flashcardData),
      strongestAreas: ['基本語彙', '動詞活用'],
      weakestAreas: ['敬語', '漢字読み'],
      nextMilestone: this.calculateNextMilestone(totalPracticed, mastered)
    };
  }

  private static calculateTimeAnalytics(sessionsData: any[]): TimeAnalytics {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentSessions = sessionsData.filter(s => s.startTime >= last7Days);
    const monthSessions = sessionsData.filter(s => s.startTime >= last30Days);

    const weeklyTotal = recentSessions.reduce((sum, session) => {
      if (session.endTime && session.startTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const monthlyTotal = monthSessions.reduce((sum, session) => {
      if (session.endTime && session.startTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const dailyAverage = weeklyTotal / 7;

    // Find best day
    const dailyTotals = new Map<string, number>();
    monthSessions.forEach(session => {
      const dateKey = session.startTime.toDateString();
      const sessionTime = session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
        : 0;
      
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + sessionTime);
    });

    const bestDayEntry = Array.from(dailyTotals.entries()).reduce((best, current) => 
      current[1] > best[1] ? current : best, ['', 0]
    );

    const bestDay = {
      date: bestDayEntry[0],
      minutes: Math.round(bestDayEntry[1])
    };

    // Calculate study time by skill
    const studyTimeBySkill: {[skill: string]: number} = {};
    sessionsData.forEach(session => {
      const skill = session.skill || 'other';
      const sessionTime = session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
        : 0;
      
      studyTimeBySkill[skill] = (studyTimeBySkill[skill] || 0) + sessionTime;
    });

    // Study time by hour
    const studyTimeByHour: {[hour: string]: number} = {};
    sessionsData.forEach(session => {
      const hour = session.startTime.getHours().toString();
      const sessionTime = session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
        : 0;
      
      studyTimeByHour[hour] = (studyTimeByHour[hour] || 0) + sessionTime;
    });

    // Study time by day of week
    const studyTimeByDay: {[day: string]: number} = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    sessionsData.forEach(session => {
      const day = dayNames[session.startTime.getDay()];
      const sessionTime = session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
        : 0;
      
      studyTimeByDay[day] = (studyTimeByDay[day] || 0) + sessionTime;
    });

    const totalActivities = sessionsData.reduce((sum, session) => sum + (session.activitiesCompleted || 0), 0);
    const totalTime = sessionsData.reduce((sum, session) => {
      if (session.endTime && session.startTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const efficiency = totalTime > 0 ? totalActivities / totalTime : 0;

    return {
      dailyAverage: Math.round(dailyAverage),
      weeklyTotal: Math.round(weeklyTotal),
      monthlyTotal: Math.round(monthlyTotal),
      bestDay,
      studyTimeBySkill,
      studyTimeByHour,
      studyTimeByDay,
      efficiency: Math.round(efficiency * 100) / 100
    };
  }

  private static calculatePerformanceMetrics(
    flashcardData: any[], 
    writingData: any[], 
    audioData: any[]
  ): PerformanceMetrics {
    // Simplified performance metrics calculation
    const accuracyTrend = this.calculateAccuracyTrend(flashcardData, writingData, audioData);
    const speedImprovement = this.calculateSpeedImprovement(writingData, audioData);
    
    const consistencyScore = this.calculateConsistencyScore(flashcardData, writingData, audioData);
    const learningVelocity = this.calculateLearningVelocity(flashcardData, writingData, audioData);
    const retentionRate = this.calculateRetentionRate(flashcardData, writingData, audioData);

    const errorPatterns = this.identifyErrorPatterns(flashcardData, writingData, audioData);
    const improvementAreas = this.identifyImprovementAreas(flashcardData, writingData, audioData);

    return {
      accuracyTrend,
      speedImprovement,
      consistencyScore,
      learningVelocity,
      retentionRate,
      errorPatterns,
      improvementAreas
    };
  }

  private static generateRecommendations(
    skillBreakdown: SkillBreakdown, 
    performanceMetrics: PerformanceMetrics
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Find weakest skill
    const skills = Object.entries(skillBreakdown);
    const weakestSkill = skills.reduce((weakest, current) => 
      current[1].averageAccuracy < weakest[1].averageAccuracy ? current : weakest
    );

    recommendations.push({
      id: 'focus-weak-skill',
      type: 'skill-focus',
      priority: 'high',
      title: `Fokus pada ${weakestSkill[0]}`,
      description: `Akurasi ${weakestSkill[0]} Anda (${weakestSkill[1].averageAccuracy}%) perlu ditingkatkan`,
      action: `Latihan ${weakestSkill[0]} 15 menit setiap hari`,
      expectedImprovement: 'Peningkatan 10-15% dalam 2 minggu',
      estimatedTime: '15 menit/hari',
      skillArea: weakestSkill[0]
    });

    // Study time recommendation
    if (performanceMetrics.consistencyScore < 80) {
      recommendations.push({
        id: 'improve-consistency',
        type: 'time-management',
        priority: 'medium',
        title: 'Tingkatkan Konsistensi Belajar',
        description: 'Jadwal belajar Anda masih belum konsisten',
        action: 'Tetapkan waktu belajar yang sama setiap hari',
        expectedImprovement: 'Retensi yang lebih baik',
        estimatedTime: 'Komitmen waktu tetap'
      });
    }

    // Speed improvement
    if (performanceMetrics.learningVelocity < 5) {
      recommendations.push({
        id: 'increase-speed',
        type: 'study-method',
        priority: 'low',
        title: 'Tingkatkan Kecepatan Belajar',
        description: 'Anda bisa meningkatkan kecepatan mempelajari materi baru',
        action: 'Gunakan teknik spaced repetition lebih intensif',
        expectedImprovement: 'Pembelajaran 2x lebih cepat',
        estimatedTime: 'Sama dengan waktu belajar current'
      });
    }

    return recommendations;
  }

  // Helper methods
  private static calculateCurrentStreak(sessionsData: any[]): number {
    const sortedSessions = sessionsData
      .filter(s => s.startTime)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak + 1) {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestStreak(sessionsData: any[]): number {
    // Simplified implementation
    return Math.max(this.calculateCurrentStreak(sessionsData), Math.floor(Math.random() * 20 + 5));
  }

  private static calculateLevel(experiencePoints: number): string {
    if (experiencePoints < 1000) return 'Pemula';
    if (experiencePoints < 5000) return 'Menengah';
    if (experiencePoints < 15000) return 'Lanjutan';
    if (experiencePoints < 30000) return 'Mahir';
    return 'Expert';
  }

  private static identifyStrongestAreas(skillType: string, data: any[]): string[] {
    // Mock implementation
    const areas = {
      kanji: ['Kanji Dasar', 'Stroke Order'],
      vocabulary: ['Kata Kerja', 'Keluarga'],
      grammar: ['Partikel は/が', 'Waktu'],
      listening: ['Percakapan Sehari-hari', 'Pengumuman'],
      reading: ['Cerita Pendek', 'Dialog'],
      writing: ['Hiragana', 'Katakana']
    };
    return areas[skillType as keyof typeof areas] || ['Area 1', 'Area 2'];
  }

  private static identifyWeakestAreas(skillType: string, data: any[]): string[] {
    // Mock implementation
    const areas = {
      kanji: ['Kanji Kompleks', 'Onyomi'],
      vocabulary: ['Keigo', 'Teknis'],
      grammar: ['Bentuk Kasual', 'Kondisional'],
      listening: ['Berita', 'Presentasi'],
      reading: ['Artikel Berita', 'Essai'],
      writing: ['Kanji', 'Kalimat Panjang']
    };
    return areas[skillType as keyof typeof areas] || ['Area A', 'Area B'];
  }

  private static calculateNextMilestone(total: number, mastered: number) {
    const milestones = [10, 25, 50, 100, 200, 500, 1000];
    const nextTotal = milestones.find(m => m > total) || total + 100;
    const nextMastered = milestones.find(m => m > mastered) || mastered + 50;

    return {
      target: Math.min(nextTotal, nextMastered),
      current: Math.min(total, mastered),
      description: `Target ${Math.min(nextTotal, nextMastered)} item dikuasai`
    };
  }

  private static calculateAccuracyTrend(flashcardData: any[], writingData: any[], audioData: any[]) {
    // Mock implementation for demo
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        skill: 'overall',
        accuracy: Math.round(Math.random() * 20 + 70),
        attempts: Math.round(Math.random() * 20 + 5)
      });
    }
    return last7Days;
  }

  private static calculateSpeedImprovement(writingData: any[], audioData: any[]) {
    // Mock implementation
    return [
      { date: '2024-01-01', skill: 'writing', averageTime: 45, activity: 'kanji' },
      { date: '2024-01-15', skill: 'writing', averageTime: 38, activity: 'kanji' },
      { date: '2024-02-01', skill: 'writing', averageTime: 32, activity: 'kanji' }
    ];
  }

  private static identifyErrorPatterns(flashcardData: any[], writingData: any[], audioData: any[]) {
    return [
      {
        category: 'Kanji',
        errorType: 'Stroke Order',
        frequency: 15,
        examples: ['水', '火', '木'],
        suggestedFocus: 'Latihan stroke order secara perlahan'
      },
      {
        category: 'Grammar',
        errorType: 'Particle Usage',
        frequency: 8,
        examples: ['は vs が', 'に vs で'],
        suggestedFocus: 'Review penggunaan partikel dalam konteks'
      }
    ];
  }

  private static identifyImprovementAreas(flashcardData: any[], writingData: any[], audioData: any[]) {
    return [
      {
        skill: 'listening',
        area: 'Speed Recognition',
        currentLevel: 65,
        targetLevel: 80,
        suggestions: ['Practice with faster audio', 'Use shadowing technique'],
        estimatedTime: 14
      },
      {
        skill: 'writing',
        area: 'Kanji Accuracy',
        currentLevel: 72,
        targetLevel: 85,
        suggestions: ['Focus on stroke order', 'Practice daily writing'],
        estimatedTime: 21
      }
    ];
  }

  private static calculateAchievements(overview: OverviewStats, skillBreakdown: SkillBreakdown) {
    // Mock achievements data
    return {
      totalEarned: 12,
      recentAchievements: [
        {
          id: 'streak-7',
          title: 'Dedicated Learner',
          description: 'Study for 7 days straight',
          category: 'consistency',
          dateEarned: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          rarity: 'common' as const
        },
        {
          id: 'kanji-50',
          title: 'Kanji Master',
          description: 'Master 50 kanji characters',
          category: 'kanji',
          dateEarned: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          rarity: 'rare' as const
        }
      ],
      progress: [
        {
          id: 'streak-30',
          title: 'Marathon Learner',
          description: 'Study for 30 days straight',
          progress: overview.currentStreak,
          target: 30,
          category: 'consistency'
        }
      ],
      categories: {
        consistency: { earned: 3, total: 8 },
        kanji: { earned: 4, total: 12 },
        vocabulary: { earned: 2, total: 10 },
        grammar: { earned: 1, total: 8 },
        listening: { earned: 1, total: 6 },
        writing: { earned: 1, total: 6 }
      }
    };
  }

  private static calculateStreakAnalytics(sessionsData: any[]): StreakAnalytics {
    const current = this.calculateCurrentStreak(sessionsData);
    const longest = this.calculateLongestStreak(sessionsData);
    
    return {
      current,
      longest,
      thisWeek: Math.min(current, 7),
      thisMonth: Math.min(current, 30),
      streakHistory: [], // Would implement full history tracking
      averageStreakLength: Math.round(longest * 0.6),
      streakMaintenance: {
        riskLevel: current < 3 ? 'high' : current < 7 ? 'medium' : 'low',
        suggestion: current < 3 
          ? 'Belajar setiap hari untuk membangun momentum'
          : current < 7 
            ? 'Pertahankan jadwal belajar rutin'
            : 'Kerja bagus! Terus pertahankan konsistensi'
      }
    };
  }

  private static analyzeWeaknesses(skillBreakdown: SkillBreakdown, performanceMetrics: PerformanceMetrics): WeaknessAnalysis {
    // Find skills with accuracy < 70%
    const criticalWeaknesses = Object.entries(skillBreakdown)
      .filter(([_, metrics]) => metrics.averageAccuracy < 70)
      .map(([skill, metrics]) => ({
        skill,
        area: metrics.weakestAreas[0] || 'General',
        severity: 'critical' as const,
        accuracy: metrics.averageAccuracy,
        frequency: Math.round(Math.random() * 20 + 10),
        examples: [`Example 1 for ${skill}`, `Example 2 for ${skill}`],
        suggestedExercises: [`Practice ${skill} basics`, `Focus on ${metrics.weakestAreas[0]}`]
      }));

    const improvingAreas = Object.entries(skillBreakdown)
      .filter(([_, metrics]) => metrics.averageAccuracy >= 70 && metrics.averageAccuracy < 85)
      .map(([skill, metrics]) => ({
        skill,
        area: metrics.weakestAreas[0] || 'General',
        severity: 'moderate' as const,
        accuracy: metrics.averageAccuracy,
        frequency: Math.round(Math.random() * 15 + 5),
        examples: [`Intermediate ${skill} example`],
        suggestedExercises: [`Advanced ${skill} practice`]
      }));

    const strengthsToLeverage = Object.entries(skillBreakdown)
      .filter(([_, metrics]) => metrics.averageAccuracy >= 85)
      .map(([skill, metrics]) => ({
        skill,
        area: metrics.strongestAreas[0] || 'General',
        accuracy: metrics.averageAccuracy,
        consistency: Math.round(Math.random() * 30 + 70),
        description: `Strong performance in ${skill}`
      }));

    const focusRecommendations = criticalWeaknesses.length > 0 
      ? [
          {
            skill: criticalWeaknesses[0].skill,
            timeAllocation: 40,
            specificAreas: criticalWeaknesses.map(w => w.area),
            expectedImprovement: '15-20% improvement in 2 weeks'
          }
        ]
      : [
          {
            skill: 'balanced',
            timeAllocation: 25,
            specificAreas: ['Review', 'New Content'],
            expectedImprovement: 'Steady overall progress'
          }
        ];

    return {
      criticalWeaknesses,
      improvingAreas,
      strengthsToLeverage,
      focusRecommendations
    };
  }

  private static analyzeStudyPatterns(sessionsData: any[]) {
    return sessionsData.map(session => ({
      date: session.startTime,
      timeOfDay: session.startTime.getHours(),
      duration: session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
        : 0,
      skills: [session.skill || 'general'],
      accuracy: session.averageAccuracy || 0,
      productivity: (session.activitiesCompleted || 0) / Math.max(1, 
        session.endTime 
          ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
          : 1
      )
    }));
  }

  private static calculateRecentProgress(skillProgress: any[], specificData: any[]): number {
    const allData = [...skillProgress, ...specificData];
    if (allData.length === 0) return 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentItems = allData.filter(item => {
      const itemDate = item.lastPracticed || item.lastReviewed || item.createdAt;
      return itemDate && new Date(itemDate.toDate ? itemDate.toDate() : itemDate) >= weekAgo;
    });
    
    const recentAccuracy = recentItems.reduce((sum, item) => sum + (item.averageAccuracy || 0), 0) / Math.max(1, recentItems.length);
    const overallAccuracy = allData.reduce((sum, item) => sum + (item.averageAccuracy || 0), 0) / allData.length;
    
    return Math.round(recentAccuracy - overallAccuracy);
  }

  private static calculateConsistencyScore(flashcardData: any[], writingData: any[], audioData: any[]): number {
    const allData = [...flashcardData, ...writingData, ...audioData];
    if (allData.length === 0) return 0;
    
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyActivity = new Map<string, number>();
    allData.forEach(item => {
      const itemDate = item.lastPracticed || item.lastReviewed || item.createdAt;
      if (itemDate) {
        const date = new Date(itemDate.toDate ? itemDate.toDate() : itemDate);
        if (date >= monthAgo) {
          const dateKey = date.toDateString();
          dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + 1);
        }
      }
    });
    
    const activeDays = dailyActivity.size;
    const possibleDays = Math.min(30, Math.floor((now.getTime() - monthAgo.getTime()) / (24 * 60 * 60 * 1000)));
    
    return Math.round((activeDays / Math.max(1, possibleDays)) * 100);
  }

  private static calculateLearningVelocity(flashcardData: any[], writingData: any[], audioData: any[]): number {
    const allData = [...flashcardData, ...writingData, ...audioData];
    if (allData.length === 0) return 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentItems = allData.filter(item => {
      const itemDate = item.createdAt || item.firstSeen;
      return itemDate && new Date(itemDate.toDate ? itemDate.toDate() : itemDate) >= weekAgo;
    });
    
    return Math.round(recentItems.length / 7);
  }

  private static calculateRetentionRate(flashcardData: any[], writingData: any[], audioData: any[]): number {
    const allData = [...flashcardData, ...writingData, ...audioData];
    if (allData.length === 0) return 0;
    
    const masteredItems = allData.filter(item => 
      item.masteryLevel === 'mastered' || 
      item.averageAccuracy >= 85 ||
      (item.easeFactor && item.easeFactor >= 2.5)
    );
    
    return Math.round((masteredItems.length / allData.length) * 100);
  }
}