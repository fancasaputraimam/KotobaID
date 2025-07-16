import React from 'react';
import { useNavigate } from 'react-router-dom';

const AIToolsDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Quiz AI Card */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2 text-blue-700">Quiz AI</h2>
        <p className="text-gray-600 mb-4 text-sm text-center">Buat soal quiz otomatis dari AI untuk latihan kanji, grammar, JLPT, atau budaya Jepang.</p>
        <button onClick={() => navigate('/ai-tools/quiz')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-auto">Buka</button>
      </div>
      {/* Contoh Kalimat AI Card */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2 text-purple-700">Contoh Kalimat AI</h2>
        <p className="text-gray-600 mb-4 text-sm text-center">Minta AI membuat contoh kalimat dari grammar atau kosakata tertentu.</p>
        <button onClick={() => navigate('/ai-tools/example')} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mt-auto">Buka</button>
      </div>
      {/* Latihan JLPT AI Card */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2 text-red-700">Latihan JLPT AI</h2>
        <p className="text-gray-600 mb-4 text-sm text-center">Simulasi soal JLPT dari AI, lengkap dengan jawaban dan penilaian otomatis.</p>
        <button onClick={() => navigate('/ai-tools/jlpt')} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mt-auto">Buka</button>
      </div>
    </div>
  );
};

export default AIToolsDashboard; 