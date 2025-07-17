import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  BookOpen, 
  Search, 
  Filter, 
  BarChart3, 
  Target, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Lightbulb, 
  Users, 
  Volume2, 
  Bookmark, 
  Share2, 
  Heart, 
  MessageCircle,
  Star,
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
import { Grammar, Chapter } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import AudioPlayer from '../common/AudioPlayer';

const GrammarLearning: React.FC = () => {
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedGrammar, setSelectedGrammar] = useState<Grammar | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showExamples, setShowExamples] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrammars();
    loadChapters();
  }, []);

  const loadGrammars = async () => {
    try {
      const grammarData = await firestoreService.getGrammars();
      setGrammars(grammarData);
    } catch (error) {
      console.error('Error loading grammars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    try {
      const chapterData = await firestoreService.getAllChapters();
      setChapters(chapterData);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const handleAIExplanation = async () => {
    if (!selectedGrammar) return;
    
    setExplanationLoading(true);
    try {
      const prompt = `Jelaskan pola grammar bahasa Jepang "${selectedGrammar.pattern}" dengan detail. Berikan:
1. Penjelasan makna dan fungsi
2. Struktur penggunaan
3. Contoh kalimat (3-5 contoh)
4. Tips penggunaan
5. Perbedaan dengan pola similar

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

  const filteredGrammars = grammars.filter(grammar => {
    const matchesSearch = grammar.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grammar.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || grammar.difficulty === difficultyFilter;
    const matchesChapter = selectedChapter === '' || grammar.chapter.toString() === selectedChapter;
    
    return matchesSearch && matchesDifficulty && matchesChapter;
  });

  const nextGrammar = () => {
    if (currentIndex < filteredGrammars.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedGrammar(filteredGrammars[currentIndex + 1]);
      setAiExplanation('');
    }
  };

  const prevGrammar = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedGrammar(filteredGrammars[currentIndex - 1]);
      setAiExplanation('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grammar Learning</h1>
        <p className="text-gray-600">Master Japanese grammar patterns step by step</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grammar List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Grammar Patterns</h2>
              <span className="text-sm text-gray-500">{filteredGrammars.length} patterns</span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patterns..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="">All Chapters</option>
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.number.toString()}>{chapter.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grammar List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGrammars.map((grammar, index) => (
                <div
                  key={grammar.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedGrammar?.id === grammar.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => {
                    setSelectedGrammar(grammar);
                    setCurrentIndex(index);
                    setAiExplanation('');
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{grammar.pattern}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(grammar.difficulty)}`}>
                      {grammar.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{grammar.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grammar Detail */}
        <div className="lg:col-span-2">
          {selectedGrammar ? (
            <div className="space-y-6">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevGrammar}
                  disabled={currentIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {filteredGrammars.length}
                </span>

                <button
                  onClick={nextGrammar}
                  disabled={currentIndex === filteredGrammars.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedGrammar.pattern}</h1>
                  <p className="text-xl text-gray-600">{selectedGrammar.meaning}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-4 ${getDifficultyColor(selectedGrammar.difficulty)}`}>
                    {selectedGrammar.difficulty}
                  </span>
                </div>

                {/* Usage */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedGrammar.usage}</p>
                  </div>
                </div>

                {/* Examples */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
                  <div className="space-y-4">
                    {selectedGrammar.examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-lg font-medium text-gray-900 mb-2">{example.sentence}</p>
                        <p className="text-gray-600 mb-2">{example.reading}</p>
                        <p className="text-blue-800">{example.meaning}</p>
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
                    <h3 className="text-xl font-semibold text-gray-900">AI Deep Dive</h3>
                    <button
                      onClick={handleAIExplanation}
                      disabled={explanationLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Grammar Pattern</h3>
                <p className="text-gray-600">Choose a grammar pattern from the list to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarLearning;