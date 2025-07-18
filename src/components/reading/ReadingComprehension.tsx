import React, { useState, useEffect } from 'react';
import { ReadingText, ComprehensionQuestion } from '../../types/reading';
import { readingTexts, getReadingTextsByDifficulty } from '../../data/readingContent';
import FuriganaText from './FuriganaText';
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Award,
  Volume2
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ReadingComprehension: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [availableTexts, setAvailableTexts] = useState<ReadingText[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('base');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [comprehensionScore, setComprehensionScore] = useState(0);

  useEffect(() => {
    const texts = getReadingTextsByDifficulty(selectedDifficulty);
    setAvailableTexts(texts);
    setCurrentTextIndex(0);
    resetReading();
  }, [selectedDifficulty]);

  useEffect(() => {
    resetReading();
  }, [currentTextIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReading && readingStartTime) {
      interval = setInterval(() => {
        setReadingTime(Math.floor((new Date().getTime() - readingStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReading, readingStartTime]);

  const currentText = availableTexts[currentTextIndex];

  const resetReading = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setReadingStartTime(null);
    setReadingTime(0);
    setIsReading(false);
    setShowVocabulary(false);
    setShowGrammar(false);
    setComprehensionScore(0);
  };

  const startReading = () => {
    setReadingStartTime(new Date());
    setIsReading(true);
  };

  const finishReading = () => {
    setIsReading(false);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswers = () => {
    if (!currentText) return;

    let correctCount = 0;
    currentText.comprehensionQuestions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer && parseInt(userAnswer) === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / currentText.comprehensionQuestions.length) * 100;
    setComprehensionScore(score);
    setShowResults(true);
  };

  const nextText = () => {
    if (currentTextIndex < availableTexts.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
    }
  };

  const previousText = () => {
    if (currentTextIndex > 0) {
      setCurrentTextIndex(currentTextIndex - 1);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (availableTexts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentText) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Teks Bacaan</h3>
          <p className="text-gray-600">Pilih tingkat kesulitan yang berbeda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Pemahaman Bacaan</h2>
          
          <div className="flex items-center space-x-4">
            {/* Difficulty Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tingkat:</span>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedDifficulty === level
                      ? level === 'beginner' ? 'bg-green-600 text-white' :
                        level === 'intermediate' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level === 'beginner' ? 'Pemula' :
                   level === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                </button>
              ))}
            </div>

            {/* Reading Timer */}
            {isReading && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {formatTime(readingTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Text Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{currentText.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>~{currentText.estimatedReadingTime} menit</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className={`px-2 py-1 rounded-full ${
              currentText.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              currentText.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentText.difficulty === 'beginner' ? 'Pemula' :
               currentText.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
            </span>
            
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {currentText.category}
            </span>
            
            <span className="text-gray-600">
              {currentTextIndex + 1} dari {availableTexts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Text */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Text Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFurigana(!showFurigana)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  showFurigana ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showFurigana ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Furigana</span>
              </button>

              <button
                onClick={() => speakText(currentText.content.replace(/\{[^}]*\}/g, ''))}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Volume2 className="h-4 w-4" />
                <span>Baca</span>
              </button>
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ukuran:</span>
              {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 rounded text-sm ${
                    fontSize === size ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {size === 'sm' ? 'S' : size === 'base' ? 'M' : 
                   size === 'lg' ? 'L' : size === 'xl' ? 'XL' : 'XXL'}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Text */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            {!isReading && !showResults && (
              <div className="text-center py-8">
                <button
                  onClick={startReading}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mx-auto"
                >
                  <Play className="h-5 w-5" />
                  <span>Mulai Membaca</span>
                </button>
              </div>
            )}

            {isReading && (
              <>
                <FuriganaText
                  content={showFurigana ? currentText.furiganaContent : currentText.content}
                  showFurigana={showFurigana}
                  fontSize={fontSize}
                  className="leading-relaxed"
                />
                
                <div className="text-center mt-6">
                  <button
                    onClick={finishReading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                  >
                    <Pause className="h-5 w-5" />
                    <span>Selesai Membaca</span>
                  </button>
                </div>
              </>
            )}

            {!isReading && readingTime > 0 && !showResults && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Waktu membaca: {formatTime(readingTime)}
                </p>
                
                <FuriganaText
                  content={showFurigana ? currentText.furiganaContent : currentText.content}
                  showFurigana={showFurigana}
                  fontSize={fontSize}
                  className="leading-relaxed mb-6"
                />
              </div>
            )}
          </div>

          {/* Translation */}
          {!isReading && readingTime > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Terjemahan:</h4>
              <p className="text-blue-800">{currentText.translation}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Vocabulary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <button
              onClick={() => setShowVocabulary(!showVocabulary)}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-medium text-gray-900">Kosakata</h4>
              {showVocabulary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            {showVocabulary && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentText.vocabulary.map((vocab, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{vocab.word} ({vocab.reading})</div>
                    <div className="text-gray-600">{vocab.meaning}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grammar Points */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <button
              onClick={() => setShowGrammar(!showGrammar)}
              className="flex items-center justify-between w-full mb-4"
            >
              <h4 className="font-medium text-gray-900">Tata Bahasa</h4>
              {showGrammar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            {showGrammar && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {currentText.grammarPoints.map((grammar, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium text-purple-700">{grammar.pattern}</div>
                    <div className="text-gray-600 mb-1">{grammar.explanation}</div>
                    <div className="text-xs text-gray-500">{grammar.example} → {grammar.translation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprehension Questions */}
      {!isReading && readingTime > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Soal Pemahaman</h3>
          
          {!showResults ? (
            <div className="space-y-6">
              {currentText.comprehensionQuestions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex.toString()}
                          onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="text-center">
                <button
                  onClick={submitAnswers}
                  disabled={Object.keys(userAnswers).length !== currentText.comprehensionQuestions.length}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Jawaban
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results Summary */}
              <div className={`p-4 rounded-lg ${
                comprehensionScore >= 70 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {comprehensionScore >= 70 ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-orange-600" />
                  )}
                  <span className={`text-lg font-semibold ${
                    comprehensionScore >= 70 ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    Skor: {Math.round(comprehensionScore)}%
                  </span>
                </div>
                <p className={`text-sm ${
                  comprehensionScore >= 70 ? 'text-green-700' : 'text-orange-700'
                }`}>
                  Waktu membaca: {formatTime(readingTime)} 
                  ({comprehensionScore >= 70 ? 'Bagus sekali!' : 'Perlu latihan lebih lanjut'})
                </p>
              </div>

              {/* Answer Review */}
              {currentText.comprehensionQuestions.map((question, index) => {
                const userAnswer = parseInt(userAnswers[question.id] || '-1');
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {index + 1}. {question.question}
                    </h4>
                    
                    <div className="space-y-2 mb-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`p-2 rounded ${
                          optionIndex === question.correctAnswer ? 'bg-green-100 border border-green-300' :
                          optionIndex === userAnswer && !isCorrect ? 'bg-red-100 border border-red-300' :
                          'bg-gray-50'
                        }`}>
                          <span className="text-gray-700">{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                          )}
                          {optionIndex === userAnswer && !isCorrect && (
                            <XCircle className="h-4 w-4 text-red-600 inline ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <strong>Penjelasan:</strong> {question.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={previousText}
            disabled={currentTextIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          <button
            onClick={resetReading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={nextText}
            disabled={currentTextIndex === availableTexts.length - 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingComprehension;