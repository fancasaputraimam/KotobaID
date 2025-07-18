import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { UserProgress } from '../../types';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  BookOpen,
  BarChart3,
  Flame,
  Globe,
  GraduationCap,
  ChevronRight,
  Trophy,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit3,
  Headphones
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface StudySession {
  id: string;
  date: string;
  duration: number;
  itemsLearned: number;
  type: 'kanji' | 'vocabulary' | 'grammar' | 'reading' | 'writing' | 'listening';
  score?: number;
}

interface WeeklyProgress {
  week: string;
  studyTime: number;
  itemsLearned: number;
  streak: number;
}

interface ProgressStats {
  totalStudyTime: number;
  totalItemsLearned: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  studyDays: number;
  completionRate: number;
}

const ProgressDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyProgress[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kanji' | 'vocabulary' | 'grammar'>('all');

  useEffect(() => {
    loadProgressData();
  }, [currentUser, timeRange, selectedCategory]);

  const loadProgressData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Load user progress
      const progress = await firestoreService.getUserProgress(currentUser.uid);
      setUserProgress(progress);

      // Generate mock study sessions (in real app, this would come from Firebase)
      const mockSessions: StudySession[] = generateMockStudySessions();
      setStudySessions(mockSessions);

      // Generate weekly data
      const weekly = generateWeeklyData(mockSessions);
      setWeeklyData(weekly);

      // Calculate stats
      const calculatedStats = calculateProgressStats(mockSessions, progress);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockStudySessions = (): StudySession[] => {
    const sessions: StudySession[] = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Skip some days to simulate real usage
      if (Math.random() > 0.3) {
        const types: Array<'kanji' | 'vocabulary' | 'grammar' | 'reading' | 'writing' | 'listening'> = 
          ['kanji', 'vocabulary', 'grammar', 'reading', 'writing', 'listening'];
        
        sessions.push({
          id: `session-${i}`,
          date: date.toISOString().split('T')[0],
          duration: Math.floor(Math.random() * 60 + 10), // 10-70 minutes
          itemsLearned: Math.floor(Math.random() * 20 + 5), // 5-25 items
          type: types[Math.floor(Math.random() * types.length)],
          score: Math.floor(Math.random() * 30 + 70) // 70-100%
        });
      }
    }
    
    return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const generateWeeklyData = (sessions: StudySession[]): WeeklyProgress[] => {
    const weeks: { [key: string]: WeeklyProgress } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week: weekKey,
          studyTime: 0,
          itemsLearned: 0,
          streak: 0
        };
      }
      
      weeks[weekKey].studyTime += session.duration;
      weeks[weekKey].itemsLearned += session.itemsLearned;
    });
    
    return Object.values(weeks).sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime());
  };

  const calculateProgressStats = (sessions: StudySession[], progress: UserProgress | null): ProgressStats => {
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalItemsLearned = sessions.reduce((sum, session) => sum + session.itemsLearned, 0);
    const averageSessionTime = sessions.length > 0 ? totalStudyTime / sessions.length : 0;
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasStudy = sessions.some(session => session.date === dateStr);
      
      if (hasStudy) {
        if (i === 0) currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }
    
    const studyDays = new Set(sessions.map(s => s.date)).size;
    const completionRate = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length : 0;
    
    return {
      totalStudyTime,
      totalItemsLearned,
      currentStreak,
      longestStreak,
      averageSessionTime,
      studyDays,
      completionRate
    };
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kanji': return BookOpen;
      case 'vocabulary': return GraduationCap;
      case 'grammar': return Globe;
      case 'reading': return Eye;
      case 'writing': return Edit3;
      case 'listening': return Headphones;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'kanji': return 'bg-blue-100 text-blue-600';
      case 'vocabulary': return 'bg-purple-100 text-purple-600';
      case 'grammar': return 'bg-green-100 text-green-600';
      case 'reading': return 'bg-orange-100 text-orange-600';
      case 'writing': return 'bg-red-100 text-red-600';
      case 'listening': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!userProgress || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Progress data not available</p>
        </div>
      </div>
    );
  }

  const kanjiLearned = Object.values(userProgress.kanjiProgress).filter(p => p.learned).length;
  const grammarLearned = Object.values(userProgress.grammarProgress).filter(p => p.learned).length;
  const vocabularyLearned = Object.values(userProgress.vocabularyProgress).filter(p => p.learned).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
        <p className="text-gray-600">Track your Japanese learning journey and achievements</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="all">All time</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="kanji">Kanji</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="grammar">Grammar</option>
        </select>

        <button
          onClick={loadProgressData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Study Time */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">+{formatTime(45)} today</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatTime(stats.totalStudyTime)}</p>
            <p className="text-sm text-gray-600">Total Study Time</p>
          </div>
        </div>

        {/* Items Learned */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">+12 today</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{kanjiLearned + grammarLearned + vocabularyLearned}</p>
            <p className="text-sm text-gray-600">Items Learned</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">🔥</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">↗️</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.completionRate)}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Progress</h3>
          <div className="space-y-4">
            {weeklyData.slice(0, 8).map((week, index) => (
              <div key={week.week} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500 w-20">
                    Week {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (week.studyTime / 300) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatTime(week.studyTime)}</div>
                  <div className="text-xs text-gray-500">{week.itemsLearned} items</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Kanji</p>
                  <p className="text-xs text-gray-500">{kanjiLearned} learned</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{kanjiLearned}</div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (kanjiLearned / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Grammar</p>
                  <p className="text-xs text-gray-500">{grammarLearned} learned</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{grammarLearned}</div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (grammarLearned / 50) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Vocabulary</p>
                  <p className="text-xs text-gray-500">{vocabularyLearned} learned</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{vocabularyLearned}</div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (vocabularyLearned / 500) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Study Sessions</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>View all</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          {studySessions.slice(0, 10).map((session) => {
            const IconComponent = getTypeIcon(session.type);
            return (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(session.type)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{session.type}</p>
                    <p className="text-xs text-gray-500">{session.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatTime(session.duration)}</div>
                  <div className="text-xs text-gray-500">{session.itemsLearned} items • {session.score}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="p-3 bg-yellow-100 rounded-xl mx-auto w-fit mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="p-3 bg-indigo-100 rounded-xl mx-auto w-fit mb-4">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatTime(Math.round(stats.averageSessionTime))}</div>
          <div className="text-sm text-gray-600">Average Session</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="p-3 bg-pink-100 rounded-xl mx-auto w-fit mb-4">
            <Calendar className="h-8 w-8 text-pink-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.studyDays}</div>
          <div className="text-sm text-gray-600">Study Days</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;