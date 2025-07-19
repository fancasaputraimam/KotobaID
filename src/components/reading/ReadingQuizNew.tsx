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
  ArrowLeft
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
}

interface ReadingQuizNewProps {
  text: ReadingText;
  readingStats: {
    timeSpent: number;
    wpm: number;
  };
  onComplete: (score: number, totalQuestions: number) => void;
  onRetry: () => void;
}

const ReadingQuizNew: React.FC<ReadingQuizNewProps> = ({ 
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

  // Pre-defined question templates that are guaranteed to be different
  const questionTemplates = [
    {
      id: 'detail_extraction',
      generator: (text: ReadingText) => {
        // Extract specific details from text
        const sentences = text.content.split('。').filter(s => s.trim());
        const firstSentence = sentences[0] || text.content.slice(0, 20);
        
        return {
          question: `Berdasarkan informasi yang diberikan di awal teks, hal yang pertama kali disebutkan adalah tentang:`,
          options: [
            'identitas atau pengenalan diri',
            'lokasi atau tempat kejadian', 
            'waktu atau periode tertentu',
            'aktivitas atau kegiatan'
          ],
          correctAnswer: 'identitas atau pengenalan diri',
          explanation: `Bagian awal teks memperkenalkan karakter atau subjek utama.`
        };
      }
    },
    {
      id: 'vocabulary_context',
      generator: (text: ReadingText) => {
        const vocab = text.vocabulary[0] || { word: '家族', reading: 'かぞく', meaning: 'keluarga' };
        
        return {
          question: `Kata "${vocab.word}" yang muncul dalam teks, jika diterjemahkan ke bahasa Indonesia berarti:`,
          options: [
            vocab.meaning,
            'teman dekat',
            'tetangga sekitar',
            'rekan kerja'
          ],
          correctAnswer: vocab.meaning,
          explanation: `Kata "${vocab.word}" (${vocab.reading}) dalam bahasa Indonesia berarti "${vocab.meaning}".`
        };
      }
    },
    {
      id: 'text_purpose',
      generator: (text: ReadingText) => {
        return {
          question: `Tujuan utama dari teks yang telah Anda baca adalah untuk:`,
          options: [
            'menggambarkan situasi kehidupan nyata',
            'memberikan instruksi atau petunjuk',
            'menyampaikan berita atau informasi',
            'menceritakan dongeng atau fiksi'
          ],
          correctAnswer: 'menggambarkan situasi kehidupan nyata',
          explanation: `Teks ini bertujuan menggambarkan situasi kehidupan yang nyata dan relatable.`
        };
      }
    },
    {
      id: 'comprehension_level',
      generator: (text: ReadingText) => {
        return {
          question: `Untuk level ${text.level}, tingkat kesulitan teks ini dapat dikategorikan sebagai:`,
          options: [
            'sesuai dengan standar level tersebut',
            'lebih mudah dari level yang ditentukan',
            'lebih sulit dari level yang ditentukan', 
            'tidak dapat ditentukan levelnya'
          ],
          correctAnswer: 'sesuai dengan standar level tersebut',
          explanation: `Teks ini dirancang khusus untuk level ${text.level} dengan vocabulary dan grammar yang sesuai.`
        };
      }
    },
    {
      id: 'application_context',
      generator: (text: ReadingText) => {
        return {
          question: `Konten yang dibahas dalam teks ini paling relevan digunakan dalam konteks:`,
          options: [
            'percakapan informal sehari-hari',
            'presentasi formal di tempat kerja',
            'diskusi akademik di universitas',
            'komunikasi resmi dengan pemerintah'
          ],
          correctAnswer: 'percakapan informal sehari-hari',
          explanation: `Konten teks ini cocok untuk percakapan sehari-hari karena membahas topik yang familiar.`
        };
      }
    }
  ];

  const generatePredefinedQuiz = () => {
    console.log('🎯 Generating quiz using predefined templates...');
    setIsGenerating(true);
    
    try {
      const generatedQuestions: QuizQuestion[] = questionTemplates.map((template, index) => {
        const questionData = template.generator(text);
        
        return {
          id: `predefined_${template.id}_${Date.now()}_${index}`,
          type: 'multiple-choice',
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
          points: 20
        };
      });

      console.log('✅ Generated questions using predefined templates:');
      generatedQuestions.forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.question.slice(0, 50)}...`);
      });

      setQuestions(generatedQuestions);
      
    } catch (error) {
      console.error('Error generating predefined quiz:', error);
      // Fallback to basic questions
      generateBasicQuiz();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBasicQuiz = () => {
    const basicQuestions: QuizQuestion[] = [
      {
        id: 'basic_1',
        type: 'multiple-choice',
        question: 'Menurut pendapat Anda, setelah membaca teks ini, level pemahaman yang Anda capai adalah:',
        options: ['Sangat baik (90-100%)', 'Baik (70-89%)', 'Cukup (50-69%)', 'Perlu perbaikan (<50%)'],
        correctAnswer: 'Sangat baik (90-100%)',
        explanation: 'Target pemahaman yang baik untuk reading practice adalah 90% atau lebih.',
        points: 20
      },
      {
        id: 'basic_2',
        type: 'multiple-choice',
        question: 'Berdasarkan struktur dan konten, teks ini paling cocok digunakan untuk latihan:',
        options: ['reading comprehension', 'listening practice', 'writing exercise', 'speaking drill'],
        correctAnswer: 'reading comprehension',
        explanation: 'Teks ini dirancang khusus untuk melatih kemampuan reading comprehension.',
        points: 20
      },
      {
        id: 'basic_3',
        type: 'multiple-choice',
        question: 'Jika harus menjelaskan isi teks ini kepada orang lain, Anda akan fokus pada:',
        options: ['karakter dan aktivitas utama', 'detail teknis dan spesifik', 'opini dan pendapat pribadi', 'data statistik dan angka'],
        correctAnswer: 'karakter dan aktivitas utama',
        explanation: 'Fokus utama teks adalah karakter dan aktivitas yang mereka lakukan.',
        points: 20
      },
      {
        id: 'basic_4',
        type: 'multiple-choice',
        question: 'Kosakata yang paling sering muncul dalam teks ini berkaitan dengan tema:',
        options: ['kehidupan sosial dan keluarga', 'teknologi dan inovasi', 'ekonomi dan bisnis', 'politik dan pemerintahan'],
        correctAnswer: 'kehidupan sosial dan keluarga',
        explanation: 'Vocabulary dalam teks ini dominan berkaitan dengan kehidupan sosial dan keluarga.',
        points: 20
      },
      {
        id: 'basic_5',
        type: 'multiple-choice',
        question: 'Tingkat formalitas bahasa yang digunakan dalam teks ini adalah:',
        options: ['casual/informal', 'semi-formal', 'formal', 'sangat formal'],
        correctAnswer: 'casual/informal',
        explanation: 'Teks menggunakan bahasa yang casual dan mudah dipahami untuk pembelajaran.',
        points: 20
      }
    ];

    setQuestions(basicQuestions);
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

  const quizTime = Math.round((Date.now() - quizStartTime) / 1000);

  useEffect(() => {
    generatePredefinedQuiz();
    setQuizStartTime(Date.now());
  }, []);

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Brain className="h-16 w-16 mx-auto text-blue-600 animate-pulse mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Quiz...</h3>
          <p className="text-gray-600">Membuat soal berdasarkan teks yang Anda baca</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quiz</h3>
          <p className="text-gray-600 mb-4">Gagal memuat soal quiz. Silakan coba lagi.</p>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

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
            <span>Pilih jawaban yang paling tepat</span>
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

export default ReadingQuizNew;