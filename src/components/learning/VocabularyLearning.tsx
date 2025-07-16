import React, { useState, useEffect } from 'react';
import { Globe, Filter, Search, BookOpen, ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { azureOpenAI } from '../../services/azureOpenAI';
import { Vocabulary, Chapter } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import AudioPlayer from '../common/AudioPlayer';

const VocabularyLearning: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [filteredVocabularies, setFilteredVocabularies] = useState<Vocabulary[]>([]);
  const [paginatedVocabularies, setPaginatedVocabularies] = useState<Vocabulary[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [category, setCategory] = useState<'chapter' | 'jlpt'>('chapter');
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N5');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const jlptLevels = [
    { value: 'N5', label: 'N5 (Pemula)', color: 'bg-green-100 text-green-800' },
    { value: 'N4', label: 'N4 (Dasar)', color: 'bg-blue-100 text-blue-800' },
    { value: 'N3', label: 'N3 (Menengah)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'N2', label: 'N2 (Menengah Atas)', color: 'bg-orange-100 text-orange-800' },
    { value: 'N1', label: 'N1 (Lanjutan)', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadChapters();
  }, []);

  useEffect(() => {
    loadVocabularies();
  }, [category, selectedLevel, selectedChapter]);

  useEffect(() => {
    filterVocabularies();
  }, [vocabularies, searchTerm]);

  useEffect(() => {
    paginateVocabularies();
  }, [filteredVocabularies, currentPage]);

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
    setCurrentPage(1); // Reset to first page when loading new data
    try {
      let vocabData: Vocabulary[] = [];
      if (category === 'jlpt') {
        vocabData = await firestoreService.getVocabularyByJLPT(selectedLevel);
      } else {
        vocabData = await firestoreService.getVocabularyByChapter(selectedChapter);
      }
      setVocabularies(vocabData);
    } catch (error) {
      console.error('Error loading vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVocabularies = () => {
    if (!searchTerm) {
      setFilteredVocabularies(vocabularies);
      return;
    }

    const filtered = vocabularies.filter(vocab =>
      vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVocabularies(filtered);
  };

  const paginateVocabularies = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedVocabularies(filteredVocabularies.slice(startIndex, endIndex));
  };

  const handleTranslateToIndonesian = async (vocab: Vocabulary) => {
    if (translatingId === vocab.id) return;
    
    setTranslatingId(vocab.id);
    try {
      const translation = await azureOpenAI.translateToIndonesian(vocab.meaning);
      
      // Update the vocabulary in state with the translation
      const updatedVocabs = vocabularies.map(v => 
        v.id === vocab.id ? { ...v, meaningIndonesian: translation } : v
      );
      setVocabularies(updatedVocabs);
      
      // Also update filtered vocabularies
      const updatedFiltered = filteredVocabularies.map(v => 
        v.id === vocab.id ? { ...v, meaningIndonesian: translation } : v
      );
      setFilteredVocabularies(updatedFiltered);
      
      // Optionally save the translation to Firestore
      try {
        await firestoreService.updateVocabulary(vocab.id, { 
          meaningIndonesian: translation,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error saving translation to Firestore:', error);
      }
    } catch (error) {
      console.error('Error translating to Indonesian:', error);
    } finally {
      setTranslatingId(null);
    }
  };

  const totalPages = Math.ceil(filteredVocabularies.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredVocabularies.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    const currentIndex = chapters.findIndex(ch => ch.number === selectedChapter);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedChapter(chapters[currentIndex - 1].number);
    } else if (direction === 'next' && currentIndex < chapters.length - 1) {
      setSelectedChapter(chapters[currentIndex + 1].number);
    }
  };

  const getCurrentInfo = () => {
    if (category === 'jlpt') {
      const level = jlptLevels.find(l => l.value === selectedLevel);
      return {
        title: `JLPT ${selectedLevel}`,
        subtitle: level?.label || '',
        color: level?.color || 'bg-gray-100 text-gray-800'
      };
    } else {
      const chapter = chapters.find(ch => ch.number === selectedChapter);
      return {
        title: `Bab ${selectedChapter}`,
        subtitle: chapter?.title || '',
        color: 'bg-blue-100 text-blue-800'
      };
    }
  };

  const currentInfo = getCurrentInfo();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pembelajaran Kosakata</h2>
          <p className="text-gray-600 mt-1">
            Pelajari kosakata berdasarkan bab atau level JLPT
          </p>
        </div>
      </div>

      {/* Category & Search Controls */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Category Toggle */}
          <div className="flex items-center space-x-4">
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
            {category === 'jlpt' ? (
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {jlptLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kosakata..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Chapter Navigation (for chapter mode) */}
      {category === 'chapter' && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateChapter('prev')}
              disabled={selectedChapter === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Bab Sebelumnya</span>
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentInfo.title}
              </h3>
              <p className="text-sm text-gray-600">{currentInfo.subtitle}</p>
            </div>
            
            <button
              onClick={() => navigateChapter('next')}
              disabled={selectedChapter === chapters.length}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Bab Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Current Selection Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {category === 'jlpt' ? (
              <Globe className="h-6 w-6 text-blue-600" />
            ) : (
              <BookOpen className="h-6 w-6 text-blue-600" />
            )}
            <div>
              <h3 className="font-semibold text-blue-900">{currentInfo.title}</h3>
              <p className="text-sm text-blue-700">{currentInfo.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentInfo.color}`}>
              {filteredVocabularies.length} kosakata
            </span>
            {filteredVocabularies.length > itemsPerPage && (
              <p className="text-xs text-gray-600 mt-1">
                Menampilkan {startItem}-{endItem} dari {filteredVocabularies.length} kosakata
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls - Top */}
      {totalPages > 1 && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedVocabularies.map((vocab) => (
            <div key={vocab.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{vocab.word}</h3>
                    {vocab.audioUrl && (
                      <AudioPlayer audioUrl={vocab.audioUrl} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{vocab.reading}</p>
                  <div className="flex flex-col space-y-2">
                    <p className="text-gray-700">{vocab.meaning}</p>
                    {vocab.meaningIndonesian && (
                      <p className="text-green-700 text-sm italic">{vocab.meaningIndonesian}</p>
                    )}
                    {!vocab.meaningIndonesian && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTranslateToIndonesian(vocab);
                        }}
                        disabled={translatingId === vocab.id}
                        className="self-start text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center space-x-1"
                      >
                        {translatingId === vocab.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Brain className="h-3 w-3" />
                        )}
                        <span>
                          {translatingId === vocab.id ? 'Menerjemahkan...' : 'Terjemahkan ke B. Indonesia'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {vocab.jlptLevel && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      jlptLevels.find(l => l.value === vocab.jlptLevel)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {vocab.jlptLevel}
                    </span>
                  )}
                  {vocab.chapter && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Bab {vocab.chapter}
                    </span>
                  )}
                </div>
              </div>

              {/* Examples */}
              {vocab.examples.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contoh Kalimat:</h4>
                  <div className="space-y-2">
                    {vocab.examples.slice(0, 2).map((example, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{example.sentence}</p>
                          {example.audioUrl && (
                            <AudioPlayer audioUrl={example.audioUrl} />
                          )}
                        </div>
                        {example.reading && (
                          <p className="text-gray-600 text-xs">{example.reading}</p>
                        )}
                        <p className="text-gray-700">{example.meaning}</p>
                      </div>
                    ))}
                    {vocab.examples.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{vocab.examples.length - 2} contoh lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls - Bottom */}
      {totalPages > 1 && (
        <div className="bg-white border rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <span className="text-xs text-gray-500">
                ({startItem}-{endItem} dari {filteredVocabularies.length} kosakata)
              </span>
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {paginatedVocabularies.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            {category === 'jlpt' ? (
              <Globe className="h-12 w-12 text-gray-400" />
            ) : (
              <BookOpen className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <p className="text-gray-500">
            {searchTerm 
              ? `Tidak ada kosakata yang ditemukan untuk "${searchTerm}"`
              : `Belum ada kosakata untuk ${category === 'jlpt' ? `level ${selectedLevel}` : `bab ${selectedChapter}`}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VocabularyLearning;