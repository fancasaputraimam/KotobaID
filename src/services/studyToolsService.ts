import { azureOpenAI } from './azureOpenAI';
import { 
  DictionaryEntry, 
  SentenceAnalysis, 
  SearchResult, 
  Token, 
  GrammarAnalysis,
  SearchFilters,
  StudySuggestion
} from '../types/studyTools';

export class StudyToolsService {
  
  // Japanese dictionary data (simplified - in production would use comprehensive dictionary)
  private static dictionaryData: DictionaryEntry[] = [
    {
      id: 'dict_01',
      word: 'こんにちは',
      reading: 'konnichiwa',
      meanings: [
        {
          id: 'meaning_01',
          definition: 'Good afternoon greeting',
          indonesian: 'Selamat siang',
          context: 'Used from late morning until late afternoon'
        }
      ],
      partOfSpeech: ['interjection'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_01',
          japanese: 'こんにちは、田中さん。',
          reading: 'konnichiwa, tanaka-san',
          indonesian: 'Selamat siang, Tanaka-san.',
          difficulty: 'beginner',
          source: 'common_greetings',
          tags: ['greeting', 'polite']
        }
      ],
      tags: ['greeting', 'daily', 'polite'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dict_02',
      word: 'ありがとう',
      reading: 'arigatou',
      meanings: [
        {
          id: 'meaning_02',
          definition: 'Thank you (casual)',
          indonesian: 'Terima kasih',
          context: 'Casual expression of gratitude'
        }
      ],
      partOfSpeech: ['interjection'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_02',
          japanese: 'ありがとう、お母さん。',
          reading: 'arigatou, okaasan',
          indonesian: 'Terima kasih, Ibu.',
          difficulty: 'beginner',
          source: 'family_conversations',
          tags: ['gratitude', 'family']
        }
      ],
      tags: ['gratitude', 'daily', 'casual'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dict_03',
      word: '食べる',
      reading: 'taberu',
      meanings: [
        {
          id: 'meaning_03',
          definition: 'To eat',
          indonesian: 'Makan',
          context: 'Basic verb for eating'
        }
      ],
      partOfSpeech: ['verb', 'ichidan'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_03',
          japanese: 'りんごを食べます。',
          reading: 'ringo wo tabemasu',
          indonesian: 'Saya makan apel.',
          difficulty: 'beginner',
          source: 'basic_verbs',
          tags: ['food', 'action']
        }
      ],
      tags: ['verb', 'food', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dict_04',
      word: '学校',
      reading: 'gakkou',
      meanings: [
        {
          id: 'meaning_04',
          definition: 'School',
          indonesian: 'Sekolah',
          context: 'Educational institution'
        }
      ],
      kanji: [
        {
          character: '学',
          meaning: 'study, learn',
          onyomi: ['がく', 'がっ'],
          kunyomi: ['まな.ぶ'],
          strokeCount: 8,
          jlptLevel: 'N5',
          frequency: 5
        },
        {
          character: '校',
          meaning: 'school',
          onyomi: ['こう', 'きょう'],
          kunyomi: [],
          strokeCount: 10,
          jlptLevel: 'N5',
          frequency: 4
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_04',
          japanese: '学校に行きます。',
          reading: 'gakkou ni ikimasu',
          indonesian: 'Saya pergi ke sekolah.',
          difficulty: 'beginner',
          source: 'daily_activities',
          tags: ['education', 'location']
        }
      ],
      tags: ['education', 'place', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dict_05',
      word: '美しい',
      reading: 'utsukushii',
      meanings: [
        {
          id: 'meaning_05',
          definition: 'Beautiful',
          indonesian: 'Indah, cantik',
          context: 'Describing aesthetic beauty'
        }
      ],
      partOfSpeech: ['i-adjective'],
      jlptLevel: 'N4',
      frequency: 4,
      examples: [
        {
          id: 'ex_05',
          japanese: '美しい花ですね。',
          reading: 'utsukushii hana desu ne',
          indonesian: 'Bunga yang indah ya.',
          difficulty: 'intermediate',
          source: 'descriptions',
          tags: ['beauty', 'nature']
        }
      ],
      tags: ['adjective', 'beauty', 'description'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  static async searchDictionary(
    query: string, 
    filters: SearchFilters = {}, 
    page: number = 1, 
    limit: number = 20
  ): Promise<SearchResult> {
    try {
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // Filter entries based on query
      let results = this.dictionaryData.filter(entry => {
        const matchesQuery = 
          entry.word.toLowerCase().includes(normalizedQuery) ||
          entry.reading.toLowerCase().includes(normalizedQuery) ||
          entry.meanings.some(meaning => 
            meaning.indonesian.toLowerCase().includes(normalizedQuery) ||
            meaning.definition.toLowerCase().includes(normalizedQuery)
          );
        
        if (!matchesQuery) return false;

        // Apply filters
        if (filters.partOfSpeech && !filters.partOfSpeech.some(pos => entry.partOfSpeech.includes(pos))) {
          return false;
        }
        
        if (filters.jlptLevel && !filters.jlptLevel.includes(entry.jlptLevel || '')) {
          return false;
        }
        
        if (filters.hasAudio && !entry.audio) {
          return false;
        }
        
        if (filters.hasExamples && entry.examples.length === 0) {
          return false;
        }
        
        if (filters.tags && !filters.tags.some(tag => entry.tags.includes(tag))) {
          return false;
        }

        return true;
      });

      // Sort by relevance and frequency
      results.sort((a, b) => {
        // Exact matches first
        if (a.word === query) return -1;
        if (b.word === query) return 1;
        
        // Then by frequency
        return b.frequency - a.frequency;
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedResults = results.slice(startIndex, startIndex + limit);

      // Generate suggestions and related terms
      const suggestions = this.generateSuggestions(query, results);
      const relatedTerms = this.findRelatedTerms(query, results);

      return {
        entries: paginatedResults,
        total: results.length,
        page,
        limit,
        suggestions,
        relatedTerms
      };
    } catch (error) {
      console.error('Error searching dictionary:', error);
      return {
        entries: [],
        total: 0,
        page: 1,
        limit: 20,
        suggestions: [],
        relatedTerms: []
      };
    }
  }

  static async analyzeSentence(sentence: string): Promise<SentenceAnalysis> {
    try {
      // Use AI to analyze the sentence
      const aiAnalysis = await this.getAIAnalysis(sentence);
      
      // Tokenize the sentence (simplified)
      const tokens = await this.tokenizeSentence(sentence);
      
      // Extract grammar patterns
      const grammar = await this.extractGrammar(sentence, tokens);
      
      // Generate breakdown
      const breakdown = await this.generateSentenceBreakdown(sentence, tokens, grammar);
      
      // Generate study suggestions
      const suggestions = await this.generateStudySuggestions(tokens, grammar);
      
      return {
        original: sentence,
        tokens,
        grammar,
        translation: aiAnalysis.translation,
        difficulty: aiAnalysis.difficulty,
        breakdown,
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing sentence:', error);
      throw error;
    }
  }

  private static async getAIAnalysis(sentence: string): Promise<{translation: string, difficulty: 'beginner' | 'intermediate' | 'advanced'}> {
    try {
      const prompt = `
        Analyze this Japanese sentence and provide:
        1. Indonesian translation
        2. Difficulty level (beginner/intermediate/advanced)
        
        Sentence: ${sentence}
        
        Please respond in JSON format:
        {
          "translation": "Indonesian translation",
          "difficulty": "beginner/intermediate/advanced"
        }
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      // Parse AI response
      try {
        const parsed = JSON.parse(response);
        return {
          translation: parsed.translation || 'Terjemahan tidak tersedia',
          difficulty: parsed.difficulty || 'intermediate'
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          translation: response.substring(0, 100) + '...',
          difficulty: 'intermediate'
        };
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      return {
        translation: 'Terjemahan tidak tersedia',
        difficulty: 'intermediate'
      };
    }
  }

  private static async tokenizeSentence(sentence: string): Promise<Token[]> {
    // Simplified tokenization - in production would use proper Japanese tokenizer
    const tokens: Token[] = [];
    const words = sentence.split(/[\s、。！？]/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].trim();
      if (!word) continue;
      
      // Find dictionary entry for this word
      const entry = this.dictionaryData.find(e => 
        e.word === word || e.reading === word
      );
      
      tokens.push({
        id: `token_${i}`,
        surface: word,
        reading: entry?.reading || word,
        baseForm: entry?.word || word,
        partOfSpeech: entry?.partOfSpeech[0] || 'unknown',
        meaning: entry?.meanings[0]?.definition || 'Unknown meaning',
        indonesian: entry?.meanings[0]?.indonesian || 'Arti tidak diketahui',
        isKnown: !!entry,
        difficulty: entry?.frequency || 1,
        jlptLevel: entry?.jlptLevel
      });
    }
    
    return tokens;
  }

  private static async extractGrammar(sentence: string, tokens: Token[]): Promise<GrammarAnalysis[]> {
    const grammar: GrammarAnalysis[] = [];
    
    // Simple grammar pattern detection
    if (sentence.includes('を')) {
      grammar.push({
        id: 'grammar_wo',
        pattern: 'を',
        explanation: 'Object marker particle',
        indonesian: 'Partikel penanda objek',
        example: 'りんごを食べます (makan apel)',
        level: 'basic',
        category: 'particles',
        relatedPatterns: ['が', 'は', 'に']
      });
    }
    
    if (sentence.includes('です') || sentence.includes('ます')) {
      grammar.push({
        id: 'grammar_polite',
        pattern: 'です/ます',
        explanation: 'Polite form endings',
        indonesian: 'Bentuk sopan/formal',
        example: 'これは本です (ini adalah buku)',
        level: 'basic',
        category: 'politeness',
        relatedPatterns: ['である', 'だ']
      });
    }
    
    return grammar;
  }

  private static async generateSentenceBreakdown(
    sentence: string, 
    tokens: Token[], 
    grammar: GrammarAnalysis[]
  ) {
    return {
      structure: this.analyzeStructure(tokens),
      parts: this.identifyParts(tokens),
      keyGrammar: grammar.map(g => g.pattern),
      culturalNotes: this.getCulturalNotes(sentence),
      formalityLevel: this.determineFormalityLevel(sentence)
    };
  }

  private static analyzeStructure(tokens: Token[]): string {
    const structure = tokens.map(token => {
      switch (token.partOfSpeech) {
        case 'noun': return 'N';
        case 'verb': return 'V';
        case 'adjective': return 'Adj';
        case 'particle': return 'P';
        default: return 'X';
      }
    }).join('-');
    
    return structure || 'Unknown';
  }

  private static identifyParts(tokens: Token[]) {
    return tokens.map((token, index) => ({
      id: `part_${index}`,
      text: token.surface,
      reading: token.reading,
      function: this.determineFunction(token, index),
      explanation: `${token.partOfSpeech} - ${token.meaning}`,
      indonesian: token.indonesian,
      importance: token.isKnown ? 'low' : 'high' as const
    }));
  }

  private static determineFunction(token: Token, index: number): string {
    switch (token.partOfSpeech) {
      case 'noun': return index === 0 ? 'subject' : 'object';
      case 'verb': return 'predicate';
      case 'adjective': return 'modifier';
      case 'particle': return 'marker';
      default: return 'other';
    }
  }

  private static getCulturalNotes(sentence: string): string[] {
    const notes = [];
    
    if (sentence.includes('さん')) {
      notes.push('さん adalah honorifik yang digunakan untuk menunjukkan rasa hormat');
    }
    
    if (sentence.includes('です') || sentence.includes('ます')) {
      notes.push('Penggunaan bentuk sopan menunjukkan formalitas dan rasa hormat');
    }
    
    return notes;
  }

  private static determineFormalityLevel(sentence: string): 'casual' | 'polite' | 'formal' {
    if (sentence.includes('です') || sentence.includes('ます')) {
      return 'polite';
    }
    if (sentence.includes('である') || sentence.includes('ございます')) {
      return 'formal';
    }
    return 'casual';
  }

  private static async generateStudySuggestions(tokens: Token[], grammar: GrammarAnalysis[]): Promise<StudySuggestion[]> {
    const suggestions: StudySuggestion[] = [];
    
    // Unknown vocabulary suggestions
    const unknownTokens = tokens.filter(t => !t.isKnown);
    if (unknownTokens.length > 0) {
      suggestions.push({
        id: 'vocab_study',
        type: 'vocabulary',
        title: 'Pelajari Kosakata Baru',
        description: `Ada ${unknownTokens.length} kata yang belum dikenal: ${unknownTokens.map(t => t.surface).join(', ')}`,
        priority: 'high',
        estimatedTime: `${unknownTokens.length * 3} menit`,
        resources: ['Flashcards', 'Example sentences', 'Audio pronunciation']
      });
    }
    
    // Grammar pattern suggestions
    if (grammar.length > 0) {
      suggestions.push({
        id: 'grammar_study',
        type: 'grammar',
        title: 'Review Pola Tata Bahasa',
        description: `Pelajari lebih lanjut tentang: ${grammar.map(g => g.pattern).join(', ')}`,
        priority: 'medium',
        estimatedTime: `${grammar.length * 5} menit`,
        resources: ['Grammar guides', 'Practice exercises', 'Related patterns']
      });
    }
    
    return suggestions;
  }

  private static generateSuggestions(query: string, results: DictionaryEntry[]): string[] {
    if (results.length === 0) {
      // Generate suggestions for typos or alternatives
      return this.dictionaryData
        .filter(entry => 
          entry.word.includes(query.substring(0, 2)) ||
          entry.reading.includes(query.substring(0, 2))
        )
        .slice(0, 5)
        .map(entry => entry.word);
    }
    
    return [];
  }

  private static findRelatedTerms(query: string, results: DictionaryEntry[]): string[] {
    const related = new Set<string>();
    
    results.forEach(entry => {
      entry.tags.forEach(tag => {
        this.dictionaryData.forEach(other => {
          if (other.id !== entry.id && other.tags.includes(tag)) {
            related.add(other.word);
          }
        });
      });
    });
    
    return Array.from(related).slice(0, 8);
  }

  static async getWordOfTheDay(): Promise<DictionaryEntry> {
    // Simple implementation - in production would be more sophisticated
    const today = new Date().getDate();
    const index = today % this.dictionaryData.length;
    return this.dictionaryData[index];
  }

  static async getRandomWords(count: number = 5): Promise<DictionaryEntry[]> {
    const shuffled = [...this.dictionaryData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static async getPopularWords(limit: number = 10): Promise<DictionaryEntry[]> {
    return this.dictionaryData
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  static async getWordsByJLPTLevel(level: string): Promise<DictionaryEntry[]> {
    return this.dictionaryData.filter(entry => entry.jlptLevel === level);
  }

  static async getWordsByTag(tag: string): Promise<DictionaryEntry[]> {
    return this.dictionaryData.filter(entry => entry.tags.includes(tag));
  }

  // Text-to-speech for pronunciation
  static async playPronunciation(text: string, reading?: string): Promise<void> {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reading || text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }

  // Get conjugations for verbs
  static async getConjugations(verb: string): Promise<any[]> {
    // Simplified conjugation system
    const conjugations = [];
    
    if (verb.endsWith('る')) {
      conjugations.push({
        form: 'present-polite',
        conjugated: verb.slice(0, -1) + 'ます',
        reading: verb.slice(0, -1) + 'masu',
        meaning: 'Present polite form'
      });
      
      conjugations.push({
        form: 'past-polite',
        conjugated: verb.slice(0, -1) + 'ました',
        reading: verb.slice(0, -1) + 'mashita',
        meaning: 'Past polite form'
      });
    }
    
    return conjugations;
  }
}