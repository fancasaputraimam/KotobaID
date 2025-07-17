import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  RefreshCw,
  Volume2,
  Copy,
  BookOpen,
  Globe,
  Brain,
  Lightbulb,
  Star,
  TrendingUp,
  Clock,
  Award,
  Target,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  Share2,
  Bookmark,
  Heart,
  Eye,
  EyeOff,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  List,
  Grid,
  Settings,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Zap,
  Users,
  Calendar,
  BarChart3,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Home,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  VolumeX,
  Volume1,
  Edit,
  Save,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Layers,
  Tag,
  Hash,
  AtSign,
  Phone,
  Mail,
  MapPin,
  Camera,
  Image,
  Film,
  Music,
  Tv,
  Radio,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryLow,
  Power,
  PowerOff
} from 'lucide-react';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';

interface ExampleSentence {
  id: string;
  japanese: string;
  romaji: string;
  indonesian: string;
  context: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category: string;
  audioUrl?: string;
  favorite?: boolean;
}

interface ExampleRequest {
  word: string;
  type: 'kanji' | 'vocabulary' | 'grammar' | 'expression';
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'mixed';
  count: number;
  context: string;
  includeRomaji: boolean;
  includeFurigana: boolean;
}

const ExampleAIPage: React.FC = () => {
  const [examples, setExamples] = useState<ExampleSentence[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ExampleRequest>({
    word: '',
    type: 'vocabulary',
    level: 'N5',
    count: 5,
    context: 'daily',
    includeRomaji: true,
    includeFurigana: true
  });
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [savedExamples, setSavedExamples] = useState<ExampleSentence[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'saved'>('generator');
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);

  const exampleTypes = [
    { value: 'kanji', label: 'Kanji', icon: BookOpen },
    { value: 'vocabulary', label: 'Kosakata', icon: Globe },
    { value: 'grammar', label: 'Tata Bahasa', icon: FileText },
    { value: 'expression', label: 'Ekspresi', icon: MessageCircle }
  ];

  const jlptLevels = [
    { value: 'N5', label: 'N5 (Pemula)', color: 'bg-green-100 text-green-800' },
    { value: 'N4', label: 'N4 (Dasar)', color: 'bg-blue-100 text-blue-800' },
    { value: 'N3', label: 'N3 (Menengah)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'N2', label: 'N2 (Menengah Atas)', color: 'bg-orange-100 text-orange-800' },
    { value: 'N1', label: 'N1 (Lanjutan)', color: 'bg-red-100 text-red-800' },
    { value: 'mixed', label: 'Campuran', color: 'bg-purple-100 text-purple-800' }
  ];

  const contextOptions = [
    { value: 'daily', label: 'Kehidupan Sehari-hari' },
    { value: 'business', label: 'Bisnis & Profesional' },
    { value: 'academic', label: 'Akademik & Pendidikan' },
    { value: 'travel', label: 'Perjalanan & Wisata' },
    { value: 'culture', label: 'Budaya & Tradisi' },
    { value: 'food', label: 'Makanan & Minuman' },
    { value: 'technology', label: 'Teknologi & Internet' },
    { value: 'sports', label: 'Olahraga & Hiburan' },
    { value: 'nature', label: 'Alam & Lingkungan' },
    { value: 'family', label: 'Keluarga & Hubungan' }
  ];

  const generateExamples = async () => {
    if (!currentRequest.word.trim()) {
      alert('Silakan masukkan kata atau frasa yang ingin Anda contohkan.');
      return;
    }

    setLoading(true);
    try {
      const contextLabel = contextOptions.find(c => c.value === currentRequest.context)?.label || 'Umum';
      const typeLabel = exampleTypes.find(t => t.value === currentRequest.type)?.label || 'Kata';
      
      const prompt = `Buatkan ${currentRequest.count} contoh kalimat bahasa Jepang untuk ${typeLabel.toLowerCase()} "${currentRequest.word}" dengan kriteria berikut:
- Level JLPT: ${currentRequest.level === 'mixed' ? 'campuran N5-N1' : currentRequest.level}
- Konteks: ${contextLabel}
- Tipe: ${typeLabel}
- Sertakan furigana: ${currentRequest.includeFurigana ? 'Ya' : 'Tidak'}
- Sertakan romaji: ${currentRequest.includeRomaji ? 'Ya' : 'Tidak'}

Format jawaban dalam JSON dengan struktur:
{
  "examples": [
    {
      "id": "1",
      "japanese": "Kalimat bahasa Jepang${currentRequest.includeFurigana ? ' dengan furigana' : ''}",
      "romaji": "${currentRequest.includeRomaji ? 'Bacaan romaji' : ''}",
      "indonesian": "Terjemahan bahasa Indonesia",
      "context": "Konteks penggunaan dalam bahasa Indonesia",
      "level": "N5/N4/N3/N2/N1",
      "category": "Kategori kalimat (misal: daily_conversation, business_meeting, dll)"
    }
  ]
}

Pastikan:
1. Kalimat bervariasi dan natural
2. Mencakup berbagai situasi dalam konteks yang dipilih
3. Sesuai dengan level JLPT yang diminta
4. ${currentRequest.includeRomaji ? 'Romaji akurat dan mudah dibaca' : ''}
5. Terjemahan Indonesia yang tepat dan natural
6. Konteks yang jelas dan membantu pemahaman
7. Kategori yang sesuai dengan konteks
8. ${currentRequest.includeFurigana ? 'Furigana untuk semua kanji' : 'Tanpa furigana'}`;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const data = JSON.parse(response);
        const newExamples = data.examples.map((example: any) => ({
          ...example,
          favorite: false
        }));
        setExamples(newExamples);
        setCurrentExampleIndex(0);
        
        // Add to generation history
        setGenerationHistory(prev => [currentRequest.word, ...prev.slice(0, 9)]);
      } catch (parseError) {
        console.error('Error parsing examples data:', parseError);
        // Fallback dengan contoh sederhana
        const fallbackExamples: ExampleSentence[] = [
          {
            id: '1',
            japanese: currentRequest.includeFurigana ? 
              `これは${currentRequest.word}です。` : 
              `これは${currentRequest.word}です。`,
            romaji: currentRequest.includeRomaji ? 
              `Kore wa ${currentRequest.word} desu.` : '',
            indonesian: `Ini adalah ${currentRequest.word}.`,
            context: 'Kalimat pengenalan dasar',
            level: 'N5',
            category: 'basic_introduction'
          }
        ];
        setExamples(fallbackExamples);
      }
    } catch (error) {
      console.error('Error generating examples:', error);
      alert('Terjadi kesalahan saat membuat contoh kalimat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
    
    setExamples(prev => 
      prev.map(example => 
        example.id === id 
          ? { ...example, favorite: !example.favorite }
          : example
      )
    );
  };

  const saveExample = (example: ExampleSentence) => {
    setSavedExamples(prev => {
      const exists = prev.find(saved => saved.id === example.id);
      if (exists) return prev;
      return [...prev, { ...example, favorite: true }];
    });
    alert('Contoh kalimat berhasil disimpan!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Teks berhasil disalin ke clipboard!');
  };

  const filteredExamples = examples.filter(example => {
    const matchesSearch = example.japanese.includes(searchTerm) || 
                         example.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.indonesian.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || example.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const categories = [...new Set(examples.map(e => e.category))];

  const renderExampleCard = (example: ExampleSentence, index: number) => (
    <div key={example.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            jlptLevels.find(l => l.value === example.level)?.color || 'bg-gray-100 text-gray-800'
          }`}>
            {example.level}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {example.category.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleFavorite(example.id)}
            className={`p-1 rounded-full ${
              favorites.includes(example.id) 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className="h-4 w-4" fill={favorites.includes(example.id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => copyToClipboard(example.japanese)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => saveExample(example)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium text-gray-900">{example.japanese}</p>
          <button
            onClick={() => setPlayingId(playingId === example.id ? null : example.id)}
            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
        
        {example.romaji && (
          <p className="text-lg text-gray-600 italic">{example.romaji}</p>
        )}
        
        <p className="text-gray-800 font-medium">{example.indonesian}</p>
        
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{example.context}</p>
            <button
              onClick={() => setShowDetails(showDetails === example.id ? null : example.id)}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              {showDetails === example.id ? 'Sembunyikan' : 'Detail'}
            </button>
          </div>
        </div>
      </div>

      {showDetails === example.id && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Analisis Detail</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Struktur:</strong> Kalimat menggunakan pola dasar subjek-objek-predikat</p>
            <p><strong>Tingkat Kesulitan:</strong> {example.level}</p>
            <p><strong>Penggunaan:</strong> {example.context}</p>
            <p><strong>Tips:</strong> Perhatikan penggunaan partikel dan konjugasi kata kerja</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pengaturan Generator</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {showSettings && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kata/Frasa yang ingin dicontohkan
                </label>
                <input
                  type="text"
                  value={currentRequest.word}
                  onChange={(e) => setCurrentRequest(prev => ({ ...prev, word: e.target.value }))}
                  placeholder="Masukkan kata atau frasa..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  {exampleTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setCurrentRequest(prev => ({ ...prev, type: type.value as any }))}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                        currentRequest.type === type.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <type.icon className="h-4 w-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konteks</label>
                <select
                  value={currentRequest.context}
                  onChange={(e) => setCurrentRequest(prev => ({ ...prev, context: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {contextOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level JLPT</label>
                <div className="grid grid-cols-3 gap-2">
                  {jlptLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setCurrentRequest(prev => ({ ...prev, level: level.value as any }))}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        currentRequest.level === level.value
                          ? level.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Contoh: {currentRequest.count}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentRequest(prev => ({ ...prev, count: Math.max(1, prev.count - 1) }))}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={currentRequest.count}
                    onChange={(e) => setCurrentRequest(prev => ({ ...prev, count: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setCurrentRequest(prev => ({ ...prev, count: Math.min(20, prev.count + 1) }))}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Sertakan Romaji</label>
                  <button
                    onClick={() => setCurrentRequest(prev => ({ ...prev, includeRomaji: !prev.includeRomaji }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentRequest.includeRomaji ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentRequest.includeRomaji ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Sertakan Furigana</label>
                  <button
                    onClick={() => setCurrentRequest(prev => ({ ...prev, includeFurigana: !prev.includeFurigana }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentRequest.includeFurigana ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentRequest.includeFurigana ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={generateExamples}
              disabled={loading || !currentRequest.word.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Membuat Contoh...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Buat Contoh Kalimat AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Contoh Kalimat AI</h1>
        <p className="text-gray-600">Generate contoh kalimat bahasa Jepang dengan bantuan AI</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tersimpan ({savedExamples.length})
          </button>
        </div>
      </div>

      {activeTab === 'generator' && (
        <>
          {renderSettings()}

          {examples.length > 0 && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari contoh kalimat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Semua Level</option>
                      {jlptLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Semua Kategori</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      {viewMode === 'card' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Examples Display */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contoh Kalimat ({filteredExamples.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Menampilkan {filteredExamples.length} dari {examples.length} contoh
                    </span>
                  </div>
                </div>

                {filteredExamples.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {examples.length === 0 ? 'Belum Ada Contoh' : 'Tidak Ada Hasil'}
                    </h3>
                    <p className="text-gray-600">
                      {examples.length === 0 
                        ? 'Gunakan generator untuk membuat contoh kalimat'
                        : 'Coba ubah filter pencarian Anda'
                      }
                    </p>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'card' 
                      ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                      : 'space-y-4'
                  }>
                    {filteredExamples.map((example, index) => renderExampleCard(example, index))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Contoh Tersimpan ({savedExamples.length})
            </h3>
          </div>

          {savedExamples.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Contoh Tersimpan</h3>
              <p className="text-gray-600">Simpan contoh kalimat favorit Anda untuk akses mudah</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedExamples.map((example, index) => renderExampleCard(example, index))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExampleAIPage; 