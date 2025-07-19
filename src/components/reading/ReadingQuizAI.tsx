import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Brain, 
  Target,
  RotateCcw,
  Lightbulb,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ReadingText {
  id: string;
  title: string;
  level: string;
  content: string;
  translation: string;
  vocabulary: Array<{
    word: string;
    reading: string;
    meaning: string;
    pos: string;
  }>;
}

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  category: string;
}

interface ReadingQuizAIProps {
  text: ReadingText;
  readingStats: {
    timeSpent: number;
    wpm: number;
  };
  onComplete: (score: number, totalQuestions: number) => void;
  onRetry: () => void;
}

const ReadingQuizAI: React.FC<ReadingQuizAIProps> = ({ 
  text, 
  readingStats, 
  onComplete, 
  onRetry 
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [questionCache, setQuestionCache] = useState<Map<string, QuizQuestion[]>>(new Map());

  const generateUniqueQuizWithAI = async () => {
    console.log('🚀 Starting NEW AI quiz generation system...');
    setIsGenerating(true);
    setError(null);
    
    try {
      const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
      
      if (!settings.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        throw new Error('Azure OpenAI tidak dikonfigurasi');
      }

      // Create unique cache key
      const cacheKey = `${text.level}_${text.content.slice(0, 50)}_${Date.now()}`;
      
      // Check cache first
      if (questionCache.has(cacheKey)) {
        console.log('📦 Using cached questions');
        setQuestions(questionCache.get(cacheKey)!);
        return;
      }

      // Enhanced prompt system with strict anti-duplication rules
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      
      const prompt = `SISTEM QUIZ ANTI-DUPLIKASI v3.0
TIMESTAMP: ${timestamp}
UNIQUE_ID: ${uniqueId}

TEKS SUMBER:
"${text.content}"

TERJEMAHAN:
"${text.translation}"

LEVEL: ${text.level}

PERINTAH ABSOLUT - BUAT 5 SOAL YANG BENAR-BENAR BERBEDA:

KATEGORI WAJIB (HARUS BERBEDA SEMUA):
1. COMPREHENSION - Pemahaman isi teks
2. VOCABULARY - Arti kata dalam konteks  
3. INFERENCE - Kesimpulan tersirat
4. DETAIL - Informasi spesifik
5. APPLICATION - Penerapan situasi

FORMAT SOAL:
Setiap soal HARUS menggunakan struktur pertanyaan yang BERBEDA TOTAL:

SOAL 1 - COMPREHENSION:
Mulai dengan: "Berdasarkan teks tersebut, hal utama yang dibahas adalah..."
Focus: Pemahaman keseluruhan

SOAL 2 - VOCABULARY: 
Mulai dengan: "Dalam konteks kalimat '[kutip kalimat spesifik]', kata '[pilih kata dari teks]' memiliki makna..."
Focus: Arti kata dalam konteks

SOAL 3 - INFERENCE:
Mulai dengan: "Dari informasi yang diberikan, dapat disimpulkan bahwa..."
Focus: Kesimpulan yang tidak tersurat langsung

SOAL 4 - DETAIL:
Mulai dengan: "Menurut teks, detail yang disebutkan secara spesifik adalah..."
Focus: Informasi faktual yang tersurat

SOAL 5 - APPLICATION:
Mulai dengan: "Jika situasi dalam teks diterapkan dalam kehidupan nyata, maka..."
Focus: Aplikasi praktis

ATURAN ANTI-DUPLIKASI KETAT:
❌ DILARANG mengulang struktur kalimat
❌ DILARANG menggunakan kata pembuka yang sama
❌ DILARANG membuat soal dengan fokus yang sama
❌ DILARANG opsi jawaban yang mirip antar soal
✅ SETIAP soal harus unik 100%
✅ SETIAP opsi jawaban harus spesifik untuk soalnya
✅ SETIAP penjelasan harus merujuk bagian teks yang berbeda

VALIDASI KUALITAS:
- Jawaban benar harus jelas dari teks
- Opsi pengecoh harus masuk akal tapi salah
- Setiap soal test aspek pemahaman yang berbeda
- Tidak boleh ada soal yang jawabannya bisa ditebak tanpa baca teks

OUTPUT JSON:
{
  "timestamp": ${timestamp},
  "uniqueId": "${uniqueId}",
  "questions": [
    {
      "id": "comp_${uniqueId}",
      "category": "comprehension", 
      "question": "Berdasarkan teks tersebut, hal utama yang dibahas adalah...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "jawaban benar",
      "explanation": "penjelasan spesifik merujuk teks",
      "textReference": "kutip bagian teks yang relevan"
    },
    {
      "id": "vocab_${uniqueId}",
      "category": "vocabulary",
      "question": "Dalam konteks kalimat '[kutip kalimat]', kata '[kata]' memiliki makna...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "jawaban benar", 
      "explanation": "penjelasan arti kata dalam konteks",
      "textReference": "kutip kalimat yang mengandung kata tersebut"
    },
    {
      "id": "infer_${uniqueId}",
      "category": "inference",
      "question": "Dari informasi yang diberikan, dapat disimpulkan bahwa...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "jawaban benar",
      "explanation": "penjelasan logika kesimpulan", 
      "textReference": "bagian teks yang mendukung kesimpulan"
    },
    {
      "id": "detail_${uniqueId}",
      "category": "detail",
      "question": "Menurut teks, detail yang disebutkan secara spesifik adalah...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "jawaban benar",
      "explanation": "penjelasan lokasi detail dalam teks",
      "textReference": "kutip bagian teks dengan detail tersebut"
    },
    {
      "id": "app_${uniqueId}",
      "category": "application", 
      "question": "Jika situasi dalam teks diterapkan dalam kehidupan nyata, maka...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "jawaban benar",
      "explanation": "penjelasan aplikasi praktis",
      "textReference": "bagian teks yang menjelaskan situasi"
    }
  ]
}

GENERATE SEKARANG!`;

      console.log('📝 Sending enhanced anti-duplication prompt...');

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.azureOpenAI.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Anda adalah expert quiz generator yang sangat ketat dalam mencegah duplikasi. SETIAP soal yang Anda buat harus BENAR-BENAR unik dan tidak boleh ada kesamaan struktur, fokus, atau jawaban dengan soal lain. Gunakan sistem kategorisasi ketat untuk memastikan variasi.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2500,
          temperature: 0.9,
          top_p: 0.95,
          frequency_penalty: 1.0, // Maximum penalty for repetition
          presence_penalty: 0.8    // High penalty for similar content
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Tidak ada response dari AI');
      }

      console.log('🔍 AI Response received, parsing...');
      
      let aiQuiz;
      try {
        // Clean JSON response
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        aiQuiz = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw content:', content);
        throw new Error('Format response AI tidak valid');
      }

      if (!aiQuiz.questions || !Array.isArray(aiQuiz.questions)) {
        throw new Error('Struktur questions tidak valid');
      }

      // Advanced validation and anti-duplication processing
      const processedQuestions = await validateAndProcessQuestions(aiQuiz.questions, uniqueId);
      
      if (processedQuestions.length < 3) {
        throw new Error('Tidak cukup soal valid setelah validasi');
      }

      // Cache the questions
      questionCache.set(cacheKey, processedQuestions);
      setQuestionCache(new Map(questionCache));

      console.log('✅ Quiz generation successful with', processedQuestions.length, 'unique questions');
      setQuestions(processedQuestions);

    } catch (error) {
      console.error('❌ Error in AI quiz generation:', error);
      setError(error instanceof Error ? error.message : 'Error generating quiz');
      generateFallbackQuiz();
    } finally {
      setIsGenerating(false);
    }
  };

  const validateAndProcessQuestions = async (rawQuestions: any[], uniqueId: string): Promise<QuizQuestion[]> => {
    console.log('🔍 Starting advanced question validation...');
    
    const requiredCategories = ['comprehension', 'vocabulary', 'inference', 'detail', 'application'];
    const requiredStarters = [
      'Berdasarkan teks tersebut',
      'Dalam konteks kalimat', 
      'Dari informasi yang diberikan',
      'Menurut teks',
      'Jika situasi dalam teks'
    ];
    
    const validQuestions: QuizQuestion[] = [];
    const usedQuestions = new Set<string>();
    const usedAnswers = new Set<string>();
    
    for (let i = 0; i < Math.min(rawQuestions.length, 5); i++) {
      const q = rawQuestions[i];
      const expectedCategory = requiredCategories[i];
      const expectedStarter = requiredStarters[i];
      
      // Validation checks
      if (!q.question || !q.correctAnswer || !q.options || !Array.isArray(q.options)) {
        console.log(`❌ Question ${i + 1} rejected: Missing required fields`);
        continue;
      }
      
      if (q.options.length < 4) {
        console.log(`❌ Question ${i + 1} rejected: Insufficient options`);
        continue;
      }
      
      // Check category compliance
      if (q.category !== expectedCategory) {
        console.log(`❌ Question ${i + 1} rejected: Wrong category. Expected ${expectedCategory}, got ${q.category}`);
        continue;
      }
      
      // Check question starter
      const startsCorrectly = q.question.trim().startsWith(expectedStarter);
      if (!startsCorrectly) {
        console.log(`❌ Question ${i + 1} rejected: Should start with "${expectedStarter}"`);
        continue;
      }
      
      // Check for duplicate questions
      const questionKey = q.question.slice(0, 50).toLowerCase();
      if (usedQuestions.has(questionKey)) {
        console.log(`❌ Question ${i + 1} rejected: Duplicate question detected`);
        continue;
      }
      
      // Check for duplicate answers
      const answerKey = q.correctAnswer.toLowerCase();
      if (usedAnswers.has(answerKey)) {
        console.log(`❌ Question ${i + 1} rejected: Duplicate answer detected`);
        continue;
      }
      
      // Check options uniqueness
      const uniqueOptions = [...new Set(q.options.map((opt: string) => opt.trim().toLowerCase()))];
      if (uniqueOptions.length < 4) {
        console.log(`❌ Question ${i + 1} rejected: Duplicate options`);
        continue;
      }
      
      // Check if correct answer exists in options
      const correctAnswerExists = q.options.some((opt: string) => 
        opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      );
      if (!correctAnswerExists) {
        console.log(`❌ Question ${i + 1} rejected: Correct answer not in options`);
        continue;
      }
      
      // All validations passed
      console.log(`✅ Question ${i + 1} (${expectedCategory}) validated successfully`);
      
      usedQuestions.add(questionKey);
      usedAnswers.add(answerKey);
      
      validQuestions.push({
        id: `${expectedCategory}_${uniqueId}_${i}`,
        type: 'multiple-choice',
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation?.trim() || 'Jawaban berdasarkan analisis teks.',
        points: 20,
        category: expectedCategory
      });
    }
    
    // Final uniqueness check
    const questionTexts = validQuestions.map(q => q.question);
    const uniqueTexts = new Set(questionTexts);
    
    if (uniqueTexts.size !== questionTexts.length) {
      console.warn('⚠️ Some questions may still be similar after validation');
    } else {
      console.log('✅ All questions confirmed unique');
    }
    
    return validQuestions;
  };

  const generateFallbackQuiz = () => {
    console.log('🔧 Generating fallback quiz...');
    
    const fallbackQuestions: QuizQuestion[] = [
      {
        id: `fallback_comp_${Date.now()}`,
        type: 'multiple-choice',
        category: 'comprehension',
        question: 'Berdasarkan teks tersebut, topik utama yang dibahas berkaitan dengan:',
        options: ['Kehidupan sosial dan keluarga', 'Teknologi modern', 'Ekonomi dan bisnis', 'Politik dan pemerintahan'],
        correctAnswer: 'Kehidupan sosial dan keluarga',
        explanation: 'Teks memfokuskan pada aspek kehidupan sosial dan keluarga.',
        points: 20
      },
      {
        id: `fallback_detail_${Date.now()}`,
        type: 'multiple-choice', 
        category: 'detail',
        question: 'Menurut teks, informasi yang paling jelas disebutkan adalah tentang:',
        options: ['Karakter dan aktivitas', 'Data statistik', 'Teori akademis', 'Prosedur teknis'],
        correctAnswer: 'Karakter dan aktivitas',
        explanation: 'Teks menyebutkan karakter dan aktivitas secara eksplisit.',
        points: 20
      },
      {
        id: `fallback_infer_${Date.now()}`,
        type: 'multiple-choice',
        category: 'inference', 
        question: 'Dari informasi yang diberikan, dapat disimpulkan bahwa situasi ini:',
        options: ['Umum terjadi dalam kehidupan sehari-hari', 'Sangat jarang ditemui', 'Hanya terjadi di masa lalu', 'Khusus untuk kalangan tertentu'],
        correctAnswer: 'Umum terjadi dalam kehidupan sehari-hari',
        explanation: 'Konteks menunjukkan situasi yang familiar dan relatable.',
        points: 20
      }
    ];
    
    setQuestions(fallbackQuestions);
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
    const score = calculateScore();
    onComplete(score, questions.length);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const getScorePercentage = () => {
    const score = calculateScore();
    return Math.round((score / questions.length) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return '🎉 Excellent! Pemahaman bacaan Anda sangat baik!';
    if (percentage >= 70) return '👍 Good! Anda sudah cukup memahami teks dengan baik.';
    if (percentage >= 50) return '📖 Fair. Masih perlu latihan lebih banyak.';
    return '💪 Keep trying! Cobalah baca ulang dengan lebih teliti.';
  };

  const retryQuizGeneration = () => {
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    generateUniqueQuizWithAI();
  };

  const quizTime = Math.round((Date.now() - quizStartTime) / 1000);

  useEffect(() => {
    generateUniqueQuizWithAI();
    setQuizStartTime(Date.now());
  }, []);

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Brain className="h-16 w-16 mx-auto text-blue-600 animate-pulse mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generating AI Quiz...</h3>
          <p className="text-gray-600 mb-4">AI sedang membuat soal unik berdasarkan teks yang Anda baca</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Menggunakan sistem anti-duplikasi advanced...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Generating Quiz</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={retryQuizGeneration}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Coba Lagi</span>
            </button>
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = getScorePercentage();
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${getScoreColor(percentage)}`} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Selesai!</h3>
            <p className="text-gray-600">{getPerformanceMessage(percentage)}</p>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">{score}/{questions.length}</div>
              <div className="text-sm text-blue-600">Jawaban Benar</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</div>
              <div className="text-sm text-green-600">Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-700">{readingStats.wpm}</div>
              <div className="text-sm text-purple-600">WPM</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-700">{quizTime}s</div>
              <div className="text-sm text-orange-600">Quiz Time</div>
            </div>
          </div>

          {/* Question Review */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Review Jawaban:</h4>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="text-xs text-gray-500 mb-2">
                          Kategori: {question.category}
                        </div>
                        <div className="text-sm space-y-1">
                          <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            <strong>Jawaban Anda:</strong> {userAnswer || 'Tidak dijawab'}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700">
                              <strong>Jawaban Benar:</strong> {question.correctAnswer}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <strong>Penjelasan:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={retryQuizGeneration}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Quiz Baru</span>
            </button>
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Baca Teks Lain</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Tidak Tersedia</h3>
          <p className="text-gray-600 mb-4">Gagal memuat soal quiz. Silakan coba lagi.</p>
          <button
            onClick={retryQuizGeneration}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Soal {currentQuestionIndex + 1} dari {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {currentQuestion.question}
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {currentQuestion.category}
            </span>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  userAnswer === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    userAnswer === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {userAnswer === option && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Lightbulb className="h-4 w-4" />
            <span>AI Quiz - Anti Duplikasi</span>
          </div>

          <button
            onClick={nextQuestion}
            disabled={!userAnswer}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{currentQuestionIndex === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingQuizAI;