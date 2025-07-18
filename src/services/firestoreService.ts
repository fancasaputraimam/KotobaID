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

      // If no results found, try AI search first before fallback
      if (filteredEntries.length === 0 && searchQuery) {
        console.log('No results found in Firestore, trying AI search for:', searchQuery);
        
        // Import StudyToolsService dynamically to avoid circular dependency
        const { StudyToolsService } = await import('./studyToolsService');
        const aiResults = await StudyToolsService.searchWithAI(searchQuery);
        
        if (aiResults.length > 0) {
          console.log('AI search found', aiResults.length, 'results');
          return {
            entries: aiResults,
            total: aiResults.length
          };
        }
        
        // If AI search also fails, use fallback data
        const fallbackEntries = this.getFallbackDictionaryEntries(searchQuery);
        return {
          entries: fallbackEntries,
          total: fallbackEntries.length
        };
      }

      return {
        entries: filteredEntries,
        total: filteredEntries.length
      };
    } catch (error) {
      console.error('Error getting dictionary entries:', error);
      // Try AI search on error as well
      if (searchQuery) {
        try {
          const { StudyToolsService } = await import('./studyToolsService');
          const aiResults = await StudyToolsService.searchWithAI(searchQuery);
          
          if (aiResults.length > 0) {
            console.log('AI search found', aiResults.length, 'results after error');
            return {
              entries: aiResults,
              total: aiResults.length
            };
          }
        } catch (aiError) {
          console.error('AI search also failed:', aiError);
        }
        
        // Return fallback data if AI search fails
        const fallbackEntries = this.getFallbackDictionaryEntries(searchQuery);
        return {
          entries: fallbackEntries,
          total: fallbackEntries.length
        };
      }
      return { entries: [], total: 0 };
    }
  }

  async getWordOfTheDay(): Promise<DictionaryEntry | null> {
    try {
      // Get a random word from popular words
      const dictRef = collection(db, 'dictionary');
      const q = query(dictRef, where('frequency', '>=', 4), orderBy('frequency', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Use fallback data
        const fallbackData = this.getFallbackDictionaryEntries('');
        const today = new Date().getDate();
        return fallbackData[today % fallbackData.length] || null;
      }
      
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
      // Use fallback data
      const fallbackData = this.getFallbackDictionaryEntries('');
      const today = new Date().getDate();
      return fallbackData[today % fallbackData.length] || null;
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
      
      if (snapshot.empty) {
        // Use fallback data
        const fallbackData = this.getFallbackDictionaryEntries('');
        return fallbackData.slice(0, limit);
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DictionaryEntry[];
    } catch (error) {
      console.error('Error getting popular words:', error);
      // Use fallback data
      const fallbackData = this.getFallbackDictionaryEntries('');
      return fallbackData.slice(0, limit);
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

  private getFallbackDictionaryEntries(searchQuery: string): DictionaryEntry[] {
    const fallbackData: DictionaryEntry[] = [
      {
        id: 'fallback_1',
        word: 'こんにちは',
        reading: 'こんにちは',
        meanings: [
          {
            id: 'meaning_1',
            definition: 'A greeting used during the day',
            indonesian: 'Halo, selamat siang',
            english: 'Hello, good afternoon',
            context: 'formal/casual greeting'
          }
        ],
        partOfSpeech: ['interjection'],
        jlptLevel: 'N5',
        frequency: 5,
        examples: [
          {
            id: 'example_1',
            japanese: 'こんにちは、田中さん。',
            reading: 'こんにちは、たなかさん。',
            indonesian: 'Halo, Tanaka-san.',
            english: 'Hello, Mr. Tanaka.',
            difficulty: 'beginner',
            source: 'common phrases',
            tags: ['greeting', 'polite']
          }
        ],
        tags: ['greeting', 'common', 'polite'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_2',
        word: '学生',
        reading: 'がくせい',
        meanings: [
          {
            id: 'meaning_2',
            definition: 'A person who is studying at a school or university',
            indonesian: 'Siswa, mahasiswa',
            english: 'Student',
            context: 'education'
          }
        ],
        partOfSpeech: ['noun'],
        jlptLevel: 'N5',
        frequency: 4,
        examples: [
          {
            id: 'example_2',
            japanese: '私は学生です。',
            reading: 'わたしはがくせいです。',
            indonesian: 'Saya adalah siswa.',
            english: 'I am a student.',
            difficulty: 'beginner',
            source: 'basic conversations',
            tags: ['self-introduction', 'school']
          }
        ],
        kanji: [
          {
            character: '学',
            meaning: 'study, learning',
            onyomi: ['ガク'],
            kunyomi: ['まな'],
            strokeCount: 8,
            jlptLevel: 'N5',
            frequency: 5
          },
          {
            character: '生',
            meaning: 'life, birth',
            onyomi: ['セイ', 'ショウ'],
            kunyomi: ['い', 'う', 'なま'],
            strokeCount: 5,
            jlptLevel: 'N5',
            frequency: 5
          }
        ],
        tags: ['education', 'occupation', 'common'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_3',
        word: '今日',
        reading: 'きょう',
        meanings: [
          {
            id: 'meaning_3',
            definition: 'This day, the current day',
            indonesian: 'Hari ini',
            english: 'Today',
            context: 'time reference'
          }
        ],
        partOfSpeech: ['noun'],
        jlptLevel: 'N5',
        frequency: 5,
        examples: [
          {
            id: 'example_3',
            japanese: '今日は天気がいいです。',
            reading: 'きょうはてんきがいいです。',
            indonesian: 'Hari ini cuacanya bagus.',
            english: 'The weather is nice today.',
            difficulty: 'beginner',
            source: 'weather conversations',
            tags: ['weather', 'time', 'daily']
          }
        ],
        kanji: [
          {
            character: '今',
            meaning: 'now, present',
            onyomi: ['コン', 'キン'],
            kunyomi: ['いま'],
            strokeCount: 4,
            jlptLevel: 'N5',
            frequency: 5
          },
          {
            character: '日',
            meaning: 'day, sun',
            onyomi: ['ニチ', 'ジツ'],
            kunyomi: ['ひ', 'か'],
            strokeCount: 4,
            jlptLevel: 'N5',
            frequency: 5
          }
        ],
        tags: ['time', 'daily', 'common'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_4',
        word: '食べる',
        reading: 'たべる',
        meanings: [
          {
            id: 'meaning_4',
            definition: 'To eat, to consume food',
            indonesian: 'Makan',
            english: 'To eat',
            context: 'daily activities'
          }
        ],
        partOfSpeech: ['verb'],
        jlptLevel: 'N5',
        frequency: 5,
        examples: [
          {
            id: 'example_4',
            japanese: '朝ごはんを食べます。',
            reading: 'あさごはんをたべます。',
            indonesian: 'Saya makan sarapan.',
            english: 'I eat breakfast.',
            difficulty: 'beginner',
            source: 'daily routines',
            tags: ['food', 'daily', 'routine']
          }
        ],
        kanji: [
          {
            character: '食',
            meaning: 'eat, food',
            onyomi: ['ショク'],
            kunyomi: ['た', 'く'],
            strokeCount: 9,
            jlptLevel: 'N5',
            frequency: 5
          }
        ],
        tags: ['food', 'verb', 'daily'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_5',
        word: '美しい',
        reading: 'うつくしい',
        meanings: [
          {
            id: 'meaning_5',
            definition: 'Beautiful, lovely, pretty',
            indonesian: 'Indah, cantik',
            english: 'Beautiful',
            context: 'describing appearance'
          }
        ],
        partOfSpeech: ['adjective'],
        jlptLevel: 'N4',
        frequency: 3,
        examples: [
          {
            id: 'example_5',
            japanese: '桜の花が美しいです。',
            reading: 'さくらのはながうつくしいです。',
            indonesian: 'Bunga sakura itu indah.',
            english: 'The cherry blossoms are beautiful.',
            difficulty: 'intermediate',
            source: 'nature descriptions',
            tags: ['nature', 'description', 'beauty']
          }
        ],
        kanji: [
          {
            character: '美',
            meaning: 'beauty, beautiful',
            onyomi: ['ビ'],
            kunyomi: ['うつく'],
            strokeCount: 9,
            jlptLevel: 'N4',
            frequency: 3
          }
        ],
        tags: ['beauty', 'adjective', 'description'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_6',
        word: 'ありがとう',
        reading: 'ありがとう',
        meanings: [
          {
            id: 'meaning_6',
            definition: 'Thank you',
            indonesian: 'Terima kasih',
            english: 'Thank you',
            context: 'gratitude expression'
          }
        ],
        partOfSpeech: ['interjection'],
        jlptLevel: 'N5',
        frequency: 5,
        examples: [
          {
            id: 'example_6',
            japanese: 'ありがとうございます。',
            reading: 'ありがとうございます。',
            indonesian: 'Terima kasih.',
            english: 'Thank you.',
            difficulty: 'beginner',
            source: 'polite expressions',
            tags: ['gratitude', 'polite']
          }
        ],
        tags: ['gratitude', 'common', 'polite'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_7',
        word: '水',
        reading: 'みず',
        meanings: [
          {
            id: 'meaning_7',
            definition: 'Water',
            indonesian: 'Air',
            english: 'Water',
            context: 'basic necessity'
          }
        ],
        partOfSpeech: ['noun'],
        jlptLevel: 'N5',
        frequency: 4,
        examples: [
          {
            id: 'example_7',
            japanese: '水を飲みます。',
            reading: 'みずをのみます。',
            indonesian: 'Saya minum air.',
            english: 'I drink water.',
            difficulty: 'beginner',
            source: 'daily activities',
            tags: ['drink', 'daily']
          }
        ],
        kanji: [
          {
            character: '水',
            meaning: 'water',
            onyomi: ['スイ'],
            kunyomi: ['みず'],
            strokeCount: 4,
            jlptLevel: 'N5',
            frequency: 4
          }
        ],
        tags: ['water', 'daily', 'basic'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_8',
        word: 'すみません',
        reading: 'すみません',
        meanings: [
          {
            id: 'meaning_8',
            definition: 'Excuse me, sorry',
            indonesian: 'Maaf, permisi',
            english: 'Excuse me, sorry',
            context: 'apology and attention getting'
          }
        ],
        partOfSpeech: ['interjection'],
        jlptLevel: 'N5',
        frequency: 5,
        examples: [
          {
            id: 'example_8',
            japanese: 'すみません、駅はどこですか。',
            reading: 'すみません、えきはどこですか。',
            indonesian: 'Permisi, di mana stasiun?',
            english: 'Excuse me, where is the station?',
            difficulty: 'beginner',
            source: 'asking directions',
            tags: ['question', 'polite']
          }
        ],
        tags: ['apology', 'polite', 'common'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_9',
        word: 'おはよう',
        reading: 'おはよう',
        meanings: [
          {
            id: 'meaning_9',
            definition: 'Good morning (casual)',
            indonesian: 'Selamat pagi',
            english: 'Good morning',
            context: 'morning greeting'
          }
        ],
        partOfSpeech: ['interjection'],
        jlptLevel: 'N5',
        frequency: 5,
        examples: [
          {
            id: 'example_9',
            japanese: 'おはようございます。',
            reading: 'おはようございます。',
            indonesian: 'Selamat pagi.',
            english: 'Good morning.',
            difficulty: 'beginner',
            source: 'morning greetings',
            tags: ['greeting', 'morning']
          }
        ],
        tags: ['greeting', 'morning', 'common'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fallback_10',
        word: '本',
        reading: 'ほん',
        meanings: [
          {
            id: 'meaning_10',
            definition: 'Book',
            indonesian: 'Buku',
            english: 'Book',
            context: 'reading material'
          }
        ],
        partOfSpeech: ['noun'],
        jlptLevel: 'N5',
        frequency: 4,
        examples: [
          {
            id: 'example_10',
            japanese: 'この本は面白いです。',
            reading: 'このほんはおもしろいです。',
            indonesian: 'Buku ini menarik.',
            english: 'This book is interesting.',
            difficulty: 'beginner',
            source: 'reading activities',
            tags: ['reading', 'study']
          }
        ],
        kanji: [
          {
            character: '本',
            meaning: 'book, origin',
            onyomi: ['ホン'],
            kunyomi: ['もと'],
            strokeCount: 5,
            jlptLevel: 'N5',
            frequency: 5
          }
        ],
        tags: ['book', 'study', 'reading'],
        source: 'internal',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filter fallback data based on search query
    if (!searchQuery) {
      return fallbackData;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = fallbackData.filter(entry => 
      entry.word.toLowerCase().includes(query) ||
      entry.reading.toLowerCase().includes(query) ||
      entry.meanings.some(meaning => 
        meaning.indonesian.toLowerCase().includes(query) ||
        meaning.definition.toLowerCase().includes(query)
      )
    );
    
    // If no matches found, return all fallback data to show something
    const result = filtered.length > 0 ? filtered : fallbackData;
    return result;
  }
}

export const firestoreService = new FirestoreService();