import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Brain, 
  Volume2, 
  Search, 
  Filter, 
  BarChart3, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Lightbulb, 
  Users, 
  Bookmark, 
  Share2, 
  Heart, 
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Eye,
  Download,
  Copy,
  ExternalLink,
  List,
  Grid,
  Layers,
  FileText,
  HelpCircle,
  Info
} from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { azureOpenAI } from '../../services/azureOpenAI';
import { Kanji } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import AudioPlayer from '../common/AudioPlayer';

const KanjiLearning: React.FC = () => {
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [studyMode, setStudyMode] = useState<'learn' | 'practice' | 'test'>('learn');
  const [progress, setProgress] = useState({ learned: 0, total: 0 });
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const grades = [
    { id: 1, label: 'Grade 1', description: 'Basic kanji (80 characters)', color: 'bg-green-100 text-green-800' },
    { id: 2, label: 'Grade 2', description: 'Elementary kanji (160 characters)', color: 'bg-blue-100 text-blue-800' },
    { id: 3, label: 'Grade 3', description: 'Intermediate kanji (200 characters)', color: 'bg-yellow-100 text-yellow-800' },
    { id: 4, label: 'Grade 4', description: 'Advanced kanji (202 characters)', color: 'bg-orange-100 text-orange-800' },
    { id: 5, label: 'Grade 5', description: 'Complex kanji (193 characters)', color: 'bg-red-100 text-red-800' },
    { id: 6, label: 'Grade 6', description: 'Expert kanji (191 characters)', color: 'bg-purple-100 text-purple-800' },
  ];

  useEffect(() => {
    loadKanjiByGrade();
  }, [selectedGrade]);

  const loadKanjiByGrade = async () => {
    try {
      setLoading(true);
      const kanjiData = await firestoreService.getKanjiByGrade(selectedGrade);
      setKanjis(kanjiData);
      setCurrentIndex(0);
      setSelectedKanji(kanjiData[0] || null);
      setAiExplanation('');
      
      // Update progress
      const learnedCount = kanjiData.filter(k => k.learned).length;
      setProgress({ learned: learnedCount, total: kanjiData.length });
    } catch (error) {
      console.error('Error loading kanji:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIExplanation = async () => {
    if (!selectedKanji) return;
    
    setExplanationLoading(true);
    try {
      const prompt = `Jelaskan kanji "${selectedKanji.character}" dengan detail. Berikan:
1. Arti dan makna kanji
2. Cara membaca (onyomi dan kunyomi)
3. Contoh penggunaan dalam kata
4. Tips mengingat kanji ini
5. Kanji yang mirip dan cara membedakannya

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

  const filteredKanjis = kanjis.filter(kanji => {
    const matchesSearch = kanji.character.includes(searchTerm) ||
                         kanji.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kanji.onyomi.some(reading => reading.includes(searchTerm)) ||
                         kanji.kunyomi.some(reading => reading.includes(searchTerm));
    
    return matchesSearch;
  });

  const nextKanji = () => {
    if (currentIndex < filteredKanjis.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedKanji(filteredKanjis[currentIndex + 1]);
      setAiExplanation('');
    }
  };

  const prevKanji = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedKanji(filteredKanjis[currentIndex - 1]);
      setAiExplanation('');
    }
  };

  const toggleLearned = async (kanji: Kanji) => {
    try {
      await firestoreService.updateKanjiProgress(kanji.id, !kanji.learned);
      await loadKanjiByGrade();
    } catch (error) {
      console.error('Error updating kanji progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanji Learning</h1>
        <p className="text-gray-600">Master Japanese kanji characters step by step</p>
      </div>

      {/* Grade Selection */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {grades.map(grade => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedGrade === grade.id
                  ? grade.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {grade.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Progress</h2>
            <span className="text-sm text-gray-500">{progress.learned} / {progress.total} learned</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.learned / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanji List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Kanji List</h2>
              <span className="text-sm text-gray-500">{filteredKanjis.length} characters</span>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search kanji..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Kanji Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {filteredKanjis.map((kanji, index) => (
                <div
                  key={kanji.id}
                  className={`relative aspect-square border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                    selectedKanji?.id === kanji.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => {
                    setSelectedKanji(kanji);
                    setCurrentIndex(index);
                    setAiExplanation('');
                  }}
                >
                  <span className="text-2xl font-bold text-gray-900">{kanji.character}</span>
                  {kanji.learned && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanji Detail */}
        <div className="lg:col-span-2">
          {selectedKanji ? (
            <div className="space-y-6">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevKanji}
                  disabled={currentIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {filteredKanjis.length}
                </span>

                <button
                  onClick={nextKanji}
                  disabled={currentIndex === filteredKanjis.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="text-8xl font-bold text-gray-900 mb-4">
                    {selectedKanji.character}
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Grade {selectedGrade}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedKanji.meaning}</h2>
                  <button
                    onClick={() => toggleLearned(selectedKanji)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedKanji.learned
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedKanji.learned ? 'Learned' : 'Mark as Learned'}
                  </button>
                </div>

                {/* Readings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Onyomi (音読み)</h3>
                    <div className="space-y-2">
                      {selectedKanji.onyomi.map((reading, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-medium">
                            {reading}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Kunyomi (訓読み)</h3>
                    <div className="space-y-2">
                      {selectedKanji.kunyomi.map((reading, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                            {reading}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Examples */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedKanji.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-lg font-medium text-gray-900 mb-1">{example.word}</p>
                        <p className="text-sm text-gray-600 mb-2">{example.reading}</p>
                        <p className="text-sm text-gray-800">{example.meaning}</p>
                        {example.audioUrl && (
                          <div className="mt-2">
                            <AudioPlayer audioUrl={example.audioUrl} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">AI Explanation</h3>
                    <button
                      onClick={handleAIExplanation}
                      disabled={explanationLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
                    >
                      <Brain className="h-5 w-5" />
                      <span>Get AI Explanation</span>
                    </button>
                  </div>

                  {explanationLoading && (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  )}

                  {aiExplanation && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {aiExplanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Kanji</h3>
                <p className="text-gray-600">Choose a kanji from the list to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanjiLearning;