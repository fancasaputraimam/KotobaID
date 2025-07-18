import React, { useState, useEffect } from 'react';
import { StudyToolsService } from '../../services/studyToolsService';
import { SentenceAnalysis, Token, GrammarAnalysis } from '../../types/studyTools';
import { 
  Search, 
  BookOpen, 
  Brain, 
  Volume2, 
  Copy, 
  RefreshCw, 
  Layers, 
  Target, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  Clock,
  Hash,
  MessageSquare,
  Zap,
  Play,
  Info
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const SentenceAnalyzer: React.FC = () => {
  const [sentence, setSentence] = useState('');
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarAnalysis | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [examples] = useState([
    'こんにちは、田中さん。',
    '今日は天気がいいですね。',
    '私は学生です。',
    'この本は面白いです。',
    '明日、映画を見に行きます。'
  ]);

  const analyzeSentence = async (inputSentence: string = sentence) => {
    if (!inputSentence.trim()) return;

    setLoading(true);
    try {
      const result = await StudyToolsService.analyzeSentence(inputSentence);
      setAnalysis(result);
      setShowBreakdown(true);
    } catch (error) {
      console.error('Error analyzing sentence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPronunciation = async (text: string, reading?: string) => {
    await StudyToolsService.playPronunciation(text, reading);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getFormalityIcon = (level: string) => {
    switch (level) {
      case 'formal': return <Target className="h-4 w-4 text-blue-600" />;
      case 'polite': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'casual': return <MessageSquare className="h-4 w-4 text-orange-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sentence Analyzer</h2>
              <p className="text-gray-600">Analisis kalimat bahasa Jepang dengan AI</p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Masukkan kalimat bahasa Jepang untuk dianalisis..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg min-h-[120px] resize-none"
              rows={4}
            />
            {sentence && (
              <button
                onClick={() => setSentence('')}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => analyzeSentence()}
              disabled={!sentence.trim() || loading}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
              <span>Analisis</span>
            </button>

            {sentence && (
              <button
                onClick={() => handlePlayPronunciation(sentence)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <Volume2 className="h-4 w-4" />
                <span>Dengarkan</span>
              </button>
            )}
          </div>

          {/* Example Sentences */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Contoh kalimat:</h3>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSentence(example);
                    analyzeSentence(example);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyText(analysis.original)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePlayPronunciation(analysis.original)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{analysis.original}</div>
                  <div className="text-lg text-gray-600 mb-4">{analysis.translation}</div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(analysis.difficulty)}`}>
                      {analysis.difficulty}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getFormalityIcon(analysis.breakdown.formalityLevel)}
                      <span className="text-sm text-gray-600 capitalize">{analysis.breakdown.formalityLevel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{analysis.breakdown.structure}</span>
                    </div>
                  </div>
                </div>

                {/* Cultural Notes */}
                {analysis.breakdown.culturalNotes && analysis.breakdown.culturalNotes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Catatan Budaya
                    </h4>
                    <ul className="space-y-1">
                      {analysis.breakdown.culturalNotes.map((note, idx) => (
                        <li key={idx} className="text-sm text-blue-800">• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Token Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Token</h3>
              
              <div className="space-y-3">
                {analysis.tokens.map((token) => (
                  <div
                    key={token.id}
                    onClick={() => setSelectedToken(token)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedToken?.id === token.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl font-bold text-gray-900">{token.surface}</div>
                        <div className="text-sm text-gray-600">{token.reading}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPronunciation(token.surface, token.reading);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!token.isKnown && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {token.partOfSpeech}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">{token.indonesian}</div>
                    
                    {token.jlptLevel && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {token.jlptLevel}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < token.difficulty ? 'bg-yellow-400' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grammar Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Tata Bahasa</h3>
              
              {analysis.grammar.length > 0 ? (
                <div className="space-y-4">
                  {analysis.grammar.map((grammar) => (
                    <div
                      key={grammar.id}
                      onClick={() => setSelectedGrammar(grammar)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedGrammar?.id === grammar.id
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-900">{grammar.pattern}</div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            grammar.level === 'basic' ? 'bg-green-100 text-green-800' :
                            grammar.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grammar.level}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {grammar.category}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">{grammar.indonesian}</div>
                      <div className="text-sm text-gray-600 italic">{grammar.example}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Tidak ada pola tata bahasa yang terdeteksi</p>
                </div>
              )}
            </div>

            {/* Sentence Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Struktur Kalimat</h3>
              
              <div className="space-y-4">
                {analysis.breakdown.parts.map((part) => (
                  <div key={part.id} className={`p-4 rounded-lg ${getImportanceColor(part.importance)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="font-bold text-gray-900">{part.text}</div>
                        <div className="text-sm text-gray-600">{part.reading}</div>
                      </div>
                      <span className="px-2 py-1 bg-white bg-opacity-75 text-gray-700 rounded text-xs">
                        {part.function}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{part.indonesian}</div>
                    <div className="text-xs text-gray-600 italic">{part.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Selected Token Details */}
            {selectedToken && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Token</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{selectedToken.surface}</div>
                    <div className="text-lg text-gray-600 mb-2">{selectedToken.reading}</div>
                    <div className="text-sm text-gray-700">{selectedToken.indonesian}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {selectedToken.partOfSpeech}
                    </span>
                    {selectedToken.jlptLevel && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {selectedToken.jlptLevel}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Difficulty Level:</div>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full mr-1 ${
                            i < selectedToken.difficulty ? 'bg-yellow-400' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Base Form:</div>
                    <div className="font-medium text-gray-900">{selectedToken.baseForm}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Grammar Details */}
            {selectedGrammar && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Grammar</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xl font-bold text-gray-900 mb-2">{selectedGrammar.pattern}</div>
                    <div className="text-sm text-gray-700 mb-2">{selectedGrammar.explanation}</div>
                    <div className="text-sm text-gray-600">{selectedGrammar.indonesian}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedGrammar.level === 'basic' ? 'bg-green-100 text-green-800' :
                      selectedGrammar.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedGrammar.level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {selectedGrammar.category}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Contoh:</div>
                    <div className="font-medium text-gray-900 italic">{selectedGrammar.example}</div>
                  </div>
                  
                  {selectedGrammar.relatedPatterns.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600 mb-2">Pola Terkait:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedGrammar.relatedPatterns.map((pattern, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Study Suggestions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saran Belajar</h3>
              
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        suggestion.type === 'vocabulary' ? 'bg-blue-100' :
                        suggestion.type === 'grammar' ? 'bg-green-100' :
                        suggestion.type === 'pronunciation' ? 'bg-yellow-100' :
                        'bg-purple-100'
                      }`}>
                        {suggestion.type === 'vocabulary' && <BookOpen className="h-4 w-4 text-blue-600" />}
                        {suggestion.type === 'grammar' && <Brain className="h-4 w-4 text-green-600" />}
                        {suggestion.type === 'pronunciation' && <Volume2 className="h-4 w-4 text-yellow-600" />}
                        {suggestion.type === 'culture' && <Lightbulb className="h-4 w-4 text-purple-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{suggestion.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{suggestion.description}</div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>⏱️ {suggestion.estimatedTime}</span>
                          <span className={`px-2 py-1 rounded ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {suggestion.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Analysis State */}
      {!analysis && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Analisis</h3>
          <p className="text-gray-600">Masukkan kalimat bahasa Jepang untuk mendapatkan analisis mendalam</p>
        </div>
      )}
    </div>
  );
};

export default SentenceAnalyzer;