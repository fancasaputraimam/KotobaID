import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { WritingAttempt, WritingSession, WritingProgress, WritingStats, CharacterData } from '../types/writing';
import { allCharacterData, getCharacterData } from '../data/strokeData';

interface WritingContextType {
  // Data
  writingProgress: WritingProgress[];
  currentSession: WritingSession | null;
  writingStats: WritingStats | null;
  loading: boolean;

  // Session management
  startWritingSession: (sessionType: 'practice' | 'test' | 'review', characters: string[]) => Promise<string>;
  endWritingSession: () => Promise<void>;
  
  // Writing practice
  submitWritingAttempt: (
    character: string, 
    userStrokes: Array<{path: string, timestamp: number, duration: number}>,
    completionTime: number
  ) => Promise<WritingAttempt>;
  
  // Progress tracking
  getCharacterProgress: (character: string) => WritingProgress | null;
  updateCharacterProgress: (character: string, attempt: WritingAttempt) => Promise<void>;
  
  // Data retrieval
  getRecommendedCharacters: () => CharacterData[];
  getCharactersByMastery: (masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered') => CharacterData[];
  getWeakCharacters: () => CharacterData[];
  
  // Statistics
  calculateWritingStats: () => Promise<WritingStats>;
}

const WritingContext = createContext<WritingContextType | undefined>(undefined);

export const useWriting = () => {
  const context = useContext(WritingContext);
  if (!context) {
    throw new Error('useWriting must be used within a WritingProvider');
  }
  return context;
};

interface WritingProviderProps {
  children: ReactNode;
}

export const WritingProvider: React.FC<WritingProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [writingProgress, setWritingProgress] = useState<WritingProgress[]>([]);
  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null);
  const [writingStats, setWritingStats] = useState<WritingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setWritingProgress([]);
      setCurrentSession(null);
      setWritingStats(null);
      setLoading(false);
      return;
    }

    loadWritingData();
  }, [currentUser]);

  useEffect(() => {
    if (writingProgress.length > 0) {
      calculateWritingStats();
    }
  }, [writingProgress]);

  const loadWritingData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load writing progress
      const progressQuery = query(
        collection(db, 'writingProgress'),
        where('uid', '==', currentUser.uid),
        orderBy('lastPracticed', 'desc')
      );

      const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
        const progress: WritingProgress[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          progress.push({
            ...data,
            lastPracticed: data.lastPracticed?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as WritingProgress);
        });
        setWritingProgress(progress);
      });

      return unsubscribeProgress;

    } catch (error) {
      console.error('Error loading writing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWritingSession = async (
    sessionType: 'practice' | 'test' | 'review', 
    characters: string[]
  ): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const session: Omit<WritingSession, 'id'> = {
      uid: currentUser.uid,
      sessionType,
      characters,
      startTime: new Date(),
      totalAttempts: 0,
      correctAttempts: 0,
      averageAccuracy: 0,
      averageTime: 0,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'writingSessions'), {
      ...session,
      startTime: Timestamp.fromDate(session.startTime),
      createdAt: Timestamp.fromDate(session.createdAt)
    });

    setCurrentSession({ id: docRef.id, ...session });
    return docRef.id;
  };

  const endWritingSession = async (): Promise<void> => {
    if (!currentSession) return;

    const endTime = new Date();
    
    await updateDoc(doc(db, 'writingSessions', currentSession.id), {
      endTime: Timestamp.fromDate(endTime)
    });

    setCurrentSession(null);
  };

  const analyzeStrokeAccuracy = (
    userStrokes: Array<{path: string, timestamp: number, duration: number}>,
    correctStrokes: Array<{path: string}>
  ): { accuracy: number, feedback: string } => {
    // Simplified stroke analysis
    // In a real implementation, this would use more sophisticated path matching algorithms
    
    if (userStrokes.length !== correctStrokes.length) {
      return {
        accuracy: Math.max(0, 70 - Math.abs(userStrokes.length - correctStrokes.length) * 20),
        feedback: `Jumlah goresan tidak tepat. Seharusnya ${correctStrokes.length} goresan, Anda membuat ${userStrokes.length} goresan.`
      };
    }

    // Calculate basic accuracy based on stroke count and timing
    let totalAccuracy = 0;
    const feedbackItems: string[] = [];

    userStrokes.forEach((userStroke, index) => {
      // Simple path length comparison
      const userPathLength = userStroke.path.length;
      const correctPathLength = correctStrokes[index]?.path.length || 0;
      
      const lengthSimilarity = Math.max(0, 1 - Math.abs(userPathLength - correctPathLength) / correctPathLength);
      
      // Timing analysis
      const timingScore = userStroke.duration > 100 && userStroke.duration < 2000 ? 1 : 0.7;
      
      const strokeAccuracy = (lengthSimilarity * 0.7 + timingScore * 0.3) * 100;
      totalAccuracy += strokeAccuracy;

      if (strokeAccuracy < 70) {
        feedbackItems.push(`Goresan ${index + 1} perlu diperbaiki`);
      }
    });

    const averageAccuracy = totalAccuracy / userStrokes.length;
    
    let feedback = 'Bagus sekali!';
    if (averageAccuracy < 60) {
      feedback = 'Perlu latihan lebih banyak. ' + feedbackItems.join(', ');
    } else if (averageAccuracy < 80) {
      feedback = 'Cukup baik, tapi masih bisa diperbaiki. ' + feedbackItems.join(', ');
    }

    return { accuracy: averageAccuracy, feedback };
  };

  const submitWritingAttempt = async (
    character: string,
    userStrokes: Array<{path: string, timestamp: number, duration: number}>,
    completionTime: number
  ): Promise<WritingAttempt> => {
    if (!currentUser) throw new Error('User not authenticated');

    const characterData = getCharacterData(character);
    if (!characterData) throw new Error('Character data not found');

    // Analyze stroke accuracy
    const analysis = analyzeStrokeAccuracy(userStrokes, characterData.strokes);

    const attempt: Omit<WritingAttempt, 'id'> = {
      uid: currentUser.uid,
      character,
      type: characterData.type,
      userStrokes,
      accuracy: analysis.accuracy,
      completionTime,
      attempts: 1,
      isCorrect: analysis.accuracy >= 70,
      feedback: analysis.feedback,
      createdAt: new Date()
    };

    // Save attempt to database
    const docRef = await addDoc(collection(db, 'writingAttempts'), {
      ...attempt,
      createdAt: Timestamp.fromDate(attempt.createdAt)
    });

    const fullAttempt = { id: docRef.id, ...attempt };

    // Update session stats
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        totalAttempts: currentSession.totalAttempts + 1,
        correctAttempts: currentSession.correctAttempts + (fullAttempt.isCorrect ? 1 : 0)
      };
      updatedSession.averageAccuracy = (updatedSession.correctAttempts / updatedSession.totalAttempts) * 100;
      setCurrentSession(updatedSession);
    }

    // Update character progress
    await updateCharacterProgress(character, fullAttempt);

    return fullAttempt;
  };

  const getCharacterProgress = (character: string): WritingProgress | null => {
    return writingProgress.find(p => p.character === character) || null;
  };

  const updateCharacterProgress = async (character: string, attempt: WritingAttempt): Promise<void> => {
    if (!currentUser) return;

    const existing = getCharacterProgress(character);
    const characterData = getCharacterData(character);
    if (!characterData) return;

    let updatedProgress: WritingProgress;

    if (existing) {
      // Update existing progress
      const newTotalPractices = existing.totalPractices + 1;
      const newSuccessfulPractices = existing.successfulPractices + (attempt.isCorrect ? 1 : 0);
      const newAverageAccuracy = ((existing.averageAccuracy * existing.totalPractices) + attempt.accuracy) / newTotalPractices;
      const newAverageTime = ((existing.averageTime * existing.totalPractices) + attempt.completionTime) / newTotalPractices;

      // Determine mastery level
      let masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered' = 'beginner';
      const successRate = newSuccessfulPractices / newTotalPractices;
      
      if (successRate >= 0.9 && newAverageAccuracy >= 85 && newTotalPractices >= 10) {
        masteryLevel = 'mastered';
      } else if (successRate >= 0.8 && newAverageAccuracy >= 75 && newTotalPractices >= 5) {
        masteryLevel = 'advanced';
      } else if (successRate >= 0.6 && newAverageAccuracy >= 60 && newTotalPractices >= 3) {
        masteryLevel = 'intermediate';
      }

      updatedProgress = {
        ...existing,
        totalPractices: newTotalPractices,
        successfulPractices: newSuccessfulPractices,
        averageAccuracy: newAverageAccuracy,
        bestAccuracy: Math.max(existing.bestAccuracy, attempt.accuracy),
        averageTime: newAverageTime,
        bestTime: Math.min(existing.bestTime, attempt.completionTime),
        lastPracticed: new Date(),
        masteryLevel,
        updatedAt: new Date()
      };
    } else {
      // Create new progress
      updatedProgress = {
        uid: currentUser.uid,
        character,
        type: characterData.type,
        totalPractices: 1,
        successfulPractices: attempt.isCorrect ? 1 : 0,
        averageAccuracy: attempt.accuracy,
        bestAccuracy: attempt.accuracy,
        averageTime: attempt.completionTime,
        bestTime: attempt.completionTime,
        lastPracticed: new Date(),
        masteryLevel: 'beginner',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Save to database
    const docId = `${currentUser.uid}_${character}`;
    await updateDoc(doc(db, 'writingProgress', docId), {
      ...updatedProgress,
      lastPracticed: Timestamp.fromDate(updatedProgress.lastPracticed),
      createdAt: existing ? Timestamp.fromDate(existing.createdAt) : Timestamp.fromDate(updatedProgress.createdAt),
      updatedAt: Timestamp.fromDate(updatedProgress.updatedAt)
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        // Document doesn't exist, create it
        await addDoc(collection(db, 'writingProgress'), {
          ...updatedProgress,
          lastPracticed: Timestamp.fromDate(updatedProgress.lastPracticed),
          createdAt: Timestamp.fromDate(updatedProgress.createdAt),
          updatedAt: Timestamp.fromDate(updatedProgress.updatedAt)
        });
      } else {
        throw error;
      }
    });
  };

  const getRecommendedCharacters = (): CharacterData[] => {
    // Get characters that haven't been practiced or need improvement
    const unpracticedCharacters = allCharacterData.filter(char => 
      !writingProgress.some(p => p.character === char.character)
    );

    const needImprovementCharacters = allCharacterData.filter(char => {
      const progress = writingProgress.find(p => p.character === char.character);
      return progress && (progress.averageAccuracy < 70 || progress.masteryLevel === 'beginner');
    });

    // Prioritize by difficulty (easy first) and include both types
    return [...unpracticedCharacters, ...needImprovementCharacters]
      .sort((a, b) => {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, 20); // Limit to 20 recommendations
  };

  const getCharactersByMastery = (masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered'): CharacterData[] => {
    const charactersByMastery = writingProgress
      .filter(p => p.masteryLevel === masteryLevel)
      .map(p => getCharacterData(p.character))
      .filter(char => char !== undefined) as CharacterData[];

    return charactersByMastery;
  };

  const getWeakCharacters = (): CharacterData[] => {
    const weakProgress = writingProgress
      .filter(p => p.averageAccuracy < 60 || (p.totalPractices >= 3 && p.successfulPractices / p.totalPractices < 0.5))
      .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
      .slice(0, 10);

    return weakProgress
      .map(p => getCharacterData(p.character))
      .filter(char => char !== undefined) as CharacterData[];
  };

  const calculateWritingStats = async (): Promise<WritingStats> => {
    const kanjiProgress = writingProgress.filter(p => p.type === 'kanji');
    const hiraganaProgress = writingProgress.filter(p => p.type === 'hiragana');
    const katakanaProgress = writingProgress.filter(p => p.type === 'katakana');

    const totalCharacters = writingProgress.length;
    const masteredCharacters = writingProgress.filter(p => p.masteryLevel === 'mastered').length;
    const averageAccuracy = totalCharacters > 0 
      ? writingProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / totalCharacters
      : 0;

    // Calculate practice time (simplified)
    const practiceTime = writingProgress.reduce((sum, p) => sum + (p.totalPractices * p.averageTime), 0) / 60; // Convert to minutes

    const stats: WritingStats = {
      totalCharacters,
      masteredCharacters,
      practiceTime,
      averageAccuracy,
      streak: 0, // TODO: Calculate from daily practice
      kanjiProgress: {
        total: kanjiProgress.length,
        mastered: kanjiProgress.filter(p => p.masteryLevel === 'mastered').length,
        accuracy: kanjiProgress.length > 0 
          ? kanjiProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / kanjiProgress.length
          : 0
      },
      hiraganaProgress: {
        total: hiraganaProgress.length,
        mastered: hiraganaProgress.filter(p => p.masteryLevel === 'mastered').length,
        accuracy: hiraganaProgress.length > 0 
          ? hiraganaProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / hiraganaProgress.length
          : 0
      },
      katakanaProgress: {
        total: katakanaProgress.length,
        mastered: katakanaProgress.filter(p => p.masteryLevel === 'mastered').length,
        accuracy: katakanaProgress.length > 0 
          ? katakanaProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / katakanaProgress.length
          : 0
      }
    };

    setWritingStats(stats);
    return stats;
  };

  const value = {
    writingProgress,
    currentSession,
    writingStats,
    loading,
    startWritingSession,
    endWritingSession,
    submitWritingAttempt,
    getCharacterProgress,
    updateCharacterProgress,
    getRecommendedCharacters,
    getCharactersByMastery,
    getWeakCharacters,
    calculateWritingStats
  };

  return (
    <WritingContext.Provider value={value}>
      {children}
    </WritingContext.Provider>
  );
};