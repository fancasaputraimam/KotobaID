import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Brain, 
  Target, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Play, 
  Pause, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Globe, 
  Volume2, 
  Lightbulb, 
  Zap, 
  Trophy, 
  Medal, 
  Timer, 
  Settings, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Shuffle, 
  Home, 
  BarChart3, 
  FileText, 
  Users, 
  Calendar, 
  Filter, 
  Download, 
  Share2, 
  BookmarkPlus, 
  Heart, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  Search, 
  Plus, 
  Minus, 
  X 
} from 'lucide-react';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';

interface JLPTQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'kanji' | 'reading' | 'listening';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  source: string;
}

interface JLPTSession {
  id: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  questions: JLPTQuestion[];
  currentQuestion: number;
  userAnswers: { [key: string]: string };
  score: number;
  timeStarted: Date;
  timeEnded?: Date;
  isCompleted: boolean;
  totalQuestions: number;
}

const JLPTAIPage: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<JLPTSession | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N5');
  const [selectedType, setSelectedType] = useState<'mixed' | 'grammar' | 'vocabulary' | 'kanji' | 'reading'>('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);

  const jlptLevels = [
    { value: 'N5', label: 'N5 (Pemula)', description: 'Dasar-dasar bahasa Jepang', color: 'bg-green-100 text-green-800' },
    { value: 'N4', label: 'N4 (Dasar)', description: 'Komunikasi sederhana', color: 'bg-blue-100 text-blue-800' },
    { value: 'N3', label: 'N3 (Menengah)', description: 'Komunikasi sehari-hari', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'N2', label: 'N2 (Menengah Atas)', description: 'Topik kompleks', color: 'bg-orange-100 text-orange-800' },
    { value: 'N1', label: 'N1 (Mahir)', description: 'Bahasa akademik & profesional', color: 'bg-red-100 text-red-800' }
  ];

  const questionTypes = [
    { value: 'mixed', label: 'Campuran', icon: Shuffle },
    { value: 'grammar', label: 'Tata Bahasa', icon: BookOpen },
    { value: 'vocabulary', label: 'Kosakata', icon: Globe },
    { value: 'kanji', label: 'Kanji', icon: FileText },
    { value: 'reading', label: 'Membaca', icon: Eye }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && currentSession && !currentSession.isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, currentSession]);

  const generateJLPTQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      // Add randomization for variety
      const randomSeed = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const typeLabel = questionTypes.find(t => t.value === selectedType)?.label || 'Campuran';
      const levelInfo = jlptLevels.find(l => l.value === selectedLevel);
      
      const prompt = `[ID: ${randomSeed}-${timestamp}] Buatkan ${questionCount} soal latihan JLPT level ${selectedLevel} BARU dan BERVARIASI dengan kriteria berikut:
- Tipe soal: ${selectedType === 'mixed' ? 'campuran grammar, vocabulary, kanji, dan reading' : typeLabel}
- Level: ${selectedLevel} (${levelInfo?.description})
- Bahasa Indonesia untuk pertanyaan dan pilihan jawaban
- Sesuai dengan standar JLPT yang sesungguhnya

PENTING: Buat soal yang BERBEDA dan UNIK. Gunakan:
- Materi JLPT yang beragam dan tidak repetitif
- Pola soal yang bervariasi dalam satu set
- Topik dan konteks yang berbeda-beda
- Tingkat kesulitan yang sesuai level ${selectedLevel}
- JANGAN mengulang soal yang sama atau mirip dengan generator sebelumnya

Format jawaban dalam JSON dengan struktur:
{
  "questions": [
    {
      "id": "1",
      "question": "Pertanyaan dalam bahasa Indonesia",
      "options": ["pilihan1", "pilihan2", "pilihan3", "pilihan4"],
      "correctAnswer": "jawaban_yang_benar",
      "explanation": "Penjelasan mengapa jawaban ini benar",
      "type": "grammar/vocabulary/kanji/reading/listening",
      "difficulty": "easy/medium/hard",
      "topic": "topik_soal",
      "source": "referensi_atau_buku"
    }
  ]
}

Pastikan:
1. Soal BERVARIASI dan sesuai level ${selectedLevel}
2. Tidak mengulang pola atau konten yang sama
3. Mencakup berbagai aspek JLPT ${selectedLevel}
4. Tingkat kesulitan konsisten dengan level
5. Penjelasan yang edukatif dan membantu
6. KREATIVITAS tinggi dalam pembuatan soal
7. Menggunakan materi autentik JLPT

Pastikan:
1. Soal sesuai dengan level JLPT yang dipilih
2. Pilihan jawaban realistis dan menantang
3. Penjelasan yang jelas dan edukatif
4. Bahasa Indonesia yang baik dan benar
5. Tingkat kesulitan yang sesuai
6. Topik yang relevan dengan kurikulum JLPT`;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const quizData = JSON.parse(response);
        const newSession: JLPTSession = {
          id: Date.now().toString(),
          level: selectedLevel,
          questions: quizData.questions,
          currentQuestion: 0,
          userAnswers: {},
          score: 0,
          timeStarted: new Date(),
          isCompleted: false,
          totalQuestions: quizData.questions.length
        };
        
        setCurrentSession(newSession);
        setTimeElapsed(0);
        setIsTimerActive(true);
        setSelectedAnswer('');
        setShowResult(false);
        setShowExplanation(false);
        setShowSettings(false);
      } catch (parseError) {
        console.error('Error parsing quiz data:', parseError);
        // Fallback dengan soal contoh
        const fallbackSession: JLPTSession = {
          id: Date.now().toString(),
          level: selectedLevel,
          questions: [
            {
              id: '1',
              question: 'Manakah cara yang benar untuk mengatakan "Saya adalah siswa" dalam bahasa Jepang?',
              options: ['私は学生です', '私は先生です', '私は医者です', '私は会社員です'],
              correctAnswer: '私は学生です',
              explanation: 'がくせい (gakusei) berarti siswa, sedangkan です (desu) adalah kopula yang sopan.',
              type: 'grammar',
              difficulty: 'easy',
              topic: 'Pengenalan Diri',
              source: 'JLPT N5 Dasar'
            }
          ],
          currentQuestion: 0,
          userAnswers: {},
          score: 0,
          timeStarted: new Date(),
          isCompleted: false,
          totalQuestions: 1
        };
        setCurrentSession(fallbackSession);
        setTimeElapsed(0);
        setIsTimerActive(true);
      }
    } catch (error) {
      console.error('Error generating JLPT quiz:', error);
      alert('Terjadi kesalahan saat membuat soal JLPT. Silakan coba lagi.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentSession || !selectedAnswer) return;

    const currentQ = currentSession.questions[currentSession.currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    const updatedAnswers = {
      ...currentSession.userAnswers,
      [currentQ.id]: selectedAnswer
    };

    setCurrentSession({
      ...currentSession,
      userAnswers: updatedAnswers,
      score: currentSession.score + (isCorrect ? 1 : 0)
    });

    setShowResult(true);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!currentSession) return;

    const nextQuestion = currentSession.currentQuestion + 1;
    
    if (nextQuestion >= currentSession.questions.length) {
      // Quiz selesai
      setCurrentSession({
        ...currentSession,
        isCompleted: true,
        timeEnded: new Date()
      });
      setIsTimerActive(false);
    } else {
      // Pertanyaan berikutnya
      setCurrentSession({
        ...currentSession,
        currentQuestion: nextQuestion
      });
      setSelectedAnswer('');
      setShowResult(false);
      setShowExplanation(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentSession(null);
    setSelectedAnswer('');
    setShowResult(false);
    setShowExplanation(false);
    setTimeElapsed(0);
    setIsTimerActive(false);
    setAiExplanation('');
  };

  const getDetailedExplanation = async (question: JLPTQuestion) => {
    setExplanationLoading(true);
    try {
      const prompt = `Berikan penjelasan detail untuk soal JLPT ${selectedLevel} berikut:

Pertanyaan: ${question.question}
Jawaban yang benar: ${question.correctAnswer}
Tipe soal: ${question.type}
Topic: ${question.topic}

Mohon berikan penjelasan yang mencakup:
1. Mengapa jawaban ini benar
2. Analisis pilihan jawaban lainnya
3. Penjelasan konsep yang terkait
4. Contoh penggunaan dalam konteks lain
5. Tips untuk soal serupa
6. Referensi materi JLPT yang relevan

Gunakan bahasa Indonesia yang mudah dipahami dan detail.`;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      setAiExplanation(response);
    } catch (error) {
      console.error('Error getting detailed explanation:', error);
      setAiExplanation('Maaf, terjadi kesalahan saat mengambil penjelasan detail.');
    } finally {
      setExplanationLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'Luar biasa! Kamu sudah siap untuk JLPT!';
    if (percentage >= 80) return 'Bagus sekali! Teruskan belajar!';
    if (percentage >= 70) return 'Lumayan baik! Masih ada ruang untuk perbaikan.';
    if (percentage >= 60) return 'Cukup baik, tapi perlu lebih banyak latihan.';
    return 'Perlu belajar lebih giat lagi. Jangan menyerah!';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return BookOpen;
      case 'vocabulary': return Globe;
      case 'kanji': return FileText;
      case 'reading': return Eye;
      case 'listening': return Volume2;
      default: return FileText;
    }
  };

  // Render Settings Panel
  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pengaturan Latihan JLPT</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {showSettings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            {/* JLPT Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level JLPT</label>
              <div className="grid grid-cols-1 gap-2">
                {jlptLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(level.value as any)}
                    className={`flex items-center justify-between p-3 rounded-lg font-medium transition-all ${
                      selectedLevel === level.value
                        ? level.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm opacity-75">{level.description}</div>
                    </div>
                    <GraduationCap className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Soal</label>
              <div className="grid grid-cols-1 gap-2">
                {questionTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                      selectedType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Soal: {questionCount}
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setQuestionCount(Math.min(30, questionCount + 5))}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Level Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Info Level {selectedLevel}</h4>
              <p className="text-sm text-blue-700">
                {jlptLevels.find(l => l.value === selectedLevel)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={generateJLPTQuiz}
          disabled={generatingQuiz}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {generatingQuiz ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Membuat Soal...</span>
            </>
          ) : (
            <>
              <GraduationCap className="h-5 w-5" />
              <span>Buat Latihan JLPT AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render Quiz Question
  const renderQuiz = () => {
    if (!currentSession) return null;

    const currentQuestion = currentSession.questions[currentSession.currentQuestion];
    const TypeIcon = getTypeIcon(currentQuestion.type);
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Soal {currentSession.currentQuestion + 1} dari {currentSession.questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{currentSession.score} / {currentSession.currentQuestion + (showResult ? 1 : 0)}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSession.currentQuestion + 1) / currentSession.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty === 'easy' ? 'Mudah' : 
                 currentQuestion.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-1">
                <TypeIcon className="h-3 w-3" />
                <span>
                  {currentQuestion.type === 'grammar' ? 'Tata Bahasa' :
                   currentQuestion.type === 'vocabulary' ? 'Kosakata' :
                   currentQuestion.type === 'kanji' ? 'Kanji' :
                   currentQuestion.type === 'reading' ? 'Membaca' : 'Mendengar'}
                </span>
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                jlptLevels.find(l => l.value === currentSession.level)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {currentSession.level}
              </span>
            </div>
            <button
              onClick={() => getDetailedExplanation(currentQuestion)}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
            >
              <Brain className="h-4 w-4" />
              <span className="text-sm">Penjelasan AI</span>
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentQuestion.question}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Topic: {currentQuestion.topic}</span>
              <span>•</span>
              <span>Sumber: {currentQuestion.source}</span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-4 text-left rounded-lg border-2 transition-all ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : selectedAnswer === option
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    : selectedAnswer === option
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && option === currentQuestion.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleRestartQuiz}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Home className="h-4 w-4" />
              <span>Kembali</span>
            </button>

            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Jawab</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>
                  {currentSession.currentQuestion + 1 >= currentSession.questions.length ? 'Selesai' : 'Soal Berikutnya'}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Penjelasan</h4>
            <p className="text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  // Render Quiz Results
  const renderResults = () => {
    if (!currentSession || !currentSession.isCompleted) return null;

    const totalQuestions = currentSession.questions.length;
    const correctAnswers = currentSession.score;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = currentSession.timeEnded 
      ? Math.floor((currentSession.timeEnded.getTime() - currentSession.timeStarted.getTime()) / 1000)
      : timeElapsed;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
          <div className="mb-6">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Latihan JLPT Selesai!</h2>
            <p className="text-gray-600">{getScoreMessage(correctAnswers, totalQuestions)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(correctAnswers, totalQuestions)}`}>
                {correctAnswers} / {totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Jawaban Benar</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(correctAnswers, totalQuestions)}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-600">Persentase</div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(timeTaken)}
              </div>
              <div className="text-sm text-gray-600">Waktu</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {currentSession.level}
              </div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestartQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Home className="h-5 w-5" />
              <span>Kembali ke Menu</span>
            </button>
            <button
              onClick={generateJLPTQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Latihan Baru</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Latihan JLPT AI</h1>
        <p className="text-gray-600">Persiapkan diri untuk ujian JLPT dengan latihan soal yang dibuat oleh AI</p>
      </div>

      {!currentSession && !generatingQuiz && renderSettings()}
      {currentSession && !currentSession.isCompleted && renderQuiz()}
      {currentSession && currentSession.isCompleted && renderResults()}

      {/* AI Explanation Modal */}
      {aiExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Penjelasan Detail AI</h3>
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

export default JLPTAIPage; 