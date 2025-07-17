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
import { firestoreService } from '../../services/firestoreService';
import { azureOpenAI } from '../../services/azureOpenAI';
import { Grammar, Chapter } from '../../types';
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
  selectedGrammar: string;
  chapter: number;
  count: number;
  context: string;
  includeRomaji: boolean;
  includeFurigana: boolean;
}

const ExampleAIPage: React.FC = () => {
  const [examples, setExamples] = useState<ExampleSentence[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ExampleRequest>({
    selectedGrammar: '',
    chapter: 1,
    count: 5,
    context: 'daily',
    includeRomaji: false,
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
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted, loading chapters...');
    loadChapters();
  }, []);

  useEffect(() => {
    console.log('Chapter changed to:', currentRequest.chapter);
    if (currentRequest.chapter) {
      loadGrammars();
    }
  }, [currentRequest.chapter]);

  // Debug state changes
  useEffect(() => {
    console.log('Chapters state updated:', chapters);
    console.log('Chapters length:', chapters.length);
  }, [chapters]);

  const loadChapters = async () => {
    try {
      setChaptersLoading(true);
      console.log('Loading chapters...');
      
      // Try to get chapters from chapters collection first
      let chaptersData = await firestoreService.getAllChapters();
      console.log('Chapters from chapters collection:', chaptersData);
      
      // If no chapters collection, get unique chapters from grammar data
      if (chaptersData.length === 0) {
        console.log('No chapters collection found, getting chapters from grammar data...');
        const grammarsData = await firestoreService.getGrammars();
        console.log('All grammars:', grammarsData);
        
        // Get unique chapter numbers from grammar data
        const uniqueChapters = [...new Set(grammarsData.map(g => g.chapter))].sort((a, b) => a - b);
        console.log('Unique chapters from grammar:', uniqueChapters);
        
        // Create chapter objects from grammar data
        chaptersData = uniqueChapters.map(chapterNum => ({
          id: chapterNum.toString(),
          number: chapterNum,
          title: `Bab ${chapterNum}`,
          description: `Materi Bab ${chapterNum}`,
          grammarTopics: [],
          vocabulary: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      }
      
      console.log('Final chapters data:', chaptersData);
      console.log('Number of chapters:', chaptersData.length);
      
      setChapters(chaptersData);
      if (chaptersData.length > 0) {
        const firstChapter = chaptersData[0];
        console.log('First chapter:', firstChapter);
        setCurrentRequest(prev => {
          console.log('Updating current request with chapter:', firstChapter.number);
          return { ...prev, chapter: firstChapter.number };
        });
      } else {
        console.log('No chapters found in Firestore');
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    } finally {
      setChaptersLoading(false);
    }
  };

  const loadGrammars = async () => {
    try {
      console.log('Loading grammars for chapter:', currentRequest.chapter);
      const grammarsData = await firestoreService.getGrammarByChapter(currentRequest.chapter);
      console.log('Grammars loaded:', grammarsData);
      setGrammars(grammarsData);
      if (grammarsData.length > 0) {
        const firstPattern = grammarsData[0].pattern || grammarsData[0].title;
        setCurrentRequest(prev => {
          console.log('Setting grammar from', prev.selectedGrammar, 'to', firstPattern);
          return { 
            ...prev, 
            selectedGrammar: firstPattern
          };
        });
        console.log('Set initial grammar to:', firstPattern);
      } else {
        console.log('No grammars found for chapter:', currentRequest.chapter);
        setCurrentRequest(prev => ({ ...prev, selectedGrammar: '' }));
      }
    } catch (error) {
      console.error('Error loading grammars:', error);
      setGrammars([]);
      setCurrentRequest(prev => ({ ...prev, selectedGrammar: '' }));
    }
  };


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

  const generatePatternExamples = (pattern: string, count: number): ExampleSentence[] => {
    const vocabulary = {
      people: [
        { jp: 'わたし', id: 'saya' },
        { jp: 'あなた', id: 'kamu' },
        { jp: 'かれ', id: 'dia (laki-laki)' },
        { jp: 'かのじょ', id: 'dia (perempuan)' },
        { jp: 'ともだち', id: 'teman' },
        { jp: 'せんせい', id: 'guru' },
        { jp: 'がくせい', id: 'siswa' },
        { jp: 'かぞく', id: 'keluarga' }
      ],
      things: [
        { jp: 'ほん', id: 'buku' },
        { jp: 'えんぴつ', id: 'pensil' },
        { jp: 'かばん', id: 'tas' },
        { jp: 'でんわ', id: 'telepon' },
        { jp: 'くるま', id: 'mobil' },
        { jp: 'いえ', id: 'rumah' },
        { jp: 'がっこう', id: 'sekolah' },
        { jp: 'みず', id: 'air' }
      ],
      adjectives: [
        { jp: 'おおきい', id: 'besar' },
        { jp: 'ちいさい', id: 'kecil' },
        { jp: 'あつい', id: 'panas' },
        { jp: 'さむい', id: 'dingin' },
        { jp: 'おいしい', id: 'enak' },
        { jp: 'たのしい', id: 'menyenangkan' },
        { jp: 'きれい', id: 'cantik/bersih' },
        { jp: 'あたらしい', id: 'baru' }
      ],
      verbs: [
        { jp: 'たべます', id: 'makan' },
        { jp: 'のみます', id: 'minum' },
        { jp: 'いきます', id: 'pergi' },
        { jp: 'きます', id: 'datang' },
        { jp: 'みます', id: 'melihat' },
        { jp: 'ききます', id: 'mendengar' },
        { jp: 'よみます', id: 'membaca' },
        { jp: 'かきます', id: 'menulis' }
      ]
    };

    const examples: ExampleSentence[] = [];
    const patternLower = pattern.toLowerCase();
    
    for (let i = 0; i < count; i++) {
      let sentence = '';
      let meaning = '';
      let category = 'Grammar';
      
      // Generate based on common grammar patterns
      if (patternLower.includes('です') || patternLower.includes('desu')) {
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const thing = vocabulary.things[Math.floor(Math.random() * vocabulary.things.length)];
        sentence = `${person.jp}は${thing.jp}です。`;
        meaning = `${person.id} adalah ${thing.id}.`;
        category = 'です/である';
      } else if (patternLower.includes('じゃありません') || patternLower.includes('ではありません')) {
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const thing = vocabulary.things[Math.floor(Math.random() * vocabulary.things.length)];
        sentence = `${person.jp}は${thing.jp}じゃありません。`;
        meaning = `${person.id} bukan ${thing.id}.`;
        category = 'Negative です';
      } else if (patternLower.includes('ます')) {
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const verb = vocabulary.verbs[Math.floor(Math.random() * vocabulary.verbs.length)];
        sentence = `${person.jp}は${verb.jp}。`;
        meaning = `${person.id} ${verb.id}.`;
        category = 'Verb ます';
      } else if (patternLower.includes('ません')) {
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const verbBase = vocabulary.verbs[Math.floor(Math.random() * vocabulary.verbs.length)];
        const negativeVerb = verbBase.jp.replace('ます', 'ません');
        sentence = `${person.jp}は${negativeVerb}。`;
        meaning = `${person.id} tidak ${verbBase.id}.`;
        category = 'Negative Verb';
      } else if (patternLower.includes('が好き') || patternLower.includes('がすき')) {
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const thing = vocabulary.things[Math.floor(Math.random() * vocabulary.things.length)];
        sentence = `${person.jp}は${thing.jp}がすきです。`;
        meaning = `${person.id} suka ${thing.id}.`;
        category = 'Preference';
      } else if (patternLower.includes('に行き') || patternLower.includes('にいき')) {
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const place = vocabulary.things[Math.floor(Math.random() * vocabulary.things.length)];
        sentence = `${person.jp}は${place.jp}にいきます。`;
        meaning = `${person.id} pergi ke ${place.id}.`;
        category = 'Movement';
      } else {
        // Default pattern - simple sentence
        const person = vocabulary.people[Math.floor(Math.random() * vocabulary.people.length)];
        const adj = vocabulary.adjectives[Math.floor(Math.random() * vocabulary.adjectives.length)];
        sentence = `${person.jp}は${adj.jp}です。`;
        meaning = `${person.id} ${adj.id}.`;
        category = 'Adjective';
      }

      examples.push({
        id: `example-${i + 1}`,
        japanese: sentence,
        romaji: '', // No romaji as requested
        indonesian: meaning,
        context: 'Generated example',
        level: 'N5',
        category: category
      });
    }

    return examples;
  };

  const generateExamples = async () => {
    console.log('generateExamples called!');
    console.log('Current request:', currentRequest);
    
    if (!currentRequest.selectedGrammar.trim()) {
      alert('Silakan pilih pola tata bahasa terlebih dahulu.');
      return;
    }

    setLoading(true);
    setExamples([]); // Clear previous examples
    
    try {
      // Add randomization seed for variety
      const randomSeed = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const contextLabel = contextOptions.find(c => c.value === currentRequest.context)?.label || 'Umum';
      
      console.log('=== GENERATING NEW EXAMPLES ===');
      console.log('Selected grammar pattern:', currentRequest.selectedGrammar);
      console.log('Chapter:', currentRequest.chapter);
      console.log('Context:', contextLabel);
      console.log('Count:', currentRequest.count);
      console.log('Random seed:', randomSeed);
      
      const prompt = `Buat ${currentRequest.count} contoh kalimat bahasa Jepang menggunakan pola "${currentRequest.selectedGrammar}".

ATURAN:
- Hanya hiragana/katakana (tanpa kanji)
- Ikuti pola "${currentRequest.selectedGrammar}" persis
- Buat ${currentRequest.count} kalimat berbeda

Format jawaban:
1. [kalimat hiragana] = [arti indonesia]
2. [kalimat hiragana] = [arti indonesia]
3. [kalimat hiragana] = [arti indonesia]

Contoh jika pola "じゃありません":
1. わたしはがくせいじゃありません = Saya bukan siswa
2. これはほんじゃありません = Ini bukan buku`;

      // Use real AI service directly
      console.log('Using real AI service for pattern:', currentRequest.selectedGrammar);
      
      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);
      
      console.log('AI Response:', response);
      
      // Parse AI response to extract examples
      const lines = response.split('\n').filter(line => line.trim());
      const examples: ExampleSentence[] = [];
      
      let exampleCount = 0;
      for (const line of lines) {
        if (line.match(/^\d+\.\s*/) && exampleCount < currentRequest.count) {
          const match = line.match(/^\d+\.\s*(.+?)\s*=\s*(.+)$/);
          if (match) {
            const [, japanese, indonesian] = match;
            examples.push({
              id: `ai-example-${exampleCount + 1}`,
              japanese: japanese.trim(),
              romaji: '',
              indonesian: indonesian.trim(),
              context: contextLabel,
              level: 'N5',
              category: 'AI Generated'
            });
            exampleCount++;
          }
        }
      }
      
      // If parsing fails, try alternative parsing
      if (examples.length === 0) {
        const cleanResponse = response.replace(/^\d+\.\s*/gm, '');
        const parts = cleanResponse.split('=');
        if (parts.length >= 2) {
          for (let i = 0; i < parts.length - 1 && i < currentRequest.count; i++) {
            const japanese = parts[i].trim();
            const indonesian = parts[i + 1].split('\n')[0].trim();
            if (japanese && indonesian) {
              examples.push({
                id: `ai-example-${i + 1}`,
                japanese: japanese,
                romaji: '',
                indonesian: indonesian,
                context: contextLabel,
                level: 'N5',
                category: 'AI Generated'
              });
            }
          }
        }
      }
      
      console.log('Parsed examples:', examples);
      setExamples(examples);
      setCurrentExampleIndex(0);
      
      // Add to generation history
      setGenerationHistory(prev => [currentRequest.selectedGrammar, ...prev.slice(0, 9)]);
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
                  Pilih Bab
                </label>
                <select
                  value={currentRequest.chapter}
                  onChange={(e) => setCurrentRequest(prev => ({ ...prev, chapter: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {(() => {
                    console.log('Rendering dropdown - chapters.length:', chapters.length);
                    console.log('Current chapters:', chapters);
                    console.log('Current request chapter:', currentRequest.chapter);
                    console.log('Chapters loading:', chaptersLoading);
                    
                    if (chaptersLoading) {
                      return <option value="">Memuat bab...</option>;
                    }
                    
                    if (chapters.length === 0) {
                      return <option value="">Tidak ada bab tersedia</option>;
                    }
                    
                    return chapters.map(chapter => {
                      console.log('Rendering chapter option:', chapter);
                      return (
                        <option key={chapter.id} value={chapter.number}>
                          Bab {chapter.number}: {chapter.title}
                        </option>
                      );
                    });
                  })()}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Pola Tata Bahasa</label>
                <select
                  value={currentRequest.selectedGrammar}
                  onChange={(e) => setCurrentRequest(prev => ({ ...prev, selectedGrammar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={grammars.length === 0}
                >
                  {grammars.length === 0 ? (
                    <option value="">
                      {currentRequest.chapter ? `Memuat tata bahasa bab ${currentRequest.chapter}...` : 'Pilih bab terlebih dahulu'}
                    </option>
                  ) : (
                    grammars.map(grammar => (
                      <option key={grammar.id} value={grammar.pattern || grammar.title}>
                        {grammar.pattern || grammar.title}
                        {(grammar.meaning || grammar.explanation) && ` - ${(grammar.meaning || grammar.explanation).substring(0, 50)}${(grammar.meaning || grammar.explanation).length > 50 ? '...' : ''}`}
                      </option>
                    ))
                  )}
                </select>
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
            {(() => {
              const isDisabled = loading || !currentRequest.selectedGrammar.trim();
              console.log('Button disabled?', isDisabled);
              console.log('Reason - Loading:', loading);
              console.log('Reason - Selected grammar empty:', !currentRequest.selectedGrammar.trim());
              console.log('Selected grammar value:', `"${currentRequest.selectedGrammar}"`);
              return null;
            })()}
            <button
              onClick={() => {
                console.log('Generate button clicked!');
                console.log('Current request:', currentRequest);
                console.log('Selected grammar:', currentRequest.selectedGrammar);
                console.log('Loading state:', loading);
                generateExamples();
              }}
              disabled={loading || !currentRequest.selectedGrammar.trim()}
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