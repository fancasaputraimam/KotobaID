import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  vectorStrokeService, 
  Point, 
  CharacterStrokeData, 
  DrawingState, 
  StrokeValidationResult 
} from '../../services/vectorStrokeService';
import { 
  PenTool, 
  RotateCcw, 
  Play, 
  Pause, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  Settings, 
  Target, 
  Award, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Book,
  Grid,
  Volume2,
  HelpCircle
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import VectorStrokeGuide from './VectorStrokeGuide';

type PracticeMode = 'hiragana' | 'katakana' | 'kanji';

interface AnimationState {
  isAnimating: boolean;
  currentStroke: number;
  frameIndex: number;
  frames: Point[][];
}

const VectorWritingPractice: React.FC = () => {
  // Character and practice state
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('hiragana');
  const [currentCharacter, setCurrentCharacter] = useState<CharacterStrokeData | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>(
    vectorStrokeService.initializeDrawingState()
  );
  
  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  
  // Validation and feedback
  const [validationResult, setValidationResult] = useState<StrokeValidationResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [strokeHint, setStrokeHint] = useState('');
  
  // Animation state
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentStroke: 0,
    frameIndex: 0,
    frames: []
  });
  
  // Settings
  const [showGrid, setShowGrid] = useState(true);
  const [showStrokeNumbers, setShowStrokeNumbers] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // Practice stats
  const [practiceStats, setPracticeStats] = useState({
    charactersCompleted: 0,
    totalStrokes: 0,
    accuracy: 0,
    currentStreak: 0
  });

  // Initialize canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6, 400);
      setCanvasSize({ width: maxSize, height: maxSize });
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Load initial character
  useEffect(() => {
    loadRandomCharacter();
  }, [practiceMode]);

  // Update stroke hint
  useEffect(() => {
    if (currentCharacter) {
      const hint = vectorStrokeService.getStrokeOrderHint(currentCharacter, drawingState.currentStroke);
      setStrokeHint(hint);
    }
  }, [currentCharacter, drawingState.currentStroke]);

  // Clear canvas and setup
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx);
    }
    
    // Draw completed strokes
    drawCompletedStrokes(ctx);
    
    // Draw stroke guide for current stroke
    if (currentCharacter && drawingState.currentStroke < currentCharacter.strokes.length) {
      drawStrokeGuide(ctx, drawingState.currentStroke);
    }
    
    // Draw stroke numbers if enabled
    if (showStrokeNumbers && currentCharacter) {
      drawStrokeNumbers(ctx);
    }
  }, [showGrid, showStrokeNumbers, currentCharacter, drawingState]);

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvasSize;
    
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    // Center lines
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Quarter lines
    ctx.strokeStyle = '#f8f8f8';
    ctx.beginPath();
    ctx.moveTo(width / 4, 0);
    ctx.lineTo(width / 4, height);
    ctx.moveTo(3 * width / 4, 0);
    ctx.lineTo(3 * width / 4, height);
    ctx.moveTo(0, height / 4);
    ctx.lineTo(width, height / 4);
    ctx.moveTo(0, 3 * height / 4);
    ctx.lineTo(width, 3 * height / 4);
    ctx.stroke();
    
    ctx.setLineDash([]);
  };

  // Draw completed strokes
  const drawCompletedStrokes = (ctx: CanvasRenderingContext2D) => {
    if (!currentCharacter) return;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    drawingState.completedStrokes.forEach((strokePath, index) => {
      const path = new Path2D(strokePath);
      ctx.stroke(path);
    });
  };

  // Draw stroke guide (faint outline of current stroke)
  const drawStrokeGuide = (ctx: CanvasRenderingContext2D, strokeIndex: number) => {
    if (!currentCharacter || strokeIndex >= currentCharacter.strokes.length) return;
    
    const stroke = currentCharacter.strokes[strokeIndex];
    const scaledStroke = vectorStrokeService.scaleStrokeData(
      stroke, 
      canvasSize.width / 100, 
      canvasSize.width * 0.1, 
      canvasSize.height * 0.1
    );
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const path = new Path2D(scaledStroke.path);
    ctx.stroke(path);
    
    // Draw start point
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(scaledStroke.startPoint.x, scaledStroke.startPoint.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw end point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(scaledStroke.endPoint.x, scaledStroke.endPoint.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.setLineDash([]);
  };

  // Draw stroke numbers
  const drawStrokeNumbers = (ctx: CanvasRenderingContext2D) => {
    if (!currentCharacter) return;
    
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    currentCharacter.strokes.forEach((stroke, index) => {
      const scaledStroke = vectorStrokeService.scaleStrokeData(
        stroke, 
        canvasSize.width / 100, 
        canvasSize.width * 0.1, 
        canvasSize.height * 0.1
      );
      
      const isCompleted = index < drawingState.currentStroke;
      const isCurrent = index === drawingState.currentStroke;
      
      ctx.fillStyle = isCompleted ? '#10b981' : isCurrent ? '#f59e0b' : '#6b7280';
      ctx.fillText(
        (index + 1).toString(),
        scaledStroke.startPoint.x - 15,
        scaledStroke.startPoint.y - 15
      );
    });
  };

  // Load random character based on practice mode
  const loadRandomCharacter = () => {
    const character = vectorStrokeService.getRandomCharacter(practiceMode);
    if (character) {
      setCurrentCharacter(character);
      setDrawingState(vectorStrokeService.initializeDrawingState());
      setValidationResult(null);
      setShowWarning(false);
      setWarningMessage('');
    }
  };

  // Handle mouse/touch events
  const getEventPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!currentCharacter || animationState.isAnimating) return;
    
    const pos = getEventPos(e);
    setIsDrawing(true);
    setCurrentPath([pos]);
    setShowWarning(false);
    
    // Validate starting point
    if (currentCharacter && drawingState.currentStroke < currentCharacter.strokes.length) {
      const result = vectorStrokeService.validateStroke(
        [pos], 
        currentCharacter, 
        drawingState.currentStroke
      );
      setValidationResult(result);
      
      if (!result.isValid) {
        showWarningMessage(result.errorMessage || 'Posisi start salah');
        setIsDrawing(false);
        setCurrentPath([]);
        return;
      }
    }
  };

  const continueDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentCharacter) return;
    
    const pos = getEventPos(e);
    const newPath = [...currentPath, pos];
    setCurrentPath(newPath);
    
    // Validate stroke in real-time
    const result = vectorStrokeService.validateStroke(
      newPath, 
      currentCharacter, 
      drawingState.currentStroke
    );
    setValidationResult(result);
    
    if (!result.isValid) {
      showWarningMessage(result.errorMessage || 'Goresan tidak sesuai');
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }
    
    // Draw current stroke
    drawCurrentStroke(newPath);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentCharacter || currentPath.length === 0) return;
    
    setIsDrawing(false);
    
    // Validate completed stroke
    const result = vectorStrokeService.validateStroke(
      currentPath, 
      currentCharacter, 
      drawingState.currentStroke
    );
    
    if (!result.isValid) {
      showWarningMessage(result.errorMessage || 'Goresan tidak lengkap');
      setCurrentPath([]);
      return;
    }
    
    // Check if stroke is complete
    const expectedStroke = currentCharacter.strokes[drawingState.currentStroke];
    const expectedPath = expectedStroke.points.map(p => ({
      x: p.x * canvasSize.width / 100 + canvasSize.width * 0.1,
      y: p.y * canvasSize.height / 100 + canvasSize.height * 0.1
    }));
    
    if (vectorStrokeService.isStrokeComplete(currentPath, expectedPath)) {
      // Snap to correct path
      const snappedPath = vectorStrokeService.snapToPath(currentPath, expectedPath);
      const pathString = vectorStrokeService.pointsToPath(snappedPath);
      
      // Update drawing state
      setDrawingState(prev => ({
        ...prev,
        currentStroke: prev.currentStroke + 1,
        completedStrokes: [...prev.completedStrokes, pathString]
      }));
      
      // Update stats
      setPracticeStats(prev => ({
        ...prev,
        totalStrokes: prev.totalStrokes + 1,
        currentStreak: prev.currentStreak + 1
      }));
      
      // Play success sound
      playSuccessSound();
      
      // Check if character is complete
      if (drawingState.currentStroke + 1 >= currentCharacter.strokes.length) {
        setTimeout(() => {
          showCompletionMessage();
        }, 500);
      }
    } else {
      showWarningMessage('Goresan belum selesai');
    }
    
    setCurrentPath([]);
  };

  // Draw current stroke on canvas
  const drawCurrentStroke = (path: Point[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and redraw everything
    clearCanvas();
    
    // Draw current stroke
    if (path.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  };

  // Show warning message
  const showWarningMessage = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 2000);
  };

  // Show completion message
  const showCompletionMessage = () => {
    setPracticeStats(prev => ({
      ...prev,
      charactersCompleted: prev.charactersCompleted + 1,
      accuracy: Math.round((prev.totalStrokes / (prev.totalStrokes + 1)) * 100)
    }));
    
    // Show completion feedback
    setWarningMessage('完成！ (Selesai!)');
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  // Play success sound
  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Animate stroke order
  const animateStrokeOrder = async () => {
    if (!currentCharacter) return;
    
    setAnimationState(prev => ({ ...prev, isAnimating: true }));
    
    for (let strokeIndex = 0; strokeIndex < currentCharacter.strokes.length; strokeIndex++) {
      const stroke = currentCharacter.strokes[strokeIndex];
      const frames = vectorStrokeService.generateStrokeAnimation(stroke, animationSpeed);
      
      for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
        await new Promise(resolve => setTimeout(resolve, animationSpeed / frames.length));
        
        setAnimationState(prev => ({
          ...prev,
          currentStroke: strokeIndex,
          frameIndex,
          frames: frames[frameIndex]
        }));
        
        // Draw animation frame
        drawAnimationFrame(strokeIndex, frames[frameIndex]);
      }
      
      // Pause between strokes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setAnimationState(prev => ({ ...prev, isAnimating: false }));
    clearCanvas();
  };

  // Draw animation frame
  const drawAnimationFrame = (strokeIndex: number, frame: Point[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    clearCanvas();
    
    // Draw completed strokes in animation
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 0; i < strokeIndex; i++) {
      const stroke = currentCharacter!.strokes[i];
      const scaledStroke = vectorStrokeService.scaleStrokeData(
        stroke, 
        canvasSize.width / 100, 
        canvasSize.width * 0.1, 
        canvasSize.height * 0.1
      );
      const path = new Path2D(scaledStroke.path);
      ctx.stroke(path);
    }
    
    // Draw current frame
    if (frame.length > 1) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = strokeWidth + 2;
      
      ctx.beginPath();
      ctx.moveTo(frame[0].x, frame[0].y);
      for (let i = 1; i < frame.length; i++) {
        ctx.lineTo(frame[i].x, frame[i].y);
      }
      ctx.stroke();
    }
    
    // Draw stroke number
    if (frame.length > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        (strokeIndex + 1).toString(),
        frame[0].x - 20,
        frame[0].y - 20
      );
    }
  };

  // Reset practice
  const resetPractice = () => {
    setDrawingState(vectorStrokeService.initializeDrawingState());
    setCurrentPath([]);
    setValidationResult(null);
    setShowWarning(false);
    setWarningMessage('');
    clearCanvas();
  };

  // Play pronunciation
  const playPronunciation = () => {
    if (!currentCharacter) return;
    
    const utterance = new SpeechSynthesisUtterance(currentCharacter.reading);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  // Redraw canvas when dependencies change
  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latihan Menulis Interaktif</h2>
              <p className="text-gray-600">Sistem urutan goresan resmi seperti aplikasi Mazii</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGuide(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Panduan Penggunaan"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Practice Mode Selection */}
        <div className="flex space-x-2 mb-4">
          {(['hiragana', 'katakana', 'kanji'] as PracticeMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setPracticeMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                practiceMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className={`p-4 rounded-lg mb-4 flex items-center space-x-2 ${
            warningMessage.includes('完成') || warningMessage.includes('Selesai')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {warningMessage.includes('完成') || warningMessage.includes('Selesai') ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{warningMessage}</span>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kecepatan Animasi (ms)
              </label>
              <input
                type="range"
                min="500"
                max="2000"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{animationSpeed}ms</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ketebalan Goresan
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{strokeWidth}px</span>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Tampilkan Grid</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showStrokeNumbers}
                  onChange={(e) => setShowStrokeNumbers(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Tampilkan Nomor Goresan</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-8xl font-bold text-gray-900 mb-4">
                {currentCharacter?.character || '?'}
              </div>
              <div className="text-xl text-gray-600 mb-2">
                {currentCharacter?.reading || 'Loading...'}
              </div>
              <div className="text-lg text-gray-700 mb-4">
                {currentCharacter?.meaning || 'Loading...'}
              </div>
              
              {currentCharacter && (
                <button
                  onClick={playPronunciation}
                  className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Dengarkan</span>
                </button>
              )}
            </div>

            {/* Examples for Kanji */}
            {practiceMode === 'kanji' && currentCharacter?.examples && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Contoh Penggunaan:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentCharacter.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">
                  {drawingState.currentStroke}/{currentCharacter?.strokes.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${currentCharacter ? 
                      (drawingState.currentStroke / currentCharacter.strokes.length) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Stroke Hint */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700 font-medium">{strokeHint}</span>
              </div>
            </div>
          </div>

          {/* Practice Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Karakter Selesai:</span>
                <span className="font-medium">{practiceStats.charactersCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Goresan:</span>
                <span className="font-medium">{practiceStats.totalStrokes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Akurasi:</span>
                <span className="font-medium">{practiceStats.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak:</span>
                <span className="font-medium">{practiceStats.currentStreak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Area Latihan</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={animateStrokeOrder}
                  disabled={!currentCharacter || animationState.isAnimating}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {animationState.isAnimating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span>Animasi</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white shadow-inner"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  touchAction: 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={continueDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={continueDrawing}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* Canvas Controls */}
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={resetPractice}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={loadRandomCharacter}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Karakter Baru</span>
              </button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-700">
                      Progress Goresan: {validationResult.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${validationResult.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <VectorStrokeGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};

export default VectorWritingPractice;