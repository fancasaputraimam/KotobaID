import React, { useState } from 'react';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';

type QuizItem = {
  question: string;
  options: string[];
  answer: string;
};

// Parsing sederhana: hanya terima JSON array valid
const parseQuizJSON = (text: string): QuizItem[] | null => {
  try {
    // Ekstrak semua objek {...} di dalam array (meski array tidak lengkap)
    const objects = text.match(/\{[^}]*\}/g);
    if (objects && objects.length > 0) {
      const valid: QuizItem[] = [];
      for (const objStr of objects) {
        try {
          // Pastikan koma di akhir tidak mengganggu
          const clean = objStr.replace(/,\s*$/, "");
          const obj = JSON.parse(clean);
          if (obj && obj.question && obj.options && obj.answer) {
            valid.push(obj);
          }
        } catch {}
      }
      if (valid.length > 0) {
        return valid.slice(0, 10); // maksimal 10 soal valid
      }
    }
    // Fallback: coba parse langsung jika text valid JSON array
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr) && arr[0]?.question && arr[0]?.options && arr[0]?.answer) {
        return arr.slice(0, 10);
      }
    } catch {}
  } catch {}
  return null;
};

const QuizAIPage: React.FC = () => {
  const [quizTopic, setQuizTopic] = useState('kanji');
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [quizRaw, setQuizRaw] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleQuizAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizLoading(true);
    setQuiz(null);
    setQuizRaw('');
    setUserAnswers([]);
    setShowResult(false);
    try {
      const jumlahSoal = 10;
      const prompt = `Buatkan ${jumlahSoal} soal quiz pilihan ganda beserta jawabannya tentang ${quizTopic} bahasa Jepang. Jawab HANYA dengan JSON array: [{question, options, answer}]. Jangan tambahkan penjelasan apapun di luar array.`;
      const res = await azureOpenAI.generateExplanation({ prompt, type: 'conversation' });
      setQuizRaw(res.text);
      const parsed = parseQuizJSON(res.text);
      if (parsed) {
        setQuiz(parsed);
        setUserAnswers(Array(parsed.length).fill(''));
      } else {
        setQuiz(null);
      }
    } catch {
      setQuiz(null);
      setQuizRaw('Gagal mendapatkan quiz dari AI.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelect = (idx: number, value: string) => {
    setUserAnswers(ans => ans.map((a, i) => (i === idx ? value : a)));
  };

  const handleFinish = () => {
    setShowResult(true);
  };

  const score = quiz && userAnswers.length === quiz.length
    ? quiz.reduce((acc, q, i) => acc + (userAnswers[i] === q.answer ? 1 : 0), 0)
    : 0;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold mb-4 text-blue-700 text-center drop-shadow">Quiz Kanji AI</h1>
      <p className="text-gray-600 mb-6 text-center text-lg">Latihan quiz kanji, grammar, JLPT, atau kosakata dengan AI. Pilih jawaban yang benar dan cek skor kamu!</p>
      {/* Tombol dan dropdown buat quiz */}
      <form onSubmit={handleQuizAI} className="flex items-center justify-center space-x-2 mb-6">
        <select value={quizTopic} onChange={e => setQuizTopic(e.target.value)} className="border rounded px-2 py-1">
          <option value="kanji">Kanji</option>
          <option value="grammar">Grammar</option>
          <option value="JLPT">JLPT</option>
          <option value="kotoba">Kotoba</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={quizLoading}>{quizLoading ? 'Membuat...' : 'Buat Quiz'}</button>
      </form>
      {quiz && (
        <div className="w-full mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
              style={{ width: `${(userAnswers.filter(Boolean).length / quiz.length) * 100}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {userAnswers.filter(Boolean).length} / {quiz.length} dijawab
          </div>
        </div>
      )}
      <div className="whitespace-pre-line text-sm bg-gray-50 rounded-xl p-6 min-h-[80px] shadow-md">
        {quizLoading && <LoadingSpinner size="md" />}
        {!quizLoading && quiz && (
          <form onSubmit={e => { e.preventDefault(); handleFinish(); }}>
            <div className="space-y-8">
              {quiz.map((q, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 relative transition-transform hover:scale-[1.02]">
                  <div className="absolute top-2 right-4 text-xs text-gray-400 font-semibold">Soal {idx + 1} / {quiz.length}</div>
                  <div className="font-bold text-lg mb-4 text-blue-700 drop-shadow">{q.question}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map(opt => {
                      const isSelected = userAnswers[idx] === opt;
                      const isCorrect = showResult && opt === q.answer;
                      const isWrong = showResult && isSelected && opt !== q.answer;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all
                            ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}
                            ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                            ${isWrong ? 'border-red-500 bg-red-50' : ''}
                            hover:border-blue-400 hover:bg-blue-100
                          `}
                        >
                          <input
                            type="radio"
                            name={`q${idx}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleSelect(idx, opt)}
                            disabled={showResult}
                            className="mr-3 accent-blue-600"
                          />
                          <span className="font-medium text-base">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  {showResult && (
                    <div className={`mt-3 font-semibold ${userAnswers[idx] === q.answer ? 'text-green-600' : 'text-red-600'}`}>
                      {userAnswers[idx] === q.answer ? 'Benar!' : `Salah. Jawaban: ${q.answer}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center mt-8">
              {!showResult && (
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  disabled={userAnswers.some(ans => !ans)}
                >
                  Selesai & Lihat Skor
                </button>
              )}
            </div>
            {showResult && (
              <div className="mt-8 flex flex-col items-center">
                <div className="px-8 py-4 bg-blue-100 rounded-full shadow text-2xl font-extrabold text-blue-700 mb-2">
                  Skor: {score} / {quiz.length}
                </div>
                <div className="text-green-700 font-semibold mb-2">Bagikan hasilmu ke teman dan terus berlatih!</div>
                <div className="mt-4 text-sm text-gray-500 text-center border-t pt-4">
                  Dukung pengembangan aplikasi ini via <span className="font-bold text-blue-700">Dana 085813601701</span>
                </div>
              </div>
            )}
          </form>
        )}
        {!quizLoading && !quiz && quizRaw && (
          <div className="text-red-600 whitespace-pre-wrap">
            Quiz tidak dapat diproses.
            <br />
            <br />
            Tips:
            <br />- Pastikan koneksi internet stabil.
            <br />- Jika masalah terus berlanjut, hubungi admin.
            <br />
            <br />Hasil mentah dari AI (bisa copy-paste untuk dicek formatnya):
            <br />{quizRaw}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAIPage; 