import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Brain, 
  Volume2, 
  Copy, 
  Star, 
  Heart, 
  Bookmark, 
  RefreshCw, 
  Target, 
  Award, 
  TrendingUp, 
  Clock, 
  Globe, 
  FileText, 
  Eye, 
  Filter, 
  Settings, 
  Info, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Zap, 
  Users, 
  Calendar, 
  BarChart3, 
  Download, 
  Share2, 
  MessageCircle, 
  ThumbsUp, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Minus, 
  X, 
  Home,
  Shuffle,
  List,
  Grid,
  Tag,
  Hash,
  AtSign,
  Layers,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Save,
  Trash2,
  Play,
  Pause,
  SkipForward,
  SkipBack
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { azureOpenAI } from '../../services/azureOpenAI';

interface KanjiResult {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string[];
  examples?: KanjiExample[];
  grade?: number;
  strokes?: number;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  frequency?: number;
  components?: string[];
  radicals?: string[];
  compounds?: CompoundWord[];
  etymology?: string;
  usage?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
  type: 'onyomi' | 'kunyomi' | 'compound';
}

interface CompoundWord {
  word: string;
  reading: string;
  meaning: string;
  level: string;
}

interface SearchHistory {
  kanji: string;
  timestamp: Date;
  result: KanjiResult;
}

function isSingleKanji(str: string) {
  return str.length === 1 && /[一-龯]/.test(str);
}

const KanjiSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<KanjiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [searchType, setSearchType] = useState<'kanji' | 'meaning' | 'reading' | 'ai'>('kanji');
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'favorites'>('search');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const searchTypes = [
    { value: 'kanji', label: 'Karakter Kanji', icon: FileText },
    { value: 'meaning', label: 'Arti', icon: Globe },
    { value: 'reading', label: 'Bacaan', icon: Volume2 },
    { value: 'ai', label: 'Pencarian AI', icon: Brain }
  ];

  const popularKanji = [
    '愛', '美', '心', '光', '水', '火', '木', '金', '土', '日', '月', '星',
    '花', '山', '海', '空', '雲', '風', '雨', '雪', '春', '夏', '秋', '冬'
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setShowSuggestions(false);
    
    let kanjiChar = query.trim();
    
    try {
      // Jika input bukan satu karakter kanji, gunakan AI untuk mencari kanji
      if (!isSingleKanji(kanjiChar) || searchType === 'ai') {
        const prompt = `Cari kanji berdasarkan "${kanjiChar}" dalam bahasa Jepang. Berikan respons dalam format JSON berikut:
{
  "kanji": "karakter_kanji",
  "onyomi": ["bacaan_onyomi"],
  "kunyomi": ["bacaan_kunyomi"],
  "meaning": ["arti_dalam_bahasa_indonesia"],
  "examples": [
    {
      "word": "kata_contoh",
      "reading": "bacaan_kata",
      "meaning": "arti_kata",
      "type": "onyomi/kunyomi/compound"
    }
  ],
  "grade": grade_sekolah,
  "strokes": jumlah_goresan,
  "jlptLevel": "N5/N4/N3/N2/N1",
  "compounds": [
    {
      "word": "kata_majemuk",
      "reading": "bacaan",
      "meaning": "arti",
      "level": "tingkat_kesulitan"
    }
  ],
  "etymology": "sejarah_kanji",
  "usage": "cara_penggunaan",
  "difficulty": "easy/medium/hard"
}

Pastikan semua arti dalam bahasa Indonesia yang mudah dipahami.`;

        const response = await azureOpenAI.getChatResponse([
          { role: 'user', content: prompt }
        ]);

        try {
          const aiResult = JSON.parse(response);
          const kanjiResult: KanjiResult = {
            kanji: aiResult.kanji,
            onyomi: aiResult.onyomi || [],
            kunyomi: aiResult.kunyomi || [],
            meaning: aiResult.meaning || [],
            examples: aiResult.examples || [],
            grade: aiResult.grade,
            strokes: aiResult.strokes,
            jlptLevel: aiResult.jlptLevel,
            compounds: aiResult.compounds || [],
            etymology: aiResult.etymology,
            usage: aiResult.usage,
            difficulty: aiResult.difficulty || 'medium'
          };
          
          setResult(kanjiResult);
          
          // Add to search history
          const historyEntry: SearchHistory = {
            kanji: kanjiResult.kanji,
            timestamp: new Date(),
            result: kanjiResult
          };
          setSearchHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
          
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          setError('Terjadi kesalahan saat memproses respons AI. Silakan coba lagi.');
        }
      } else {
        // Fallback untuk pencarian kanji langsung
        const fallbackResult: KanjiResult = {
          kanji: kanjiChar,
          onyomi: [],
          kunyomi: [],
          meaning: ['Arti tidak tersedia'],
          examples: [],
          difficulty: 'medium'
        };
        setResult(fallbackResult);
      }
    } catch (error) {
      console.error('Error searching kanji:', error);
      setError('Terjadi kesalahan saat mencari kanji. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (kanji: string) => {
    setQuery(kanji);
    setSearchType('kanji');
    // Auto-search
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 100);
  };

  const getAIExplanation = async (kanji: string) => {
    setExplanationLoading(true);
    try {
      const prompt = `Berikan penjelasan detail tentang kanji "${kanji}" dalam bahasa Indonesia. Jelaskan:
1. Asal-usul dan sejarah kanji
2. Cara mengingat kanji ini
3. Penggunaan dalam kehidupan sehari-hari
4. Kanji yang serupa dan perbedaannya
5. Tips untuk menghafal
6. Contoh kalimat dalam konteks

Gunakan bahasa Indonesia yang mudah dipahami dan menarik.`;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      setAiExplanation(response);
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      setAiExplanation('Maaf, terjadi kesalahan saat mengambil penjelasan AI.');
    } finally {
      setExplanationLoading(false);
    }
  };

  const toggleFavorite = (kanji: string) => {
    setFavorites(prev => 
      prev.includes(kanji) 
        ? prev.filter(k => k !== kanji)
        : [...prev, kanji]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Teks berhasil disalin ke clipboard!');
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJLPTColor = (level?: string) => {
    switch (level) {
      case 'N5': return 'bg-green-100 text-green-800';
      case 'N4': return 'bg-blue-100 text-blue-800';
      case 'N3': return 'bg-yellow-100 text-yellow-800';
      case 'N2': return 'bg-orange-100 text-orange-800';
      case 'N1': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSearchForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pencarian</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {searchTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                searchType === type.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <type.icon className="h-4 w-4" />
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchType === 'kanji' ? 'Masukkan karakter kanji...' :
              searchType === 'meaning' ? 'Masukkan arti dalam bahasa Indonesia...' :
              searchType === 'reading' ? 'Masukkan bacaan (hiragana/katakana)...' :
              'Deskripsikan kanji yang Anda cari...'
            }
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Cari Kanji</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Search */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Kanji Populer</h4>
        <div className="flex flex-wrap gap-2">
          {popularKanji.slice(0, 12).map(kanji => (
            <button
              key={kanji}
              onClick={() => handleQuickSearch(kanji)}
              className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors font-medium"
            >
              {kanji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-8xl font-bold text-orange-600">{result.kanji}</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {result.difficulty && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>
                    {result.difficulty === 'easy' ? 'Mudah' : 
                     result.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                  </span>
                )}
                {result.jlptLevel && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJLPTColor(result.jlptLevel)}`}>
                    {result.jlptLevel}
                  </span>
                )}
                {result.grade && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Grade {result.grade}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {result.strokes && <span>Goresan: {result.strokes}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(result.kanji)}
              className={`p-2 rounded-full ${
                favorites.includes(result.kanji) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className="h-5 w-5" fill={favorites.includes(result.kanji) ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => copyToClipboard(result.kanji)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={() => getAIExplanation(result.kanji)}
              className="p-2 text-purple-600 hover:text-purple-800"
            >
              <Brain className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Arti</h3>
            <div className="space-y-1">
              {result.meaning.map((meaning, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span className="text-gray-700">{meaning}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bacaan</h3>
            <div className="space-y-3">
              {result.onyomi.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Onyomi (音読み)</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.onyomi.map((reading, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-mono">
                        {reading}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {result.kunyomi.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Kunyomi (訓読み)</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.kunyomi.map((reading, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                        {reading}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Examples */}
        {result.examples && result.examples.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contoh Penggunaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.examples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium text-gray-900">{example.word}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      example.type === 'onyomi' ? 'bg-red-100 text-red-800' :
                      example.type === 'kunyomi' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {example.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{example.reading}</p>
                  <p className="text-sm text-gray-800">{example.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compound Words */}
        {result.compounds && result.compounds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kata Majemuk</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.compounds.map((compound, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium text-gray-900">{compound.word}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {compound.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{compound.reading}</p>
                  <p className="text-sm text-gray-800">{compound.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Etymology and Usage */}
        {(result.etymology || result.usage) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.etymology && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Etimologi</h3>
                <p className="text-gray-700 leading-relaxed">{result.etymology}</p>
              </div>
            )}
            
            {result.usage && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cara Penggunaan</h3>
                <p className="text-gray-700 leading-relaxed">{result.usage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Pencarian</h3>
      {searchHistory.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada riwayat pencarian</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchHistory.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-orange-600">{item.kanji}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.result.meaning.slice(0, 3).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.timestamp.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleQuickSearch(item.kanji)}
                className="text-orange-600 hover:text-orange-800"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kanji Favorit</h3>
      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada kanji favorit</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {favorites.map((kanji, index) => (
            <button
              key={index}
              onClick={() => handleQuickSearch(kanji)}
              className="aspect-square bg-orange-50 rounded-lg flex items-center justify-center text-2xl font-bold text-orange-600 hover:bg-orange-100 transition-colors"
            >
              {kanji}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pencarian Kanji</h1>
        <p className="text-gray-600">Cari dan pelajari kanji bahasa Jepang dengan bantuan AI</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pencarian
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Riwayat ({searchHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Favorit ({favorites.length})
          </button>
        </div>
      </div>

      {activeTab === 'search' && (
        <>
          {renderSearchForm()}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {result && renderResult()}
        </>
      )}

      {activeTab === 'history' && renderHistory()}
      {activeTab === 'favorites' && renderFavorites()}

      {/* AI Explanation Modal */}
      {aiExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Penjelasan AI</h3>
                <button
                  onClick={() => setAiExplanation('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {explanationLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {aiExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanjiSearchPage; 