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
import { 
  AudioContent, 
  ListeningExercise, 
  ListeningSession, 
  PronunciationAttempt, 
  AudioProgress, 
  AudioStats 
} from '../types/audio';
import { allAudioContent, getAudioContentById } from '../data/audioContent';

interface AudioContextType {
  // Data
  audioProgress: AudioProgress[];
  currentSession: ListeningSession | null;
  audioStats: AudioStats | null;
  loading: boolean;

  // Session management
  startListeningSession: (sessionType: 'listening' | 'pronunciation' | 'dictation', contentIds: string[]) => Promise<string>;
  endListeningSession: () => Promise<void>;
  
  // Listening exercises
  submitListeningAnswer: (contentId: string, userResponse: string, completionTime: number) => Promise<ListeningExercise>;
  
  // Pronunciation
  submitPronunciation: (text: string, audioBlob: Blob) => Promise<PronunciationAttempt>;
  
  // Progress tracking
  getContentProgress: (contentId: string) => AudioProgress | null;
  updateContentProgress: (contentId: string, exercise: ListeningExercise) => Promise<void>;
  
  // Data retrieval
  getRecommendedContent: () => AudioContent[];
  getContentByCategory: (category: 'vocabulary' | 'grammar' | 'conversation' | 'pronunciation') => AudioContent[];
  getWeakContent: () => AudioContent[];
  
  // Audio playback
  playAudio: (text: string, reading?: string) => Promise<void>;
  isPlaying: boolean;
  currentPlayingText: string | null;
  
  // Speech recognition
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  isRecording: boolean;
  
  // Statistics
  calculateAudioStats: () => Promise<AudioStats>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [audioProgress, setAudioProgress] = useState<AudioProgress[]>([]);
  const [currentSession, setCurrentSession] = useState<ListeningSession | null>(null);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingText, setCurrentPlayingText] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setAudioProgress([]);
      setCurrentSession(null);
      setAudioStats(null);
      setLoading(false);
      return;
    }

    loadAudioData();
  }, [currentUser]);

  useEffect(() => {
    if (audioProgress.length > 0) {
      calculateAudioStats();
    }
  }, [audioProgress]);

  const loadAudioData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load audio progress
      const progressQuery = query(
        collection(db, 'audioProgress'),
        where('uid', '==', currentUser.uid),
        orderBy('lastPracticed', 'desc')
      );

      const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
        const progress: AudioProgress[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          progress.push({
            ...data,
            lastPracticed: data.lastPracticed?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as AudioProgress);
        });
        setAudioProgress(progress);
      });

      return unsubscribeProgress;

    } catch (error) {
      console.error('Error loading audio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startListeningSession = async (
    sessionType: 'listening' | 'pronunciation' | 'dictation',
    contentIds: string[]
  ): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const session: Omit<ListeningSession, 'id'> = {
      uid: currentUser.uid,
      sessionType,
      exercises: contentIds,
      startTime: new Date(),
      totalExercises: 0,
      correctAnswers: 0,
      averageAccuracy: 0,
      averageTime: 0,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'listeningSessions'), {
      ...session,
      startTime: Timestamp.fromDate(session.startTime),
      createdAt: Timestamp.fromDate(session.createdAt)
    });

    setCurrentSession({ id: docRef.id, ...session });
    return docRef.id;
  };

  const endListeningSession = async (): Promise<void> => {
    if (!currentSession) return;

    const endTime = new Date();
    
    await updateDoc(doc(db, 'listeningSessions', currentSession.id), {
      endTime: Timestamp.fromDate(endTime)
    });

    setCurrentSession(null);
  };

  const analyzeSimilarity = (userResponse: string, expectedResponse: string): { accuracy: number, feedback: string } => {
    // Simple similarity analysis - in real app, use more sophisticated NLP
    const userWords = userResponse.toLowerCase().trim().split(/\s+/);
    const expectedWords = expectedResponse.toLowerCase().trim().split(/\s+/);
    
    let matchedWords = 0;
    userWords.forEach(word => {
      if (expectedWords.includes(word)) {
        matchedWords++;
      }
    });

    const accuracy = expectedWords.length > 0 
      ? (matchedWords / expectedWords.length) * 100 
      : 0;

    let feedback = 'Bagus sekali!';
    if (accuracy < 50) {
      feedback = 'Perlu lebih banyak latihan. Coba dengarkan lagi dengan lebih teliti.';
    } else if (accuracy < 80) {
      feedback = 'Cukup baik! Beberapa kata masih perlu diperbaiki.';
    }

    return { accuracy, feedback };
  };

  const submitListeningAnswer = async (
    contentId: string,
    userResponse: string,
    completionTime: number
  ): Promise<ListeningExercise> => {
    if (!currentUser) throw new Error('User not authenticated');

    const content = getAudioContentById(contentId);
    if (!content) throw new Error('Audio content not found');

    // Analyze response
    const analysis = analyzeSimilarity(userResponse, content.translation);

    const exercise: Omit<ListeningExercise, 'id'> = {
      uid: currentUser.uid,
      audioContent: content,
      userResponse,
      expectedResponse: content.translation,
      isCorrect: analysis.accuracy >= 70,
      accuracy: analysis.accuracy,
      completionTime,
      hints: [],
      feedback: analysis.feedback,
      attempts: 1,
      createdAt: new Date()
    };

    // Save to database
    const docRef = await addDoc(collection(db, 'listeningExercises'), {
      ...exercise,
      createdAt: Timestamp.fromDate(exercise.createdAt)
    });

    const fullExercise = { id: docRef.id, ...exercise };

    // Update session stats
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        totalExercises: currentSession.totalExercises + 1,
        correctAnswers: currentSession.correctAnswers + (fullExercise.isCorrect ? 1 : 0)
      };
      updatedSession.averageAccuracy = (updatedSession.correctAnswers / updatedSession.totalExercises) * 100;
      setCurrentSession(updatedSession);
    }

    // Update content progress
    await updateContentProgress(contentId, fullExercise);

    return fullExercise;
  };

  const submitPronunciation = async (text: string, audioBlob: Blob): Promise<PronunciationAttempt> => {
    if (!currentUser) throw new Error('User not authenticated');

    // Simplified pronunciation analysis
    // In real app, this would use speech recognition API
    const accuracy = Math.random() * 40 + 60; // Simulate 60-100% accuracy
    const feedback = accuracy >= 80 
      ? 'Pelafalan sangat baik!' 
      : accuracy >= 70 
        ? 'Pelafalan cukup baik, perlu sedikit perbaikan.'
        : 'Perlu latihan lebih banyak untuk pelafalan yang lebih baik.';

    const attempt: Omit<PronunciationAttempt, 'id'> = {
      uid: currentUser.uid,
      text,
      audioBlob,
      accuracy,
      feedback,
      issues: accuracy < 80 ? ['Intonasi perlu diperbaiki'] : [],
      suggestions: ['Dengarkan audio referensi lagi', 'Latih pelafalan pelan-pelan'],
      createdAt: new Date()
    };

    // In real app, would save audio blob to storage and save metadata to Firestore
    const docRef = await addDoc(collection(db, 'pronunciationAttempts'), {
      ...attempt,
      audioBlob: null, // Don't save blob directly to Firestore
      createdAt: Timestamp.fromDate(attempt.createdAt)
    });

    return { id: docRef.id, ...attempt };
  };

  const getContentProgress = (contentId: string): AudioProgress | null => {
    return audioProgress.find(p => p.contentId === contentId) || null;
  };

  const updateContentProgress = async (contentId: string, exercise: ListeningExercise): Promise<void> => {
    if (!currentUser) return;

    const existing = getContentProgress(contentId);
    const content = getAudioContentById(contentId);
    if (!content) return;

    let updatedProgress: AudioProgress;

    if (existing) {
      // Update existing progress
      const newTotalListened = existing.totalListened + 1;
      const newSuccessfulAttempts = existing.successfulAttempts + (exercise.isCorrect ? 1 : 0);
      const newAverageAccuracy = ((existing.averageAccuracy * existing.totalListened) + exercise.accuracy) / newTotalListened;

      // Determine mastery level
      let masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered' = 'beginner';
      const successRate = newSuccessfulAttempts / newTotalListened;
      
      if (successRate >= 0.9 && newAverageAccuracy >= 85 && newTotalListened >= 5) {
        masteryLevel = 'mastered';
      } else if (successRate >= 0.8 && newAverageAccuracy >= 75 && newTotalListened >= 3) {
        masteryLevel = 'advanced';
      } else if (successRate >= 0.6 && newAverageAccuracy >= 60 && newTotalListened >= 2) {
        masteryLevel = 'intermediate';
      }

      updatedProgress = {
        ...existing,
        totalListened: newTotalListened,
        successfulAttempts: newSuccessfulAttempts,
        averageAccuracy: newAverageAccuracy,
        bestAccuracy: Math.max(existing.bestAccuracy, exercise.accuracy),
        lastPracticed: new Date(),
        masteryLevel,
        updatedAt: new Date()
      };
    } else {
      // Create new progress
      updatedProgress = {
        uid: currentUser.uid,
        contentId,
        totalListened: 1,
        successfulAttempts: exercise.isCorrect ? 1 : 0,
        averageAccuracy: exercise.accuracy,
        bestAccuracy: exercise.accuracy,
        lastPracticed: new Date(),
        masteryLevel: 'beginner',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Save to database
    const docId = `${currentUser.uid}_${contentId}`;
    await updateDoc(doc(db, 'audioProgress', docId), {
      ...updatedProgress,
      lastPracticed: Timestamp.fromDate(updatedProgress.lastPracticed),
      createdAt: existing ? Timestamp.fromDate(existing.createdAt) : Timestamp.fromDate(updatedProgress.createdAt),
      updatedAt: Timestamp.fromDate(updatedProgress.updatedAt)
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        // Document doesn't exist, create it
        await addDoc(collection(db, 'audioProgress'), {
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

  const getRecommendedContent = (): AudioContent[] => {
    // Get content that hasn't been practiced or needs improvement
    const unpracticedContent = allAudioContent.filter(content => 
      !audioProgress.some(p => p.contentId === content.id)
    );

    const needImprovementContent = allAudioContent.filter(content => {
      const progress = audioProgress.find(p => p.contentId === content.id);
      return progress && (progress.averageAccuracy < 70 || progress.masteryLevel === 'beginner');
    });

    // Prioritize by difficulty (easy first)
    return [...unpracticedContent, ...needImprovementContent]
      .sort((a, b) => {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, 15);
  };

  const getContentByCategory = (category: 'vocabulary' | 'grammar' | 'conversation' | 'pronunciation'): AudioContent[] => {
    return allAudioContent.filter(content => content.category === category);
  };

  const getWeakContent = (): AudioContent[] => {
    const weakProgress = audioProgress
      .filter(p => p.averageAccuracy < 60 || (p.totalListened >= 3 && p.successfulAttempts / p.totalListened < 0.5))
      .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
      .slice(0, 10);

    return weakProgress
      .map(p => getAudioContentById(p.contentId))
      .filter(content => content !== undefined) as AudioContent[];
  };

  // Text-to-Speech using Web Speech API
  const playAudio = async (text: string, reading?: string): Promise<void> => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      setCurrentPlayingText(text);

      const utterance = new SpeechSynthesisUtterance(reading || text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentPlayingText(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentPlayingText(null);
      };

      speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition for pronunciation practice
  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    if (!mediaRecorder) return null;

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setIsRecording(false);
        setMediaRecorder(null);
        setAudioChunks([]);
        resolve(audioBlob);
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  };

  const calculateAudioStats = async (): Promise<AudioStats> => {
    const vocabularyProgress = audioProgress.filter(p => {
      const content = getAudioContentById(p.contentId);
      return content?.category === 'vocabulary';
    });
    
    const conversationProgress = audioProgress.filter(p => {
      const content = getAudioContentById(p.contentId);
      return content?.category === 'conversation';
    });
    
    const pronunciationProgress = audioProgress.filter(p => {
      const content = getAudioContentById(p.contentId);
      return content?.category === 'pronunciation';
    });

    const totalExercises = audioProgress.reduce((sum, p) => sum + p.totalListened, 0);
    const totalListeningTime = totalExercises * 2; // Estimate 2 minutes per exercise
    const averageAccuracy = audioProgress.length > 0 
      ? audioProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / audioProgress.length
      : 0;

    const stats: AudioStats = {
      totalExercises,
      totalListeningTime,
      averageAccuracy,
      streak: 0, // TODO: Calculate from daily practice
      vocabularyProgress: {
        total: vocabularyProgress.length,
        mastered: vocabularyProgress.filter(p => p.masteryLevel === 'mastered').length,
        accuracy: vocabularyProgress.length > 0 
          ? vocabularyProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / vocabularyProgress.length
          : 0
      },
      conversationProgress: {
        total: conversationProgress.length,
        mastered: conversationProgress.filter(p => p.masteryLevel === 'mastered').length,
        accuracy: conversationProgress.length > 0 
          ? conversationProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / conversationProgress.length
          : 0
      },
      pronunciationProgress: {
        total: pronunciationProgress.length,
        mastered: pronunciationProgress.filter(p => p.masteryLevel === 'mastered').length,
        accuracy: pronunciationProgress.length > 0 
          ? pronunciationProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) / pronunciationProgress.length
          : 0
      }
    };

    setAudioStats(stats);
    return stats;
  };

  const value = {
    audioProgress,
    currentSession,
    audioStats,
    loading,
    startListeningSession,
    endListeningSession,
    submitListeningAnswer,
    submitPronunciation,
    getContentProgress,
    updateContentProgress,
    getRecommendedContent,
    getContentByCategory,
    getWeakContent,
    playAudio,
    isPlaying,
    currentPlayingText,
    startRecording,
    stopRecording,
    isRecording,
    calculateAudioStats
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};