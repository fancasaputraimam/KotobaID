import React, { useState, useEffect, useCallback } from 'react';
import { 
  webAudioService, 
  AudioSettings, 
  RecordingResult, 
  PronunciationFeedback 
} from '../../services/webAudioService';
import {
  Play,
  Pause,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
  Award,
  Target,
  Headphones,
  MessageSquare,
  Info,
  Zap,
  Speaker
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface AudioExercise {
  id: string;
  japanese: string;
  romanization: string;
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

type PracticeMode = 'listen' | 'speak' | 'shadow' | 'quiz';

const WorkingAudioPractice: React.FC = () => {
  // Practice state
  const [currentMode, setCurrentMode] = useState<PracticeMode>('listen');
  const [currentExercise, setCurrentExercise] = useState<AudioExercise | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    rate: 0.8,
    pitch: 1,
    volume: 1
  });
  
  // Results state
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  // Support state
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  // Sample exercises
  const exercises: AudioExercise[] = [
    {
      id: '1',
      japanese: 'おはようございます',
      romanization: 'Ohayou gozaimasu',
      translation: 'Selamat pagi',
      difficulty: 'beginner',
      category: 'Salam'
    },
    {
      id: '2',
      japanese: 'ありがとうございます',
      romanization: 'Arigatou gozaimasu',
      translation: 'Terima kasih',
      difficulty: 'beginner',
      category: 'Sopan Santun'
    },
    {
      id: '3',
      japanese: 'こんにちは',
      romanization: 'Konnichiwa',
      translation: 'Selamat siang',
      difficulty: 'beginner',
      category: 'Salam'
    },
    {
      id: '4',
      japanese: 'すみません',
      romanization: 'Sumimasen',
      translation: 'Maaf / Permisi',
      difficulty: 'beginner',
      category: 'Sopan Santun'
    },
    {
      id: '5',
      japanese: 'お元気ですか',
      romanization: 'Ogenki desu ka',
      translation: 'Apa kabar?',
      difficulty: 'intermediate',
      category: 'Percakapan'
    },
    {
      id: '6',
      japanese: 'はじめまして',
      romanization: 'Hajimemashite',
      translation: 'Senang berkenalan',
      difficulty: 'intermediate',
      category: 'Perkenalan'
    },
    {
      id: '7',
      japanese: 'さようなら',
      romanization: 'Sayounara',
      translation: 'Selamat tinggal',
      difficulty: 'beginner',
      category: 'Salam'
    },
    {
      id: '8',
      japanese: 'いらっしゃいませ',
      romanization: 'Irasshaimase',
      translation: 'Selamat datang',
      difficulty: 'intermediate',
      category: 'Layanan'
    }
  ];

  // Initialize
  useEffect(() => {
    setSpeechSupported(webAudioService.isSpeechSynthesisSupported());
    setRecognitionSupported(webAudioService.isSpeechRecognitionSupported());
    
    // Load first exercise
    if (exercises.length > 0) {
      setCurrentExercise(exercises[0]);
    }
    
    // Load voices
    setTimeout(() => {
      const voices = webAudioService.getJapaneseVoices();
      setAvailableVoices(voices);
      if (voices.length > 0) {
        setSelectedVoice(voices[0].name);
      }
    }, 1000); // Wait for voices to load
    
    return () => {
      webAudioService.cleanup();
    };
  }, []);

  // Speak current exercise
  const speakText = async (text?: string) => {
    if (!speechSupported || isSpeaking) return;
    
    const textToSpeak = text || currentExercise?.japanese || '';
    if (!textToSpeak) return;
    
    setIsSpeaking(true);
    try {
      await webAudioService.speak(textToSpeak, {
        ...audioSettings,
        voice: selectedVoice
      });
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    webAudioService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Start listening
  const startListening = async () => {
    if (!recognitionSupported || isListening) return;
    
    setIsListening(true);
    setRecordingResult(null);
    setPronunciationFeedback(null);
    
    try {
      const result = await webAudioService.listen();
      setRecordingResult(result);
      
      // Check pronunciation if we have a target
      if (currentExercise) {
        const feedback = webAudioService.checkPronunciation(
          result.text,
          currentExercise.japanese
        );
        setPronunciationFeedback(feedback);
      }
    } catch (error) {
      console.error('Listening error:', error);
    } finally {
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    webAudioService.stopListening();
    setIsListening(false);
  };

  // Next exercise
  const nextExercise = () => {
    const nextIndex = (exerciseIndex + 1) % exercises.length;
    setExerciseIndex(nextIndex);
    setCurrentExercise(exercises[nextIndex]);
    resetState();
  };

  // Previous exercise
  const previousExercise = () => {
    const prevIndex = exerciseIndex === 0 ? exercises.length - 1 : exerciseIndex - 1;
    setExerciseIndex(prevIndex);
    setCurrentExercise(exercises[prevIndex]);
    resetState();
  };

  // Reset state
  const resetState = () => {
    setRecordingResult(null);
    setPronunciationFeedback(null);
    setUserAnswer('');
    setShowAnswer(false);
    webAudioService.cleanup();
  };

  // Check translation answer
  const checkAnswer = () => {
    if (!currentExercise) return;
    
    const correct = userAnswer.toLowerCase().trim() === currentExercise.translation.toLowerCase().trim();
    setPronunciationFeedback({
      isCorrect: correct,
      score: correct ? 100 : 0,
      feedback: correct ? '✅ Benar! Terjemahan tepat!' : `❌ Salah. Jawaban yang benar: ${currentExercise.translation}`,
      suggestions: correct ? [] : ['Coba dengarkan lagi dengan seksama', 'Perhatikan intonasi dan konteks']
    });
    setShowAnswer(true);
  };

  const modes = [
    { 
      id: 'listen' as const, 
      name: 'Mendengar', 
      icon: Volume2, 
      color: 'blue',
      description: 'Dengarkan pelafalan Jepang'
    },
    { 
      id: 'speak' as const, 
      name: 'Berbicara', 
      icon: Mic, 
      color: 'green',
      description: 'Latih pelafalan Anda'
    },
    { 
      id: 'shadow' as const, 
      name: 'Mengikuti', 
      icon: Headphones, 
      color: 'purple',
      description: 'Ikuti audio yang diputar'
    },
    { 
      id: 'quiz' as const, 
      name: 'Kuis', 
      icon: MessageSquare, 
      color: 'orange',
      description: 'Tebak terjemahan'
    }
  ];

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Audio Practice</h2>
              <p className="text-gray-600">Latihan listening dan speaking yang benar-benar berfungsi</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Support Status */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            speechSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <Speaker className="h-4 w-4" />
            <span>TTS: {speechSupported ? 'Supported' : 'Not Supported'}</span>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            recognitionSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <Mic className="h-4 w-4" />
            <span>STT: {recognitionSupported ? 'Supported' : 'Not Supported'}</span>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setCurrentMode(mode.id);
                resetState();
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentMode === mode.id
                  ? `border-${mode.color}-500 bg-${mode.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <mode.icon className={`h-6 w-6 mx-auto mb-2 ${
                currentMode === mode.id ? `text-${mode.color}-600` : 'text-gray-500'
              }`} />
              <h3 className="font-medium text-sm text-gray-900">{mode.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Audio</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kecepatan: {audioSettings.rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={audioSettings.rate}
                onChange={(e) => setAudioSettings(prev => ({ ...prev, rate: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume: {Math.round((audioSettings.volume || 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioSettings.volume}
                onChange={(e) => setAudioSettings(prev => ({ ...prev, volume: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Exercise Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900">Latihan {exerciseIndex + 1} dari {exercises.length}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentExercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              currentExercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentExercise.difficulty}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {currentExercise.category}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={previousExercise}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextExercise}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Exercise Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🇯🇵 Japanese</h4>
            <p className="text-2xl font-bold text-blue-900 mb-1">{currentExercise.japanese}</p>
            <p className="text-sm text-blue-600">{currentExercise.romanization}</p>
          </div>
          
          {(currentMode === 'listen' || showAnswer) && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🇮🇩 Translation</h4>
              <p className="text-lg text-green-900">{currentExercise.translation}</p>
            </div>
          )}
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">🎯 Mode</h4>
            <p className="text-lg text-purple-900">
              {modes.find(m => m.id === currentMode)?.name}
            </p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={isSpeaking ? stopSpeaking : () => speakText()}
            disabled={!speechSupported}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpeaking ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Putar Audio</span>
              </>
            )}
          </button>
          
          {speechSupported && (
            <button
              onClick={() => speakText(currentExercise.romanization)}
              disabled={isSpeaking}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Volume2 className="h-4 w-4" />
              <span>Romanization</span>
            </button>
          )}
        </div>

        {/* Mode-specific Content */}
        {currentMode === 'speak' && (
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!recognitionSupported}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isListening 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Start Speaking</span>
                  </>
                )}
              </button>
              
              {isListening && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
            </div>
            
            {recordingResult && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h4 className="font-medium text-gray-700 mb-2">You said:</h4>
                <p className="text-lg text-gray-900">{recordingResult.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Confidence: {Math.round(recordingResult.confidence * 100)}%
                </p>
              </div>
            )}
          </div>
        )}

        {currentMode === 'quiz' && (
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apa terjemahan dari kalimat di atas?
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Ketik terjemahan dalam bahasa Indonesia..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={showAnswer}
              />
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim() || showAnswer}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Cek
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {pronunciationFeedback && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            pronunciationFeedback.isCorrect 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-start space-x-3">
              {pronunciationFeedback.isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  pronunciationFeedback.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  Hasil Penilaian
                </h4>
                <p className={`mt-1 ${
                  pronunciationFeedback.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {pronunciationFeedback.feedback}
                </p>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Skor:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {pronunciationFeedback.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        pronunciationFeedback.score >= 80 ? 'bg-green-500' :
                        pronunciationFeedback.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pronunciationFeedback.score}%` }}
                    />
                  </div>
                </div>
                
                {pronunciationFeedback.suggestions.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Saran:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {pronunciationFeedback.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="mt-6">
          <button
            onClick={resetState}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Support Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Browser Support Info</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Fitur ini menggunakan Web Speech API browser. Untuk hasil terbaik, gunakan Chrome/Edge. 
              Pastikan mikrofon diizinkan untuk Speech Recognition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingAudioPractice;