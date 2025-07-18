import React, { useState } from 'react';
import { useFlashcards } from '../../contexts/FlashcardContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen,
  Brain,
  MessageSquare,
  Type,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const FlashcardManager: React.FC = () => {
  const { 
    flashcards, 
    createFlashcard, 
    updateFlashcard, 
    deleteFlashcard,
    bulkCreateFlashcards,
    searchCards,
    getCardsByType,
    loading 
  } = useFlashcards();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'kanji' | 'vocabulary' | 'grammar' | 'sentence'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);

  // Create form state
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    type: 'kanji' as 'kanji' | 'vocabulary' | 'grammar' | 'sentence',
    category: 'default',
    hints: '',
    notes: ''
  });

  // Bulk create state
  const [bulkText, setBulkText] = useState('');

  // Filter cards based on search and type
  const filteredCards = React.useMemo(() => {
    let cards = flashcards;

    if (searchTerm) {
      cards = searchCards(searchTerm);
    }

    if (selectedType !== 'all') {
      cards = cards.filter(card => card.type === selectedType);
    }

    return cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [flashcards, searchTerm, selectedType, searchCards]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createFlashcard(
        newCard.front.trim(),
        newCard.back.trim(),
        newCard.type,
        newCard.category
      );
      
      // Reset form
      setNewCard({
        front: '',
        back: '',
        type: 'kanji',
        category: 'default',
        hints: '',
        notes: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating flashcard:', error);
      alert('Gagal membuat flashcard. Silakan coba lagi.');
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse bulk text (format: front|back|type)
      const lines = bulkText.trim().split('\n').filter(line => line.trim());
      const cards = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 2) {
          throw new Error(`Format tidak valid: ${line}`);
        }
        
        return {
          front: parts[0],
          back: parts[1],
          type: (parts[2] || 'vocabulary') as 'kanji' | 'vocabulary' | 'grammar' | 'sentence',
          category: 'bulk-import'
        };
      });

      if (cards.length === 0) {
        throw new Error('Tidak ada kartu yang valid ditemukan');
      }

      await bulkCreateFlashcards(cards);
      setBulkText('');
      setShowBulkCreate(false);
      alert(`Berhasil membuat ${cards.length} flashcard!`);
    } catch (error) {
      console.error('Error bulk creating flashcards:', error);
      alert(`Gagal membuat flashcard: ${error}`);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus flashcard ini?')) {
      try {
        await deleteFlashcard(cardId);
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Gagal menghapus flashcard. Silakan coba lagi.');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kanji': return <BookOpen className="h-4 w-4" />;
      case 'vocabulary': return <Type className="h-4 w-4" />;
      case 'grammar': return <Brain className="h-4 w-4" />;
      case 'sentence': return <MessageSquare className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'kanji': return 'bg-red-100 text-red-800';
      case 'vocabulary': return 'bg-blue-100 text-blue-800';
      case 'grammar': return 'bg-green-100 text-green-800';
      case 'sentence': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Flashcard</h2>
          <p className="text-gray-600">Total: {flashcards.length} kartu</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Kartu</span>
          </button>
          
          <button
            onClick={() => setShowBulkCreate(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="h-4 w-4" />
            <span>Import Massal</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari flashcard..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Semua Tipe</option>
              <option value="kanji">Kanji</option>
              <option value="vocabulary">Kosakata</option>
              <option value="grammar">Tata Bahasa</option>
              <option value="sentence">Kalimat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(card.type)}`}>
                  {getTypeIcon(card.type)}
                  <span className="capitalize">{card.type}</span>
                </span>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingCard(card.id)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium text-gray-500">Depan:</div>
                  <div className="text-lg font-semibold text-gray-900 truncate">{card.front}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Belakang:</div>
                  <div className="text-gray-700 truncate">{card.back}</div>
                </div>
              </div>

              {/* Card Stats */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>
                    <div className="font-medium">Reviews</div>
                    <div>{card.totalReviews}</div>
                  </div>
                  <div>
                    <div className="font-medium">Akurasi</div>
                    <div>{Math.round(card.accuracy)}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Interval</div>
                    <div>{card.interval}d</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Flashcard</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedType !== 'all' 
              ? 'Tidak ada flashcard yang sesuai dengan filter Anda.'
              : 'Mulai dengan membuat flashcard pertama Anda.'
            }
          </p>
          {!searchTerm && selectedType === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Flashcard Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Flashcard Baru</h3>
              
              <form onSubmit={handleCreateCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Kartu
                  </label>
                  <select
                    value={newCard.type}
                    onChange={(e) => setNewCard({...newCard, type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="kanji">Kanji</option>
                    <option value="vocabulary">Kosakata</option>
                    <option value="grammar">Tata Bahasa</option>
                    <option value="sentence">Kalimat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sisi Depan (Pertanyaan)
                  </label>
                  <input
                    type="text"
                    value={newCard.front}
                    onChange={(e) => setNewCard({...newCard, front: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Masukkan pertanyaan atau kanji..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sisi Belakang (Jawaban)
                  </label>
                  <textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard({...newCard, back: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Masukkan jawaban atau arti..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Buat Kartu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Flashcard Massal</h3>
              
              <form onSubmit={handleBulkCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Kartu (Format: Depan|Belakang|Tipe)
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={10}
                    placeholder={`Contoh:
水|air|kanji
こんにちは|halo|vocabulary
です|partikel penanda sopan|grammar`}
                    required
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-1">Format Import:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Setiap baris = 1 flashcard</li>
                    <li>• Format: Depan|Belakang|Tipe (opsional)</li>
                    <li>• Tipe: kanji, vocabulary, grammar, sentence</li>
                    <li>• Jika tipe tidak disebutkan, default: vocabulary</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkCreate(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Import Kartu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;