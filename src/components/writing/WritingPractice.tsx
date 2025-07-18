import React, { useState, useRef, useEffect } from 'react';
import { useWriting } from '../../contexts/WritingContext';
import { useProgress } from '../../contexts/ProgressContext';
import { azureOpenAI } from '../../services/azureOpenAI';
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
  Award,
  Sparkles,
  PenTool,
  Type,
  Keyboard,
  Brain,
  Lightbulb,
  BookOpen,
  Zap,
  MessageCircle,
  Volume2,
  Copy,
  Save,
  Share2,
  Star,
  TrendingUp,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mic,
  Camera,
  Image,
  Download,
  Upload,
  Edit3,
  Layers,
  Grid,
  Move,
  MoreHorizontal
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface WritingFeedback {
  accuracy: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

interface WritingAnalysis {
  strokeOrder: string;
  accuracy: number;
  timing: string;
  suggestions: string[];
  culturalNotes: string[];
  relatedCharacters: string[];
}

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

  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userStrokes, setUserStrokes] = useState<Array<{path: string, timestamp: number, duration: number}>>([]);
  const [currentStroke, setCurrentStroke] = useState<{path: string, startTime: number} | null>(null);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(true);
  const [gridStyle, setGridStyle] = useState<'guide' | 'dots' | 'minimal'>('guide');

  // Character and practice state
  const [recommendedChars, setRecommendedChars] = useState<CharacterData[]>([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState<'guided' | 'free' | 'test'>('guided');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [customText, setCustomText] = useState('');
  const [selectedCharacterSet, setSelectedCharacterSet] = useState<'hiragana' | 'katakana' | 'kanji' | 'custom'>('hiragana');

  // AI and feedback state
  const [aiAnalysis, setAiAnalysis] = useState<WritingAnalysis | null>(null);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiChat, setAiChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Input methods
  const [inputMethod, setInputMethod] = useState<'canvas' | 'keyboard' | 'voice'>('canvas');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Session state
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [practiceStartTime, setPracticeStartTime] = useState<Date | null>(null);
  const [progressSessionId, setProgressSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    charactersWritten: 0,
    totalTime: 0,
    averageAccuracy: 0,
    streakCount: 0
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'practice' | 'analysis' | 'history'>('practice');

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const chars = await getRecommendedCharacters();
        setRecommendedChars(chars.slice(0, 20));
      } catch (error) {
        console.error('Error loading characters:', error);
        // Fallback to basic characters
        const basicChars = [
          { character: 'あ', strokes: [], meaning: 'a', reading: 'あ', difficulty: 'beginner' },
          { character: 'か', strokes: [], meaning: 'ka', reading: 'か', difficulty: 'beginner' },
          { character: 'さ', strokes: [], meaning: 'sa', reading: 'さ', difficulty: 'beginner' },
          { character: 'た', strokes: [], meaning: 'ta', reading: 'た', difficulty: 'beginner' },
          { character: 'な', strokes: [], meaning: 'na', reading: 'な', difficulty: 'beginner' },
        ];
        setRecommendedChars(basicChars as CharacterData[]);
      }
    };
    loadCharacters();
  }, [selectedCharacterSet, difficulty]);

  useEffect(() => {
    if (recommendedChars.length > 0) {
      resetCanvas();
    }
  }, [currentCharIndex, recommendedChars, showGrid, gridStyle]);

  useEffect(() => {
    // Initialize canvas size based on screen size
    const updateCanvasSize = () => {
      const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5, 400);
      setCanvasSize({ width: maxSize, height: maxSize });
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const currentChar = recommendedChars[currentCharIndex];
  const progress = currentChar ? getCharacterProgress(currentChar.character) : null;

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid based on style
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }
    
    // Draw border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    setUserStrokes([]);
    setCurrentStroke(null);
    setWritingFeedback(null);
    setAiAnalysis(null);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    switch (gridStyle) {
      case 'guide':
        // Draw center lines
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Draw quarter lines
        ctx.strokeStyle = '#f3f4f6';
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
        break;
        
      case 'dots':
        // Draw dot grid
        ctx.fillStyle = '#e5e7eb';
        for (let x = 0; x <= width; x += 20) {
          for (let y = 0; y <= height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        break;
        
      case 'minimal':
        // Just center lines
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        break;
    }
  };

  const analyzeWritingWithAI = async (userStrokes: Array<{path: string, timestamp: number, duration: number}>) => {
    if (!currentChar || userStrokes.length === 0) return;

    setAiLoading(true);
    try {
      const prompt = `
        Analyze this Japanese character writing attempt:
        
        Character: ${currentChar.character}
        Meaning: ${currentChar.meaning}
        Reading: ${currentChar.reading}
        Difficulty: ${currentChar.difficulty}
        
        User drew ${userStrokes.length} strokes.
        Writing time: ${userStrokes[userStrokes.length - 1]?.timestamp - userStrokes[0]?.timestamp}ms
        
        Please provide detailed feedback in Indonesian about:
        1. Stroke order accuracy
        2. Character proportions
        3. Overall writing quality
        4. Specific suggestions for improvement
        5. Cultural notes about this character
        6. Related characters to practice
        
        Respond in JSON format:
        {
          "strokeOrder": "analysis of stroke order",
          "accuracy": number (0-100),
          "timing": "analysis of writing speed and flow",
          "suggestions": ["specific improvement suggestions"],
          "culturalNotes": ["cultural context and usage"],
          "relatedCharacters": ["related characters to practice"]
        }
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const analysis = JSON.parse(response);
        setAiAnalysis(analysis);
      } catch (parseError) {
        // Handle non-JSON response
        setAiAnalysis({
          strokeOrder: 'Analisis tidak dapat diparsing',
          accuracy: 70,
          timing: 'Normal',
          suggestions: ['Coba lagi dengan lebih hati-hati'],
          culturalNotes: ['Karakter ini penting dalam bahasa Jepang'],
          relatedCharacters: []
        });
      }
    } catch (error) {
      console.error('Error analyzing writing with AI:', error);
      setAiAnalysis({
        strokeOrder: 'Terjadi kesalahan dalam analisis',
        accuracy: 50,
        timing: 'Tidak dapat dianalisis',
        suggestions: ['Silakan coba lagi'],
        culturalNotes: [],
        relatedCharacters: []
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim() || aiChatLoading) return;

    const userMessage = { role: 'user' as const, content: aiChatInput };
    setAiChat(prev => [...prev, userMessage]);
    setAiChatLoading(true);
    setAiChatInput('');

    try {
      const contextPrompt = `
        You are a Japanese writing tutor. The user is currently practicing writing the character "${currentChar?.character}" (${currentChar?.meaning}).
        
        Previous analysis: ${aiAnalysis ? JSON.stringify(aiAnalysis) : 'No analysis yet'}
        
        User's question: ${aiChatInput}
        
        Please provide helpful, encouraging feedback in Indonesian. Focus on:
        - Writing technique and stroke order
        - Character meaning and usage
        - Practice suggestions
        - Cultural context
        
        Keep responses concise but informative.
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'system', content: contextPrompt },
        ...aiChat,
        userMessage
      ]);

      setAiChat(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setAiChat(prev => [...prev, { role: 'ai', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const generateWritingFeedback = async () => {
    if (!currentChar || userStrokes.length === 0) return;

    setAiLoading(true);
    try {
      const prompt = `
        Generate comprehensive writing feedback for this Japanese character practice:
        
        Character: ${currentChar.character}
        User wrote ${userStrokes.length} strokes
        
        Please provide feedback in Indonesian in JSON format:
        {
          "accuracy": number (0-100),
          "feedback": "overall feedback message",
          "suggestions": ["specific suggestions for improvement"],
          "strengths": ["what the user did well"],
          "improvements": ["areas that need work"],
          "nextSteps": ["what to practice next"]
        }
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const feedback = JSON.parse(response);
        setWritingFeedback(feedback);
      } catch (parseError) {
        setWritingFeedback({
          accuracy: 75,
          feedback: 'Latihan yang bagus! Terus berlatih untuk meningkatkan akurasi.',
          suggestions: ['Perhatikan urutan goresan', 'Latih proporsi karakter'],
          strengths: ['Usaha yang konsisten'],
          improvements: ['Ketelitian goresan'],
          nextSteps: ['Lanjutkan ke karakter berikutnya']
        });
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      setWritingFeedback({
        accuracy: 50,
        feedback: 'Terjadi kesalahan dalam memberikan feedback. Silakan coba lagi.',
        suggestions: ['Coba tulis ulang karakter'],
        strengths: ['Tetap semangat berlatih'],
        improvements: ['Sistem feedback'],
        nextSteps: ['Ulangi latihan']
      });
    } finally {
      setAiLoading(false);
    }
  };

  const startSession = async () => {
    if (recommendedChars.length === 0) return;

    try {
      const sessionId = await startWritingSession('practice', recommendedChars.map(c => c.character));
      const progressId = await startLearningSession('writing', 'Latihan Menulis');
      setProgressSessionId(progressId);
      setSessionStartTime(new Date());
      setPracticeStartTime(new Date());
      setSessionStats({
        charactersWritten: 0,
        totalTime: 0,
        averageAccuracy: 0,
        streakCount: 0
      });
    } catch (error) {
      console.error('Error starting writing session:', error);
    }
  };

  const endSession = async () => {
    try {
      await endWritingSession();
      if (progressSessionId) {
        await endLearningSession(progressSessionId, sessionStats.charactersWritten);
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

    // Show character background lightly
    ctx.fillStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.font = `bold ${canvas.width * 0.6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentChar.character, canvas.width / 2, canvas.height / 2);

    // Animate each stroke
    if (currentChar.strokes && currentChar.strokes.length > 0) {
      for (let i = 0; i < currentChar.strokes.length; i++) {
        const stroke = currentChar.strokes[i];
        
        await new Promise(resolve => {
          setTimeout(() => {
            // Draw stroke number
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(`${i + 1}`, 20 + (i * 25), 30);

            // Draw stroke path
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            const path = new Path2D(stroke.path);
            ctx.stroke(path);
            
            resolve(undefined);
          }, (stroke.delay || 500) * (i + 1));
        });
      }
    }

    setIsAnimating(false);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
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

    // Update stroke path
    const newPath = currentStroke.path + ` L${pos.x},${pos.y}`;
    setCurrentStroke({ ...currentStroke, path: newPath });

    // Draw on canvas
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const path = new Path2D(newPath);
    ctx.stroke(path);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    
    const strokeData = {
      path: currentStroke.path,
      timestamp: Date.now(),
      duration: Date.now() - currentStroke.startTime
    };
    
    setUserStrokes(prev => [...prev, strokeData]);
    setCurrentStroke(null);
  };

  const nextCharacter = () => {
    if (currentCharIndex < recommendedChars.length - 1) {
      setCurrentCharIndex(currentCharIndex + 1);
      setSessionStats(prev => ({ ...prev, charactersWritten: prev.charactersWritten + 1 }));
    }
  };

  const previousCharacter = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(currentCharIndex - 1);
    }
  };

  const handleKeyboardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyboardInput(e.target.value);
  };

  const submitKeyboardInput = () => {
    if (keyboardInput.trim()) {
      // Process keyboard input
      console.log('Keyboard input:', keyboardInput);
      setKeyboardInput('');
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  const playPronunciation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    const link = document.createElement('a');
    link.download = `writing-practice-${currentChar?.character}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latihan Menulis</h2>
              <p className="text-gray-600">Latihan menulis karakter Jepang dengan bantuan AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <TrendingUp className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'practice', label: 'Latihan', icon: PenTool },
              { id: 'analysis', label: 'Analisis AI', icon: Brain },
              { id: 'history', label: 'Riwayat', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Set Karakter</label>
              <select
                value={selectedCharacterSet}
                onChange={(e) => setSelectedCharacterSet(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
                <option value="kanji">Kanji</option>
                <option value="custom">Kustom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Lanjutan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode Latihan</label>
              <select
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="guided">Terpandu</option>
                <option value="free">Bebas</option>
                <option value="test">Ujian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran Kuas</label>
              <input
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{brushSize}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warna Kuas</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gaya Grid</label>
              <select
                value={gridStyle}
                onChange={(e) => setGridStyle(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="guide">Panduan</option>
                <option value="dots">Titik</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Character Info */}
        <div className="space-y-6">
          {/* Current Character */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-8xl font-bold text-gray-900 mb-4">
                {currentChar?.character || '?'}
              </div>
              <div className="text-xl text-gray-600 mb-2">
                {currentChar?.reading || 'Loading...'}
              </div>
              <div className="text-lg text-gray-700 mb-4">
                {currentChar?.meaning || 'Loading...'}
              </div>
              
              {currentChar && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <button
                    onClick={() => playPronunciation(currentChar.reading)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentChar.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    currentChar.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentChar.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            {progress && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(progress.accuracy)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.accuracy}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Attempts: {progress.attempts}</span>
                  <span>Best: {Math.round(progress.bestAccuracy)}%</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={previousCharacter}
                disabled={currentCharIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>
              
              <span className="text-sm text-gray-600">
                {currentCharIndex + 1} dari {recommendedChars.length}
              </span>
              
              <button
                onClick={nextCharacter}
                disabled={currentCharIndex === recommendedChars.length - 1}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Input Method Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Input</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="canvas"
                  name="inputMethod"
                  value="canvas"
                  checked={inputMethod === 'canvas'}
                  onChange={(e) => setInputMethod(e.target.value as any)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="canvas" className="flex items-center space-x-2 text-gray-700">
                  <PenTool className="h-4 w-4" />
                  <span>Gambar di Canvas</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="keyboard"
                  name="inputMethod"
                  value="keyboard"
                  checked={inputMethod === 'keyboard'}
                  onChange={(e) => setInputMethod(e.target.value as any)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="keyboard" className="flex items-center space-x-2 text-gray-700">
                  <Keyboard className="h-4 w-4" />
                  <span>Ketik dengan Keyboard</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="voice"
                  name="inputMethod"
                  value="voice"
                  checked={inputMethod === 'voice'}
                  onChange={(e) => setInputMethod(e.target.value as any)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="voice" className="flex items-center space-x-2 text-gray-700">
                  <Mic className="h-4 w-4" />
                  <span>Input Suara</span>
                </label>
              </div>
            </div>

            {/* Input Method Specific UI */}
            {inputMethod === 'keyboard' && (
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={keyboardInput}
                    onChange={handleKeyboardInput}
                    placeholder="Ketik karakter..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={submitKeyboardInput}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {inputMethod === 'voice' && (
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isListening 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    <span>{isListening ? 'Mendengarkan...' : 'Mulai Rekam'}</span>
                  </button>
                  {voiceInput && (
                    <span className="text-sm text-gray-600">"{voiceInput}"</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Canvas */}
        <div className="space-y-6">
          {/* Canvas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Area Latihan</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg ${
                    showGrid 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={animateStrokeOrder}
                  disabled={isAnimating}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isAnimating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span>Urutan Goresan</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white shadow-inner"
                style={{ maxWidth: '100%', height: 'auto' }}
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

            {/* Canvas Controls */}
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={resetCanvas}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={saveCanvas}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Simpan</span>
              </button>
              
              <button
                onClick={generateWritingFeedback}
                disabled={userStrokes.length === 0 || aiLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {aiLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                <span>Analisis AI</span>
              </button>
            </div>
          </div>

          {/* Writing Feedback */}
          {writingFeedback && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                Feedback AI
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-orange-600">
                    {writingFeedback.accuracy}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${writingFeedback.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">{writingFeedback.feedback}</p>
                </div>
                
                {writingFeedback.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">✓ Kekuatan:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {writingFeedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {writingFeedback.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">💡 Saran:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {writingFeedback.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="space-y-6">
          {/* AI Analysis */}
          {aiAnalysis && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                Analisis Detail
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Urutan Goresan</h4>
                  <p className="text-sm text-gray-600">{aiAnalysis.strokeOrder}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Akurasi</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${aiAnalysis.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {aiAnalysis.accuracy}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Timing</h4>
                  <p className="text-sm text-gray-600">{aiAnalysis.timing}</p>
                </div>
                
                {aiAnalysis.culturalNotes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Catatan Budaya</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {aiAnalysis.culturalNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiAnalysis.relatedCharacters.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Karakter Terkait</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.relatedCharacters.map((char, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Chat Assistant */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                Asisten AI
              </h3>
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {showAIAssistant ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
            
            {showAIAssistant && (
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {aiChat.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Tanya saya tentang teknik menulis!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiChat.map((message, index) => (
                        <div key={index} className={`${
                          message.role === 'user' 
                            ? 'text-right' 
                            : 'text-left'
                        }`}>
                          <div className={`inline-block p-3 rounded-lg max-w-xs ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleAIChat} className="flex space-x-2">
                  <input
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Tanya tentang teknik menulis..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!aiChatInput.trim() || aiChatLoading}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {aiChatLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Session Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Sesi</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Karakter Ditulis:</span>
                <span className="font-medium">{sessionStats.charactersWritten}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu Total:</span>
                <span className="font-medium">{Math.floor(sessionStats.totalTime / 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Akurasi Rata-rata:</span>
                <span className="font-medium">{sessionStats.averageAccuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Streak:</span>
                <span className="font-medium">{sessionStats.streakCount}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              {!sessionStartTime ? (
                <button
                  onClick={startSession}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play className="h-4 w-4" />
                  <span>Mulai Sesi</span>
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Pause className="h-4 w-4" />
                  <span>Selesai Sesi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPractice;