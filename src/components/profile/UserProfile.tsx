import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { UserProgress } from '../../types';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  Globe, 
  GraduationCap,
  TrendingUp,
  Clock,
  Flame,
  Trophy,
  Target,
  Edit3,
  Camera,
  Save,
  X,
  Settings,
  Bell,
  Shield,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Palette,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ChevronRight,
  Star,
  Heart,
  Zap,
  Gift,
  Crown,
  Diamond,
  Sparkles
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const progress = await firestoreService.getUserProgress(currentUser.uid);
          setUserProgress(progress);
          setDisplayName(currentUser.displayName || '');
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadUserData();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    // Implementasi save profile nanti
    setIsEditing(false);
  };

  const kanjiLearned = userProgress ? Object.values(userProgress.kanjiProgress).filter(p => p.learned).length : 0;
  const grammarLearned = userProgress ? Object.values(userProgress.grammarProgress).filter(p => p.learned).length : 0;
  const vocabularyLearned = userProgress ? Object.values(userProgress.vocabularyProgress).filter(p => p.learned).length : 0;
  const totalLearned = kanjiLearned + grammarLearned + vocabularyLearned;

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Completed first lesson', icon: Star, earned: true },
    { id: 2, name: 'Kanji Master', description: 'Learned 100 kanji', icon: BookOpen, earned: kanjiLearned >= 100 },
    { id: 3, name: 'Grammar Guru', description: 'Mastered 50 grammar points', icon: Globe, earned: grammarLearned >= 50 },
    { id: 4, name: 'Vocabulary Virtuoso', description: 'Learned 500 words', icon: GraduationCap, earned: vocabularyLearned >= 500 },
    { id: 5, name: 'Streak Legend', description: '30 day study streak', icon: Flame, earned: false },
    { id: 6, name: 'Quiz Champion', description: 'Perfect score on 10 quizzes', icon: Trophy, earned: false },
  ];

  const profileSections = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and track your Japanese learning journey</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Your name"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">
                    {currentUser?.displayName || currentUser?.email || 'Japanese Learner'}
                  </h2>
                )}
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </button>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{currentUser?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm">Premium</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{totalLearned}</div>
              <div className="text-sm text-blue-100">Items Learned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {profileSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <section.icon className="h-4 w-4" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{kanjiLearned}</div>
                  <div className="text-sm text-gray-600">Kanji</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{grammarLearned}</div>
                  <div className="text-sm text-gray-600">Grammar</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{vocabularyLearned}</div>
                  <div className="text-sm text-gray-600">Vocabulary</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Completed Kanji lesson</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Learned 5 new vocabulary words</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Earned achievement: First Steps</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'achievements' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.earned
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <achievement.icon className={`h-5 w-5 ${
                        achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-yellow-800' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h4>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'preferences' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Display Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sun className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Theme</span>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Sound Effects</span>
                  </div>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Daily Reminders</span>
                  </div>
                  <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Daily Goal</span>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>5 items</option>
                    <option>10 items</option>
                    <option>15 items</option>
                    <option>20 items</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;