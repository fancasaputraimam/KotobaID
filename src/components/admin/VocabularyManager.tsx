import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, BookOpen, Globe, Filter, Download } from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { Vocabulary, Chapter } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const VocabularyManager: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'chapter' | 'jlpt'>('chapter');
  const [selectedLevel, setSelectedLevel] = useState<'N1' | 'N2' | 'N3' | 'N4' | 'N5'>('N5');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [showForm, setShowForm] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null);

  const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

  useEffect(() => {
    loadChapters();
  }, []);

  useEffect(() => {
    loadVocabularies();
  }, [category, selectedLevel, selectedChapter]);

  const loadChapters = async () => {
    try {
      const chaptersData = await firestoreService.getAllChapters();
      setChapters(chaptersData);
      if (chaptersData.length > 0 && !selectedChapter) {
        setSelectedChapter(chaptersData[0].number);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const loadVocabularies = async () => {
    setLoading(true);
    try {
      let vocabs: Vocabulary[] = [];
      if (category === 'jlpt') {
        vocabs = await firestoreService.getVocabularyByJLPT(selectedLevel);
      } else {
        vocabs = await firestoreService.getVocabularyByChapter(selectedChapter);
      }
      setVocabularies(vocabs);
    } catch (error) {
      console.error('Error loading vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVocabulary = () => {
    setEditingVocab(null);
    setShowForm(true);
  };

  const handleEditVocabulary = (vocab: Vocabulary) => {
    setEditingVocab(vocab);
    setShowForm(true);
  };

  const handleDeleteVocabulary = async (vocab: Vocabulary) => {
    if (!confirm(`Hapus kosakata "${vocab.word}"?`)) return;
    
    try {
      await firestoreService.deleteVocabulary(vocab.id);
      loadVocabularies();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVocab(null);
  };

  const handleSaveVocabulary = async (vocabularyData: Omit<Vocabulary, 'id'>) => {
    try {
      if (editingVocab) {
        await firestoreService.updateVocabulary(editingVocab.id, vocabularyData);
      } else {
        await firestoreService.saveVocabulary(vocabularyData);
      }
      handleCloseForm();
      loadVocabularies();
    } catch (error) {
      console.error('Error saving vocabulary:', error);
    }
  };

  const handleImportChapterVocabulary = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setLoading(true);

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!Array.isArray(data)) {
          alert('Format file tidak valid. Harus berupa array JSON.');
          setLoading(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        let totalCount = data.length;
        
        alert(`Memulai import ${totalCount} kosakata Bab ${selectedChapter}...`);

        for (const item of data) {
          try {
            const vocabulary: Omit<Vocabulary, 'id'> = {
              word: item.word || '',
              reading: item.reading || '',
              meaning: item.meaning || '',
              chapter: item.chapter || selectedChapter,
              audioUrl: item.audioUrl || '',
              examples: item.examples || [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            // Only add jlptLevel if it exists and is not undefined
            if (item.jlptLevel !== undefined && item.jlptLevel !== null) {
              vocabulary.jlptLevel = item.jlptLevel;
            }

            if (!vocabulary.word || !vocabulary.reading || !vocabulary.meaning) {
              errorCount++;
              continue;
            }

            await firestoreService.saveVocabulary(vocabulary);
            successCount++;
            
            // Add a small delay to avoid overwhelming Firestore
            if (successCount % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error('Error importing vocabulary item:', error);
            errorCount++;
          }
        }

        alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${errorCount}\nTotal: ${totalCount}`);
        loadVocabularies();
      } catch (error) {
        console.error('Error importing vocabulary:', error);
        alert('Gagal mengimpor file. Pastikan format JSON valid.');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const handleImportJLPTVocabulary = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setLoading(true);

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!Array.isArray(data)) {
          alert('Format file tidak valid. Harus berupa array JSON.');
          setLoading(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        let totalCount = data.length;
        
        alert(`Memulai import ${totalCount} kosakata JLPT...`);

        for (const item of data) {
          try {
            // Ekstrak data dari format JSON yang diberikan
            const word = item.word || ''; 
            
            // Prioritaskan furigana jika ada, jika tidak gunakan reading atau romaji
            let reading = '';
            if (item.furigana) {
              reading = item.furigana;
            } else if (item.reading) {
              reading = item.reading;
            } else if (item.romaji) {
              reading = item.romaji;
            }
            
            const meaning = item.meaning || '';
            
            // Tentukan level JLPT
            let jlptLevel = selectedLevel;
            if (item.jlptLevel) {
              jlptLevel = item.jlptLevel;
            } else if (item.level) {
              // Konversi level numerik ke format JLPT
              if (typeof item.level === 'number') {
                jlptLevel = `N${item.level}` as 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
              } else {
                jlptLevel = item.level as 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
              }
            }
            
            // Siapkan array contoh
            let examples = [];
            
            // Gunakan examples jika tersedia
            if (Array.isArray(item.examples)) {
              examples = item.examples;
            } 
            // Jika tidak ada examples tapi ada sentence, buat contoh baru
            else if (item.sentence) {
              examples.push({
                sentence: item.sentence,
                reading: item.sentenceReading || '',
                meaning: item.sentenceMeaning || ''
              });
            }
            
            const vocabulary: Omit<Vocabulary, 'id'> = {
              word: word,
              reading: reading,
              meaning: meaning,
              jlptLevel: jlptLevel,
              audioUrl: item.audioUrl || '',
              examples: examples,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            // Only add chapter if it exists and is not undefined
            if (item.chapter !== undefined && item.chapter !== null) {
              vocabulary.chapter = item.chapter;
            }

            // Validate required fields
            if (!word) {
              console.error('Kata kosong:', item);
              errorCount++;
              continue;
            }

            await firestoreService.saveVocabulary(vocabulary);
            successCount++;
            
            // Add a small delay to avoid overwhelming Firestore
            if (successCount % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 200));
              console.log(`Progress: ${successCount}/${totalCount}`);
            }
          } catch (error) {
            console.error('Error importing vocabulary item:', error);
            errorCount++;
          }
        }

        alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${errorCount}\nTotal: ${totalCount}`);
        loadVocabularies();
      } catch (error) {
        console.error('Error importing vocabulary:', error);
        alert('Gagal mengimpor file. Pastikan format JSON valid.');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const downloadSampleChapterJSON = () => {
    const sampleData = [
      {
        word: "こんにちは",
        reading: "konnichiwa",
        meaning: "halo, selamat siang",
        chapter: 1,
        jlptLevel: "N5",
        audioUrl: "",
        examples: [
          {
            sentence: "こんにちは、田中さん。",
            reading: "konnichiwa, tanaka-san",
            meaning: "Halo, Tanaka-san."
          }
        ]
      },
      {
        word: "ありがとう",
        reading: "arigatou",
        meaning: "terima kasih",
        chapter: 1,
        jlptLevel: "N5",
        audioUrl: "",
        examples: [
          {
            sentence: "ありがとうございます。",
            reading: "arigatou gozaimasu",
            meaning: "Terima kasih (formal)."
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-vocabulary-chapter.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleJLPTJSON = () => {
    const sampleData = [
      {
        word: "同感", 
        furigana: "どうかん",
        romaji: "dōkan",
        meaning: "agreement; same opinion; same feeling; sympathy; concurrence",
        level: 1,
        audioUrl: "",
        examples: [
          {
            sentence: "彼の意見に同感です。", 
            reading: "kare no iken ni dōkan desu", 
            meaning: "Saya setuju dengan pendapatnya."
          }
        ]
      },
      {
        word: "風車", 
        furigana: "かざぐるま",
        romaji: "kazaguruma",
        meaning: "1.  windmill; 2.  pinwheel",
        level: 1,
        audioUrl: "",
        examples: [
          {
            sentence: "子供が風車で遊んでいます。", 
            reading: "kodomo ga kazaguruma de asonde imasu", 
            meaning: "Anak-anak sedang bermain dengan baling-baling."
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-vocabulary-jlpt-n1.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDisplayTitle = () => {
    if (category === 'jlpt') {
      return `Kosakata JLPT ${selectedLevel}`;
    } else {
      const chapter = chapters.find(ch => ch.number === selectedChapter);
      return `Kosakata Bab ${selectedChapter}${chapter ? `: ${chapter.title}` : ''}`;
    }
  };

  const getVocabCount = () => {
    return vocabularies.length;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Kosakata</h2>
          <p className="text-gray-600 mt-1">
            Kelola kosakata berdasarkan bab atau level JLPT
          </p>
        </div>
        <button
          onClick={handleAddVocabulary}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kosakata</span>
        </button>
      </div>

      {/* Category Selection */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Category Toggle */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Kategori:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCategory('chapter')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    category === 'chapter'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Per Bab</span>
                </button>
                <button
                  onClick={() => setCategory('jlpt')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    category === 'jlpt'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>JLPT</span>
                </button>
              </div>
            </div>

            {/* Level/Chapter Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {category === 'jlpt' ? 'Level:' : 'Bab:'}
              </span>
              {category === 'jlpt' ? (
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {jlptLevels.map(level => (
                    <option key={level} value={level}>JLPT {level}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {chapters.map(chapter => (
                    <option key={chapter.id} value={chapter.number}>
                      Bab {chapter.number}: {chapter.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {getVocabCount()} kosakata
          </div>
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          {category === 'jlpt' ? (
            <Globe className="h-6 w-6 text-blue-600" />
          ) : (
            <BookOpen className="h-6 w-6 text-blue-600" />
          )}
          <div>
            <h3 className="font-semibold text-blue-900">{getDisplayTitle()}</h3>
            <p className="text-sm text-blue-700">
              {category === 'jlpt' 
                ? `Kosakata untuk ujian JLPT level ${selectedLevel}`
                : `Kosakata yang dipelajari di bab ${selectedChapter} Minna no Nihongo`
              }
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bacaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contoh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vocabularies.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vocab.word}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vocab.reading}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{vocab.meaning}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {vocab.jlptLevel && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {vocab.jlptLevel}
                          </span>
                        )}
                        {vocab.chapter && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Bab {vocab.chapter}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {vocab.examples.length > 0 ? (
                          <span>{vocab.examples.length} contoh</span>
                        ) : (
                          <span className="text-gray-400">Tidak ada</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditVocabulary(vocab)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteVocabulary(vocab)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {vocabularies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Belum ada kosakata untuk {category === 'jlpt' ? `level ${selectedLevel}` : `bab ${selectedChapter}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Import Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Impor Kosakata Per Bab
          </h3>
          <p className="text-blue-700 mb-4 text-sm">
            Import kosakata dari file JSON yang berisi daftar kosakata berdasarkan bab Minna no Nihongo.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleImportChapterVocabulary}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full justify-center"
            >
              <Upload className="h-4 w-4" />
              <span>Impor Kosakata Bab</span>
            </button>
            <button 
              onClick={downloadSampleChapterJSON}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 w-full justify-center text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download Contoh JSON</span>
            </button>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Impor Kosakata JLPT
          </h3>
          <p className="text-green-700 mb-4 text-sm">
            Import kosakata dari file JSON yang berisi daftar kosakata berdasarkan level JLPT.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleImportJLPTVocabulary}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full justify-center"
            >
              <Upload className="h-4 w-4" />
              <span>Impor Kosakata JLPT</span>
            </button>
            <button 
              onClick={downloadSampleJLPTJSON}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 w-full justify-center text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download Contoh JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Guide */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Panduan Import Kosakata</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📚 Format JSON untuk Kosakata Bab:</h4>
            <div className="bg-white p-3 rounded border text-xs font-mono">
              <pre>{`[
  {
    "word": "こんにちは",
    "reading": "konnichiwa", 
    "meaning": "halo, selamat siang",
    "chapter": 1,
    "jlptLevel": "N5",
    "examples": [
      {
        "sentence": "こんにちは、田中さん。",
        "reading": "konnichiwa, tanaka-san",
        "meaning": "Halo, Tanaka-san."
      }
    ]
  }
]`}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🌍 Format JSON untuk Kosakata JLPT:</h4>
            <div className="bg-white p-3 rounded border text-xs font-mono">
              <pre>{`[
  {
    "word": "学生",
    "reading": "がくせい",
    "meaning": "siswa, mahasiswa", 
    "jlptLevel": "N5",
    "chapter": 1,
    "examples": [
      {
        "sentence": "私は学生です。",
        "reading": "watashi wa gakusei desu",
        "meaning": "Saya adalah siswa."
      }
    ]
  }
]`}</pre>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Tips Import:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Field wajib: <code>word</code>, <code>reading</code>, <code>meaning</code></li>
            <li>• Field opsional: <code>chapter</code>, <code>jlptLevel</code>, <code>audioUrl</code>, <code>examples</code></li>
            <li>• Download contoh JSON untuk melihat format yang benar</li>
            <li>• Pastikan encoding file adalah UTF-8 untuk karakter Jepang</li>
            <li>• Import akan menambahkan data baru, tidak mengganti yang sudah ada</li>
          </ul>
        </div>
      </div>

      {showForm && (
        <VocabularyForm
          vocabulary={editingVocab}
          category={category}
          selectedChapter={selectedChapter}
          selectedLevel={selectedLevel}
          onSave={handleSaveVocabulary}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

// Vocabulary Form Component
interface VocabularyFormProps {
  vocabulary: Vocabulary | null;
  category: 'chapter' | 'jlpt';
  selectedChapter: number;
  selectedLevel: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  onSave: (vocabulary: Omit<Vocabulary, 'id'>) => void;
  onClose: () => void;
}

const VocabularyForm: React.FC<VocabularyFormProps> = ({ 
  vocabulary, 
  category, 
  selectedChapter, 
  selectedLevel, 
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    word: vocabulary?.word || '',
    reading: vocabulary?.reading || '',
    meaning: vocabulary?.meaning || '',
    jlptLevel: vocabulary?.jlptLevel || (category === 'jlpt' ? selectedLevel : undefined),
    chapter: vocabulary?.chapter || (category === 'chapter' ? selectedChapter : undefined),
    audioUrl: vocabulary?.audioUrl || '',
    examples: vocabulary?.examples || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { sentence: '', reading: '', meaning: '' }]
    });
  };

  const updateExample = (index: number, field: string, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const removeExample = (index: number) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: newExamples });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {vocabulary ? 'Edit Kosakata' : 'Tambah Kosakata'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kata
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData({...formData, word: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: こんにちは"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bacaan
                </label>
                <input
                  type="text"
                  value={formData.reading}
                  onChange={(e) => setFormData({...formData, reading: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: konnichiwa"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arti
              </label>
              <textarea
                value={formData.meaning}
                onChange={(e) => setFormData({...formData, meaning: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Arti dalam bahasa Indonesia"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level JLPT
                </label>
                <select
                  value={formData.jlptLevel || ''}
                  onChange={(e) => setFormData({...formData, jlptLevel: e.target.value as any || undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tidak ada</option>
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bab
                </label>
                <input
                  type="number"
                  value={formData.chapter || ''}
                  onChange={(e) => setFormData({...formData, chapter: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="Nomor bab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Audio (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Examples Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contoh Kalimat
                </label>
                <button
                  type="button"
                  onClick={addExample}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Tambah Contoh
                </button>
              </div>
              
              {formData.examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Contoh {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={example.sentence}
                      onChange={(e) => updateExample(index, 'sentence', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Kalimat dalam bahasa Jepang"
                      required
                    />
                    <input
                      type="text"
                      value={example.reading}
                      onChange={(e) => updateExample(index, 'reading', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bacaan (romaji atau hiragana)"
                    />
                    <input
                      type="text"
                      value={example.meaning}
                      onChange={(e) => updateExample(index, 'meaning', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Arti dalam bahasa Indonesia"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {vocabulary ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VocabularyManager;