import React, { useState, useRef, useEffect } from 'react';
import { 
  azureAudioService, 
  TTSRequest, 
  STTRequest, 
  AudioResponse, 
  PronunciationResult 
} from '../../services/azureAudioService';
import {
  Play,
  Pause,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Speaker,
  Settings,
  Headphones,
  MessageSquare,
  Target,
  Award,
  Clock,
  Zap,
  BookOpen,
  ArrowRight,
  Info,
  RotateCcw
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

type PracticeMode = 'tts' | 'pronunciation' | 'shadowing' | 'listening';

interface AudioExercise {
  id: string;
  japaneseText: string;
  romanization: string;
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

const AudioPracticeHub: React.FC = () => {
  // Practice mode state
  const [activeMode, setActiveMode] = useState<PracticeMode>('tts');
  const [currentExercise, setCurrentExercise] = useState<AudioExercise | null>(null);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState('ja-JP-NanamiNeural');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  
  // Results state
  const [userTranscription, setUserTranscription] = useState('');
  const [userTranslation, setUserTranslation] = useState('');
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [maxRecordingTime, setMaxRecordingTime] = useState(5000);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample exercises
  const exercises: AudioExercise[] = [
    {
      id: '1',
      japaneseText: 'おはようございます',
      romanization: 'Ohayou gozaimasu',
      translation: 'Selamat pagi',
      difficulty: 'beginner',
      category: 'Salam'
    },
    {
      id: '2',
      japaneseText: 'ありがとうございます',
      romanization: 'Arigatou gozaimasu',
      translation: 'Terima kasih',
      difficulty: 'beginner',
      category: 'Sopan Santun'
    },
    {
      id: '3',
      japaneseText: 'すみません、駅はどこですか',
      romanization: 'Sumimasen, eki wa doko desu ka',
      translation: 'Maaf, di mana stasiun?',
      difficulty: 'intermediate',
      category: 'Bertanya Arah'
    },
    {
      id: '4',
      japaneseText: '今日は天気がいいですね',
      romanization: 'Kyou wa tenki ga ii desu ne',
      translation: 'Hari ini cuacanya bagus ya',
      difficulty: 'intermediate',
      category: 'Cuaca'
    },
    {
      id: '5',
      japaneseText: '来週の会議について話し合いましょう',
      romanization: 'Raishuu no kaigi ni tsuite hanashiaimashou',
      translation: 'Mari kita diskusikan tentang rapat minggu depan',
      difficulty: 'advanced',
      category: 'Bisnis'
    }
  ];

  useEffect(() => {
    // Load first exercise
    if (exercises.length > 0) {
      setCurrentExercise(exercises[0]);
    }
    
    return () => {
      // Cleanup audio URLs
      if (audioUrl) {
        azureAudioService.cleanupAudioUrl(audioUrl);
      }
    };
  }, []);

  // Text-to-Speech function
  const generateSpeech = async () => {
    if (!currentExercise) return;
    
    setLoading(true);
    try {
      const request: TTSRequest = {
        text: currentExercise.japaneseText,
        voice: selectedVoice,
        speed: speechSpeed,
        format: 'mp3'
      };
      
      const response = await azureAudioService.textToSpeech(request);
      
      if (response.error) {
        console.error('TTS Error:', response.error);
        return;
      }
      
      if (response.audioUrl) {
        // Cleanup previous audio URL
        if (audioUrl) {
          azureAudioService.cleanupAudioUrl(audioUrl);
        }
        setAudioUrl(response.audioUrl);
      }
    } catch (error) {
      console.error('Generate speech error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Play audio
  const playAudio = async () => {
    if (!audioUrl) {
      await generateSpeech();
      return;
    }
    
    setIsPlaying(true);
    try {
      await azureAudioService.playAudio(audioUrl);
    } catch (error) {
      console.error('Play audio error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    setUserTranscription('');
    setPronunciationResult(null);
    
    // Start timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 100);
    }, 100);
    
    try {
      const audioBlob = await azureAudioService.recordAudio(maxRecordingTime);
      
      if (audioBlob) {
        await processRecording(audioBlob);
      }
    } catch (error) {
      console.error('Recording error:', error);
    } finally {
      stopRecording();
    }
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  // Process recorded audio
  const processRecording = async (audioBlob: Blob) => {
    if (!currentExercise) return;
    
    setLoading(true);
    try {
      const request: STTRequest = {
        audioBlob,
        language: 'ja'
      };
      
      const response = await azureAudioService.speechToText(request);
      
      if (response.error) {
        console.error('STT Error:', response.error);
        return;
      }
      
      if (response.transcription) {
        setUserTranscription(response.transcription);
        
        // Check pronunciation based on mode
        if (activeMode === 'pronunciation') {
          const result = await azureAudioService.checkPronunciation(
            response.transcription,
            currentExercise.japaneseText
          );
          setPronunciationResult(result);
        } else if (activeMode === 'shadowing') {
          const result = await azureAudioService.checkPronunciationWithScore(
            response.transcription,
            currentExercise.japaneseText
          );
          setPronunciationResult(result);
        }
      }
    } catch (error) {
      console.error('Process recording error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check translation for listening test
  const checkTranslation = async () => {
    if (!currentExercise || !userTranslation.trim()) return;
    
    setLoading(true);
    try {
      const result = await azureAudioService.checkTranslation(
        userTranslation,
        currentExercise.translation
      );
      setPronunciationResult(result);
    } catch (error) {
      console.error('Translation check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Next exercise
  const nextExercise = () => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExercise?.id);
    const nextIndex = (currentIndex + 1) % exercises.length;
    setCurrentExercise(exercises[nextIndex]);
    resetState();
  };

  // Reset state
  const resetState = () => {
    setUserTranscription('');
    setUserTranslation('');
    setPronunciationResult(null);
    setRecordingTime(0);
    if (audioUrl) {
      azureAudioService.cleanupAudioUrl(audioUrl);
      setAudioUrl('');
    }
  };

  const modes = [
    {
      id: 'tts' as const,
      name: 'Text to Speech',
      icon: Volume2,
      color: 'blue',
      description: 'Dengarkan pelafalan Jepang'
    },
    {
      id: 'pronunciation' as const,
      name: 'Koreksi Pelafalan',
      icon: Mic,
      color: 'green',
      description: 'Latih pelafalan dan dapatkan koreksi'
    },
    {
      id: 'shadowing' as const,
      name: 'Mode Shadowing',
      icon: Headphones,
      color: 'purple',
      description: 'Ikuti audio dengan skor detail'
    },
    {
      id: 'listening' as const,
      name: 'Tebak Terjemahan',
      icon: MessageSquare,
      color: 'orange',
      description: 'Dengar audio, tebak terjemahan'
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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Audio Practice Hub</h2>
              <p className="text-gray-600">Latihan listening dan speaking dengan Azure OpenAI</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                resetState();
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeMode === mode.id
                  ? `border-${mode.color}-500 bg-${mode.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <mode.icon className={`h-6 w-6 mx-auto mb-2 ${
                activeMode === mode.id ? `text-${mode.color}-600` : 'text-gray-500'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice Model</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {azureAudioService.getJapaneseVoices().map(voice => (
                  <option key={voice} value={voice}>
                    {voice.replace('ja-JP-', '').replace('Neural', '')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kecepatan Bicara: {speechSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Recording: {maxRecordingTime / 1000}s
              </label>
              <input
                type="range"
                min="3000"
                max="10000"
                step="1000"
                value={maxRecordingTime}
                onChange={(e) => setMaxRecordingTime(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Exercise */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900">Latihan Saat Ini</span>
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
          
          <button
            onClick={nextExercise}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Next</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🇯🇵 Bahasa Jepang</h4>
            <p className="text-2xl font-bold text-blue-900 mb-1">{currentExercise.japaneseText}</p>
            <p className="text-sm text-blue-600">{currentExercise.romanization}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">🇮🇩 Terjemahan</h4>
            <p className="text-lg text-green-900">{currentExercise.translation}</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">🎯 Mode Aktif</h4>
            <p className="text-lg text-purple-900">
              {modes.find(m => m.id === activeMode)?.name}
            </p>
          </div>
        </div>

        {/* TTS Controls */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={playAudio}
            disabled={loading || isPlaying}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>
              {loading ? 'Generating...' : isPlaying ? 'Playing...' : 'Putar Audio'}
            </span>
          </button>
          
          <button
            onClick={generateSpeech}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate Ulang</span>
          </button>
        </div>

        {/* Mode-specific content */}
        {activeMode !== 'tts' && (
          <div className="border-t pt-6">
            {/* Recording Controls */}
            {(activeMode === 'pronunciation' || activeMode === 'shadowing') && (
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isRecording 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    <span>
                      {isRecording ? 'Stop Recording' : 'Mulai Rekam'}
                    </span>
                  </button>
                  
                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="font-mono">
                        {(recordingTime / 1000).toFixed(1)}s / {maxRecordingTime / 1000}s
                      </span>
                    </div>
                  )}
                </div>
                
                {userTranscription && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Hasil Transkripsi:</h4>
                    <p className="text-lg text-gray-900">{userTranscription}</p>
                  </div>
                )}
              </div>
            )}

            {/* Translation Input for Listening Test */}
            {activeMode === 'listening' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Masukkan Terjemahan:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userTranslation}
                    onChange={(e) => setUserTranslation(e.target.value)}
                    placeholder="Ketik terjemahan dalam bahasa Indonesia..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={checkTranslation}
                    disabled={!userTranslation.trim() || loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Cek'}
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {pronunciationResult && (
              <div className={`p-4 rounded-lg border-2 ${
                pronunciationResult.isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start space-x-3">
                  {pronunciationResult.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      pronunciationResult.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Hasil Penilaian
                    </h4>
                    <p className={`mt-1 ${
                      pronunciationResult.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {pronunciationResult.feedback}
                    </p>
                    
                    {pronunciationResult.score !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Skor:</span>
                          <span className="text-sm font-bold text-gray-900">
                            {pronunciationResult.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              pronunciationResult.score >= 80 ? 'bg-green-500' :
                              pronunciationResult.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${pronunciationResult.score}%` }}
                          />
                        </div>
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
                <RotateCcw className="h-4 w-4" />
                <span>Reset Latihan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPracticeHub;