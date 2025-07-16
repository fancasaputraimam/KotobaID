import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { Grammar, Chapter } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const GrammarManager: React.FC = () => {
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [showForm, setShowForm] = useState(false);
  const [editingGrammar, setEditingGrammar] = useState<Grammar | null>(null);

  useEffect(() => {
    loadChapters();
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      loadGrammars();
    }
  }, [selectedChapter]);

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

  const loadGrammars = async () => {
    setLoading(true);
    try {
      const grammarsData = await firestoreService.getGrammarByChapter(selectedChapter);
      setGrammars(grammarsData);
    } catch (error) {
      console.error('Error loading grammars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrammar = () => {
    setEditingGrammar(null);
    setShowForm(true);
  };

  const handleEditGrammar = (grammar: Grammar) => {
    setEditingGrammar(grammar);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGrammar(null);
  };

  const handleSaveGrammar = async (grammarData: Omit<Grammar, 'id'>) => {
    try {
      if (editingGrammar) {
        await firestoreService.updateGrammar(editingGrammar.id, grammarData);
      } else {
        await firestoreService.saveGrammar(grammarData);
      }
      handleCloseForm();
      loadGrammars();
    } catch (error) {
      console.error('Error saving grammar:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Tata Bahasa</h2>
          <p className="text-gray-600 mt-1">
            Kelola materi tata bahasa berdasarkan bab Minna no Nihongo
          </p>
        </div>
        <div className="flex items-center space-x-4">
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
          <button
            onClick={handleAddGrammar}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tata Bahasa</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grammars.map((grammar) => (
            <div key={grammar.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">{grammar.title}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditGrammar(grammar)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Struktur:</p>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded text-red-600">
                    {grammar.structure}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Penjelasan:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{grammar.explanation}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Contoh:</p>
                  <div className="space-y-1">
                    {grammar.examples.slice(0, 2).map((example, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{example.sentence}</p>
                        <p className="text-gray-600">{example.meaning}</p>
                      </div>
                    ))}
                    {grammar.examples.length > 2 && (
                      <p className="text-xs text-gray-500">+{grammar.examples.length - 2} contoh lainnya</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {grammars.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada tata bahasa untuk bab {selectedChapter}</p>
        </div>
      )}

      {showForm && (
        <GrammarForm
          grammar={editingGrammar}
          selectedChapter={selectedChapter}
          onSave={handleSaveGrammar}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

// Grammar Form Component
interface GrammarFormProps {
  grammar: Grammar | null;
  selectedChapter: number;
  onSave: (grammar: Omit<Grammar, 'id'>) => void;
  onClose: () => void;
}

const GrammarForm: React.FC<GrammarFormProps> = ({ grammar, selectedChapter, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: grammar?.title || '',
    chapter: grammar?.chapter || selectedChapter,
    structure: grammar?.structure || '',
    explanation: grammar?.explanation || '',
    examples: grammar?.examples || []
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
            {grammar ? 'Edit Tata Bahasa' : 'Tambah Tata Bahasa'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Tata Bahasa
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Kalimat Negatif dengan じゃありません"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bab
              </label>
              <input
                type="number"
                value={formData.chapter}
                onChange={(e) => setFormData({...formData, chapter: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Struktur/Rumus
              </label>
              <input
                type="text"
                value={formData.structure}
                onChange={(e) => setFormData({...formData, structure: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Subjek は Predikat じゃありません"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penjelasan
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Penjelasan singkat tentang tata bahasa ini..."
                required
              />
            </div>

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
                {grammar ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GrammarManager;