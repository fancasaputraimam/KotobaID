import React, { useState, useEffect } from 'react';
import { useFlashcards } from '../../contexts/FlashcardContext';
import { useProgress } from '../../contexts/ProgressContext';
import { Flashcard } from '../../types/flashcard';
import { 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Play,
  Pause
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const FlashcardStudy: React.FC = () => {
  const { 
    getDueCards, 
    getNewCards, 
    processCardReview, 
    startReviewSession, 
    endReviewSession,
    reviewSession,
    srsStats,
    loading 
  } = useFlashcards();
  const { startLearningSession, endLearningSession } = useProgress();

  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [cardStartTime, setCardStartTime] = useState<Date | null>(null);
  const [studyMode, setStudyMode] = useState<'review' | 'new' | 'mixed'>('mixed');
  const [progressSessionId, setProgressSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadStudyCards();
  }, [studyMode]);

  const loadStudyCards = () => {
    let cards: Flashcard[] = [];
    
    switch (studyMode) {
      case 'review':
        cards = getDueCards().slice(0, 20); // Limit to 20 cards
        break;
      case 'new':
        cards = getNewCards(10); // Limit to 10 new cards
        break;
      case 'mixed':
        const dueCards = getDueCards().slice(0, 15);
        const newCards = getNewCards(5);
        cards = [...dueCards, ...newCards];
        break;
    }
    
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const startStudySession = async () => {
    if (studyCards.length === 0) return;

    try {
      await startReviewSession();
      const progressId = await startLearningSession('flashcard', 'Latihan Flashcard');
      setProgressSessionId(progressId);
      setSessionActive(true);
      setSessionStartTime(new Date());
      setCardStartTime(new Date());
    } catch (error) {
      console.error('Error starting study session:', error);
    }
  };

  const endStudySession = async () => {
    try {
      await endReviewSession();
      if (progressSessionId) {
        await endLearningSession(progressSessionId, studyCards.length);
      }
      setSessionActive(false);
      setSessionStartTime(null);
      setCardStartTime(null);
      setProgressSessionId(null);
    } catch (error) {
      console.error('Error ending study session:', error);
    }
  };

  const handleCardResponse = async (quality: 1 | 2 | 3 | 4 | 5) => {
    if (!cardStartTime || currentCardIndex >= studyCards.length) return;

    const responseTime = (new Date().getTime() - cardStartTime.getTime()) / 1000; // seconds
    const currentCard = studyCards[currentCardIndex];

    try {
      await processCardReview(currentCard.id, quality, responseTime);
      
      // Move to next card
      if (currentCardIndex < studyCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
        setCardStartTime(new Date());
      } else {
        // Session completed
        await endStudySession();
        alert('Sesi belajar selesai! Kerja bagus! 🎉');
      }
    } catch (error) {
      console.error('Error processing card review:', error);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setCardStartTime(new Date());
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setCardStartTime(new Date());
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentCard = studyCards[currentCardIndex];
  const progress = studyCards.length > 0 ? ((currentCardIndex + 1) / studyCards.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Belajar Flashcard</h2>
          <div className="flex items-center space-x-4">
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as 'review' | 'new' | 'mixed')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              disabled={sessionActive}
            >
              <option value="mixed">Campuran</option>
              <option value="review">Review</option>
              <option value="new">Kartu Baru</option>
            </select>
            
            {!sessionActive ? (
              <button
                onClick={startStudySession}
                disabled={studyCards.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                <span>Mulai Belajar</span>
              </button>
            ) : (
              <button
                onClick={endStudySession}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Pause className="h-4 w-4" />
                <span>Selesai</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {studyCards.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress: {currentCardIndex + 1} / {studyCards.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        {srsStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Kartu</div>
              <div className="text-lg font-bold text-gray-900">{srsStats.totalCards}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Perlu Review</div>
              <div className="text-lg font-bold text-orange-600">{srsStats.dueToday}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Kartu Baru</div>
              <div className="text-lg font-bold text-blue-600">{srsStats.newCards}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Akurasi</div>
              <div className="text-lg font-bold text-green-600">{Math.round(srsStats.averageAccuracy)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Study Area */}
      {studyCards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Kartu untuk Dipelajari</h3>
          <p className="text-gray-600 mb-4">
            {studyMode === 'review' && 'Tidak ada kartu yang perlu direview hari ini.'}
            {studyMode === 'new' && 'Tidak ada kartu baru untuk dipelajari.'}
            {studyMode === 'mixed' && 'Tidak ada kartu yang perlu dipelajari hari ini.'}
          </p>
          <button
            onClick={loadStudyCards}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      ) : currentCard && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Card Display */}
          <div className="p-8">
            {/* Card Type Badge */}
            <div className="flex justify-between items-center mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentCard.type === 'kanji' ? 'bg-red-100 text-red-800' :
                currentCard.type === 'vocabulary' ? 'bg-blue-100 text-blue-800' :
                currentCard.type === 'grammar' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {currentCard.type === 'kanji' && 'Kanji'}
                {currentCard.type === 'vocabulary' && 'Kosakata'}
                {currentCard.type === 'grammar' && 'Tata Bahasa'}
                {currentCard.type === 'sentence' && 'Kalimat'}
              </span>
              
              {sessionActive && cardStartTime && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.floor((new Date().getTime() - cardStartTime.getTime()) / 1000)}s
                  </span>
                </div>
              )}
            </div>

            {/* Front of Card */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-900 mb-4">
                {currentCard.front}
              </div>
              
              {currentCard.hints && currentCard.hints.length > 0 && (
                <div className="text-sm text-gray-500">
                  Petunjuk: {currentCard.hints.join(', ')}
                </div>
              )}
            </div>

            {/* Answer Section */}
            {showAnswer && (
              <div className="border-t pt-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-semibold text-blue-600 mb-2">
                    {currentCard.back}
                  </div>
                  
                  {currentCard.notes && (
                    <div className="text-sm text-gray-600 mt-2">
                      {currentCard.notes}
                    </div>
                  )}
                </div>

                {/* Quality Buttons */}
                {sessionActive && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <button
                      onClick={() => handleCardResponse(1)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Salah Total</span>
                    </button>
                    
                    <button
                      onClick={() => handleCardResponse(2)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Salah</span>
                    </button>
                    
                    <button
                      onClick={() => handleCardResponse(3)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Susah</span>
                    </button>
                    
                    <button
                      onClick={() => handleCardResponse(4)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Baik</span>
                    </button>
                    
                    <button
                      onClick={() => handleCardResponse(5)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm font-medium">Mudah</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Controls */}
          <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
            <button
              onClick={goToPreviousCard}
              disabled={currentCardIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={toggleAnswer}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Sembunyikan Jawaban</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Lihat Jawaban</span>
                </>
              )}
            </button>

            <button
              onClick={goToNextCard}
              disabled={currentCardIndex === studyCards.length - 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Session Info */}
      {sessionActive && reviewSession && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-medium text-blue-900">Kartu Direview:</span>
                <span className="ml-1 text-blue-700">{reviewSession.cardsReviewed}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-blue-900">Akurasi:</span>
                <span className="ml-1 text-blue-700">{Math.round(reviewSession.accuracy)}%</span>
              </div>
            </div>
            
            {sessionStartTime && (
              <div className="text-sm text-blue-700">
                Durasi: {Math.floor((new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60))} menit
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardStudy;