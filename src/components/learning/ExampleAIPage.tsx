import React, { useState } from 'react';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';

const ExampleAIPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState<'kanji' | 'kana'>('kanji');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExamples([]);
    let prompt = '';
    if (version === 'kanji') {
      prompt = `Buatkan 5 contoh kalimat bahasa Jepang beserta terjemahan Indonesia untuk: ${input}. Setiap kanji WAJIB diberi furigana dalam tanda kurung setelahnya, meskipun kanji tersebut sangat umum. Contoh: 学生(がくせい)は図書館(としょかん)に行(い)きます。 (Siswa pergi ke perpustakaan.) Format: ["kalimat (terjemahan)", ...]`;
    } else {
      prompt = `Buatkan 5 contoh kalimat bahasa Jepang (tanpa kanji, hanya hiragana atau katakana) beserta terjemahan Indonesia untuk: ${input}. Format: ["kalimat (terjemahan)", ...]`;
    }
    try {
      const res = await azureOpenAI.generateExplanation({ prompt, type: 'conversation' });
      // Ambil array string dari hasil AI
      const match = res.text.match(/\[([\s\S]*)\]/);
      let arr: string[] | null = null;
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            arr = parsed;
          }
        } catch {}
      }
      // Parsing toleran: jika gagal, ambil semua string diapit tanda kutip ganda
      if (!arr) {
        const regex = /"([^"]+)"/g;
        const found: string[] = [];
        let m;
        while ((m = regex.exec(res.text)) !== null) {
          found.push(m[1]);
        }
        if (found.length > 0) arr = found;
      }
      if (arr && arr.length > 0) {
        setExamples(arr);
      } else {
        setError('Contoh kalimat tidak dapat diproses.\n\nHasil mentah AI:\n' + res.text);
      }
    } catch {
      setError('Gagal mendapatkan contoh kalimat dari AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold mb-4 text-purple-700 text-center drop-shadow">Contoh Kalimat AI</h1>
      <p className="text-gray-600 mb-6 text-center text-lg">Dapatkan contoh kalimat bahasa Jepang beserta terjemahan Indonesia untuk kata/frasa/topik apapun.</p>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center md:space-x-2 mb-6 space-y-2 md:space-y-0">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full max-w-xs"
          placeholder="Masukkan kata/frasa/topik..."
          value={input}
          onChange={e => setInput(e.target.value)}
          required
        />
        <select value={version} onChange={e => setVersion(e.target.value as 'kanji' | 'kana')} className="border rounded px-2 py-2">
          <option value="kanji">Kanji + Furigana</option>
          <option value="kana">Hiragana/Katakana saja</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" disabled={loading || !input.trim()}>{loading ? 'Membuat...' : 'Buat Contoh Kalimat'}</button>
      </form>
      <div className="min-h-[120px]">
        {loading && <LoadingSpinner size="md" />}
        {!loading && error && (
          <div className="text-red-600 whitespace-pre-wrap">{error}</div>
        )}
        {!loading && !error && examples.length > 0 && (
          <>
            <div className="space-y-4 mt-4">
              {examples.map((ex, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-400">
                  <span className="font-semibold text-purple-700">{idx + 1}.</span> <span className="ml-2 text-gray-800">{ex}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-sm text-gray-500 text-center border-t pt-4">
              Dukung pengembangan aplikasi ini via <span className="font-bold text-purple-700">Dana 085813601701</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExampleAIPage; 