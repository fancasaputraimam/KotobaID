import React, { useState } from 'react';
import { 
  Brain, 
  RefreshCw, 
  Zap, 
  Target, 
  BookOpen,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  AlertCircle,
  Settings,
  Sparkles
} from 'lucide-react';

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

interface QuizResult {
  questions: QuizQuestion[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  timestamp: number;
}

const AIQuizGenerator: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('N5');
  const [selectedTopic, setSelectedTopic] = useState<string>('daily-life');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

  const levels = [
    { value: 'N5', label: 'N5 - Pemula', color: 'bg-green-100 text-green-700' },
    { value: 'N4', label: 'N4 - Dasar', color: 'bg-blue-100 text-blue-700' },
    { value: 'N3', label: 'N3 - Menengah', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'N2', label: 'N2 - Lanjutan', color: 'bg-orange-100 text-orange-700' },
    { value: 'N1', label: 'N1 - Mahir', color: 'bg-red-100 text-red-700' }
  ];

  const topics = [
    { value: 'daily-life', label: 'Kehidupan Sehari-hari', icon: '🏠' },
    { value: 'culture', label: 'Budaya Jepang', icon: '🎌' },
    { value: 'travel', label: 'Perjalanan', icon: '✈️' },
    { value: 'food', label: 'Makanan', icon: '🍜' },
    { value: 'work', label: 'Pekerjaan', icon: '💼' },
    { value: 'family', label: 'Keluarga', icon: '👨‍👩‍👧‍👦' },
    { value: 'school', label: 'Sekolah', icon: '🏫' },
    { value: 'hobby', label: 'Hobi', icon: '🎨' },
    { value: 'custom', label: 'Topik Kustom', icon: '✏️' }
  ];

  const generateAIQuiz = async () => {
    console.log('🚀 Starting AI Quiz Generation...');
    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    
    try {
      const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
      
      if (!settings.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        throw new Error('Azure OpenAI tidak dikonfigurasi. Silakan konfigurasi di panel Dev.');
      }

      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      
      const topicText = selectedTopic === 'custom' ? customTopic : 
        topics.find(t => t.value === selectedTopic)?.label || 'kehidupan sehari-hari';

      const prompt = `Buat quiz bahasa Jepang level ${selectedLevel} dengan topik ${topicText}.

WAJIB BUAT TEPAT 5 SOAL dengan kategori berbeda:
1. VOCABULARY - kosakata
2. GRAMMAR - tata bahasa  
3. CULTURE - budaya Jepang
4. PRACTICAL - ungkapan praktis
5. COMPREHENSION - pemahaman konteks

CONTOH FORMAT SOAL:
VOCABULARY: "Kata '学校' dalam bahasa Indonesia berarti..."
GRAMMAR: "Untuk menyatakan kegiatan yang sedang berlangsung, pola yang benar adalah..."
CULTURE: "Dalam budaya Jepang, saat bertemu orang yang lebih tua, yang dilakukan adalah..."
PRACTICAL: "Jika ingin memesan makanan di restoran, ungkapan yang tepat adalah..."
COMPREHENSION: "Ungkapan 'おつかれさま' biasanya digunakan untuk..."

WAJIB RESPONSE FORMAT JSON:
{
  "questions": [
    {
      "category": "vocabulary",
      "question": "soal vocabulary di sini",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "correctAnswer": "pilihan yang benar",
      "explanation": "penjelasan jawaban"
    },
    {
      "category": "grammar", 
      "question": "soal grammar di sini",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "correctAnswer": "pilihan yang benar",
      "explanation": "penjelasan jawaban"
    },
    {
      "category": "culture",
      "question": "soal budaya di sini", 
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "correctAnswer": "pilihan yang benar",
      "explanation": "penjelasan jawaban"
    },
    {
      "category": "practical",
      "question": "soal praktis di sini",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"], 
      "correctAnswer": "pilihan yang benar",
      "explanation": "penjelasan jawaban"
    },
    {
      "category": "comprehension",
      "question": "soal pemahaman di sini",
      "options": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "correctAnswer": "pilihan yang benar", 
      "explanation": "penjelasan jawaban"
    }
  ]
}

HANYA RESPONSE JSON SAJA, JANGAN ADA TEKS LAIN!`;

      console.log('📝 Sending AI Quiz request...');
      console.log('Endpoint:', settings.azureOpenAI.backendEndpoint);
      console.log('API Key present:', !!settings.azureOpenAI.apiKey);

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'api-key': settings.azureOpenAI.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Anda adalah expert quiz generator bahasa Jepang JLPT yang sangat ketat dalam anti-duplikasi. Setiap soal harus unik, akurat, dan sesuai level. Gunakan pengetahuan mendalam tentang JLPT dan budaya Jepang.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 3000,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0.8,
          presence_penalty: 0.6
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure OpenAI Response Error:', errorText);
        throw new Error(`Azure OpenAI Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Full Azure OpenAI Response:', result);
      
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Tidak ada response dari AI');
      }

      console.log('🔍 Parsing AI response...');
      
      console.log('Raw AI response:', content);
      
      let aiQuiz;
      try {
        // Multiple cleaning attempts for different response formats
        let cleanContent = content.trim();
        
        // Remove markdown code blocks
        cleanContent = cleanContent.replace(/```json\n?|\n?```/g, '');
        cleanContent = cleanContent.replace(/```\n?|\n?```/g, '');
        
        // Remove any text before the first {
        const jsonStart = cleanContent.indexOf('{');
        if (jsonStart > 0) {
          cleanContent = cleanContent.substring(jsonStart);
        }
        
        // Remove any text after the last }
        const jsonEnd = cleanContent.lastIndexOf('}');
        if (jsonEnd > 0) {
          cleanContent = cleanContent.substring(0, jsonEnd + 1);
        }
        
        // Try to fix common JSON issues
        cleanContent = cleanContent.replace(/,\s*}/g, '}'); // Remove trailing commas
        cleanContent = cleanContent.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        console.log('Cleaned content for parsing:', cleanContent);
        
        aiQuiz = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Failed to parse content:', content);
        
        // Try alternative parsing - extract JSON using regex
        try {
          const jsonRegex = /\{[\s\S]*\}/;
          const match = content.match(jsonRegex);
          if (match) {
            aiQuiz = JSON.parse(match[0]);
            console.log('Successfully parsed with regex fallback');
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (regexError) {
          console.error('Regex parsing also failed:', regexError);
          console.log('Falling back to predefined quiz due to parsing failure');
          generateFallbackQuiz();
          return;
        }
      }

      if (!aiQuiz.questions || !Array.isArray(aiQuiz.questions)) {
        throw new Error('Struktur questions tidak valid');
      }

      // Process and validate questions
      const processedQuestions = validateQuestions(aiQuiz.questions, uniqueId);
      
      if (processedQuestions.length < 3) {
        throw new Error('Tidak cukup soal valid setelah validasi');
      }

      console.log('✅ AI Quiz generated successfully:', processedQuestions.length, 'questions');
      setQuestions(processedQuestions);
      setQuizStartTime(Date.now());

    } catch (error) {
      console.error('❌ Error generating AI quiz:', error);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Check specific error types
      let errorMessage = 'Error generating quiz';
      if (error instanceof Error) {
        if (error.message.includes('Azure OpenAI tidak dikonfigurasi')) {
          errorMessage = 'Azure OpenAI belum dikonfigurasi. Silakan konfigurasi di panel Settings.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Request tidak valid. Periksa konfigurasi API.';
        } else if (error.message.includes('401')) {
          errorMessage = 'API Key tidak valid. Periksa konfigurasi Azure OpenAI.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Akses ditolak. Periksa permissions Azure OpenAI.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Coba lagi dalam beberapa saat.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Coba lagi nanti.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Auto fallback for certain errors
      if (error instanceof Error && 
          (error.message.includes('Format response') || 
           error.message.includes('tidak valid') ||
           error.message.includes('parsing'))) {
        console.log('🔄 Auto-falling back to predefined quiz due to response error');
        generateFallbackQuiz();
        return;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const validateQuestions = (rawQuestions: any[], uniqueId: string): QuizQuestion[] => {
    console.log('🔍 Validating AI questions...');
    
    const requiredCategories = ['vocabulary', 'grammar', 'culture', 'practical', 'comprehension'];
    const validQuestions: QuizQuestion[] = [];
    
    for (let i = 0; i < Math.min(rawQuestions.length, 5); i++) {
      const q = rawQuestions[i];
      const expectedCategory = requiredCategories[i];
      
      // Basic validation
      if (!q.question || !q.correctAnswer || !q.options || !Array.isArray(q.options)) {
        console.log(`❌ Question ${i + 1} rejected: Missing required fields`);
        continue;
      }
      
      if (q.options.length < 4) {
        console.log(`❌ Question ${i + 1} rejected: Insufficient options`);
        continue;
      }
      
      // Check category match
      if (q.category !== expectedCategory) {
        console.log(`❌ Question ${i + 1} rejected: Wrong category`);
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
      
      console.log(`✅ Question ${i + 1} (${expectedCategory}) validated`);
      
      validQuestions.push({
        id: `${expectedCategory}_${uniqueId}_${i}`,
        type: 'multiple-choice',
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation?.trim() || 'Jawaban berdasarkan standar JLPT.',
        points: 20,
        category: expectedCategory
      });
    }
    
    return validQuestions;
  };

  const generateFallbackQuiz = () => {
    console.log('🔧 Generating fallback quiz...');
    
    const fallbackQuestions: QuizQuestion[] = [
      {
        id: `fallback_vocab_${Date.now()}`,
        type: 'multiple-choice',
        category: 'vocabulary',
        question: `Kata '家族' dalam bahasa Indonesia berarti:`,
        options: ['Keluarga', 'Teman', 'Tetangga', 'Rekan kerja'],
        correctAnswer: 'Keluarga',
        explanation: 'Kata 家族 (kazoku) berarti keluarga dalam bahasa Indonesia.',
        points: 20
      },
      {
        id: `fallback_grammar_${Date.now()}`,
        type: 'multiple-choice', 
        category: 'grammar',
        question: `Untuk menyatakan "sedang melakukan sesuatu" dalam bahasa Jepang, pola yang benar adalah:`,
        options: ['～ています', '～ました', '～ます', '～でした'],
        correctAnswer: '～ています',
        explanation: 'Pola ～ています digunakan untuk menyatakan kegiatan yang sedang berlangsung.',
        points: 20
      },
      {
        id: `fallback_culture_${Date.now()}`,
        type: 'multiple-choice',
        category: 'culture', 
        question: 'Dalam budaya Jepang, saat bertemu dengan orang yang lebih tua atau atasan, yang biasanya dilakukan adalah:',
        options: ['Membungkukkan badan (ojigi)', 'Berjabat tangan', 'Melambaikan tangan', 'Menganggukkan kepala saja'],
        correctAnswer: 'Membungkukkan badan (ojigi)',
        explanation: 'Ojigi (membungkukkan badan) adalah cara menunjukkan rasa hormat dalam budaya Jepang.',
        points: 20
      },
      {
        id: `fallback_practical_${Date.now()}`,
        type: 'multiple-choice',
        category: 'practical',
        question: 'Jika ingin memesan makanan di restoran Jepang, ungkapan yang tepat adalah:',
        options: ['注文をお願いします', 'ありがとうございます', 'すみません', 'いらっしゃいませ'],
        correctAnswer: '注文をお願いします',
        explanation: '注文をお願いします (chuumon wo onegaishimasu) berarti "tolong pesanan" yang tepat untuk memesan makanan.',
        points: 20
      },
      {
        id: `fallback_comprehension_${Date.now()}`,
        type: 'multiple-choice',
        category: 'comprehension',
        question: 'Ungkapan "お疲れ様" biasanya digunakan dalam konteks:',
        options: ['Mengucapkan terima kasih atas kerja keras', 'Menyapa di pagi hari', 'Meminta maaf', 'Mengucapkan selamat tinggal'],
        correctAnswer: 'Mengucapkan terima kasih atas kerja keras',
        explanation: 'お疲れ様 (otsukaresama) digunakan untuk menghargai usaha dan kerja keras seseorang.',
        points: 20
      }
    ];
    
    setQuestions(fallbackQuestions);
    setQuizStartTime(Date.now());
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
    const score = calculateScore();
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
    
    const quizResult: QuizResult = {
      questions,
      score,
      totalQuestions: questions.length,
      timeSpent,
      timestamp: Date.now()
    };
    
    setQuizHistory(prev => [quizResult, ...prev.slice(0, 9)]); // Keep last 10 results
    setShowResults(true);
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
    if (percentage >= 90) return '🎉 Excellent! Penguasaan Anda sangat baik!';
    if (percentage >= 70) return '👍 Good! Anda sudah cukup menguasai level ini.';
    if (percentage >= 50) return '📖 Fair. Masih perlu latihan lebih banyak.';
    return '💪 Keep trying! Cobalah fokus pada area yang lemah.';
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setError(null);
    setQuizStartTime(0);
  };

  // Quiz Generation View
  if (!questions.length && !isGenerating && !error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Quiz Generator</h2>
            <p className="text-gray-600">Generator soal JLPT otomatis dengan AI anti-duplikasi</p>
          </div>

          {/* Level Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Level JLPT:</label>
            <div className="grid grid-cols-5 gap-2">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedLevel === level.value 
                      ? level.color + ' shadow-md ring-2 ring-offset-2 ring-blue-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Topik:</label>
            <div className="grid grid-cols-3 gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.value}
                  onClick={() => setSelectedTopic(topic.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedTopic === topic.value 
                      ? 'bg-purple-100 text-purple-700 shadow-md ring-2 ring-offset-2 ring-purple-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {topic.icon} {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          {selectedTopic === 'custom' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Topik Kustom:</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Masukkan topik yang ingin Anda pelajari..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Generate Buttons */}
          <div className="text-center mb-6 space-y-3">
            <button
              onClick={generateAIQuiz}
              disabled={selectedTopic === 'custom' && !customTopic.trim()}
              className="flex items-center justify-center space-x-2 mx-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Generate AI Quiz</span>
            </button>
            
            <div className="text-sm text-gray-500">atau</div>
            
            <button
              onClick={generateFallbackQuiz}
              className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              <Target className="h-4 w-4" />
              <span>Quiz Standar (Tanpa AI)</span>
            </button>
          </div>

          {/* Quiz History */}
          {quizHistory.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Quiz Terakhir:</h4>
              <div className="space-y-3">
                {quizHistory.slice(0, 3).map((result, index) => (
                  <div key={result.timestamp} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trophy className={`h-4 w-4 ${getScoreColor((result.score / result.totalQuestions) * 100)}`} />
                      <span className="text-sm font-medium">
                        {result.score}/{result.totalQuestions} ({Math.round((result.score / result.totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{result.timeSpent}s</span>
                      <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-800 mb-2">
              <Settings className="h-4 w-4 inline mr-2" />
              Fitur AI Quiz:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 5 kategori soal berbeda: Vocabulary, Grammar, Culture, Practical, Comprehension</li>
              <li>• Sistem anti-duplikasi advanced dengan validasi ketat</li>
              <li>• Soal disesuaikan dengan level JLPT yang dipilih</li>
              <li>• Topik dapat disesuaikan atau menggunakan topik kustom</li>
              <li>• Analisis performa dan tracking progress</li>
            </ul>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Status Konfigurasi:
            </h4>
            <div className="text-sm space-y-1">
              {(() => {
                const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
                return (
                  <>
                    <div className={`flex items-center space-x-2 ${settings.azureOpenAI?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      <span>Azure OpenAI: {settings.azureOpenAI?.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${settings.azureOpenAI?.backendEndpoint ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      <span>Endpoint: {settings.azureOpenAI?.backendEndpoint ? 'Configured' : 'Not configured'}</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${settings.azureOpenAI?.apiKey ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      <span>API Key: {settings.azureOpenAI?.apiKey ? 'Configured' : 'Not configured'}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            {(() => {
              const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
              if (!settings.azureOpenAI?.enabled || !settings.azureOpenAI?.backendEndpoint || !settings.azureOpenAI?.apiKey) {
                return (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                    ⚠️ Azure OpenAI belum dikonfigurasi. Gunakan "Quiz Standar" atau konfigurasi di Settings.
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Brain className="h-16 w-16 mx-auto text-purple-600 animate-pulse mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI Sedang Membuat Quiz...</h3>
          <p className="text-gray-600 mb-4">Menggunakan teknologi anti-duplikasi advanced</p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-purple-700">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Validasi kualitas soal dan anti-duplikasi...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Generate Quiz</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={generateAIQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Coba Lagi</span>
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (showResults) {
    const score = calculateScore();
    const percentage = getScorePercentage();
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
    
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
              <BookOpen className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-700">{selectedLevel}</div>
              <div className="text-sm text-purple-600">Level</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-700">{timeSpent}s</div>
              <div className="text-sm text-orange-600">Waktu</div>
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
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            {index + 1}. {question.question}
                          </p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {question.category}
                          </span>
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
              onClick={generateAIQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Zap className="h-4 w-4" />
              <span>Quiz Baru</span>
            </button>
            <button
              onClick={resetQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
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
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
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
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
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
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    userAnswer === option
                      ? 'border-purple-500 bg-purple-500'
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
            <span>AI Quiz Level {selectedLevel}</span>
          </div>

          <button
            onClick={nextQuestion}
            disabled={!userAnswer}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>{currentQuestionIndex === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIQuizGenerator;