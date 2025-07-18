import { azureOpenAI } from './azureOpenAI';
import { firestoreService } from './firestoreService';
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

  static async searchDictionary(
    query: string, 
    filters: SearchFilters = {}, 
    page: number = 1, 
    limit: number = 20
  ): Promise<SearchResult> {
    try {
      // Get dictionary data from Firebase
      const dictionaryData = await firestoreService.getDictionaryEntries(query, filters, page, limit);
      
      // Generate suggestions and related terms using AI
      const suggestions = await this.generateAISuggestions(query, dictionaryData.entries);
      const relatedTerms = await this.findAIRelatedTerms(query, dictionaryData.entries);

      return {
        entries: dictionaryData.entries,
        total: dictionaryData.total,
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
    try {
      // Use AI to tokenize Japanese sentence
      const prompt = `
        Analyze and tokenize this Japanese sentence: "${sentence}"
        
        For each token, provide:
        1. surface (original form)
        2. reading (hiragana/katakana reading)
        3. baseForm (dictionary form)
        4. partOfSpeech (noun, verb, adjective, etc.)
        5. meaning (English definition)
        6. indonesian (Indonesian translation)
        7. isKnown (estimate based on JLPT N5-N4 level)
        8. difficulty (1-5 scale)
        9. jlptLevel (N5, N4, N3, N2, N1, or null)
        
        Return as JSON array of tokens.
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const tokens = JSON.parse(response);
        return tokens.map((token: any, index: number) => ({
          id: `token_${index}`,
          surface: token.surface || '',
          reading: token.reading || token.surface,
          baseForm: token.baseForm || token.surface,
          partOfSpeech: token.partOfSpeech || 'unknown',
          meaning: token.meaning || 'Unknown meaning',
          indonesian: token.indonesian || 'Arti tidak diketahui',
          isKnown: token.isKnown || false,
          difficulty: token.difficulty || 3,
          jlptLevel: token.jlptLevel
        }));
      } catch (parseError) {
        console.error('Error parsing AI tokenization:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error in AI tokenization:', error);
      return [];
    }
  }

  private static async extractGrammar(sentence: string, tokens: Token[]): Promise<GrammarAnalysis[]> {
    try {
      // Use AI to analyze grammar patterns
      const prompt = `
        Analyze the grammar patterns in this Japanese sentence: "${sentence}"
        
        For each grammar pattern found, provide:
        1. pattern (the grammar pattern)
        2. explanation (English explanation)
        3. indonesian (Indonesian explanation)
        4. example (example usage)
        5. level (basic, intermediate, advanced)
        6. category (particles, politeness, verb-forms, etc.)
        7. relatedPatterns (array of related patterns)
        
        Return as JSON array of grammar analyses.
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const grammarAnalyses = JSON.parse(response);
        return grammarAnalyses.map((analysis: any, index: number) => ({
          id: `grammar_${index}`,
          pattern: analysis.pattern || '',
          explanation: analysis.explanation || '',
          indonesian: analysis.indonesian || '',
          example: analysis.example || '',
          level: analysis.level || 'basic',
          category: analysis.category || 'general',
          relatedPatterns: analysis.relatedPatterns || []
        }));
      } catch (parseError) {
        console.error('Error parsing AI grammar analysis:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error in AI grammar analysis:', error);
      return [];
    }
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

  private static async generateAISuggestions(query: string, results: DictionaryEntry[]): Promise<string[]> {
    try {
      if (results.length === 0) {
        // Use AI to generate suggestions for typos or alternatives
        const prompt = `
          The user searched for "${query}" in Japanese but no results were found.
          Generate 5 alternative search suggestions that might be what they meant.
          Consider common typos, romanization variations, or similar words.
          Return as JSON array of strings.
        `;

        const response = await azureOpenAI.getChatResponse([
          { role: 'user', content: prompt }
        ]);

        try {
          return JSON.parse(response);
        } catch (parseError) {
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return [];
    }
  }

  private static async findAIRelatedTerms(query: string, results: DictionaryEntry[]): Promise<string[]> {
    try {
      if (results.length === 0) return [];

      const prompt = `
        Based on the search query "${query}" and the found results, 
        suggest 8 related Japanese words that the user might be interested in learning.
        Consider semantic relationships, word families, and thematic connections.
        Return as JSON array of strings.
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return [];
      }
    } catch (error) {
      console.error('Error finding AI related terms:', error);
      return [];
    }
  }

  static async getWordOfTheDay(): Promise<DictionaryEntry | null> {
    try {
      return await firestoreService.getWordOfTheDay();
    } catch (error) {
      console.error('Error getting word of the day:', error);
      return null;
    }
  }

  static async getRandomWords(count: number = 5): Promise<DictionaryEntry[]> {
    try {
      return await firestoreService.getRandomWords(count);
    } catch (error) {
      console.error('Error getting random words:', error);
      return [];
    }
  }

  static async getPopularWords(limit: number = 10): Promise<DictionaryEntry[]> {
    try {
      return await firestoreService.getPopularWords(limit);
    } catch (error) {
      console.error('Error getting popular words:', error);
      return [];
    }
  }

  static async getWordsByJLPTLevel(level: string): Promise<DictionaryEntry[]> {
    try {
      return await firestoreService.getWordsByJLPTLevel(level);
    } catch (error) {
      console.error('Error getting words by JLPT level:', error);
      return [];
    }
  }

  static async getWordsByTag(tag: string): Promise<DictionaryEntry[]> {
    try {
      return await firestoreService.getWordsByTag(tag);
    } catch (error) {
      console.error('Error getting words by tag:', error);
      return [];
    }
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