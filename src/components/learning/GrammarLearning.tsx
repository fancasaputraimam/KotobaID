import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Brain, MessageCircle, Send, Lightbulb, ChevronRight } from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { azureOpenAI } from '../../services/azureOpenAI';
import { Grammar, Chapter } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const GrammarLearning: React.FC = () => {
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrammar, setSelectedGrammar] = useState<Grammar | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [selectedGrammarForAI, setSelectedGrammarForAI] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [aiQuestionLoading, setAiQuestionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedChapter > 0) {
      loadGrammars();
    }
  }, [selectedChapter]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading chapters...');
      const chapterData = await firestoreService.getAllChapters();
      console.log('Chapters loaded:', chapterData);
      setChapters(chapterData);
      if (chapterData.length > 0) {
        setSelectedChapter(chapterData[0].number);
        console.log('Selected chapter:', chapterData[0].number);
      } else {
        console.log('No chapters found, using fallback');
        // Fallback chapter
        setChapters([{
          id: '1',
          number: 1,
          title: 'Pengenalan Dasar',
          description: 'Materi dasar bahasa Jepang',
          grammarTopics: [],
          vocabulary: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
        setSelectedChapter(1);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      // Fallback chapter
      setChapters([{
        id: '1',
        number: 1,
        title: 'Pengenalan Dasar',
        description: 'Materi dasar bahasa Jepang',
        grammarTopics: [],
        vocabulary: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      setSelectedChapter(1);
    } finally {
      setLoading(false);
    }
  };

  const loadGrammars = async () => {
    try {
      console.log('Loading grammars for chapter:', selectedChapter);
      const grammarData = await firestoreService.getGrammarByChapter(selectedChapter);
      console.log('Grammar data received:', grammarData);
      console.log('Grammar data length:', grammarData?.length || 0);
      setGrammars(grammarData || []);
    } catch (error) {
      console.error('Error loading grammars:', error);
      setGrammars([]);
    }
  };

  const handleAIExplanation = async (grammar: Grammar) => {
    setAiLoading(true);
    setSelectedGrammarForAI(grammar.id);
    // Clear the AI Grammar Assistant section
    setAiAnswer('');
    setAiQuestion('');
    try {
      const prompt = `Jelaskan pola grammar bahasa Jepang "${grammar.pattern || grammar.title}" dengan detail dalam bahasa Indonesia. 

Berikan:
1. Penjelasan yang mudah dipahami tentang penggunaan grammar ini
2. 3-4 contoh kalimat dalam hiragana (TANPA kanji dan TANPA romaji)
3. Arti dari setiap contoh kalimat dalam bahasa Indonesia

Format jawaban:
**Penjelasan:**
[penjelasan detail]

**Contoh Kalimat:**
1. [kalimat hiragana] - [arti Indonesia]
2. [kalimat hiragana] - [arti Indonesia]
3. [kalimat hiragana] - [arti Indonesia]`;
      
      const response = await azureOpenAI.getChatResponse([{ role: 'user', content: prompt }]);
      setAiExplanation(response);
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      setAiExplanation('Maaf, terjadi kesalahan saat mengambil penjelasan AI. Silakan coba lagi.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiQuestionLoading(true);
    setAiAnswer('');
    try {
      const prompt = `Pertanyaan tentang tata bahasa Jepang: ${aiQuestion}. Jawab dalam bahasa Indonesia dengan jelas dan berikan contoh jika diperlukan.`;
      const response = await azureOpenAI.getChatResponse([{ role: 'user', content: prompt }]);
      setAiAnswer(response);
    } catch (error) {
      console.error('Error getting AI answer:', error);
      setAiAnswer('Maaf, terjadi kesalahan saat memproses pertanyaan. Silakan coba lagi.');
    } finally {
      setAiQuestionLoading(false);
    }
  };

  const filteredGrammars = grammars.filter(grammar => 
    (grammar.pattern || grammar.title)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (grammar.meaning || grammar.explanation)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChapterColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Memuat data tata bahasa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <BookOpen className="inline mr-2" />
          Tata Bahasa Jepang
        </h1>
        <p className="text-gray-600">
          Pelajari pola tata bahasa Jepang per bab secara bertahap
        </p>
      </div>

      {/* Chapter Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Bab</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter.number)}
              className={`p-4 rounded-lg font-medium transition-all border-2 ${
                selectedChapter === chapter.number
                  ? `${getChapterColor(index)} text-white shadow-lg scale-105 border-transparent`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-lg font-bold">Bab {chapter.number}</div>
              <div className="text-sm opacity-90">{chapter.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pola tata bahasa..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grammar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGrammars.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {grammars.length === 0 ? 'Belum ada data tata bahasa' : 'Tidak ada pola tata bahasa ditemukan'}
            </h3>
            <p className="text-gray-600">
              {grammars.length === 0 
                ? 'Silakan tambahkan data tata bahasa untuk bab ini di panel admin'
                : 'Coba ubah pencarian atau pilih bab yang berbeda'
              }
            </p>
          </div>
        ) : (
          filteredGrammars.map((grammar) => (
            <div
              key={grammar.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedGrammar(grammar)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{grammar.pattern || grammar.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  getChapterColor(chapters.findIndex(ch => ch.number === selectedChapter))
                } text-white`}>
                  Bab {selectedChapter}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{grammar.meaning || grammar.explanation}</p>
              
              {grammar.usage && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">Penggunaan:</p>
                  <p className="text-sm text-gray-600">{grammar.usage}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-blue-600 text-sm">
                  <span>Lihat detail</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIExplanation(grammar);
                  }}
                  disabled={aiLoading && selectedGrammarForAI === grammar.id}
                  className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm disabled:opacity-50"
                >
                  {aiLoading && selectedGrammarForAI === grammar.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Brain className="h-3 w-3" />
                  )}
                  <span>AI</span>
                </button>
              </div>

              {/* AI Explanation for this specific grammar */}
              {selectedGrammarForAI === grammar.id && aiExplanation && (
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Brain className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-semibold text-purple-800">Penjelasan AI</span>
                  </div>
                  <div className="text-sm text-purple-900 leading-relaxed whitespace-pre-line">
                    {aiExplanation}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGrammarForAI(null);
                      setAiExplanation('');
                    }}
                    className="mt-3 text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Sembunyikan penjelasan
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedGrammar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedGrammar.pattern || selectedGrammar.title}</h2>
                <button
                  onClick={() => setSelectedGrammar(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Arti</h3>
                <p className="text-gray-700">{selectedGrammar.meaning || selectedGrammar.explanation}</p>
              </div>

              {selectedGrammar.usage && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Penggunaan</h3>
                  <p className="text-gray-700">{selectedGrammar.usage}</p>
                </div>
              )}

              {selectedGrammar.examples && selectedGrammar.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contoh Kalimat</h3>
                  <div className="space-y-4">
                    {selectedGrammar.examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-lg font-medium text-gray-900 mb-2">{example.sentence}</p>
                        <p className="text-gray-600 mb-2">{example.reading}</p>
                        <p className="text-blue-800">{example.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedGrammar(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Quick Access */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-600" />
          AI Grammar Assistant
        </h2>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
            Tanya AI tentang Bab {selectedChapter}
          </h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Contoh: Bagaimana cara menggunakan pola grammar ini?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
              />
              <button
                onClick={handleAIQuestion}
                disabled={!aiQuestion.trim() || aiQuestionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {aiQuestionLoading ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            
            {aiAnswer && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 max-h-32 overflow-y-auto">
                <div className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                  {aiAnswer}
                </div>
              </div>
            )}

            {aiExplanation && !selectedGrammarForAI && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 max-h-32 overflow-y-auto">
                <div className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">
                  <strong>AI Explanation:</strong><br />
                  {aiExplanation}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Pembelajaran</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{filteredGrammars.length}</div>
            <div className="text-sm text-gray-600">Pola Tersedia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{selectedChapter}</div>
            <div className="text-sm text-gray-600">Bab Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{grammars.length}</div>
            <div className="text-sm text-gray-600">Total Pola Bab</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{chapters.length}</div>
            <div className="text-sm text-gray-600">Total Bab</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarLearning;