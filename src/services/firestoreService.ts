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
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Kanji, Vocabulary, Grammar, Chapter, UserProgress } from '../types';

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

  async saveGrammar(grammar: Omit<Grammar, 'id'>): Promise<string> {
    const docRef = doc(collection(db, 'grammar'));
    await setDoc(docRef, {
      ...grammar,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
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

  // Check if kanji already exists (for import deduplication)
  // Removed kanjiExists function - no longer checking for duplicates
}

export const firestoreService = new FirestoreService();