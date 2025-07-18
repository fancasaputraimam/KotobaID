import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { UserProgress } from '../../types';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Globe,
  GraduationCap,
  Activity,
  Brain,
  Trophy,
  Eye,
  Edit3,
  Headphones,
  AlertCircle,
  RefreshCw,
  Download,
  ArrowUp,
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface AnalyticsData {
  totalStudyTime: number;
  totalSessions: number;
  averageSessionTime: number;
  strongestArea: string;
  weakestArea: string;
  improvementRate: number;
  consistencyScore: number;
  retentionRate: number;
}

interface CategoryStats {
  category: string;
  totalTime: number;
  sessionsCount: number;
  averageScore: number;
  progressRate: number;
  lastStudied: string;
}

interface TimeDistribution {
  hour: number;
  minutes: number;
  sessions: number;
}

interface DifficultyAnalysis {
  level: string;
  accuracy: number;
  timeSpent: number;
  improvements: string[];
}

interface LearningTrend {
  date: string;
  studyTime: number;
  itemsLearned: number;
  accuracy: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [difficultyAnalysis, setDifficultyAnalysis] = useState<DifficultyAnalysis[]>([]);
  const [learningTrends, setLearningTrends] = useState<LearningTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [selectedMetric, setSelectedMetric] = useState<'time' | 'accuracy' | 'progress'>('time');

  useEffect(() => {
    loadAnalyticsData();
  }, [currentUser, selectedTimeRange]);

  const loadAnalyticsData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Load user progress
      const progress = await firestoreService.getUserProgress(currentUser.uid);
      setUserProgress(progress);

      // Generate analytics data
      const analytics = generateAnalyticsData(progress);
      setAnalyticsData(analytics);

      // Generate category stats
      const categoryData = generateCategoryStats(progress);
      setCategoryStats(categoryData);

      // Generate time distribution
      const timeData = generateTimeDistribution();
      setTimeDistribution(timeData);

      // Generate difficulty analysis
      const difficultyData = generateDifficultyAnalysis();
      setDifficultyAnalysis(difficultyData);

      // Generate learning trends
      const trendsData = generateLearningTrends();
      setLearningTrends(trendsData);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = (progress: UserProgress | null): AnalyticsData => {
    if (!progress) {
      return {
        totalStudyTime: 0,
        totalSessions: 0,
        averageSessionTime: 0,
        strongestArea: 'None',
        weakestArea: 'None',
        improvementRate: 0,
        consistencyScore: 0,
        retentionRate: 0
      };
    }

    const kanjiLearned = Object.values(progress.kanjiProgress).filter(p => p.learned).length;
    const grammarLearned = Object.values(progress.grammarProgress).filter(p => p.learned).length;
    const vocabularyLearned = Object.values(progress.vocabularyProgress).filter(p => p.learned).length;

    // Determine strongest and weakest areas
    const areas = [
      { name: 'Kanji', score: kanjiLearned },
      { name: 'Grammar', score: grammarLearned },
      { name: 'Vocabulary', score: vocabularyLearned }
    ];

    const strongest = areas.reduce((max, area) => area.score > max.score ? area : max);
    const weakest = areas.reduce((min, area) => area.score < min.score ? area : min);

    return {
      totalStudyTime: Math.floor(Math.random() * 500 + 100), // Mock data
      totalSessions: Math.floor(Math.random() * 50 + 20),
      averageSessionTime: Math.floor(Math.random() * 30 + 15),
      strongestArea: strongest.name,
      weakestArea: weakest.name,
      improvementRate: Math.floor(Math.random() * 20 + 5),
      consistencyScore: Math.floor(Math.random() * 30 + 70),
      retentionRate: Math.floor(Math.random() * 15 + 80)
    };
  };

  const generateCategoryStats = (progress: UserProgress | null): CategoryStats[] => {
    if (!progress) return [];

    const kanjiLearned = Object.values(progress.kanjiProgress).filter(p => p.learned).length;
    const grammarLearned = Object.values(progress.grammarProgress).filter(p => p.learned).length;
    const vocabularyLearned = Object.values(progress.vocabularyProgress).filter(p => p.learned).length;

    return [
      {
        category: 'Kanji',
        totalTime: Math.floor(Math.random() * 200 + 50),
        sessionsCount: Math.floor(Math.random() * 20 + 10),
        averageScore: Math.floor(Math.random() * 20 + 75),
        progressRate: Math.floor(Math.random() * 15 + 5),
        lastStudied: '2024-01-15'
      },
      {
        category: 'Grammar',
        totalTime: Math.floor(Math.random() * 150 + 40),
        sessionsCount: Math.floor(Math.random() * 15 + 8),
        averageScore: Math.floor(Math.random() * 25 + 70),
        progressRate: Math.floor(Math.random() * 12 + 3),
        lastStudied: '2024-01-14'
      },
      {
        category: 'Vocabulary',
        totalTime: Math.floor(Math.random() * 180 + 60),
        sessionsCount: Math.floor(Math.random() * 18 + 12),
        averageScore: Math.floor(Math.random() * 18 + 80),
        progressRate: Math.floor(Math.random() * 20 + 8),
        lastStudied: '2024-01-16'
      },
      {
        category: 'Reading',
        totalTime: Math.floor(Math.random() * 120 + 30),
        sessionsCount: Math.floor(Math.random() * 10 + 5),
        averageScore: Math.floor(Math.random() * 22 + 65),
        progressRate: Math.floor(Math.random() * 10 + 2),
        lastStudied: '2024-01-13'
      },
      {
        category: 'Writing',
        totalTime: Math.floor(Math.random() * 100 + 25),
        sessionsCount: Math.floor(Math.random() * 8 + 4),
        averageScore: Math.floor(Math.random() * 25 + 60),
        progressRate: Math.floor(Math.random() * 8 + 1),
        lastStudied: '2024-01-12'
      },
      {
        category: 'Listening',
        totalTime: Math.floor(Math.random() * 90 + 20),
        sessionsCount: Math.floor(Math.random() * 6 + 3),
        averageScore: Math.floor(Math.random() * 30 + 55),
        progressRate: Math.floor(Math.random() * 6 + 1),
        lastStudied: '2024-01-11'
      }
    ];
  };

  const generateTimeDistribution = (): TimeDistribution[] => {
    const distribution: TimeDistribution[] = [];
    for (let hour = 0; hour < 24; hour++) {
      distribution.push({
        hour,
        minutes: Math.floor(Math.random() * 60),
        sessions: Math.floor(Math.random() * 5)
      });
    }
    return distribution;
  };

  const generateDifficultyAnalysis = (): DifficultyAnalysis[] => {
    return [
      {
        level: 'Beginner',
        accuracy: Math.floor(Math.random() * 15 + 85),
        timeSpent: Math.floor(Math.random() * 100 + 50),
        improvements: ['Consistent practice', 'Good retention', 'Steady progress']
      },
      {
        level: 'Intermediate',
        accuracy: Math.floor(Math.random() * 20 + 70),
        timeSpent: Math.floor(Math.random() * 150 + 75),
        improvements: ['Focus on weak areas', 'Increase practice frequency', 'Review previous lessons']
      },
      {
        level: 'Advanced',
        accuracy: Math.floor(Math.random() * 25 + 60),
        timeSpent: Math.floor(Math.random() * 200 + 100),
        improvements: ['Challenge yourself more', 'Practice complex structures', 'Immersion activities']
      }
    ];
  };

  const generateLearningTrends = (): LearningTrend[] => {
    const trends: LearningTrend[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        studyTime: Math.floor(Math.random() * 60 + 10),
        itemsLearned: Math.floor(Math.random() * 15 + 5),
        accuracy: Math.floor(Math.random() * 25 + 70)
      });
    }
    
    return trends;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'kanji': return BookOpen;
      case 'grammar': return Globe;
      case 'vocabulary': return GraduationCap;
      case 'reading': return Eye;
      case 'writing': return Edit3;
      case 'listening': return Headphones;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'kanji': return 'bg-blue-100 text-blue-600';
      case 'grammar': return 'bg-green-100 text-green-600';
      case 'vocabulary': return 'bg-purple-100 text-purple-600';
      case 'reading': return 'bg-orange-100 text-orange-600';
      case 'writing': return 'bg-red-100 text-red-600';
      case 'listening': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return TrendingUp;
    if (score >= 75) return TrendingUp;
    if (score >= 60) return TrendingDown;
    return TrendingDown;
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

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Analytics data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
        <p className="text-gray-600">Detailed insights into your Japanese learning performance</p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="all">All time</option>
        </select>

        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="time">Study Time</option>
          <option value="accuracy">Accuracy</option>
          <option value="progress">Progress Rate</option>
        </select>

        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>

        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Study Time */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">This month</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatTime(analyticsData.totalStudyTime)}</p>
            <p className="text-sm text-gray-600">Total Study Time</p>
          </div>
        </div>

        {/* Average Session */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Per session</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatTime(analyticsData.averageSessionTime)}</p>
            <p className="text-sm text-gray-600">Average Session</p>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">Score</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.consistencyScore}%</p>
            <p className="text-sm text-gray-600">Consistency</p>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Brain className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-600 font-medium">Rate</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.retentionRate}%</p>
            <p className="text-sm text-gray-600">Retention</p>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Strongest vs Weakest Areas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Strongest Area</p>
                  <p className="text-lg font-bold text-green-800">{analyticsData.strongestArea}</p>
                </div>
              </div>
              <div className="text-right">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Needs Improvement</p>
                  <p className="text-lg font-bold text-red-800">{analyticsData.weakestArea}</p>
                </div>
              </div>
              <div className="text-right">
                <Target className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Improvement Rate</p>
                  <p className="text-lg font-bold text-blue-800">+{analyticsData.improvementRate}%</p>
                </div>
              </div>
              <div className="text-right">
                <ArrowUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Learning Trends Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Trends (30 Days)</h3>
          <div className="space-y-4">
            {learningTrends.slice(-7).map((trend, index) => (
              <div key={trend.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500 w-20">
                    Day {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (trend.studyTime / 60) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatTime(trend.studyTime)}</div>
                  <div className="text-xs text-gray-500">{trend.itemsLearned} items • {trend.accuracy}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Detailed breakdown</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((stat) => {
            const IconComponent = getCategoryIcon(stat.category);
            const PerformanceIcon = getPerformanceIcon(stat.averageScore);
            
            return (
              <div key={stat.category} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(stat.category)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stat.category}</p>
                      <p className="text-xs text-gray-500">{stat.sessionsCount} sessions</p>
                    </div>
                  </div>
                  <div className={`${getPerformanceColor(stat.averageScore)}`}>
                    <PerformanceIcon className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time spent:</span>
                    <span className="font-medium">{formatTime(stat.totalTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. score:</span>
                    <span className={`font-medium ${getPerformanceColor(stat.averageScore)}`}>
                      {stat.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium text-green-600">+{stat.progressRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${stat.averageScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Study Time Distribution</h3>
          <div className="space-y-3">
            {timeDistribution.filter(t => t.sessions > 0).slice(0, 6).map((time) => (
              <div key={time.hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500 w-16">
                    {time.hour}:00
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (time.sessions / 5) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{time.sessions} sessions</div>
                  <div className="text-xs text-gray-500">{time.minutes}m avg</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Difficulty Analysis</h3>
          <div className="space-y-4">
            {difficultyAnalysis.map((analysis) => (
              <div key={analysis.level} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{analysis.level}</h4>
                  <div className={`font-medium ${getPerformanceColor(analysis.accuracy)}`}>
                    {analysis.accuracy}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time spent:</span>
                    <span className="font-medium">{formatTime(analysis.timeSpent)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${analysis.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Improvements:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.improvements.map((improvement, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {improvement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;