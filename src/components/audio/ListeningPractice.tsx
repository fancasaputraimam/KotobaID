import React, { useState, useEffect } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useProgress } from '../../contexts/ProgressContext';
import { AudioContent } from '../../types/audio';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  Headphones,
  Clock,
  Award
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ListeningPractice: React.FC = () => {
  const { 
    startListeningSession, 
    endListeningSession, 
    submitListeningAnswer,
    submitPronunciation,
    currentSession,
    getRecommendedContent,
    getContentProgress,
    playAudio,
    isPlaying,
    currentPlayingText,
    startRecording,
    stopRecording,
    isRecording,
    loading 
  } = useAudio();
  const { startLearningSession, endLearningSession } = useProgress();

  const [recommendedContent, setRecommendedContent] = useState<AudioContent[]>([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [exerciseStartTime, setExerciseStartTime] = useState<Date | null>(null);
  const [lastResult, setLastResult] = useState<{accuracy: number, feedback: string} | null>(null);
  const [progressSessionId, setProgressSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<'listening' | 'pronunciation'>('listening');
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const content = getRecommendedContent();
    setRecommendedContent(content.slice(0, 10));
  }, []);

  useEffect(() => {
    if (recommendedContent.length > 0) {
      resetExercise();
    }
  }, [currentContentIndex, recommendedContent]);

  const currentContent = recommendedContent[currentContentIndex];
  const progress = currentContent ? getContentProgress(currentContent.id) : null;

  const resetExercise = () => {
    setUserResponse('');
    setShowAnswer(false);
    setLastResult(null);
    setExerciseStartTime(new Date());
  };

  const startSession = async () => {
    if (recommendedContent.length === 0) return;

    try {
      const sessionId = await startListeningSession(
        mode === 'listening' ? 'listening' : 'pronunciation', 
        recommendedContent.map(c => c.id)
      );
      const progressId = await startLearningSession('audio', 'Latihan Mendengar');
      setProgressSessionId(progressId);
      setSessionStartTime(new Date());
      setExerciseStartTime(new Date());
    } catch (error) {
      console.error('Error starting listening session:', error);
    }
  };

  const endSession = async () => {
    try {
      await endListeningSession();
      if (progressSessionId) {
        await endLearningSession(progressSessionId, recommendedContent.length);
      }
      setSessionStartTime(null);
      setExerciseStartTime(null);
      setProgressSessionId(null);
    } catch (error) {
      console.error('Error ending listening session:', error);
    }
  };

  const handlePlayAudio = async () => {
    if (!currentContent) return;
    
    if (isPlaying && currentPlayingText === currentContent.text) {
      // Stop current audio
      speechSynthesis.cancel();
    } else {
      await playAudio(currentContent.text, currentContent.reading);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentContent || !exerciseStartTime || !userResponse.trim()) return;

    const completionTime = (new Date().getTime() - exerciseStartTime.getTime()) / 1000;

    try {
      const result = await submitListeningAnswer(
        currentContent.id,
        userResponse.trim(),
        completionTime
      );

      setLastResult({
        accuracy: result.accuracy,
        feedback: result.feedback
      });

      setShowAnswer(true);

      // Auto advance after good accuracy
      if (result.accuracy >= 70) {
        setTimeout(() => {
          nextContent();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleRecordPronunciation = async () => {
    if (!currentContent) return;

    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        try {
          const result = await submitPronunciation(currentContent.text, audioBlob);
          setLastResult({
            accuracy: result.accuracy,
            feedback: result.feedback
          });
          setShowAnswer(true);
        } catch (error) {
          console.error('Error submitting pronunciation:', error);
        }
      }
    } else {
      await startRecording();
    }
  };

  const nextContent = () => {
    if (currentContentIndex < recommendedContent.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else {
      endSession();
      alert('Sesi latihan selesai! Kerja bagus! 🎉');
    }
  };

  const previousContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const showHint = () => {
    setShowAnswer(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (recommendedContent.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Konten Audio</h3>
          <p className="text-gray-600">
            Semua konten audio sudah dikuasai dengan baik. Coba latihan lagi nanti!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Latihan Audio</h2>
          
          <div className="flex items-center space-x-4">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMode('listening')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  mode === 'listening' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mendengar
              </button>
              <button
                onClick={() => setMode('pronunciation')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  mode === 'pronunciation' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pelafalan
              </button>
            </div>

            {!sessionStartTime ? (
              <button
                onClick={startSession}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                <span>Mulai Latihan</span>
              </button>
            ) : (
              <button
                onClick={endSession}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Pause className="h-4 w-4" />
                <span>Selesai</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress: {currentContentIndex + 1} / {recommendedContent.length}</span>
            <span>{Math.round(((currentContentIndex + 1) / recommendedContent.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentContentIndex + 1) / recommendedContent.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {currentContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Info & Audio Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-gray-900 mb-4">
                {currentContent.text}
              </div>
              
              {currentContent.reading && (
                <div className="text-2xl text-gray-600 mb-2">
                  {currentContent.reading}
                </div>
              )}
              
              <div className="space-y-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentContent.category === 'vocabulary' ? 'bg-blue-100 text-blue-800' :
                  currentContent.category === 'conversation' ? 'bg-green-100 text-green-800' :
                  currentContent.category === 'pronunciation' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentContent.category}
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                  currentContent.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  currentContent.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentContent.difficulty}
                </div>
              </div>

              {showAnswer && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-medium text-blue-900">Terjemahan:</div>
                  <div className="text-blue-800">{currentContent.translation}</div>
                </div>
              )}
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isPlaying && currentPlayingText === currentContent.text ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                  <span>
                    {isPlaying && currentPlayingText === currentContent.text ? 'Stop' : 'Putar Audio'}
                  </span>
                </button>

                <button
                  onClick={showHint}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Petunjuk</span>
                </button>
              </div>
            </div>
          </div>

          {/* Practice Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'listening' ? 'Area Latihan Mendengar' : 'Area Latihan Pelafalan'}
              </h3>
              <p className="text-sm text-gray-600">
                {mode === 'listening' 
                  ? 'Tulis apa yang Anda dengar dalam bahasa Indonesia'
                  : 'Tekan tombol mikrofon dan ucapkan teks dengan benar'
                }
              </p>
            </div>

            {mode === 'listening' ? (
              <div className="space-y-4">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Tulis terjemahan yang Anda dengar..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={showAnswer}
                />

                <div className="flex justify-center">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userResponse.trim() || showAnswer}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    <span>Periksa Jawaban</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleRecordPronunciation}
                    className={`flex items-center justify-center w-24 h-24 rounded-full text-white text-2xl ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  {isRecording ? 'Sedang merekam... Tekan lagi untuk berhenti' : 'Tekan untuk mulai merekam'}
                </div>
              </div>
            )}

            {/* Timer */}
            {exerciseStartTime && (
              <div className="text-center text-sm text-gray-500 mt-4">
                <Clock className="h-4 w-4 inline mr-1" />
                Waktu: {Math.floor((new Date().getTime() - exerciseStartTime.getTime()) / 1000)}s
              </div>
            )}

            {/* Result */}
            {lastResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                lastResult.accuracy >= 70 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {lastResult.accuracy >= 70 ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-orange-600" />
                  )}
                  <span className={`font-medium ${
                    lastResult.accuracy >= 70 ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    Akurasi: {Math.round(lastResult.accuracy)}%
                  </span>
                </div>
                <p className={`text-sm ${
                  lastResult.accuracy >= 70 ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {lastResult.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={previousContent}
            disabled={currentContentIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="text-sm text-gray-600">
            {currentContent?.text} ({currentContentIndex + 1} dari {recommendedContent.length})
          </div>

          <button
            onClick={nextContent}
            disabled={currentContentIndex === recommendedContent.length - 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListeningPractice;