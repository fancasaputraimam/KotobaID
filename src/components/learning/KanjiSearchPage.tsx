import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { kanjiAPI } from '../../services/kanjiAPI';
import { azureOpenAI } from '../../services/azureOpenAI';

interface KanjiResult {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string[];
  examples?: string[];
}

function isSingleKanji(str: string) {
  return str.length === 1 && /[一-龯]/.test(str);
}

const KanjiSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<KanjiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    let kanjiChar = query.trim();
    try {
      // Jika input bukan satu karakter kanji, gunakan AI untuk mencari kanji
      if (!isSingleKanji(kanjiChar)) {
        const prompt = `Kanji apa yang berarti "${kanjiChar}" dalam bahasa Jepang? Jawab HANYA dengan satu karakter kanji.`;
        const res = await azureOpenAI.generateExplanation({ prompt, type: 'conversation' });
        const aiKanji = res.text.match(/[一-龯]/);
        if (aiKanji) {
          kanjiChar = aiKanji[0];
        } else {
          setError('Kanji tidak ditemukan oleh AI.');
          setLoading(false);
          return;
        }
      }
      const res = await kanjiAPI.getKanjiDetails(kanjiChar);
      if (res) {
        // Terjemahkan meaning ke bahasa Indonesia jika masih Inggris
        let meaningsIndo = res.meanings;
        if (meaningsIndo.length > 0) {
          const prompt = `Terjemahkan daftar arti berikut ke bahasa Indonesia, pisahkan dengan koma: ${meaningsIndo.join(', ')}. Jawab hanya dengan daftar arti dalam bahasa Indonesia, koma dipisah.`;
          try {
            const aiRes = await azureOpenAI.generateExplanation({ prompt, type: 'conversation' });
            const indoArr = aiRes.text.split(',').map(s => s.trim()).filter(Boolean);
            if (indoArr.length > 0) meaningsIndo = indoArr;
          } catch {}
        }
        setResult({
          kanji: res.kanji,
          onyomi: res.on_readings,
          kunyomi: res.kun_readings,
          meaning: meaningsIndo,
          examples: res.name_readings?.slice(0, 5) || [],
        });
      } else {
        setError('Kanji tidak ditemukan.');
      }
    } catch {
      setError('Kanji tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold mb-4 text-orange-700 text-center drop-shadow">Pencarian Kanji</h1>
      <p className="text-gray-600 mb-6 text-center text-lg">Cari kanji berdasarkan karakter, bacaan, atau arti. Jika bukan karakter kanji, AI akan membantu mencari kanji yang relevan.</p>
      <form onSubmit={handleSearch} className="flex items-center justify-center space-x-2 mb-6">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full max-w-xs"
          placeholder="Masukkan kanji, bacaan, atau arti..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
        />
        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700" disabled={loading || !query.trim()}>{loading ? 'Mencari...' : 'Cari Kanji'}</button>
      </form>
      <div className="min-h-[120px]">
        {loading && <LoadingSpinner size="md" />}
        {!loading && error && (
          <div className="text-red-600 whitespace-pre-wrap">{error}</div>
        )}
        {!loading && result && (
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-400 flex flex-col items-center">
            <div className="text-6xl font-extrabold text-orange-700 mb-2 drop-shadow">{result.kanji}</div>
            <div className="mb-2 text-gray-700 text-lg">Arti: <span className="font-semibold">{result.meaning.join(', ')}</span></div>
            <div className="mb-2 text-gray-700">Onyomi: <span className="font-mono">{result.onyomi.join(', ')}</span></div>
            <div className="mb-2 text-gray-700">Kunyomi: <span className="font-mono">{result.kunyomi.join(', ')}</span></div>
            {result.examples && result.examples.length > 0 && (
              <div className="mt-2 w-full">
                <div className="font-semibold text-orange-700 mb-1">Contoh Nama Bacaan:</div>
                <ul className="list-disc ml-6 text-gray-800">
                  {result.examples.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanjiSearchPage; 