import React, { useState, useEffect, useRef } from 'react';
import { StudyToolsService } from '../../services/studyToolsService';
import { DictionaryEntry, SearchResult, SearchFilters } from '../../types/studyTools';
import { 
  Search, 
  Volume2, 
  BookOpen, 
  Tag, 
  Clock, 
  Star, 
  Filter,
  Copy,
  Share2,
  Bookmark,
  Play,
  RefreshCw,
  TrendingUp,
  Calendar,
  Hash,
  Info
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const Dictionary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry | null>(null);
  const [popularWords, setPopularWords] = useState<DictionaryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWordOfTheDay();
    loadPopularWords();
    loadSearchHistory();
  }, []);

  const loadWordOfTheDay = async () => {
    try {
      const word = await StudyToolsService.getWordOfTheDay();
      setWordOfTheDay(word);
    } catch (error) {
      console.error('Error loading word of the day:', error);
      setWordOfTheDay(null);
    }
  };

  const loadPopularWords = async () => {
    try {
      const words = await StudyToolsService.getPopularWords(8);
      setPopularWords(words);
    } catch (error) {
      console.error('Error loading popular words:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('dictionary_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const saveSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('dictionary_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await StudyToolsService.searchDictionary(query, filters);
      setSearchResults(results);
      setSelectedEntry(results.entries[0] || null);
      saveSearchHistory(query);
    } catch (error) {
      console.error('Error searching dictionary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handlePlayPronunciation = async (text: string, reading?: string) => {
    await StudyToolsService.playPronunciation(text, reading);
  };

  const handleBookmark = (entryId: string) => {
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(entryId)) {
      newBookmarks.delete(entryId);
    } else {
      newBookmarks.add(entryId);
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('dictionary_bookmarks', JSON.stringify(Array.from(newBookmarks)));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could show a toast notification here
  };

  const handleShare = (entry: DictionaryEntry) => {
    const text = `${entry.word} (${entry.reading}): ${entry.meanings[0]?.indonesian}`;
    if (navigator.share) {
      navigator.share({
        title: 'Japanese Dictionary Entry',
        text: text,
        url: window.location.href
      });
    } else {
      handleCopyText(text);
    }
  };

  const applyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  const clearFilters = () => {
    setFilters({});
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  const getJLPTBadgeColor = (level?: string) => {
    switch (level) {
      case 'N5': return 'bg-green-100 text-green-800';
      case 'N4': return 'bg-blue-100 text-blue-800';
      case 'N3': return 'bg-yellow-100 text-yellow-800';
      case 'N2': return 'bg-orange-100 text-orange-800';
      case 'N1': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyStars = (frequency: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < frequency ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Japanese Dictionary</h2>
              <p className="text-gray-600">Kamus Jepang-Indonesia dengan analisis mendalam</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari kata dalam bahasa Jepang atau Indonesia..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          
          {loading && (
            <div className="absolute right-4 top-3.5">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleSearch()}
            disabled={!searchQuery.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
          
          {searchHistory.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Recent:</span>
              {searchHistory.slice(0, 3).map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(query);
                    handleSearch(query);
                  }}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JLPT Level</label>
                <select
                  value={filters.jlptLevel?.[0] || ''}
                  onChange={(e) => applyFilters({
                    ...filters,
                    jlptLevel: e.target.value ? [e.target.value] : undefined
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All levels</option>
                  <option value="N5">N5 (Beginner)</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1 (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
                <select
                  value={filters.partOfSpeech?.[0] || ''}
                  onChange={(e) => applyFilters({
                    ...filters,
                    partOfSpeech: e.target.value ? [e.target.value] : undefined
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All types</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="particle">Particle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasExamples || false}
                      onChange={(e) => applyFilters({
                        ...filters,
                        hasExamples: e.target.checked || undefined
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Has examples</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasAudio || false}
                      onChange={(e) => applyFilters({
                        ...filters,
                        hasAudio: e.target.checked || undefined
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Has audio</span>
                  </label>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Clear filters</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word of the Day */}
      {wordOfTheDay && !searchResults && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Word of the Day</h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">{wordOfTheDay.word}</div>
                <div className="text-xl opacity-90">{wordOfTheDay.reading}</div>
                <button
                  onClick={() => handlePlayPronunciation(wordOfTheDay.word, wordOfTheDay.reading)}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="text-lg opacity-90 mt-2">{wordOfTheDay.meanings[0]?.indonesian}</p>
            </div>
            <Calendar className="h-16 w-16 opacity-30" />
          </div>
        </div>
      )}

      {/* Popular Words */}
      {popularWords.length > 0 && !searchResults && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Popular Words
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularWords.map((word) => (
              <div
                key={word.id}
                onClick={() => handleEntrySelect(word)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{word.word}</div>
                  <div className="flex">{getFrequencyStars(word.frequency)}</div>
                </div>
                <div className="text-sm text-gray-600 mb-1">{word.reading}</div>
                <div className="text-sm text-gray-700">{word.meanings[0]?.indonesian}</div>
                {word.jlptLevel && (
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJLPTBadgeColor(word.jlptLevel)}`}>
                      {word.jlptLevel}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.total})
            </h3>
            
            {searchResults.entries.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                
                {searchResults.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Did you mean:</p>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleEntrySelect(entry)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEntry?.id === entry.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900">{entry.word}</div>
                      <div className="flex">{getFrequencyStars(entry.frequency)}</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{entry.reading}</div>
                    <div className="text-sm text-gray-700">{entry.meanings[0]?.indonesian}</div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      {entry.jlptLevel && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJLPTBadgeColor(entry.jlptLevel)}`}>
                          {entry.jlptLevel}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {entry.partOfSpeech[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Related Terms */}
            {searchResults.relatedTerms.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Related Terms</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResults.relatedTerms.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entry Details */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            {selectedEntry ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-3xl font-bold text-gray-900">{selectedEntry.word}</h3>
                      <button
                        onClick={() => handlePlayPronunciation(selectedEntry.word, selectedEntry.reading)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="text-xl text-gray-600 mb-4">{selectedEntry.reading}</div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      {selectedEntry.jlptLevel && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJLPTBadgeColor(selectedEntry.jlptLevel)}`}>
                          {selectedEntry.jlptLevel}
                        </span>
                      )}
                      {selectedEntry.partOfSpeech.map((pos, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {pos}
                        </span>
                      ))}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">Frequency:</span>
                        <div className="flex">{getFrequencyStars(selectedEntry.frequency)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBookmark(selectedEntry.id)}
                      className={`p-2 rounded-full ${
                        bookmarks.has(selectedEntry.id)
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCopyText(selectedEntry.word)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleShare(selectedEntry)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Meanings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Meanings
                  </h4>
                  <div className="space-y-3">
                    {selectedEntry.meanings.map((meaning, idx) => (
                      <div key={meaning.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-1">{meaning.indonesian}</div>
                        <div className="text-sm text-gray-600 mb-2">{meaning.definition}</div>
                        {meaning.context && (
                          <div className="text-xs text-gray-500 italic">Context: {meaning.context}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kanji Information */}
                {selectedEntry.kanji && selectedEntry.kanji.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Kanji Breakdown</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEntry.kanji.map((kanji, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900 mb-2">{kanji.character}</div>
                          <div className="text-sm space-y-1">
                            <div><strong>Meaning:</strong> {kanji.meaning}</div>
                            <div><strong>On'yomi:</strong> {kanji.onyomi.join(', ')}</div>
                            <div><strong>Kun'yomi:</strong> {kanji.kunyomi.join(', ')}</div>
                            <div><strong>Strokes:</strong> {kanji.strokeCount}</div>
                            {kanji.jlptLevel && (
                              <div><strong>JLPT:</strong> {kanji.jlptLevel}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example Sentences */}
                {selectedEntry.examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Example Sentences</h4>
                    <div className="space-y-4">
                      {selectedEntry.examples.map((example) => (
                        <div key={example.id} className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-gray-900 mb-1">{example.japanese}</div>
                              <div className="text-sm text-gray-600 mb-2">{example.reading}</div>
                            </div>
                            <button
                              onClick={() => handlePlayPronunciation(example.japanese, example.reading)}
                              className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-gray-700 mb-2">{example.indonesian}</div>
                          {example.english && (
                            <div className="text-sm text-gray-600 italic">{example.english}</div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              example.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                              example.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {example.difficulty}
                            </span>
                            {example.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedEntry.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(tag);
                            handleSearch(tag);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a word to view details</h3>
                <p className="text-gray-600">Choose a word from the search results to see detailed information</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dictionary;