import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Kanji, Vocabulary, Grammar, Chapter, UserProgress } from '../types';
import { DictionaryEntry, SearchFilters } from '../types/studyTools';

class FirestoreService {
  // Kanji Operations
  async getKanjiByGrade(grade: number): Promise<Kanji[]> {
    const kanjiRef = collection(db, 'kanji');
    const q = query(kanjiRef, where('grade', '==', grade));
    const snapshot = await getDocs(q);
    
    const kanjiList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Kanji[];
    
    // Sort by character on the client side
    return kanjiList.sort((a, b) => a.character.localeCompare(b.character));
  }

  async getKanjiById(id: string): Promise<Kanji | null> {
    const docRef = doc(db, 'kanji', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Kanji;
    }
    return null;
  }

  async saveKanji(kanji: Omit<Kanji, 'id'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'kanji'));
      await setDoc(docRef, {
        ...kanji,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Kanji saved successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving kanji:', error);
      throw error;
    }
  }

  async updateKanji(id: string, updates: Partial<Kanji>): Promise<void> {
    const docRef = doc(db, 'kanji', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deleteGrammar(id: string): Promise<void> {
    const docRef = doc(db, 'grammar', id);
    await deleteDoc(docRef);
  }
  async deleteKanji(id: string): Promise<void> {
    const docRef = doc(db, 'kanji', id);
    await deleteDoc(docRef);
  }

  async clearKanjiByGrade(grade: number): Promise<void> {
    const kanjiList = await this.getKanjiByGrade(grade);
    const batch = writeBatch(db);
    
    for (const kanji of kanjiList) {
      const docRef = doc(db, 'kanji', kanji.id);
      batch.delete(docRef);
    }
    
    await batch.commit();
  }

  async batchImportKanji(kanjiList: Omit<Kanji, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    
    for (const kanji of kanjiList) {
      const docRef = doc(collection(db, 'kanji'));
      batch.set(docRef, {
        ...kanji,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
  }

  // Grammar Operations
  async getGrammarByChapter(chapter: number): Promise<Grammar[]> {
    const grammarRef = collection(db, 'grammar');
    const q = query(grammarRef, where('chapter', '==', chapter));
    const snapshot = await getDocs(q);
    
    const grammars = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Grammar[];
    
    // Sort by title on the client side
    return grammars.sort((a, b) => a.title.localeCompare(b.title));
  }

  async getGrammars(): Promise<Grammar[]> {
    const grammarRef = collection(db, 'grammar');
    const q = query(grammarRef, orderBy('title'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Grammar[];
  }

  async saveGrammar(grammar: Omit<Grammar, 'id'>): Promise<string> {
    const docRef = doc(collection(db, 'grammar'));
    await setDoc(docRef, {
      ...grammar,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async updateGrammar(id: string, updates: Partial<Grammar>): Promise<void> {
    const docRef = doc(db, 'grammar', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Vocabulary Operations
  async getVocabularyByJLPT(level: string): Promise<Vocabulary[]> {
    const vocabRef = collection(db, 'vocabulary');
    const q = query(vocabRef, where('jlptLevel', '==', level));
    const snapshot = await getDocs(q);
    
    const vocabularies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Vocabulary[];
    
    // Sort by word on the client side
    return vocabularies.sort((a, b) => a.word.localeCompare(b.word));
  }

  async getVocabularyByChapter(chapter: number): Promise<Vocabulary[]> {
    const vocabRef = collection(db, 'vocabulary');
    const q = query(vocabRef, where('chapter', '==', chapter));
    const snapshot = await getDocs(q);
    
    const vocabularies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Vocabulary[];
    
    // Sort by word on the client side
    return vocabularies.sort((a, b) => a.word.localeCompare(b.word));
  }

  async saveVocabulary(vocabulary: Omit<Vocabulary, 'id'>): Promise<string> {
    const docRef = doc(collection(db, 'vocabulary'));
    await setDoc(docRef, {
      ...vocabulary,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async updateVocabulary(id: string, updates: Partial<Vocabulary>): Promise<void> {
    const docRef = doc(db, 'vocabulary', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deleteVocabulary(id: string): Promise<void> {
    const docRef = doc(db, 'vocabulary', id);
    await deleteDoc(docRef);
  }

  // Chapter Operations
  async getAllChapters(): Promise<Chapter[]> {
    const chaptersRef = collection(db, 'chapters');
    const q = query(chaptersRef, orderBy('number'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Chapter[];
  }

  async saveChapter(chapter: Omit<Chapter, 'id'>): Promise<string> {
    const docRef = doc(collection(db, 'chapters'));
    await setDoc(docRef, {
      ...chapter,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  // User Progress Operations
  async getUserProgress(uid: string): Promise<UserProgress | null> {
    const docRef = doc(db, 'userProgress', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastActivity: data.lastActivity.toDate()
      } as UserProgress;
    }
    return null;
  }

  async saveUserProgress(progress: UserProgress): Promise<void> {
    const docRef = doc(db, 'userProgress', progress.uid);
    await setDoc(docRef, {
      ...progress,
      lastActivity: new Date()
    });
  }

  // Dictionary Operations
  async getDictionaryEntries(searchQuery: string, filters: SearchFilters = {}, page: number = 1, pageSize: number = 20): Promise<{entries: DictionaryEntry[], total: number}> {
    try {
      const dictRef = collection(db, 'dictionary');
      let q = query(dictRef);

      // Apply filters
      if (filters.jlptLevel && filters.jlptLevel.length > 0) {
        q = query(q, where('jlptLevel', 'in', filters.jlptLevel));
      }
      
      if (filters.partOfSpeech && filters.partOfSpeech.length > 0) {
        q = query(q, where('partOfSpeech', 'array-contains-any', filters.partOfSpeech));
      }

      if (filters.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      // Add search by word or reading
      if (searchQuery) {
        q = query(q, where('word', '>=', searchQuery), where('word', '<=', searchQuery + '\uf8ff'));
      }

      // Add pagination
      q = query(q, orderBy('frequency', 'desc'), limit(pageSize));

      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];

      // Filter by search query in memory (more flexible search)
      const filteredEntries = entries.filter(entry => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          entry.word.toLowerCase().includes(query) ||
          entry.reading.toLowerCase().includes(query) ||
          entry.meanings.some(meaning => 
            meaning.indonesian.toLowerCase().includes(query) ||
            meaning.definition.toLowerCase().includes(query)
          )
        );
      });

      return {
        entries: filteredEntries,
        total: filteredEntries.length
      };
    } catch (error) {
      console.error('Error getting dictionary entries:', error);
      return { entries: [], total: 0 };
    }
  }

  async getWordOfTheDay(): Promise<DictionaryEntry | null> {
    try {
      // Get a random word from popular words
      const dictRef = collection(db, 'dictionary');
      const q = query(dictRef, where('frequency', '>=', 4), orderBy('frequency', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const words = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];

      // Select word based on current date
      const today = new Date().getDate();
      const selectedWord = words[today % words.length];
      
      return selectedWord;
    } catch (error) {
      console.error('Error getting word of the day:', error);
      return null;
    }
  }

  async getRandomWords(count: number = 5): Promise<DictionaryEntry[]> {
    try {
      const dictRef = collection(db, 'dictionary');
      const q = query(dictRef, orderBy('frequency', 'desc'), limit(count * 2));
      const snapshot = await getDocs(q);
      
      const words = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];

      // Shuffle and return requested count
      const shuffled = words.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error getting random words:', error);
      return [];
    }
  }

  async getPopularWords(limit: number = 10): Promise<DictionaryEntry[]> {
    try {
      const dictRef = collection(db, 'dictionary');
      const q = query(dictRef, orderBy('frequency', 'desc'), limit(limit));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];
    } catch (error) {
      console.error('Error getting popular words:', error);
      return [];
    }
  }

  async getWordsByJLPTLevel(level: string): Promise<DictionaryEntry[]> {
    try {
      const dictRef = collection(db, 'dictionary');
      const q = query(dictRef, where('jlptLevel', '==', level), orderBy('frequency', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];
    } catch (error) {
      console.error('Error getting words by JLPT level:', error);
      return [];
    }
  }

  async getWordsByTag(tag: string): Promise<DictionaryEntry[]> {
    try {
      const dictRef = collection(db, 'dictionary');
      const q = query(dictRef, where('tags', 'array-contains', tag), orderBy('frequency', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];
    } catch (error) {
      console.error('Error getting words by tag:', error);
      return [];
    }
  }

  async addDictionaryEntry(entry: Omit<DictionaryEntry, 'id'>): Promise<string> {
    try {
      const dictRef = collection(db, 'dictionary');
      const docRef = doc(dictRef);
      await setDoc(docRef, {
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding dictionary entry:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();