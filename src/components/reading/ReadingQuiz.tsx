import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Brain, 
  Target,
  RotateCcw,
  Lightbulb,
  Clock
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
  type: 'multiple-choice' | 'true-false' | 'vocabulary' | 'comprehension';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface ReadingQuizProps {
  text: ReadingText;
  readingStats: {
    timeSpent: number;
    wpm: number;
  };
  onComplete: (score: number, totalQuestions: number) => void;
  onRetry: () => void;
}

const ReadingQuiz: React.FC<ReadingQuizProps> = ({ 
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

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
      
      if (!settings.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        // Generate simple questions if AI not available
        generateSimpleQuiz();
        return;
      }

      // Create unique identifier for this text to ensure variety
      const textHash = text.content.slice(0, 20) + Date.now();
      
      const prompt = `Sebagai guru bahasa Jepang ahli, buat 5 soal quiz UNIK dan BERVARIASI untuk teks berikut:

TEKS ASLI: "${text.content}"
TERJEMAHAN: "${text.translation}"
LEVEL: ${text.level}
VOCABULARY: ${text.vocabulary.map(v => `${v.word}(${v.meaning})`).join(', ')}

REQUIREMENTS KETAT:
1. Buat 5 soal yang BENAR-BENAR BERBEDA satu sama lain
2. JANGAN gunakan pola soal yang sama atau mirip
3. Setiap soal harus SPESIFIK berdasarkan konten teks ini
4. Soal harus mengukur pemahaman MENDALAM, bukan hafalan

DISTRIBUSI SOAL:
- 1 soal tentang MAIN IDEA / tema utama teks
- 1 soal tentang DETAIL SPESIFIK yang disebutkan dalam teks  
- 1 soal VOCABULARY dari kata yang ADA di teks
- 1 soal tentang INFERENSI / kesimpulan dari teks
- 1 soal tentang APLIKASI / penerapan informasi dari teks

CONTOH VARIASI SOAL YANG BAGUS:
- "Berdasarkan teks, apa yang menjadi fokus utama pembahasan?"
- "Menurut teks, kapan/dimana/siapa yang melakukan [detail spesifik]?"
- "Kata '${text.vocabulary[0]?.word || 'example'}' dalam teks memiliki arti..."
- "Dari teks dapat disimpulkan bahwa..."
- "Jika situasi dalam teks terjadi di Indonesia, maka..."

FORMAT JSON TEPAT:
{
  "questions": [
    {
      "id": "unique_id_${textHash}",
      "type": "multiple-choice", 
      "question": "Soal spesifik berdasarkan teks (UNIK, tidak boleh sama dengan soal lain)",
      "options": ["Opsi A yang logis", "Opsi B yang masuk akal", "Opsi C yang mungkin", "Opsi D yang reasonable"],
      "correctAnswer": "Opsi yang benar sesuai teks",
      "explanation": "Penjelasan detail mengapa jawaban ini benar berdasarkan teks",
      "points": 20
    }
  ]
}

PENTING: 
- Setiap soal HARUS merujuk konten spesifik dari teks
- HINDARI soal generik seperti "Apa topik teks ini?"
- Buat soal yang hanya bisa dijawab jika benar-benar membaca teks
- Pastikan 5 soal benar-benar berbeda fokus dan tidak overlap
- Response HARUS dalam format JSON yang valid
- Setiap soal HARUS memiliki minimal 4 opsi jawaban
- JANGAN buat soal yang mirip atau pola yang sama

CONTOH SOAL YANG HARUS DIHINDARI (JANGAN BUAT INI):
- "Apa tema utama teks?"
- "Siapa yang disebutkan dalam teks?"
- "Dimana cerita ini terjadi?"

CONTOH SOAL YANG BAGUS (BUAT SEPERTI INI):
- "Menurut teks, mengapa [karakter] melakukan [tindakan spesifik]?"
- "Berdasarkan informasi yang diberikan, kapan peristiwa [X] terjadi?"
- "Apa yang dapat disimpulkan tentang [aspek spesifik] dari teks?"`;

      console.log('📝 Sending prompt to AI for quiz generation...');
      console.log('Text preview:', text.content.slice(0, 100) + '...');

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
              content: 'Kamu adalah guru bahasa Jepang expert yang sangat kreatif dalam membuat soal quiz UNIK dan BERVARIASI. Setiap soal yang kamu buat harus ORIGINAL dan tidak boleh mengulangi pola yang sama. Fokus pada pemahaman mendalam, bukan soal generik.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.9, // Higher temperature untuk lebih banyak variasi
          top_p: 0.95, // Menambah diversity
          frequency_penalty: 0.8, // Mengurangi repetisi
          presence_penalty: 0.6 // Mendorong topik baru
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI Error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Tidak ada response dari AI');
      }

      let aiQuiz;
      try {
        aiQuiz = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI quiz:', content);
        generateSimpleQuiz();
        return;
      }

      if (aiQuiz.questions && Array.isArray(aiQuiz.questions)) {
        // Validate and process questions
        const processedQuestions = aiQuiz.questions
          .filter((q: any, index: number, arr: any[]) => {
            // Remove questions with empty content
            if (!q.question || !q.correctAnswer || !q.options || q.options.length < 2) {
              return false;
            }
            
            // Remove duplicate questions (check similarity)
            const questionLower = q.question.toLowerCase();
            const isDuplicate = arr.slice(0, index).some((prevQ: any) => 
              prevQ.question && 
              prevQ.question.toLowerCase().includes(questionLower.slice(0, 20)) ||
              questionLower.includes(prevQ.question.toLowerCase().slice(0, 20))
            );
            
            return !isDuplicate;
          })
          .map((q: any, index: number) => ({
            id: `${textHash}_q${index + 1}`,
            type: q.type || 'multiple-choice',
            question: q.question.trim(),
            options: q.options.filter((opt: string) => opt && opt.trim()),
            correctAnswer: q.correctAnswer.trim(),
            explanation: q.explanation?.trim() || 'Jawaban berdasarkan konten teks.',
            points: q.points || 20
          }))
          .slice(0, 5); // Ensure max 5 questions

        // Debug logging
        console.log('AI Generated Questions:', aiQuiz.questions.length);
        console.log('Valid Questions After Processing:', processedQuestions.length);
        console.log('Processed Questions:', processedQuestions.map(q => ({ id: q.id, question: q.question.slice(0, 50) + '...' })));

        // Validate we have enough good questions
        if (processedQuestions.length >= 3) {
          setQuestions(processedQuestions);
          console.log('✅ Using AI generated questions');
        } else {
          console.warn('⚠️ Not enough valid questions from AI, using fallback. Reasons could be: duplicates, empty content, or insufficient options');
          generateSimpleQuiz();
        }
      } else {
        generateSimpleQuiz();
      }

    } catch (error) {
      console.error('Error generating quiz:', error);
      generateSimpleQuiz();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimpleQuiz = () => {
    // Generate unique questions based on the actual text content
    const textHash = text.content.slice(0, 10) + Date.now();
    
    // Create questions based on text content
    const dynamicQuestions: QuizQuestion[] = [];
    
    // Question 1: About main content/character/setting
    const contentWords = text.content.split('').filter(char => char.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]/));
    const hasFamily = text.content.includes('家族') || text.content.includes('父') || text.content.includes('母');
    const hasSchool = text.content.includes('学校') || text.content.includes('学生') || text.content.includes('先生');
    const hasWork = text.content.includes('仕事') || text.content.includes('会社') || text.content.includes('働');
    
    let mainTopicAnswer = 'Kehidupan sehari-hari';
    if (hasFamily) mainTopicAnswer = 'Keluarga';
    if (hasSchool) mainTopicAnswer = 'Pendidikan';
    if (hasWork) mainTopicAnswer = 'Pekerjaan';
    
    dynamicQuestions.push({
      id: `${textHash}_main`,
      type: 'multiple-choice',
      question: 'Berdasarkan teks yang Anda baca, tema utamanya adalah tentang?',
      options: [mainTopicAnswer, 'Teknologi', 'Olahraga', 'Makanan'],
      correctAnswer: mainTopicAnswer,
      explanation: `Dari konten teks dapat dilihat bahwa pembahasan utama adalah tentang ${mainTopicAnswer.toLowerCase()}.`,
      points: 20
    });

    // Question 2: Vocabulary from actual text
    if (text.vocabulary && text.vocabulary.length > 0) {
      const vocab = text.vocabulary[0];
      const otherMeanings = ['teman', 'makanan', 'tempat', 'waktu'].filter(m => m !== vocab.meaning);
      
      dynamicQuestions.push({
        id: `${textHash}_vocab`,
        type: 'vocabulary',
        question: `Dalam teks, kata "${vocab.word}" (${vocab.reading}) memiliki arti?`,
        options: [vocab.meaning, ...otherMeanings.slice(0, 3)],
        correctAnswer: vocab.meaning,
        explanation: `Kata "${vocab.word}" dalam konteks teks ini berarti "${vocab.meaning}".`,
        points: 20
      });
    }

    // Question 3: Text length/complexity assessment
    const wordCount = text.wordCount || text.content.length;
    let difficultyLevel = 'sesuai level';
    if (text.level === 'N5') difficultyLevel = 'mudah dipahami';
    if (text.level === 'N1') difficultyLevel = 'cukup menantang';
    
    dynamicQuestions.push({
      id: `${textHash}_difficulty`,
      type: 'multiple-choice',
      question: `Dengan ${wordCount} karakter, bagaimana tingkat kesulitan teks ini untuk level ${text.level}?`,
      options: [difficultyLevel, 'terlalu sulit', 'terlalu mudah', 'tidak sesuai'],
      correctAnswer: difficultyLevel,
      explanation: `Teks ini dirancang ${difficultyLevel} untuk level ${text.level}.`,
      points: 20
    });

    // Question 4: Reading comprehension self-assessment
    dynamicQuestions.push({
      id: `${textHash}_comprehension`,
      type: 'multiple-choice',
      question: 'Setelah membaca teks ini, seberapa baik pemahaman Anda terhadap isinya?',
      options: ['Sangat paham (90-100%)', 'Cukup paham (70-89%)', 'Kurang paham (50-69%)', 'Tidak paham (<50%)'],
      correctAnswer: 'Sangat paham (90-100%)',
      explanation: 'Target yang baik adalah memahami minimal 90% dari isi teks.',
      points: 20
    });

    // Question 5: Application/practical use
    dynamicQuestions.push({
      id: `${textHash}_application`,
      type: 'multiple-choice',
      question: 'Informasi dalam teks ini paling berguna untuk situasi?',
      options: ['Percakapan sehari-hari', 'Ujian tertulis', 'Presentasi formal', 'Menulis email'],
      correctAnswer: 'Percakapan sehari-hari',
      explanation: 'Konten teks ini praktis untuk digunakan dalam komunikasi sehari-hari.',
      points: 20
    });

    setQuestions(dynamicQuestions);
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
    let totalScore = 0;
    let correctAnswers = 0;

    questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        totalScore += question.points;
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
    generateQuiz();
    setQuizStartTime(Date.now());
  }, []);

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Brain className="h-16 w-16 mx-auto text-blue-600 animate-pulse mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Quiz...</h3>
          <p className="text-gray-600">AI sedang membuat soal berdasarkan teks yang Anda baca</p>
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
          {currentQuestion.options && (
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
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sebelumnya
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Lightbulb className="h-4 w-4" />
            <span>Pilih jawaban yang paling tepat</span>
          </div>

          <button
            onClick={nextQuestion}
            disabled={!userAnswer}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingQuiz;