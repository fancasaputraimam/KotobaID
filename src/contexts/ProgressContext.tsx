import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProgress, ModuleProgress, DailyProgress, LearningSession, StudyStats, Achievement } from '../types/progress';

interface ProgressContextType {
  userProgress: UserProgress | null;
  moduleProgresses: ModuleProgress[];
  todayProgress: DailyProgress | null;
  studyStats: StudyStats | null;
  loading: boolean;
  
  // Progress tracking functions
  startLearningSession: (moduleType: string, moduleName: string) => Promise<string>;
  endLearningSession: (sessionId: string, itemsStudied: number, correctAnswers?: number, totalQuestions?: number) => Promise<void>;
  updateModuleProgress: (moduleId: string, moduleName: string, moduleType: string, progressData: Partial<ModuleProgress>) => Promise<void>;
  updateDailyGoal: (goalMinutes: number) => Promise<void>;
  
  // Utility functions
  getTodayStudyTime: () => number;
  getWeeklyProgress: () => DailyProgress[];
  checkAchievements: () => Achievement[];
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [moduleProgresses, setModuleProgresses] = useState<ModuleProgress[]>([]);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<Map<string, Date>>(new Map());

  // Initialize user progress when user logs in
  useEffect(() => {
    if (!currentUser) {
      setUserProgress(null);
      setModuleProgresses([]);
      setTodayProgress(null);
      setStudyStats(null);
      setLoading(false);
      return;
    }

    initializeUserProgress();
  }, [currentUser]);

  const initializeUserProgress = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Get or create user progress
      const progressDoc = await getDoc(doc(db, 'userProgress', currentUser.uid));
      let progress: UserProgress;

      if (!progressDoc.exists()) {
        // Create initial progress
        progress = {
          uid: currentUser.uid,
          totalStudyTime: 0,
          dailyGoal: 30, // 30 minutes default
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(doc(db, 'userProgress', currentUser.uid), progress);
      } else {
        progress = progressDoc.data() as UserProgress;
        // Convert timestamps
        progress.lastStudyDate = progress.lastStudyDate instanceof Date ? progress.lastStudyDate : new Date(progress.lastStudyDate);
        progress.createdAt = progress.createdAt instanceof Date ? progress.createdAt : new Date(progress.createdAt);
        progress.updatedAt = progress.updatedAt instanceof Date ? progress.updatedAt : new Date(progress.updatedAt);
      }

      setUserProgress(progress);

      // Get today's progress
      await loadTodayProgress();
      
      // Load module progresses
      await loadModuleProgresses();
      
      // Calculate study stats
      await calculateStudyStats();

    } catch (error) {
      console.error('Error initializing user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayProgress = async () => {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayDoc = await getDoc(doc(db, 'dailyProgress', `${currentUser.uid}_${today}`));

    if (todayDoc.exists()) {
      const data = todayDoc.data() as DailyProgress;
      data.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
      setTodayProgress(data);
    } else {
      // Create today's progress
      const newTodayProgress: DailyProgress = {
        uid: currentUser.uid,
        date: today,
        studyTime: 0,
        lessonsCompleted: 0,
        kanjiLearned: 0,
        vocabularyLearned: 0,
        quizzesCompleted: 0,
        createdAt: new Date()
      };
      await setDoc(doc(db, 'dailyProgress', `${currentUser.uid}_${today}`), newTodayProgress);
      setTodayProgress(newTodayProgress);
    }
  };

  const loadModuleProgresses = async () => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'moduleProgress'),
      where('uid', '==', currentUser.uid),
      orderBy('lastAccessed', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progresses: ModuleProgress[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as ModuleProgress;
        // Convert timestamps
        data.lastAccessed = data.lastAccessed instanceof Date ? data.lastAccessed : new Date(data.lastAccessed);
        data.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
        data.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt);
        progresses.push(data);
      });
      setModuleProgresses(progresses);
    });

    return unsubscribe;
  };

  const calculateStudyStats = async () => {
    if (!currentUser || !userProgress) return;

    try {
      // Get weekly progress (last 7 days)
      const weeklyProgress: DailyProgress[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayDoc = await getDoc(doc(db, 'dailyProgress', `${currentUser.uid}_${dateStr}`));
        if (dayDoc.exists()) {
          const data = dayDoc.data() as DailyProgress;
          data.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
          weeklyProgress.push(data);
        } else {
          weeklyProgress.push({
            uid: currentUser.uid,
            date: dateStr,
            studyTime: 0,
            lessonsCompleted: 0,
            kanjiLearned: 0,
            vocabularyLearned: 0,
            quizzesCompleted: 0,
            createdAt: new Date()
          });
        }
      }

      // Calculate total stats from module progresses
      const totalLessons = moduleProgresses.reduce((sum, mod) => sum + mod.completedLessons, 0);
      const totalKanji = moduleProgresses.filter(mod => mod.moduleType === 'kanji').reduce((sum, mod) => sum + mod.completedLessons, 0);
      const totalVocabulary = moduleProgresses.filter(mod => mod.moduleType === 'vocabulary').reduce((sum, mod) => sum + mod.completedLessons, 0);

      // Calculate daily goal progress
      const dailyGoalProgress = todayProgress ? (todayProgress.studyTime / userProgress.dailyGoal) * 100 : 0;

      // Load achievements
      const achievements = getAchievements();

      const stats: StudyStats = {
        totalStudyTime: userProgress.totalStudyTime,
        totalLessons,
        totalKanji,
        totalVocabulary,
        averageAccuracy: 85, // TODO: Calculate from learning sessions
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
        dailyGoalProgress: Math.min(dailyGoalProgress, 100),
        weeklyProgress,
        achievements
      };

      setStudyStats(stats);
    } catch (error) {
      console.error('Error calculating study stats:', error);
    }
  };

  const startLearningSession = async (moduleType: string, moduleName: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const sessionId = `${currentUser.uid}_${Date.now()}`;
    const now = new Date();
    
    // Store session start time in memory
    setActiveSessions(prev => new Map(prev.set(sessionId, now)));
    
    return sessionId;
  };

  const endLearningSession = async (
    sessionId: string, 
    itemsStudied: number, 
    correctAnswers: number = 0, 
    totalQuestions: number = 0
  ): Promise<void> => {
    if (!currentUser) return;

    const startTime = activeSessions.get(sessionId);
    if (!startTime) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

    // Create learning session record
    const session: LearningSession = {
      uid: currentUser.uid,
      sessionId,
      moduleType: 'kanji', // Will be dynamic based on actual module
      startTime,
      endTime,
      duration,
      itemsStudied,
      correctAnswers,
      totalQuestions,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      createdAt: new Date()
    };

    try {
      // Save learning session
      await addDoc(collection(db, 'learningSessions'), session);

      // Update today's progress
      const today = new Date().toISOString().split('T')[0];
      const todayDocRef = doc(db, 'dailyProgress', `${currentUser.uid}_${today}`);
      
      if (todayProgress) {
        await updateDoc(todayDocRef, {
          studyTime: todayProgress.studyTime + duration,
          lessonsCompleted: todayProgress.lessonsCompleted + 1
        });
      }

      // Update user progress
      if (userProgress) {
        const newTotalTime = userProgress.totalStudyTime + duration;
        const today_date = new Date();
        const lastStudy = userProgress.lastStudyDate;
        
        // Calculate streak
        let newStreak = userProgress.currentStreak;
        const daysDiff = Math.floor((today_date.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }

        await updateDoc(doc(db, 'userProgress', currentUser.uid), {
          totalStudyTime: newTotalTime,
          currentStreak: newStreak,
          longestStreak: Math.max(userProgress.longestStreak, newStreak),
          lastStudyDate: today_date,
          updatedAt: new Date()
        });
      }

      // Remove from active sessions
      setActiveSessions(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });

      // Reload data
      await initializeUserProgress();

    } catch (error) {
      console.error('Error ending learning session:', error);
    }
  };

  const updateModuleProgress = async (
    moduleId: string, 
    moduleName: string, 
    moduleType: string, 
    progressData: Partial<ModuleProgress>
  ): Promise<void> => {
    if (!currentUser) return;

    const moduleDocRef = doc(db, 'moduleProgress', `${currentUser.uid}_${moduleId}`);
    
    try {
      const existingDoc = await getDoc(moduleDocRef);
      
      if (existingDoc.exists()) {
        await updateDoc(moduleDocRef, {
          ...progressData,
          lastAccessed: new Date(),
          updatedAt: new Date()
        });
      } else {
        const newModuleProgress: ModuleProgress = {
          uid: currentUser.uid,
          moduleId,
          moduleName,
          moduleType: moduleType as any,
          completedLessons: 0,
          totalLessons: 100, // Default, should be set properly
          progressPercentage: 0,
          timeSpent: 0,
          lastAccessed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...progressData
        };
        
        await setDoc(moduleDocRef, newModuleProgress);
      }
    } catch (error) {
      console.error('Error updating module progress:', error);
    }
  };

  const updateDailyGoal = async (goalMinutes: number): Promise<void> => {
    if (!currentUser || !userProgress) return;

    try {
      await updateDoc(doc(db, 'userProgress', currentUser.uid), {
        dailyGoal: goalMinutes,
        updatedAt: new Date()
      });
      
      setUserProgress({
        ...userProgress,
        dailyGoal: goalMinutes,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating daily goal:', error);
    }
  };

  const getTodayStudyTime = (): number => {
    return todayProgress?.studyTime || 0;
  };

  const getWeeklyProgress = (): DailyProgress[] => {
    return studyStats?.weeklyProgress || [];
  };

  const getAchievements = (): Achievement[] => {
    const achievements: Achievement[] = [
      {
        id: 'first_lesson',
        name: 'Langkah Pertama',
        description: 'Selesaikan pelajaran pertama Anda',
        icon: '🎯',
        type: 'lessons',
        requirement: 1,
        earned: (studyStats?.totalLessons || 0) >= 1
      },
      {
        id: 'study_streak_7',
        name: 'Konsisten Seminggu',
        description: 'Belajar selama 7 hari berturut-turut',
        icon: '🔥',
        type: 'streak',
        requirement: 7,
        earned: (userProgress?.currentStreak || 0) >= 7
      },
      {
        id: 'study_time_100',
        name: 'Dedikasi Tinggi',
        description: 'Total waktu belajar 100 menit',
        icon: '⏰',
        type: 'study_time',
        requirement: 100,
        earned: (userProgress?.totalStudyTime || 0) >= 100
      },
      {
        id: 'kanji_master_50',
        name: 'Master Kanji',
        description: 'Pelajari 50 kanji',
        icon: '漢',
        type: 'milestone',
        requirement: 50,
        earned: (studyStats?.totalKanji || 0) >= 50
      }
    ];

    return achievements;
  };

  const checkAchievements = (): Achievement[] => {
    return getAchievements().filter(achievement => achievement.earned);
  };

  const value = {
    userProgress,
    moduleProgresses,
    todayProgress,
    studyStats,
    loading,
    startLearningSession,
    endLearningSession,
    updateModuleProgress,
    updateDailyGoal,
    getTodayStudyTime,
    getWeeklyProgress,
    checkAchievements
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};