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
  Lightbulb,
  Brain,
  Volume2,
  Edit3,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Zap,
  Calendar,
  Trophy,
  Bell,
  User,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

// Import all components
import KanjiLearning from '../learning/KanjiLearning';
import GrammarLearning from '../learning/GrammarLearning';
import VocabularyLearning from '../learning/VocabularyLearning';
import { firestoreService } from '../../services/firestoreService';
import { UserProgress } from '../../types';
import { azureOpenAI } from '../../services/azureOpenAI';
import LoadingSpinner from '../common/LoadingSpinner';
import QuizAIPage from '../learning/QuizAIPage';
import ExampleAIPage from '../learning/ExampleAIPage';
import JLPTAIPage from '../learning/JLPTAIPage';
import KanjiSearchPage from '../learning/KanjiSearchPage';
import ProgressDashboard from '../progress/ProgressDashboard';
import FlashcardStudy from '../flashcard/FlashcardStudy';
import FlashcardManager from '../flashcard/FlashcardManager';
import WritingPractice from '../writing/WritingPractice';
import ListeningPractice from '../audio/ListeningPractice';
import ReadingComprehension from '../reading/ReadingComprehension';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import AIRecommendations from '../recommendations/AIRecommendations';
import StudyTools from '../studyTools/StudyTools';
import Settings from '../settings/Settings';
import MobileBottomNav from './MobileBottomNav';

const ModernDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Navigation structure
  const navigation = [
    {
      category: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
        { id: 'progress', label: 'Progress', icon: BarChart3, color: 'text-green-600' },
        { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'text-purple-600' },
        { id: 'ai-recommendations', label: 'AI Recommendations', icon: Lightbulb, color: 'text-yellow-600' },
      ]
    },
    {
      category: 'Learning',
      items: [
        { id: 'study-tools', label: 'Study Tools', icon: Search, color: 'text-indigo-600' },
        { id: 'flashcard-study', label: 'Flashcards', icon: Layers, color: 'text-pink-600' },
        { id: 'writing', label: 'Writing', icon: Edit3, color: 'text-orange-600' },
        { id: 'audio', label: 'Audio & Listening', icon: Volume2, color: 'text-red-600' },
        { id: 'reading', label: 'Reading', icon: FileText, color: 'text-teal-600' },
      ]
    },
    {
      category: 'Practice',
      items: [
        { id: 'kanji', label: 'Kanji', icon: BookOpen, color: 'text-blue-600' },
        { id: 'grammar', label: 'Grammar', icon: Globe, color: 'text-green-600' },
        { id: 'vocabulary', label: 'Vocabulary', icon: GraduationCap, color: 'text-purple-600' },
        { id: 'quiz', label: 'AI Quiz', icon: TrendingUp, color: 'text-yellow-600' },
      ]
    },
    {
      category: 'Tools',
      items: [
        { id: 'example', label: 'AI Examples', icon: Zap, color: 'text-indigo-600' },
        { id: 'jlpt', label: 'JLPT Prep', icon: Trophy, color: 'text-pink-600' },
        { id: 'kanji-search', label: 'Kanji Search', icon: Search, color: 'text-orange-600' },
        { id: 'flashcard-manager', label: 'Manage Cards', icon: Target, color: 'text-red-600' },
      ]
    },
    {
      category: 'Settings',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
      ]
    }
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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
    // Apply theme logic here
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const kanjiLearned = userProgress ? Object.values(userProgress.kanjiProgress).filter(p => p.learned).length : 0;
  const grammarLearned = userProgress ? Object.values(userProgress.grammarProgress).filter(p => p.learned).length : 0;
  const vocabularyLearned = userProgress ? Object.values(userProgress.vocabularyProgress).filter(p => p.learned).length : 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome userProgress={userProgress} />;
      case 'progress':
        return <ProgressDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'ai-recommendations':
        return <AIRecommendations />;
      case 'study-tools':
        return <StudyTools />;
      case 'flashcard-study':
        return <FlashcardStudy />;
      case 'writing':
        return <WritingPractice />;
      case 'audio':
        return <ListeningPractice />;
      case 'reading':
        return <ReadingComprehension />;
      case 'kanji':
        return <KanjiLearning />;
      case 'grammar':
        return <GrammarLearning />;
      case 'vocabulary':
        return <VocabularyLearning />;
      case 'quiz':
        return <QuizAIPage />;
      case 'example':
        return <ExampleAIPage />;
      case 'jlpt':
        return <JLPTAIPage />;
      case 'kanji-search':
        return <KanjiSearchPage />;
      case 'flashcard-manager':
        return <FlashcardManager />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome userProgress={userProgress} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KotobaID</h1>
                <p className="text-xs text-gray-500">Learning Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.category}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${item.color}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-xs text-gray-500">Premium User</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                {getThemeIcon()}
                <span className="text-xs capitalize">{theme}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-sm text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-300 ease-in-out`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigation.flatMap(section => section.items).find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Streak: 7 hari</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{kanjiLearned + grammarLearned + vocabularyLearned} dipelajari</span>
                </div>
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

// Dashboard Home Component
const DashboardHome: React.FC<{ userProgress: UserProgress | null }> = ({ userProgress }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

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

  const quickActions = [
    { label: 'Study Tools', icon: Search, color: 'bg-indigo-500', description: 'Dictionary & Analysis' },
    { label: 'Flashcards', icon: Layers, color: 'bg-pink-500', description: 'Review & Practice' },
    { label: 'Writing Practice', icon: Edit3, color: 'bg-orange-500', description: 'Kanji & Kana' },
    { label: 'Audio Lesson', icon: Volume2, color: 'bg-red-500', description: 'Listening & Speaking' },
    { label: 'Reading', icon: FileText, color: 'bg-teal-500', description: 'Comprehension' },
    { label: 'AI Quiz', icon: Brain, color: 'bg-purple-500', description: 'Smart Practice' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              おかえりなさい! Welcome back!
            </h1>
            <p className="text-blue-100 text-lg">
              Mari lanjutkan perjalanan belajar bahasa Jepang Anda hari ini.
            </p>
          </div>
          <div className="hidden md:block">
            <Calendar className="h-20 w-20 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">+5 today</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kanjiLearned}</p>
            <p className="text-sm text-gray-600">Kanji Learned</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+3 today</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{grammarLearned}</p>
            <p className="text-sm text-gray-600">Grammar Points</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">+12 today</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{vocabularyLearned}</p>
            <p className="text-sm text-gray-600">Vocabulary</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">🔥</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">7</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className={`p-3 rounded-lg ${action.color} mb-3 group-hover:scale-105 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">{action.label}</span>
              <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Chat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          AI Assistant
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Tanyakan sesuatu tentang bahasa Jepang!</p>
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
          ) : (
            <div className="space-y-3">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <form onSubmit={handleChatSubmit} className="flex space-x-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Tanya AI tentang bahasa Jepang..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {chatLoading ? <LoadingSpinner size="sm" /> : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModernDashboard;