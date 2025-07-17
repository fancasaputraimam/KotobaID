import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Filter, 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Brain,
  Volume2,
  Star,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  Bookmark,
  Heart,
  Shuffle,
  Play,
  Pause,
  Languages,
  Lightbulb,
  FileText,
  Target,
  Zap
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { azureOpenAI } from '../../services/azureOpenAI';
import { Vocabulary, Chapter } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import AudioPlayer from '../common/AudioPlayer';

const VocabularyLearning: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [filteredVocabularies, setFilteredVocabularies] = useState<Vocabulary[]>([]);
  const [paginatedVocabularies, setPaginatedVocabularies] = useState<Vocabulary[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [category, setCategory] = useState<'chapter' | 'jlpt'>('chapter');
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N5');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studyMode, setStudyMode] = useState<'list' | 'flashcard' | 'quiz'>('list');
  const [showMeaning, setShowMeaning] = useState(true);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [quizMode, setQuizMode] = useState<'meaning' | 'reading'>('meaning');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const itemsPerPage = 25;

  const jlptLevels = [
    { value: 'N5', label: 'N5 (Pemula)', color: 'bg-green-100 text-green-800' },
    { value: 'N4', label: 'N4 (Dasar)', color: 'bg-blue-100 text-blue-800' },
    { value: 'N3', label: 'N3 (Menengah)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'N2', label: 'N2 (Menengah Atas)', color: 'bg-orange-100 text-orange-800' },
    { value: 'N1', label: 'N1 (Lanjutan)', color: 'bg-red-100 text-red-800' }
  ];

  const studyModes = [
    { value: 'list', label: 'Daftar', icon: FileText },
    { value: 'flashcard', label: 'Kartu Flash', icon: Eye },
    { value: 'quiz', label: 'Kuis', icon: Target }
  ];

  useEffect(() => {
    loadChapters();
  }, []);

  useEffect(() => {
    loadVocabularies();
  }, [category, selectedLevel, selectedChapter]);

  useEffect(() => {
    filterVocabularies();
  }, [vocabularies, searchTerm]);

  useEffect(() => {
    paginateVocabularies();
  }, [filteredVocabularies, currentPage]);

  const loadChapters = async () => {
    try {
      const chaptersData = await firestoreService.getAllChapters();
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const loadVocabularies = async () => {
    try {
      setLoading(true);
      let vocabData: Vocabulary[] = [];
      
      if (category === 'chapter') {
        vocabData = await firestoreService.getVocabulariesByChapter(selectedChapter);
      } else {
        vocabData = await firestoreService.getVocabulariesByJLPT(selectedLevel);
      }
      
      setVocabularies(vocabData);
      setCurrentPage(1);
      setCurrentFlashcard(0);
      setScore({ correct: 0, total: 0 });
    } catch (error) {
      console.error('Error loading vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVocabularies = () => {
    const filtered = vocabularies.filter(vocab => 
      vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.reading.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVocabularies(filtered);
  };

  const paginateVocabularies = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedVocabularies(filteredVocabularies.slice(startIndex, endIndex));
  };

  const handleAIExplanation = async (vocabulary: Vocabulary) => {
    setExplanationLoading(true);
    try {
      const prompt = `Jelaskan kosakata bahasa Jepang "${vocabulary.word}" (${vocabulary.reading}) dengan detail. Berikan:
1. Arti dan makna dalam bahasa Indonesia
2. Cara penggunaan dalam kalimat
3. Contoh kalimat (3-5 contoh)
4. Sinonim atau kata yang mirip
5. Tips untuk mengingat kata ini

Jawab dalam bahasa Indonesia dengan detail dan mudah dipahami.`;
      
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

  const nextFlashcard = () => {
    if (currentFlashcard < filteredVocabularies.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setShowMeaning(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1);
      setShowMeaning(false);
    }
  };

  const shuffleFlashcards = () => {
    const shuffled = [...filteredVocabularies].sort(() => Math.random() - 0.5);
    setFilteredVocabularies(shuffled);
    setCurrentFlashcard(0);
    setShowMeaning(false);
  };

  const generateQuizOptions = (correctVocab: Vocabulary) => {
    const options = [correctVocab];
    const otherVocabs = vocabularies.filter(v => v.id !== correctVocab.id);
    
    while (options.length < 4 && otherVocabs.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherVocabs.length);
      options.push(otherVocabs.splice(randomIndex, 1)[0]);
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  const handleQuizAnswer = (answer: string, correct: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === correct;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      nextFlashcard();
    }, 2000);
  };

  const resetQuiz = () => {
    setScore({ correct: 0, total: 0 });
    setCurrentFlashcard(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const totalPages = Math.ceil(filteredVocabularies.length / itemsPerPage);

  const renderListMode = () => (
    <div className="space-y-4">
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-sm text-gray-500">
          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredVocabularies.length)} dari {filteredVocabularies.length} kosakata
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Vocabulary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedVocabularies.map((vocab) => (
          <div key={vocab.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-gray-900">{vocab.word}</h3>
                <button className="text-blue-600 hover:text-blue-800">
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => handleAIExplanation(vocab)}
                className="text-purple-600 hover:text-purple-800"
              >
                <Brain className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-lg text-gray-600 mb-2">{vocab.reading}</p>
              <p className="text-gray-800 font-medium">{vocab.meaning}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                vocab.jlptLevel ? jlptLevels.find(l => l.value === vocab.jlptLevel)?.color : 'bg-gray-100 text-gray-800'
              }`}>
                {vocab.jlptLevel || 'N/A'}
              </span>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-red-500">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-yellow-500">
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFlashcardMode = () => {
    if (filteredVocabularies.length === 0) return null;
    
    const currentVocab = filteredVocabularies[currentFlashcard];
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevFlashcard}
            disabled={currentFlashcard === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {currentFlashcard + 1} / {filteredVocabularies.length}
            </span>
            <button
              onClick={shuffleFlashcards}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={nextFlashcard}
            disabled={currentFlashcard === filteredVocabularies.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-96 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-gray-900 mb-4">{currentVocab.word}</div>
            <div className="text-2xl text-gray-600 mb-6">{currentVocab.reading}</div>
            
            <button
              onClick={() => setShowMeaning(!showMeaning)}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showMeaning ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span>{showMeaning ? 'Sembunyikan Arti' : 'Tampilkan Arti'}</span>
            </button>
          </div>
          
          {showMeaning && (
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-4">{currentVocab.meaning}</div>
              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <span>Tahu</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                  <XCircle className="h-4 w-4" />
                  <span>Belum Tahu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizMode = () => {
    if (filteredVocabularies.length === 0) return null;
    
    const currentVocab = filteredVocabularies[currentFlashcard];
    const options = generateQuizOptions(currentVocab);
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Soal {currentFlashcard + 1} / {filteredVocabularies.length}
            </span>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {score.correct} / {score.total}
              </span>
            </div>
          </div>
          
          <button
            onClick={resetQuiz}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              {quizMode === 'meaning' ? 'Apa arti dari:' : 'Bagaimana cara membaca:'}
            </h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {quizMode === 'meaning' ? currentVocab.word : currentVocab.meaning}
            </div>
            {quizMode === 'meaning' && (
              <div className="text-xl text-gray-600">{currentVocab.reading}</div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuizAnswer(
                  quizMode === 'meaning' ? option.meaning : option.reading,
                  quizMode === 'meaning' ? currentVocab.meaning : currentVocab.reading
                )}
                disabled={showResult}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  showResult
                    ? selectedAnswer === (quizMode === 'meaning' ? option.meaning : option.reading)
                      ? selectedAnswer === (quizMode === 'meaning' ? currentVocab.meaning : currentVocab.reading)
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-red-100 border-red-500 text-red-800'
                      : (quizMode === 'meaning' ? option.meaning : option.reading) === (quizMode === 'meaning' ? currentVocab.meaning : currentVocab.reading)
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                {quizMode === 'meaning' ? option.meaning : option.reading}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pembelajaran Kosakata</h1>
        <p className="text-gray-600">Pelajari kosakata bahasa Jepang secara interaktif</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('chapter')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    category === 'chapter'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Berdasarkan Bab
                </button>
                <button
                  onClick={() => setCategory('jlpt')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    category === 'jlpt'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  JLPT Level
                </button>
              </div>
            </div>

            {/* Level/Chapter Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === 'chapter' ? 'Pilih Bab' : 'Pilih Level JLPT'}
              </label>
              {category === 'chapter' ? (
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      Bab {chapter.id}: {chapter.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {jlptLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedLevel(level.value as any)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        selectedLevel === level.value
                          ? level.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Study Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode Belajar</label>
              <div className="flex flex-wrap gap-2">
                {studyModes.map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setStudyMode(mode.value as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      studyMode === mode.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Kosakata</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan kata, arti, atau bacaan..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        {studyMode === 'list' && renderListMode()}
        {studyMode === 'flashcard' && renderFlashcardMode()}
        {studyMode === 'quiz' && renderQuizMode()}
      </div>

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
                  <XCircle className="h-6 w-6" />
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

export default VocabularyLearning;