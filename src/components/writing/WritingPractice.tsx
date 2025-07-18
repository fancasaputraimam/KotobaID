import React, { useState, useRef, useEffect } from 'react';
import { useWriting } from '../../contexts/WritingContext';
import { useProgress } from '../../contexts/ProgressContext';
import { CharacterData } from '../../types/writing';
import { getCharacterData } from '../../data/strokeData';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  Award
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const WritingPractice: React.FC = () => {
  const { 
    startWritingSession, 
    endWritingSession, 
    submitWritingAttempt,
    currentSession,
    getRecommendedCharacters,
    getCharacterProgress,
    loading 
  } = useWriting();
  const { startLearningSession, endLearningSession } = useProgress();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recommendedChars, setRecommendedChars] = useState<CharacterData[]>([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userStrokes, setUserStrokes] = useState<Array<{path: string, timestamp: number, duration: number}>>([]);
  const [currentStroke, setCurrentStroke] = useState<{path: string, startTime: number} | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [practiceStartTime, setPracticeStartTime] = useState<Date | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{accuracy: number, feedback: string} | null>(null);
  const [progressSessionId, setProgressSessionId] = useState<string | null>(null);

  useEffect(() => {
    const chars = getRecommendedCharacters();
    setRecommendedChars(chars.slice(0, 10)); // Limit to 10 characters for practice
  }, []);

  useEffect(() => {
    if (recommendedChars.length > 0) {
      resetCanvas();
    }
  }, [currentCharIndex, recommendedChars]);

  const currentChar = recommendedChars[currentCharIndex];
  const progress = currentChar ? getCharacterProgress(currentChar.character) : null;

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw center lines
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Draw border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    setUserStrokes([]);
    setCurrentStroke(null);
    setLastAttempt(null);
  };

  const startSession = async () => {
    if (recommendedChars.length === 0) return;

    try {
      const sessionId = await startWritingSession('practice', recommendedChars.map(c => c.character));
      const progressId = await startLearningSession('writing', 'Latihan Menulis');
      setProgressSessionId(progressId);
      setSessionStartTime(new Date());
      setPracticeStartTime(new Date());
    } catch (error) {
      console.error('Error starting writing session:', error);
    }
  };

  const endSession = async () => {
    try {
      await endWritingSession();
      if (progressSessionId) {
        await endLearningSession(progressSessionId, recommendedChars.length);
      }
      setSessionStartTime(null);
      setPracticeStartTime(null);
      setProgressSessionId(null);
    } catch (error) {
      console.error('Error ending writing session:', error);
    }
  };

  const animateStrokeOrder = async () => {
    if (!currentChar || !canvasRef.current) return;

    setIsAnimating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resetCanvas();

    // Show character background
    ctx.fillStyle = '#f3f4f6';
    ctx.font = 'bold 180px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentChar.character, canvas.width / 2, canvas.height / 2);

    // Animate each stroke
    for (let i = 0; i < currentChar.strokes.length; i++) {
      const stroke = currentChar.strokes[i];
      
      await new Promise(resolve => {
        setTimeout(() => {
          // Draw stroke number
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(`${i + 1}`, 20 + (i * 30), 30);

          // Draw stroke path
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          const path = new Path2D(stroke.path);
          ctx.stroke(path);
          
          resolve(undefined);
        }, stroke.delay);
      });
    }

    setIsAnimating(false);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (pos: { x: number, y: number }) => {
    if (!currentChar || isAnimating) return;

    setIsDrawing(true);
    const pathStart = `M${pos.x},${pos.y}`;
    setCurrentStroke({
      path: pathStart,
      startTime: Date.now()
    });

    if (!practiceStartTime) {
      setPracticeStartTime(new Date());
    }
  };

  const draw = (pos: { x: number, y: number }) => {
    if (!isDrawing || !currentStroke || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update current stroke path
    const updatedPath = `${currentStroke.path} L${pos.x},${pos.y}`;
    setCurrentStroke({
      ...currentStroke,
      path: updatedPath
    });

    // Draw on canvas
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const path = new Path2D(updatedPath);
    ctx.stroke(path);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    
    const strokeDuration = Date.now() - currentStroke.startTime;
    const completedStroke = {
      path: currentStroke.path,
      timestamp: currentStroke.startTime,
      duration: strokeDuration
    };

    setUserStrokes(prev => [...prev, completedStroke]);
    setCurrentStroke(null);
  };

  const submitAttempt = async () => {
    if (!currentChar || !practiceStartTime || userStrokes.length === 0) return;

    const completionTime = (new Date().getTime() - practiceStartTime.getTime()) / 1000; // seconds

    try {
      const attempt = await submitWritingAttempt(
        currentChar.character,
        userStrokes,
        completionTime
      );

      setLastAttempt({
        accuracy: attempt.accuracy,
        feedback: attempt.feedback
      });

      // Auto advance after a delay if accuracy is good
      if (attempt.accuracy >= 70) {
        setTimeout(() => {
          nextCharacter();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting writing attempt:', error);
    }
  };

  const nextCharacter = () => {
    if (currentCharIndex < recommendedChars.length - 1) {
      setCurrentCharIndex(currentCharIndex + 1);
      setPracticeStartTime(new Date());
    } else {
      // End of practice session
      endSession();
      alert('Sesi latihan selesai! Kerja bagus! 🎉');
    }
  };

  const previousCharacter = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(currentCharIndex - 1);
      setPracticeStartTime(new Date());
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (recommendedChars.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Karakter untuk Dipraktikkan</h3>
          <p className="text-gray-600">
            Semua karakter sudah dalam kondisi baik. Coba latihan lagi nanti atau pilih karakter tertentu.
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
          <h2 className="text-2xl font-bold text-gray-900">Latihan Menulis</h2>
          
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

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress: {currentCharIndex + 1} / {recommendedChars.length}</span>
            <span>{Math.round(((currentCharIndex + 1) / recommendedChars.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCharIndex + 1) / recommendedChars.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {currentChar && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="text-8xl font-bold text-gray-900 mb-4">
                {currentChar.character}
              </div>
              
              <div className="space-y-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentChar.type === 'kanji' ? 'bg-red-100 text-red-800' :
                  currentChar.type === 'hiragana' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentChar.type}
                </div>
                
                <div className="text-gray-600">
                  {currentChar.meaning && <div>Arti: {currentChar.meaning}</div>}
                  {currentChar.reading && <div>Bacaan: {currentChar.reading}</div>}
                  <div>Goresan: {currentChar.strokeCount}</div>
                </div>
              </div>
            </div>

            {/* Progress for this character */}
            {progress && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Progress Karakter</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Latihan</div>
                    <div className="font-medium">{progress.totalPractices}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Akurasi</div>
                    <div className="font-medium">{Math.round(progress.averageAccuracy)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Level</div>
                    <div className="font-medium capitalize">{progress.masteryLevel}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Waktu Rata-rata</div>
                    <div className="font-medium">{Math.round(progress.averageTime)}s</div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={animateStrokeOrder}
                disabled={isAnimating}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {showStrokeOrder ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>Lihat Urutan Goresan</span>
              </button>
              
              <button
                onClick={resetCanvas}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Writing Canvas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Area Latihan</h3>
              <p className="text-sm text-gray-600">Tulis karakter di dalam kotak</p>
            </div>

            <div className="flex justify-center mb-4">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
                onMouseDown={(e) => startDrawing(getMousePos(e))}
                onMouseMove={(e) => draw(getMousePos(e))}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startDrawing(getTouchPos(e));
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  draw(getTouchPos(e));
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopDrawing();
                }}
              />
            </div>

            {/* Session Timer */}
            {practiceStartTime && (
              <div className="text-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 inline mr-1" />
                Waktu: {Math.floor((new Date().getTime() - practiceStartTime.getTime()) / 1000)}s
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={submitAttempt}
                disabled={userStrokes.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                <span>Periksa Tulisan</span>
              </button>
            </div>

            {/* Result */}
            {lastAttempt && (
              <div className={`mt-4 p-4 rounded-lg ${
                lastAttempt.accuracy >= 70 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {lastAttempt.accuracy >= 70 ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-orange-600" />
                  )}
                  <span className={`font-medium ${
                    lastAttempt.accuracy >= 70 ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    Akurasi: {Math.round(lastAttempt.accuracy)}%
                  </span>
                </div>
                <p className={`text-sm ${
                  lastAttempt.accuracy >= 70 ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {lastAttempt.feedback}
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
            onClick={previousCharacter}
            disabled={currentCharIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="text-sm text-gray-600">
            {currentChar?.character} ({currentCharIndex + 1} dari {recommendedChars.length})
          </div>

          <button
            onClick={nextCharacter}
            disabled={currentCharIndex === recommendedChars.length - 1}
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

export default WritingPractice;