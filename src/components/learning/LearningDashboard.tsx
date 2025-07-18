import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { 
  BookOpen, 
  Globe, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  LogOut,
  BarChart3,
  Target,
  Layers,
  Settings,
  FileText,
  PieChart,
  Lightbulb
} from 'lucide-react';
import KanjiLearning from './KanjiLearning';
import GrammarLearning from './GrammarLearning';
import VocabularyLearning from './VocabularyLearning';
import { firestoreService } from '../../services/firestoreService';
import { UserProgress } from '../../types';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';
import AIToolsDashboard from './AIToolsDashboard';
import { Outlet } from 'react-router-dom';
import QuizAIPage from './QuizAIPage';
import ExampleAIPage from './ExampleAIPage';
import JLPTAIPage from './JLPTAIPage';
import KanjiSearchPage from './KanjiSearchPage';
import ProgressDashboard from '../progress/ProgressDashboard';
import Settings from '../settings/Settings';
import FlashcardStudy from '../flashcard/FlashcardStudy';
import FlashcardManager from '../flashcard/FlashcardManager';
import WritingPractice from '../writing/WritingPractice';
import ListeningPractice from '../audio/ListeningPractice';
import ReadingComprehension from '../reading/ReadingComprehension';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import AIRecommendations from '../recommendations/AIRecommendations';
import StudyTools from '../studyTools/StudyTools';

const LearningDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('progress');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const tabs = [
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics Detail', icon: PieChart },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { id: 'study-tools', label: 'Alat Belajar', icon: BookOpen },
    { id: 'flashcard-study', label: 'Belajar Flashcard', icon: Layers },
    { id: 'writing', label: 'Latihan Menulis', icon: Target },
    { id: 'audio', label: 'Audio & Mendengar', icon: Clock },
    { id: 'reading', label: 'Pemahaman Bacaan', icon: FileText },
    { id: 'kanji', label: 'Kanji', icon: BookOpen },
    { id: 'grammar', label: 'Tata Bahasa', icon: Globe },
    { id: 'vocabulary', label: 'Kosakata', icon: GraduationCap },
    { id: 'quiz', label: 'Kuis AI', icon: TrendingUp },
    { id: 'example', label: 'Contoh AI', icon: Clock },
    { id: 'jlpt', label: 'JLPT AI', icon: GraduationCap },
    { id: 'kanji-search', label: 'Pencarian Kanji', icon: BookOpen },
    { id: 'flashcard-manager', label: 'Kelola Flashcard', icon: Layers },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (currentUser) {
        try {
          const progress = await firestoreService.getUserProgress(currentUser.uid);
          setUserProgress(progress);
        } catch (error) {
          console.error('Error loading user progress:', error);
        }
      }
    };

    loadProgress();
  }, [currentUser]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatLoading(true);
    setChatInput('');

    try {
      const response = await azureOpenAI.getChatResponse([...chatHistory, userMessage]);
      setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const kanjiLearned = userProgress ? Object.values(userProgress.kanjiProgress).filter(p => p.learned).length : 0;
  const grammarLearned = userProgress ? Object.values(userProgress.grammarProgress).filter(p => p.learned).length : 0;
  const vocabularyLearned = userProgress ? Object.values(userProgress.vocabularyProgress).filter(p => p.learned).length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">KotobaID</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Learning Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">
                  {currentUser?.displayName || currentUser?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat datang kembali, {currentUser?.displayName?.split(' ')[0] || 'Pembelajar'}!
          </h2>
          <p className="text-gray-600">Mari lanjutkan perjalanan belajar bahasa Jepang Anda hari ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Kanji Dipelajari</p>
                <p className="text-2xl font-bold">{kanjiLearned}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tata Bahasa Dipelajari</p>
                <p className="text-2xl font-bold">{grammarLearned}</p>
              </div>
              <Globe className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Kosakata Dipelajari</p>
                <p className="text-2xl font-bold">{vocabularyLearned}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Streak Belajar</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-2 text-blue-700">Tanya AI seputar Bahasa Jepang</h2>
          <p className="text-gray-600 mb-4 text-sm">Tanyakan apapun tentang bunpou, kosakata, kanji, budaya, JLPT, atau topik lain seputar bahasa Jepang. Jawaban dibantu AI.</p>
          <div className="max-h-64 overflow-y-auto mb-4 border rounded p-3 bg-gray-50">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 italic mb-4">Belum ada percakapan. Tanyakan sesuatu!</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => setChatInput('Apa itu hiragana?')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    Apa itu hiragana?
                  </button>
                  <button 
                    onClick={() => setChatInput('Bagaimana cara belajar kanji?')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    Cara belajar kanji
                  </button>
                  <button 
                    onClick={() => setChatInput('Tips lulus JLPT N3?')}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    Tips JLPT N3
                  </button>
                </div>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-xl whitespace-pre-line ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleChatSubmit} className="flex space-x-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tulis pertanyaan tentang bahasa Jepang..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            {chatLoading ? (
              <div className="flex justify-start"><LoadingSpinner size="sm" /></div>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Kirim
              </button>
            )}
          </form>
        </div>

        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <nav className="-mb-px flex flex-nowrap space-x-2 md:space-x-8 overflow-x-auto scrollbar-hide px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-2 px-4 md:px-5 border-b-2 font-medium text-sm rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
                style={{ minWidth: 56 }}
              >
                <tab.icon className="h-5 w-5 md:h-4 md:w-4 mr-0 md:mr-2" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'progress' && <ProgressDashboard />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'ai-recommendations' && <AIRecommendations />}
          {activeTab === 'study-tools' && <StudyTools />}
          {activeTab === 'flashcard-study' && <FlashcardStudy />}
          {activeTab === 'writing' && <WritingPractice />}
          {activeTab === 'audio' && <ListeningPractice />}
          {activeTab === 'reading' && <ReadingComprehension />}
          {activeTab === 'kanji' && <KanjiLearning />}
          {activeTab === 'grammar' && <GrammarLearning />}
          {activeTab === 'vocabulary' && <VocabularyLearning />}
          {activeTab === 'quiz' && <QuizAIPage />}
          {activeTab === 'example' && <ExampleAIPage />}
          {activeTab === 'jlpt' && <JLPTAIPage />}
          {activeTab === 'kanji-search' && <KanjiSearchPage />}
          {activeTab === 'flashcard-manager' && <FlashcardManager />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;