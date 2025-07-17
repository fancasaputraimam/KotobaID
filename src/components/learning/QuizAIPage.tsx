import React, { useState, useEffect } from 'react';
import { 
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

interface QuizQuestion {
  id: string;
  type: 'kanji' | 'vocabulary' | 'grammar' | 'reading' | 'listening';
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  source: string;
}

interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestion: number;
  score: number;
  timeStarted: Date;
  timeEnded?: Date;
  answers: { [key: string]: string };
  isCompleted: boolean;
}

const QuizAIPage: React.FC = () => {
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizType, setQuizType] = useState<'mixed' | 'kanji' | 'vocabulary' | 'grammar'>('mixed');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [jlptLevel, setJlptLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'mixed'>('N5');
  const [showSettings, setShowSettings] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);

  const quizTypes = [
    { value: 'mixed', label: 'Campuran', icon: Shuffle },
    { value: 'kanji', label: 'Kanji', icon: BookOpen },
    { value: 'vocabulary', label: 'Kosakata', icon: Globe },
    { value: 'grammar', label: 'Tata Bahasa', icon: FileText }
  ];

  const difficulties = [
    { value: 'easy', label: 'Mudah', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Sulit', color: 'bg-red-100 text-red-800' },
    { value: 'mixed', label: 'Campuran', color: 'bg-blue-100 text-blue-800' }
  ];

  const jlptLevels = [
    { value: 'N5', label: 'N5 (Pemula)', color: 'bg-green-100 text-green-800' },
    { value: 'N4', label: 'N4 (Dasar)', color: 'bg-blue-100 text-blue-800' },
    { value: 'N3', label: 'N3 (Menengah)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'N2', label: 'N2 (Menengah Atas)', color: 'bg-orange-100 text-orange-800' },
    { value: 'N1', label: 'N1 (Lanjutan)', color: 'bg-red-100 text-red-800' },
    { value: 'mixed', label: 'Campuran', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && quizSession && !quizSession.isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, quizSession]);

  const generateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      // Add randomization seed to ensure different results
      const randomSeed = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      
      const prompt = `[ID: ${randomSeed}-${timestamp}] Buatkan ${questionCount} soal kuis bahasa Jepang BARU dan UNIK dengan kriteria SPESIFIK berikut:

KRITERIA WAJIB:
- Tipe soal: ${quizType === 'mixed' ? 'CAMPURAN (40% kanji, 30% kosakata, 30% tata bahasa)' : quizType.toUpperCase()}
- Tingkat kesulitan: ${difficulty === 'mixed' ? 'CAMPURAN (mudah, sedang, sulit)' : difficulty.toUpperCase()}
- Level JLPT: ${jlptLevel === 'mixed' ? 'CAMPURAN (N5-N1)' : jlptLevel.toUpperCase()}

ATURAN SPESIFIK BERDASARKAN PILIHAN USER:
${quizType === 'kanji' ? `
- HANYA soal kanji (arti, bacaan, penggunaan)
- Gunakan kanji sesuai level ${jlptLevel}
- Fokus pada kanji yang sering digunakan
` : ''}
${quizType === 'vocabulary' ? `
- HANYA soal kosakata (arti, penggunaan, sinonim)
- Gunakan kosakata sesuai level ${jlptLevel}
- Fokus pada kata-kata praktis sehari-hari
` : ''}
${quizType === 'grammar' ? `
- HANYA soal tata bahasa (pola, fungsi, penggunaan)
- Gunakan grammar sesuai level ${jlptLevel}
- Fokus pada pola grammar yang sering digunakan
` : ''}
${difficulty === 'easy' ? `
- Soal mudah dengan materi dasar
- Pilihan jawaban yang jelas dan tidak membingungkan
- Penjelasan sederhana dan mudah dipahami
` : ''}
${difficulty === 'medium' ? `
- Soal sedang dengan materi menengah
- Pilihan jawaban yang membutuhkan pemikiran
- Penjelasan yang cukup detail
` : ''}
${difficulty === 'hard' ? `
- Soal sulit dengan materi lanjutan
- Pilihan jawaban yang menantang
- Penjelasan yang komprehensif
` : ''}

PENTING: Buat soal yang BERBEDA dari sebelumnya. Gunakan variasi:
- Kanji yang berbeda-beda
- Kosakata yang bervariasi  
- Pola tata bahasa yang beragam
- Konteks situasi yang berbeda
- Jangan gunakan soal yang sama atau mirip

Format jawaban dalam JSON dengan struktur:
{
  "questions": [
    {
      "id": "1",
      "type": "${quizType === 'mixed' ? 'kanji/vocabulary/grammar sesuai proporsi' : quizType}",
      "question": "Pertanyaan dalam bahasa Indonesia yang SPESIFIK sesuai tipe",
      "options": ["pilihan1", "pilihan2", "pilihan3", "pilihan4"],
      "correct": "jawaban_yang_benar",
      "explanation": "Penjelasan detail mengapa jawaban ini benar",
      "difficulty": "${difficulty === 'mixed' ? 'easy/medium/hard sesuai proporsi' : difficulty}",
      "category": "kategori_soal_spesifik",
      "source": "${jlptLevel === 'mixed' ? 'N5/N4/N3/N2/N1 sesuai proporsi' : jlptLevel}"
    }
  ]
}

Pastikan:
1. Semua pertanyaan dan pilihan dalam bahasa Indonesia
2. Soal SESUAI PERSIS dengan pilihan user (tipe: ${quizType}, kesulitan: ${difficulty}, level: ${jlptLevel})
3. Gunakan materi yang sesuai dengan level yang diminta
4. Penjelasan yang jelas dan edukatif
5. Tingkat kesulitan KONSISTEN dengan pilihan user
6. Jawaban yang akurat dan terpercaya
7. TIDAK mengulang soal yang sama
8. Jika mixed, buat proporsi yang seimbang`;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        console.log('AI Response received:', response);
        const quizData = JSON.parse(response);
        console.log('Quiz data parsed successfully:', quizData);
        
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
          throw new Error('Invalid quiz format: missing questions array');
        }
        
        const newSession: QuizSession = {
          id: Date.now().toString(),
          questions: quizData.questions,
          currentQuestion: 0,
          score: 0,
          timeStarted: new Date(),
          answers: {},
          isCompleted: false
        };
        
        console.log('Quiz session created with', quizData.questions.length, 'questions');
        setQuizSession(newSession);
        setTimeElapsed(0);
        setIsTimerActive(true);
        setSelectedAnswer('');
        setShowResult(false);
        setShowExplanation(false);
        setShowSettings(false);
      } catch (parseError) {
        console.error('Error parsing quiz data:', parseError);
        console.log('Raw response:', response);
        // Generate fallback quiz that respects user selections
        const fallbackQuestions = [];
        
        // Create questions based on user selections
        for (let i = 0; i < questionCount; i++) {
          let question: QuizQuestion;
          
          if (quizType === 'kanji' || (quizType === 'mixed' && Math.random() < 0.4)) {
            // Kanji questions based on JLPT level
            const kanjiByLevel = {
              N5: [
                { kanji: '一', meaning: 'Satu', reading: 'いち' },
                { kanji: '二', meaning: 'Dua', reading: 'に' },
                { kanji: '三', meaning: 'Tiga', reading: 'さん' },
                { kanji: '四', meaning: 'Empat', reading: 'よん' },
                { kanji: '五', meaning: 'Lima', reading: 'ご' },
                { kanji: '六', meaning: 'Enam', reading: 'ろく' },
                { kanji: '七', meaning: 'Tujuh', reading: 'なな' },
                { kanji: '八', meaning: 'Delapan', reading: 'はち' },
                { kanji: '九', meaning: 'Sembilan', reading: 'きゅう' },
                { kanji: '十', meaning: 'Sepuluh', reading: 'じゅう' },
                { kanji: '山', meaning: 'Gunung', reading: 'やま' },
                { kanji: '川', meaning: 'Sungai', reading: 'かわ' },
                { kanji: '月', meaning: 'Bulan', reading: 'つき' },
                { kanji: '日', meaning: 'Hari/Matahari', reading: 'ひ' },
                { kanji: '水', meaning: 'Air', reading: 'みず' },
                { kanji: '火', meaning: 'Api', reading: 'ひ' },
                { kanji: '木', meaning: 'Pohon/Kayu', reading: 'き' },
                { kanji: '金', meaning: 'Emas/Uang', reading: 'きん' },
                { kanji: '土', meaning: 'Tanah', reading: 'つち' },
                { kanji: '空', meaning: 'Langit/Kosong', reading: 'そら' }
              ],
              N4: [
                { kanji: '今', meaning: 'Sekarang', reading: 'いま' },
                { kanji: '時', meaning: 'Waktu', reading: 'じ' },
                { kanji: '年', meaning: 'Tahun', reading: 'ねん' },
                { kanji: '前', meaning: 'Depan', reading: 'まえ' },
                { kanji: '後', meaning: 'Belakang', reading: 'あと' },
                { kanji: '中', meaning: 'Dalam', reading: 'なか' },
                { kanji: '外', meaning: 'Luar', reading: 'そと' },
                { kanji: '上', meaning: 'Atas', reading: 'うえ' },
                { kanji: '下', meaning: 'Bawah', reading: 'した' },
                { kanji: '左', meaning: 'Kiri', reading: 'ひだり' }
              ],
              N3: [
                { kanji: '経', meaning: 'Melalui', reading: 'けい' },
                { kanji: '験', meaning: 'Percobaan', reading: 'けん' },
                { kanji: '説', meaning: 'Penjelasan', reading: 'せつ' },
                { kanji: '論', meaning: 'Teori', reading: 'ろん' },
                { kanji: '制', meaning: 'Sistem', reading: 'せい' },
                { kanji: '政', meaning: 'Politik', reading: 'せい' },
                { kanji: '治', meaning: 'Pemerintahan', reading: 'じ' },
                { kanji: '法', meaning: 'Hukum', reading: 'ほう' },
                { kanji: '権', meaning: 'Hak', reading: 'けん' },
                { kanji: '利', meaning: 'Keuntungan', reading: 'り' }
              ],
              N2: [
                { kanji: '責', meaning: 'Tanggung jawab', reading: 'せき' },
                { kanji: '任', meaning: 'Tugas', reading: 'にん' },
                { kanji: '務', meaning: 'Kewajiban', reading: 'む' },
                { kanji: '職', meaning: 'Pekerjaan', reading: 'しょく' },
                { kanji: '労', meaning: 'Kerja keras', reading: 'ろう' },
                { kanji: '働', meaning: 'Bekerja', reading: 'どう' },
                { kanji: '給', meaning: 'Gaji', reading: 'きゅう' },
                { kanji: '与', meaning: 'Memberikan', reading: 'よ' },
                { kanji: '受', meaning: 'Menerima', reading: 'じゅ' },
                { kanji: '取', meaning: 'Mengambil', reading: 'しゅ' }
              ],
              N1: [
                { kanji: '概', meaning: 'Secara umum', reading: 'がい' },
                { kanji: '略', meaning: 'Singkatan', reading: 'りゃく' },
                { kanji: '傾', meaning: 'Kecenderungan', reading: 'けい' },
                { kanji: '向', meaning: 'Arah', reading: 'こう' },
                { kanji: '構', meaning: 'Struktur', reading: 'こう' },
                { kanji: '造', meaning: 'Pembangunan', reading: 'ぞう' },
                { kanji: '築', meaning: 'Membangun', reading: 'ちく' },
                { kanji: '設', meaning: 'Mendirikan', reading: 'せつ' },
                { kanji: '備', meaning: 'Persiapan', reading: 'び' },
                { kanji: '装', meaning: 'Peralatan', reading: 'そう' }
              ]
            };
            
            const currentLevel = jlptLevel === 'mixed' ? 
              ['N5', 'N4', 'N3', 'N2', 'N1'][Math.floor(Math.random() * 5)] : 
              jlptLevel;
            
            const kanjiData = kanjiByLevel[currentLevel as keyof typeof kanjiByLevel] || kanjiByLevel.N5;
            const selectedKanji = kanjiData[Math.floor(Math.random() * kanjiData.length)];
            
            const wrongOptions = kanjiData
              .filter(k => k.kanji !== selectedKanji.kanji)
              .map(k => k.meaning)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            
            const allOptions = [selectedKanji.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
            
            question = {
              id: (i + 1).toString(),
              type: 'kanji',
              question: `Apa arti dari kanji ${selectedKanji.kanji}?`,
              options: allOptions,
              correct: selectedKanji.meaning,
              explanation: `Kanji ${selectedKanji.kanji} dibaca "${selectedKanji.reading}" dan memiliki arti "${selectedKanji.meaning}". Kanji ini termasuk dalam level ${currentLevel}.`,
              difficulty: difficulty === 'mixed' ? 
                ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any : 
                difficulty,
              category: `Kanji ${currentLevel}`,
              source: currentLevel
            };
          } else if (quizType === 'vocabulary' || (quizType === 'mixed' && Math.random() < 0.3)) {
            // Vocabulary questions
            const vocabData = [
              { word: 'がくせい', meaning: 'Siswa', reading: 'がくせい' },
              { word: 'せんせい', meaning: 'Guru', reading: 'せんせい' },
              { word: 'ともだち', meaning: 'Teman', reading: 'ともだち' },
              { word: 'かぞく', meaning: 'Keluarga', reading: 'かぞく' },
              { word: 'りょうしん', meaning: 'Orang tua', reading: 'りょうしん' }
            ];
            
            const selectedVocab = vocabData[Math.floor(Math.random() * vocabData.length)];
            const wrongOptions = vocabData
              .filter(v => v.word !== selectedVocab.word)
              .map(v => v.meaning)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            
            const allOptions = [selectedVocab.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
            
            question = {
              id: (i + 1).toString(),
              type: 'vocabulary',
              question: `Apa arti dari "${selectedVocab.word}"?`,
              options: allOptions,
              correct: selectedVocab.meaning,
              explanation: `"${selectedVocab.word}" berarti "${selectedVocab.meaning}" dalam bahasa Indonesia.`,
              difficulty: difficulty === 'mixed' ? 
                ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any : 
                difficulty,
              category: 'Kosakata',
              source: jlptLevel === 'mixed' ? 'N5' : jlptLevel
            };
          } else {
            // Grammar questions
            const grammarData = [
              { pattern: 'です', meaning: 'adalah', example: 'わたしは がくせい です' },
              { pattern: 'じゃありません', meaning: 'bukan', example: 'わたしは せんせい じゃありません' },
              { pattern: 'ます', meaning: 'bentuk sopan verb', example: 'わたしは たべます' },
              { pattern: 'ません', meaning: 'tidak (bentuk sopan)', example: 'わたしは たべません' },
              { pattern: 'が好きです', meaning: 'suka', example: 'わたしは すしが好きです' }
            ];
            
            const selectedGrammar = grammarData[Math.floor(Math.random() * grammarData.length)];
            const wrongOptions = grammarData
              .filter(g => g.pattern !== selectedGrammar.pattern)
              .map(g => g.meaning)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            
            const allOptions = [selectedGrammar.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
            
            question = {
              id: (i + 1).toString(),
              type: 'grammar',
              question: `Apa fungsi dari pola tata bahasa "${selectedGrammar.pattern}"?`,
              options: allOptions,
              correct: selectedGrammar.meaning,
              explanation: `Pola "${selectedGrammar.pattern}" digunakan untuk menyatakan "${selectedGrammar.meaning}". Contoh: ${selectedGrammar.example}`,
              difficulty: difficulty === 'mixed' ? 
                ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any : 
                difficulty,
              category: 'Tata Bahasa',
              source: jlptLevel === 'mixed' ? 'N5' : jlptLevel
            };
          }
          
          fallbackQuestions.push(question);
        }
        
        const fallbackQuiz: QuizSession = {
          id: Date.now().toString(),
          questions: fallbackQuestions,
          currentQuestion: 0,
          score: 0,
          timeStarted: new Date(),
          answers: {},
          isCompleted: false
        };
        setQuizSession(fallbackQuiz);
        setTimeElapsed(0);
        setIsTimerActive(true);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Terjadi kesalahan saat membuat kuis. Silakan coba lagi.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const generateNewQuiz = () => {
    // Force new quiz generation with different seed
    setQuizSession(null);
    setSelectedAnswer('');
    setShowResult(false);
    setShowExplanation(false);
    setTimeElapsed(0);
    setIsTimerActive(false);
    
    // Add small delay to ensure different timestamp
    setTimeout(() => {
      generateQuiz();
    }, 100);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!quizSession || !selectedAnswer) return;

    const currentQ = quizSession.questions[quizSession.currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct;
    
    const updatedAnswers = {
      ...quizSession.answers,
      [currentQ.id]: selectedAnswer
    };

    setQuizSession({
      ...quizSession,
      answers: updatedAnswers,
      score: quizSession.score + (isCorrect ? 1 : 0)
    });

    setShowResult(true);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!quizSession) return;

    const nextQuestion = quizSession.currentQuestion + 1;
    
    if (nextQuestion >= quizSession.questions.length) {
      // Quiz selesai
      setQuizSession({
        ...quizSession,
        isCompleted: true,
        timeEnded: new Date()
      });
      setIsTimerActive(false);
    } else {
      // Pertanyaan berikutnya
      setQuizSession({
        ...quizSession,
        currentQuestion: nextQuestion
      });
      setSelectedAnswer('');
      setShowResult(false);
      setShowExplanation(false);
    }
  };

  const handleRestartQuiz = () => {
    setQuizSession(null);
    setSelectedAnswer('');
    setShowResult(false);
    setShowExplanation(false);
    setTimeElapsed(0);
    setIsTimerActive(false);
    setAiExplanation('');
  };

  const getDetailedExplanation = async (question: QuizQuestion) => {
    setExplanationLoading(true);
    try {
      const prompt = `Berikan penjelasan detail untuk soal kuis bahasa Jepang berikut:

Pertanyaan: ${question.question}
Jawaban yang benar: ${question.correct}
Tipe soal: ${question.type}
Tingkat kesulitan: ${question.difficulty}

Mohon berikan penjelasan yang mencakup:
1. Mengapa jawaban ini benar
2. Penjelasan konsep yang terkait
3. Contoh penggunaan lain
4. Tips untuk mengingat
5. Kesalahan umum yang mungkin terjadi

Gunakan bahasa Indonesia yang mudah dipahami.`;

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
    if (percentage >= 90) return 'Sempurna! Anda menguasai materi dengan baik!';
    if (percentage >= 80) return 'Bagus sekali! Teruskan belajar!';
    if (percentage >= 70) return 'Lumayan baik! Masih ada ruang untuk perbaikan.';
    if (percentage >= 60) return 'Cukup baik, tapi perlu lebih banyak latihan.';
    return 'Perlu belajar lebih giat lagi. Jangan menyerah!';
  };

  // Render Settings Panel
  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pengaturan Kuis</h3>
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
            {/* Quiz Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kuis</label>
              <div className="grid grid-cols-2 gap-2">
                {quizTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setQuizType(type.value as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                      quizType === type.value
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

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value as any)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      difficulty === diff.value
                        ? diff.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-sm">{diff.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* JLPT Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level JLPT</label>
              <div className="grid grid-cols-3 gap-2">
                {jlptLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setJlptLevel(level.value as any)}
                    className={`px-2 py-2 rounded-lg font-medium transition-all ${
                      jlptLevel === level.value
                        ? level.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xs">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

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
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setQuestionCount(Math.min(50, questionCount + 5))}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={generateQuiz}
          disabled={generatingQuiz}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {generatingQuiz ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Membuat Kuis...</span>
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              <span>Buat Kuis AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render Quiz Question
  const renderQuiz = () => {
    if (!quizSession) return null;

    const currentQuestion = quizSession.questions[quizSession.currentQuestion];
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Soal {quizSession.currentQuestion + 1} dari {quizSession.questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{quizSession.score} / {quizSession.currentQuestion + (showResult ? 1 : 0)}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((quizSession.currentQuestion + 1) / quizSession.questions.length) * 100}%` }}
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
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentQuestion.type === 'kanji' ? 'Kanji' :
                 currentQuestion.type === 'vocabulary' ? 'Kosakata' :
                 currentQuestion.type === 'grammar' ? 'Tata Bahasa' :
                 currentQuestion.type === 'reading' ? 'Membaca' : 'Mendengar'}
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
            <p className="text-sm text-gray-600">
              Kategori: {currentQuestion.category} | Sumber: {currentQuestion.source}
            </p>
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
                    ? option === currentQuestion.correct
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
                  {showResult && option === currentQuestion.correct && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && selectedAnswer === option && option !== currentQuestion.correct && (
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
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Jawab</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <span>
                  {quizSession.currentQuestion + 1 >= quizSession.questions.length ? 'Selesai' : 'Soal Berikutnya'}
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
    if (!quizSession || !quizSession.isCompleted) return null;

    const totalQuestions = quizSession.questions.length;
    const correctAnswers = quizSession.score;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = quizSession.timeEnded 
      ? Math.floor((quizSession.timeEnded.getTime() - quizSession.timeStarted.getTime()) / 1000)
      : timeElapsed;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
          <div className="mb-6">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kuis Selesai!</h2>
            <p className="text-gray-600">{getScoreMessage(correctAnswers, totalQuestions)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
              onClick={generateQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Kuis Baru</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kuis AI Kanji</h1>
        <p className="text-gray-600">Uji kemampuan bahasa Jepang Anda dengan kuis yang dibuat oleh AI</p>
      </div>

      {!quizSession && !generatingQuiz && renderSettings()}
      {quizSession && !quizSession.isCompleted && renderQuiz()}
      {quizSession && quizSession.isCompleted && renderResults()}

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

export default QuizAIPage;