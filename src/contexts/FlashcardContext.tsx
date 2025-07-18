import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Flashcard, ReviewSession, StudyDeck, SRSStats } from '../types/flashcard';
import { SRSAlgorithm } from '../services/srsAlgorithm';

interface FlashcardContextType {
  // Data
  flashcards: Flashcard[];
  studyDecks: StudyDeck[];
  currentDeck: StudyDeck | null;
  reviewSession: ReviewSession | null;
  srsStats: SRSStats | null;
  loading: boolean;

  // Deck management
  createDeck: (name: string, description: string, category: 'kanji' | 'vocabulary' | 'grammar' | 'mixed') => Promise<void>;
  updateDeck: (deckId: string, updates: Partial<StudyDeck>) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  setActiveDeck: (deckId: string) => void;

  // Flashcard management
  createFlashcard: (front: string, back: string, type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence', category: string) => Promise<void>;
  updateFlashcard: (cardId: string, updates: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (cardId: string) => Promise<void>;
  bulkCreateFlashcards: (cards: Array<{front: string, back: string, type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence', category: string}>) => Promise<void>;

  // Study session management
  startReviewSession: () => Promise<string>;
  endReviewSession: () => Promise<void>;
  processCardReview: (cardId: string, quality: 1 | 2 | 3 | 4 | 5, responseTime: number) => Promise<void>;

  // Data retrieval
  getDueCards: () => Flashcard[];
  getNewCards: (limit?: number) => Flashcard[];
  getCardsByType: (type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence') => Flashcard[];
  searchCards: (searchTerm: string) => Flashcard[];
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

interface FlashcardProviderProps {
  children: ReactNode;
}

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studyDecks, setStudyDecks] = useState<StudyDeck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<StudyDeck | null>(null);
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [srsStats, setSrsStats] = useState<SRSStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize data when user logs in
  useEffect(() => {
    if (!currentUser) {
      setFlashcards([]);
      setStudyDecks([]);
      setCurrentDeck(null);
      setReviewSession(null);
      setSrsStats(null);
      setLoading(false);
      return;
    }

    loadUserData();
  }, [currentUser]);

  // Calculate SRS stats whenever flashcards change
  useEffect(() => {
    if (flashcards.length > 0) {
      calculateSRSStats();
    }
  }, [flashcards]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load flashcards
      const flashcardsQuery = query(
        collection(db, 'flashcards'),
        where('uid', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeFlashcards = onSnapshot(flashcardsQuery, (snapshot) => {
        const cards: Flashcard[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          cards.push({
            id: doc.id,
            ...data,
            nextReviewDate: data.nextReviewDate?.toDate() || new Date(),
            lastReviewDate: data.lastReviewDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Flashcard);
        });
        setFlashcards(cards);
      });

      // Load study decks
      const decksQuery = query(
        collection(db, 'studyDecks'),
        where('uid', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeDecks = onSnapshot(decksQuery, (snapshot) => {
        const decks: StudyDeck[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          decks.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as StudyDeck);
        });
        setStudyDecks(decks);
        
        // Set first deck as active if none selected
        if (decks.length > 0 && !currentDeck) {
          setCurrentDeck(decks[0]);
        }
      });

      return () => {
        unsubscribeFlashcards();
        unsubscribeDecks();
      };

    } catch (error) {
      console.error('Error loading flashcard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSRSStats = () => {
    const stats = SRSAlgorithm.calculateStats(flashcards);
    const today = new Date().toISOString().split('T')[0];
    const todayReviews = flashcards.filter(card => 
      card.lastReviewDate.toISOString().split('T')[0] === today
    ).length;

    const srsStats: SRSStats = {
      ...stats,
      todayReviews,
      streakDays: 0, // TODO: Calculate from review history
      totalReviewTime: 0, // TODO: Calculate from review sessions
    };

    setSrsStats(srsStats);
  };

  // Deck management
  const createDeck = async (name: string, description: string, category: 'kanji' | 'vocabulary' | 'grammar' | 'mixed'): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    const newDeck: Omit<StudyDeck, 'id'> = {
      uid: currentUser.uid,
      name,
      description,
      category,
      cardCount: 0,
      newCardsPerDay: 20,
      maxReviewsPerDay: 100,
      isActive: true,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await addDoc(collection(db, 'studyDecks'), {
      ...newDeck,
      createdAt: Timestamp.fromDate(newDeck.createdAt),
      updatedAt: Timestamp.fromDate(newDeck.updatedAt)
    });
  };

  const updateDeck = async (deckId: string, updates: Partial<StudyDeck>): Promise<void> => {
    await updateDoc(doc(db, 'studyDecks', deckId), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    });
  };

  const deleteDeck = async (deckId: string): Promise<void> => {
    // Delete all cards in the deck first
    const cardsQuery = query(
      collection(db, 'flashcards'),
      where('uid', '==', currentUser?.uid),
      where('category', '==', deckId)
    );
    const cardsSnapshot = await getDocs(cardsQuery);
    
    const deletePromises = cardsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the deck
    await deleteDoc(doc(db, 'studyDecks', deckId));
  };

  const setActiveDeck = (deckId: string) => {
    const deck = studyDecks.find(d => d.id === deckId);
    setCurrentDeck(deck || null);
  };

  // Flashcard management
  const createFlashcard = async (
    front: string, 
    back: string, 
    type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence', 
    category: string
  ): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    const newCard = SRSAlgorithm.createNewCard(currentUser.uid, front, back, type, category);
    
    await addDoc(collection(db, 'flashcards'), {
      ...newCard,
      nextReviewDate: Timestamp.fromDate(newCard.nextReviewDate),
      lastReviewDate: Timestamp.fromDate(newCard.lastReviewDate),
      createdAt: Timestamp.fromDate(newCard.createdAt),
      updatedAt: Timestamp.fromDate(newCard.updatedAt)
    });
  };

  const updateFlashcard = async (cardId: string, updates: Partial<Flashcard>): Promise<void> => {
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Convert Date objects to Timestamps
    if (updates.nextReviewDate) {
      updateData.nextReviewDate = Timestamp.fromDate(updates.nextReviewDate);
    }
    if (updates.lastReviewDate) {
      updateData.lastReviewDate = Timestamp.fromDate(updates.lastReviewDate);
    }

    await updateDoc(doc(db, 'flashcards', cardId), updateData);
  };

  const deleteFlashcard = async (cardId: string): Promise<void> => {
    await deleteDoc(doc(db, 'flashcards', cardId));
  };

  const bulkCreateFlashcards = async (cards: Array<{front: string, back: string, type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence', category: string}>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    const batch = cards.map(cardData => {
      const newCard = SRSAlgorithm.createNewCard(
        currentUser.uid, 
        cardData.front, 
        cardData.back, 
        cardData.type, 
        cardData.category
      );
      
      return addDoc(collection(db, 'flashcards'), {
        ...newCard,
        nextReviewDate: Timestamp.fromDate(newCard.nextReviewDate),
        lastReviewDate: Timestamp.fromDate(newCard.lastReviewDate),
        createdAt: Timestamp.fromDate(newCard.createdAt),
        updatedAt: Timestamp.fromDate(newCard.updatedAt)
      });
    });

    await Promise.all(batch);
  };

  // Study session management
  const startReviewSession = async (): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const session: Omit<ReviewSession, 'id'> = {
      uid: currentUser.uid,
      startTime: new Date(),
      cardsReviewed: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageResponseTime: 0,
      sessionType: 'review',
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'reviewSessions'), {
      ...session,
      startTime: Timestamp.fromDate(session.startTime),
      createdAt: Timestamp.fromDate(session.createdAt)
    });

    setReviewSession({ id: docRef.id, ...session });
    return docRef.id;
  };

  const endReviewSession = async (): Promise<void> => {
    if (!reviewSession) return;

    const endTime = new Date();
    const duration = endTime.getTime() - reviewSession.startTime.getTime();

    await updateDoc(doc(db, 'reviewSessions', reviewSession.id), {
      endTime: Timestamp.fromDate(endTime),
      averageResponseTime: duration / Math.max(reviewSession.cardsReviewed, 1)
    });

    setReviewSession(null);
  };

  const processCardReview = async (cardId: string, quality: 1 | 2 | 3 | 4 | 5, responseTime: number): Promise<void> => {
    const card = flashcards.find(c => c.id === cardId);
    if (!card) return;

    // Process with SRS algorithm
    const updatedCard = SRSAlgorithm.processReview(card, quality);
    
    // Update response time
    const totalTime = card.averageResponseTime * card.totalReviews + responseTime;
    updatedCard.averageResponseTime = totalTime / updatedCard.totalReviews;

    // Save to database
    await updateFlashcard(cardId, updatedCard);

    // Update review session
    if (reviewSession) {
      const updatedSession = {
        ...reviewSession,
        cardsReviewed: reviewSession.cardsReviewed + 1,
        correctAnswers: reviewSession.correctAnswers + (quality >= 3 ? 1 : 0)
      };
      updatedSession.accuracy = (updatedSession.correctAnswers / updatedSession.cardsReviewed) * 100;
      
      setReviewSession(updatedSession);
    }
  };

  // Data retrieval
  const getDueCards = (): Flashcard[] => {
    const dueCards = SRSAlgorithm.getDueCards(flashcards);
    return SRSAlgorithm.sortCardsByPriority(dueCards);
  };

  const getNewCards = (limit: number = 20): Flashcard[] => {
    return flashcards
      .filter(card => card.repetitions === 0)
      .slice(0, limit);
  };

  const getCardsByType = (type: 'kanji' | 'vocabulary' | 'grammar' | 'sentence'): Flashcard[] => {
    return flashcards.filter(card => card.type === type);
  };

  const searchCards = (searchTerm: string): Flashcard[] => {
    const term = searchTerm.toLowerCase();
    return flashcards.filter(card => 
      card.front.toLowerCase().includes(term) ||
      card.back.toLowerCase().includes(term) ||
      card.tags.some(tag => tag.toLowerCase().includes(term))
    );
  };

  const value = {
    flashcards,
    studyDecks,
    currentDeck,
    reviewSession,
    srsStats,
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    setActiveDeck,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    bulkCreateFlashcards,
    startReviewSession,
    endReviewSession,
    processCardReview,
    getDueCards,
    getNewCards,
    getCardsByType,
    searchCards
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
};