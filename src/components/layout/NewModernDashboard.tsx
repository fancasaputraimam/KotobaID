import React, { useState, useEffect, useRef } from 'react';
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
  Home,
  Zap,
  Calendar,
  Trophy,
  Bell,
  User,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Grid3X3,
  Plus,
  Filter,
  Star,
  Heart,
  Award,
  Sparkles,
  Coffee,
  Flame
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
import UserProfile from '../profile/UserProfile';

const NewModernDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Navigation categories for top navigation
  const navigationCategories = [
    {
      id: 'main',
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'progress', label: 'Progress', icon: BarChart3, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'ai-recommendations', label: 'AI Recommendations', icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      ]
    },
    {
      id: 'learning',
      label: 'Learning',
      items: [
        { id: 'study-tools', label: 'Study Tools', icon: Search, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'flashcard-study', label: 'Flashcards', icon: Layers, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'writing', label: 'Writing', icon: Edit3, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'audio', label: 'Audio', icon: Volume2, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'reading', label: 'Reading', icon: FileText, color: 'text-teal-600', bgColor: 'bg-teal-50' },
      ]
    },
    {
      id: 'practice',
      label: 'Practice',
      items: [
        { id: 'kanji', label: 'Kanji', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'grammar', label: 'Grammar', icon: Globe, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'vocabulary', label: 'Vocabulary', icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'quiz', label: 'AI Quiz', icon: TrendingUp, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { id: 'example', label: 'AI Examples', icon: Zap, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'jlpt', label: 'JLPT Prep', icon: Trophy, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'kanji-search', label: 'Kanji Search', icon: Search, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'flashcard-manager', label: 'Manage Cards', icon: Target, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' },
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

  // Handle click outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

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
        return <DashboardHome userProgress={userProgress} onTabChange={setActiveTab} />;
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
      case 'profile':
        return <UserProfile />;
      default:
        return <DashboardHome userProgress={userProgress} onTabChange={setActiveTab} />;
    }
  };

  const allItems = navigationCategories.flatMap(category => category.items);
  const currentItem = allItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KotobaID</h1>
                <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Japanese Learning</p>
              </div>
            </div>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationCategories.map((category) => (
                <div key={category.id} className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-all duration-300 hover:scale-105">
                    <span>{category.label}</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform scale-95 group-hover:scale-100 mt-2">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{category.label}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map((item, index) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300 hover:scale-105 hover:shadow-md ${
                              activeTab === item.id
                                ? `${item.bgColor} ${item.color} border border-current transform scale-105 shadow-lg`
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: 'fadeInUp 0.4s ease-out forwards'
                            }}
                          >
                            <item.icon className="h-4 w-4 transition-transform duration-300" />
                            <span className="text-xs font-medium">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Quick Stats - Desktop */}
              <div className="hidden xl:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>7 day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{kanjiLearned + grammarLearned + vocabularyLearned} learned</span>
                </div>
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110">
                <Bell className="h-5 w-5 text-gray-600 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white animate-pulse">
                  3
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
              >
                <div className="transition-transform duration-300">
                  {getThemeIcon()}
                </div>
              </button>

              {/* User Menu */}
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                      {currentUser?.displayName || currentUser?.email}
                    </p>
                    <p className="text-xs text-gray-500">Premium</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 mt-2 z-50 transition-all duration-300 ease-out transform scale-100 opacity-100"
                    style={{
                      animation: 'slideInDown 0.3s ease-out forwards'
                    }}>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-blue-700 transition-all duration-300 hover:scale-105"
                      >
                        <User className="h-4 w-4 transition-transform duration-300" />
                        <span className="text-sm">Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-300 hover:scale-105"
                      >
                        <Settings className="h-4 w-4 transition-transform duration-300" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-300 hover:scale-105"
                      >
                        <LogOut className="h-4 w-4 transition-transform duration-300" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              >
                <div className="transition-transform duration-300">
                  {mobileMenuOpen ? <X className="h-5 w-5 transform rotate-90" /> : <Menu className="h-5 w-5" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden bg-white border-t border-gray-200 overflow-hidden transition-all duration-500 ease-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            {navigationCategories.map((category, categoryIndex) => (
              <div 
                key={category.id} 
                className="mb-6"
                style={{
                  animationDelay: `${categoryIndex * 100}ms`,
                  animation: mobileMenuOpen ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                  {category.label}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {category.items.map((item, itemIndex) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        activeTab === item.id
                          ? `${item.bgColor} ${item.color} border border-current transform scale-105 shadow-lg`
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      style={{
                        animationDelay: `${(categoryIndex * 100) + (itemIndex * 50)}ms`,
                        animation: mobileMenuOpen ? 'slideInUp 0.6s ease-out forwards' : 'none'
                      }}
                    >
                      <item.icon className="h-5 w-5 transition-transform duration-300" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {activeTab !== 'dashboard' && (
        <div className="bg-white/50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {currentItem?.label || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen">
        {renderContent()}
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      )}
    </div>
  );
};

// Enhanced Dashboard Home Component
const DashboardHome: React.FC<{ userProgress: UserProgress | null; onTabChange: (tab: string) => void }> = ({ userProgress, onTabChange }) => {
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
    { 
      label: 'Study Tools', 
      icon: Search, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Dictionary & Analysis',
      tab: 'study-tools'
    },
    { 
      label: 'Flashcards', 
      icon: Layers, 
      color: 'from-pink-500 to-rose-500',
      description: 'Review & Practice',
      tab: 'flashcard-study'
    },
    { 
      label: 'Writing', 
      icon: Edit3, 
      color: 'from-orange-500 to-red-500',
      description: 'Kanji & Kana',
      tab: 'writing'
    },
    { 
      label: 'Audio', 
      icon: Volume2, 
      color: 'from-red-500 to-pink-500',
      description: 'Listening & Speaking',
      tab: 'audio'
    },
    { 
      label: 'Reading', 
      icon: FileText, 
      color: 'from-teal-500 to-cyan-500',
      description: 'Comprehension',
      tab: 'reading'
    },
    { 
      label: 'AI Quiz', 
      icon: Brain, 
      color: 'from-purple-500 to-indigo-500',
      description: 'Smart Practice',
      tab: 'quiz'
    },
  ];

  const featuredLessons = [
    {
      title: 'JLPT N5 Vocabulary',
      description: 'Master essential words for JLPT N5',
      progress: 65,
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
      tab: 'vocabulary'
    },
    {
      title: 'Basic Kanji Practice',
      description: 'Learn stroke order and meanings',
      progress: 45,
      icon: BookOpen,
      color: 'from-green-500 to-teal-500',
      tab: 'kanji'
    },
    {
      title: 'Grammar Fundamentals',
      description: 'Essential Japanese grammar patterns',
      progress: 30,
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      tab: 'grammar'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                おかえりなさい! Welcome back! 🎌
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Mari lanjutkan perjalanan belajar bahasa Jepang Anda hari ini.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <span className="text-blue-100">7 day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-300" />
                  <span className="text-blue-100">{kanjiLearned + grammarLearned + vocabularyLearned} items learned</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-105 stagger-animation">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110">
              <BookOpen className="h-6 w-6 text-blue-600 transition-transform duration-300" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">+5 today</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kanjiLearned}</p>
            <p className="text-sm text-gray-600">Kanji Learned</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-105 stagger-animation">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl transition-all duration-300 hover:scale-110">
              <Globe className="h-6 w-6 text-green-600 transition-transform duration-300" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">+3 today</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{grammarLearned}</p>
            <p className="text-sm text-gray-600">Grammar Points</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-105 stagger-animation">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl transition-all duration-300 hover:scale-110">
              <GraduationCap className="h-6 w-6 text-purple-600 transition-transform duration-300" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">+12 today</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{vocabularyLearned}</p>
            <p className="text-sm text-gray-600">Vocabulary</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:scale-105 stagger-animation">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl transition-all duration-300 hover:scale-110">
              <Flame className="h-6 w-6 text-orange-600 transition-transform duration-300 icon-bounce" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">🔥</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">7</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
          <Grid3X3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onTabChange(action.tab)}
              className="group flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 micro-bounce"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg gradient-animation`}>
                <action.icon className="h-6 w-6 text-white transition-transform duration-300" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center mb-1">{action.label}</span>
              <span className="text-xs text-gray-500 text-center">{action.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Lessons & AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Lessons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Continue Learning</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {featuredLessons.map((lesson, index) => (
              <button
                key={index}
                onClick={() => onTabChange(lesson.tab)}
                className="w-full group p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 hover:scale-105 micro-bounce"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'slideInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${lesson.color} group-hover:scale-110 transition-all duration-300 gradient-animation`}>
                    <lesson.icon className="h-6 w-6 text-white transition-transform duration-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900 mb-1">{lesson.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${lesson.progress}%`,
                            animation: 'scaleIn 0.8s ease-out forwards'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{lesson.progress}%</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 stagger-animation">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">AI Assistant</h3>
            <Brain className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                <p className="text-gray-500 mb-4">Tanyakan sesuatu tentang bahasa Jepang!</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => setChatInput('Apa itu hiragana?')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-all duration-300 hover:scale-105 micro-bounce"
                  >
                    Apa itu hiragana?
                  </button>
                  <button 
                    onClick={() => setChatInput('Bagaimana cara belajar kanji?')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-all duration-300 hover:scale-105 micro-bounce"
                  >
                    Cara belajar kanji
                  </button>
                  <button 
                    onClick={() => setChatInput('Tips lulus JLPT N3?')}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-all duration-300 hover:scale-105 micro-bounce"
                  >
                    Tips JLPT N3
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white gradient-animation' 
                        : 'bg-white border border-gray-200 text-gray-900 shadow-sm hover:shadow-md'
                    }`}
                    style={{
                      animation: 'slideInUp 0.4s ease-out forwards',
                      animationDelay: `${idx * 100}ms`
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 micro-bounce gradient-animation"
            >
              {chatLoading ? <LoadingSpinner size="sm" /> : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewModernDashboard;