import React, { useState } from 'react';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';

type JLPTQuizItem = {
  question: string;
  options: string[];
  answer: string;
};

const parseJLPTQuiz = (text: string): JLPTQuizItem[] | null => {
  try {
    const match = text.match(/\[([\s\S]*)\]/);
    if (match) {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr) && arr[0]?.question && arr[0]?.options && arr[0]?.answer) {
        return arr.slice(0, 10);
      }
    }
  } catch {}
  return null;
};

const JLPTAIPage: React.FC = () => {
  const [level, setLevel] = useState('N5');
  const [quiz, setQuiz] = useState<JLPTQuizItem[] | null>(null);
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
      // Untuk N5: 10 soal, N4-N1: 5 soal
      const jumlahSoal = level === 'N5' ? 10 : 5;
      const prompt = `Buatkan ${jumlahSoal} soal quiz JLPT level ${level} pilihan ganda beserta jawabannya. Jawab HANYA dengan JSON array: [{question, options, answer}]. Jangan tambahkan penjelasan apapun di luar array.`;
      const res = await azureOpenAI.generateExplanation({ prompt, type: 'conversation' });
      setQuizRaw(res.text);
      const parsed = parseJLPTQuiz(res.text);
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
      <h1 className="text-3xl font-extrabold mb-4 text-green-700 text-center drop-shadow">JLPT AI Quiz</h1>
      <p className="text-gray-600 mb-6 text-center text-lg">Latihan soal JLPT (N5-N1) dengan AI. Pilih level, jawab soal, dan cek skor kamu!</p>
      <form onSubmit={handleQuizAI} className="flex items-center justify-center space-x-2 mb-6">
        <select value={level} onChange={e => setLevel(e.target.value)} className="border rounded px-2 py-1">
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={quizLoading}>{quizLoading ? 'Membuat...' : 'Buat Soal JLPT'}</button>
      </form>
      <div className="whitespace-pre-line text-sm bg-gray-50 rounded-xl p-6 min-h-[80px] shadow-md">
        {quizLoading && <LoadingSpinner size="md" />}
        {!quizLoading && quiz && (
          <>
            {((level === 'N5' && quiz.length < 10) || (level !== 'N5' && quiz.length < 5)) && (
              <div className="text-yellow-600 mb-2 text-sm text-center font-semibold">
                AI hanya mengembalikan {quiz.length} soal dari {level === 'N5' ? 10 : 5}.
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); handleFinish(); }}>
              <div className="space-y-8">
                {quiz.map((q, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 relative transition-transform hover:scale-[1.02]">
                    <div className="absolute top-2 right-4 text-xs text-gray-400 font-semibold">Soal {idx + 1} / {quiz.length}</div>
                    <div className="font-bold text-lg mb-4 text-green-700 drop-shadow">{q.question}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map(opt => {
                        const isSelected = userAnswers[idx] === opt;
                        const isCorrect = showResult && opt === q.answer;
                        const isWrong = showResult && isSelected && opt !== q.answer;
                        return (
                          <label
                            key={opt}
                            className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all
                              ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}
                              ${isCorrect ? 'border-blue-500 bg-blue-50' : ''}
                              ${isWrong ? 'border-red-500 bg-red-50' : ''}
                              hover:border-green-400 hover:bg-green-100
                            `}
                          >
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={opt}
                              checked={isSelected}
                              onChange={() => handleSelect(idx, opt)}
                              disabled={showResult}
                              className="mr-3 accent-green-600"
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
                  <div className="px-8 py-4 bg-green-100 rounded-full shadow text-2xl font-extrabold text-green-700 mb-2">
                    Skor: {score} / {quiz.length}
                  </div>
                  <div className="text-green-700 font-semibold mb-2">Bagikan hasilmu ke teman dan terus berlatih!</div>
                  <div className="mt-4 text-sm text-gray-500 text-center border-t pt-4">
                    Dukung pengembangan aplikasi ini via <span className="font-bold text-green-700">Dana 085813601701</span>
                  </div>
                </div>
              )}
            </form>
          </>
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

export default JLPTAIPage; 