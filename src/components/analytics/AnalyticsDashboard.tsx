import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LearningAnalytics } from '../../types/analytics';
import { AnalyticsService } from '../../services/analyticsService';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Brain,
  BarChart3,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Star,
  BookOpen,
  Headphones,
  Edit3,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalyticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'time' | 'activities'>('accuracy');

  useEffect(() => {
    loadAnalytics();
  }, [currentUser]);

  const loadAnalytics = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const analyticsData = await AnalyticsService.generateLearningAnalytics(currentUser.uid);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Analytics Tidak Tersedia</h3>
          <p className="text-gray-600">Mulai belajar untuk melihat analytics Anda!</p>
        </div>
      </div>
    );
  }

  const { overview, skillBreakdown, timeAnalytics, performanceMetrics, recommendations, streakAnalytics, weaknessAnalysis } = analytics;

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'kanji': return <BookOpen className="h-5 w-5" />;
      case 'listening': return <Headphones className="h-5 w-5" />;
      case 'writing': return <Edit3 className="h-5 w-5" />;
      case 'reading': return <FileText className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600 bg-green-100';
    if (accuracy >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressColor = (progress: number) => {
    if (progress > 0) return 'text-green-600';
    if (progress < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Periode:</span>
              {(['week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedTimeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range === 'week' ? 'Minggu' : range === 'month' ? 'Bulan' : 'Semua'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Waktu Belajar</p>
                <p className="text-2xl font-bold">{overview.totalStudyTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Akurasi Rata-rata</p>
                <p className="text-2xl font-bold">{overview.overallAccuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Streak Saat Ini</p>
                <p className="text-2xl font-bold">{overview.currentStreak}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Level</p>
                <p className="text-2xl font-bold">{overview.level}</p>
              </div>
              <Award className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Kemampuan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(skillBreakdown).map(([skill, metrics]) => (
            <div key={skill} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getSkillIcon(skill)}
                  <span className="font-medium text-gray-900 capitalize">{skill}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(metrics.averageAccuracy)}`}>
                  {metrics.averageAccuracy}%
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dipraktikkan:</span>
                  <span className="font-medium">{metrics.totalPracticed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dikuasai:</span>
                  <span className="font-medium">{metrics.mastered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waktu:</span>
                  <span className="font-medium">{metrics.timeSpent}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className={`font-medium flex items-center ${getProgressColor(metrics.recentProgress)}`}>
                    {metrics.recentProgress > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : 
                     metrics.recentProgress < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : null}
                    {Math.abs(metrics.recentProgress)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Area Kuat:</div>
                  <div className="flex flex-wrap gap-1">
                    {metrics.strongestAreas.slice(0, 2).map((area, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Perlu Diperbaiki:</div>
                  <div className="flex flex-wrap gap-1">
                    {metrics.weakestAreas.slice(0, 2).map((area, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Target: {metrics.nextMilestone.target}</span>
                  <span>{metrics.nextMilestone.current}/{metrics.nextMilestone.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.nextMilestone.current / metrics.nextMilestone.target) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Waktu</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rata-rata Harian:</span>
              <span className="font-semibold">{timeAnalytics.dailyAverage} menit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Minggu Ini:</span>
              <span className="font-semibold">{timeAnalytics.weeklyTotal} menit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bulan Ini:</span>
              <span className="font-semibold">{timeAnalytics.monthlyTotal} menit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hari Terbaik:</span>
              <span className="font-semibold">{timeAnalytics.bestDay.minutes}m ({new Date(timeAnalytics.bestDay.date).toLocaleDateString()})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Efisiensi:</span>
              <span className="font-semibold">{timeAnalytics.efficiency} aktivitas/menit</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Waktu Belajar per Skill</h4>
            <div className="space-y-2">
              {Object.entries(timeAnalytics.studyTimeBySkill).slice(0, 5).map(([skill, time]) => (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSkillIcon(skill)}
                    <span className="text-sm capitalize">{skill}</span>
                  </div>
                  <span className="text-sm font-medium">{Math.round(time)}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights Performa</h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Konsistensi</span>
              </div>
              <div className="text-sm text-blue-700">
                Skor konsistensi: {performanceMetrics.consistencyScore}%
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Kecepatan Belajar</span>
              </div>
              <div className="text-sm text-green-700">
                {performanceMetrics.learningVelocity} item/hari
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Retensi</span>
              </div>
              <div className="text-sm text-purple-700">
                Tingkat retensi: {performanceMetrics.retentionRate}%
              </div>
            </div>
          </div>

          {/* Error Patterns */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Pola Kesalahan</h4>
            <div className="space-y-2">
              {performanceMetrics.errorPatterns.slice(0, 3).map((pattern, idx) => (
                <div key={idx} className="p-2 bg-red-50 rounded border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-red-900 text-sm">{pattern.errorType}</div>
                      <div className="text-red-700 text-xs">{pattern.category}</div>
                    </div>
                    <span className="text-red-600 text-xs font-medium">{pattern.frequency}x</span>
                  </div>
                  <div className="text-red-600 text-xs mt-1">{pattern.suggestedFocus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendasi Personal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className={`p-4 rounded-lg border ${
              rec.priority === 'high' ? 'border-red-200 bg-red-50' :
              rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`p-1 rounded ${
                  rec.priority === 'high' ? 'bg-red-200' :
                  rec.priority === 'medium' ? 'bg-yellow-200' :
                  'bg-blue-200'
                }`}>
                  {rec.priority === 'high' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                   rec.priority === 'medium' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                   <CheckCircle className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${
                    rec.priority === 'high' ? 'text-red-900' :
                    rec.priority === 'medium' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {rec.title}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    rec.priority === 'high' ? 'text-red-700' :
                    rec.priority === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {rec.description}
                  </p>
                  <div className={`text-xs ${
                    rec.priority === 'high' ? 'text-red-600' :
                    rec.priority === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    <div className="font-medium">Action: {rec.action}</div>
                    <div>Target: {rec.expectedImprovement}</div>
                    <div>Waktu: {rec.estimatedTime}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Streak</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white">
            <div className="text-2xl font-bold">{streakAnalytics.current}</div>
            <div className="text-yellow-100 text-sm">Streak Saat Ini</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white">
            <div className="text-2xl font-bold">{streakAnalytics.longest}</div>
            <div className="text-purple-100 text-sm">Streak Terpanjang</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg text-white">
            <div className="text-2xl font-bold">{streakAnalytics.thisWeek}</div>
            <div className="text-green-100 text-sm">Minggu Ini</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg text-white">
            <div className="text-2xl font-bold">{streakAnalytics.averageStreakLength}</div>
            <div className="text-blue-100 text-sm">Rata-rata</div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          streakAnalytics.streakMaintenance.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
          streakAnalytics.streakMaintenance.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {streakAnalytics.streakMaintenance.riskLevel === 'high' ? 
              <AlertTriangle className="h-5 w-5 text-red-600" /> :
              streakAnalytics.streakMaintenance.riskLevel === 'medium' ? 
                <Clock className="h-5 w-5 text-yellow-600" /> :
                <Star className="h-5 w-5 text-green-600" />
            }
            <span className={`font-medium ${
              streakAnalytics.streakMaintenance.riskLevel === 'high' ? 'text-red-900' :
              streakAnalytics.streakMaintenance.riskLevel === 'medium' ? 'text-yellow-900' :
              'text-green-900'
            }`}>
              Status Streak: {
                streakAnalytics.streakMaintenance.riskLevel === 'high' ? 'Risiko Tinggi' :
                streakAnalytics.streakMaintenance.riskLevel === 'medium' ? 'Perlu Perhatian' :
                'Sangat Baik'
              }
            </span>
          </div>
          <p className={`text-sm ${
            streakAnalytics.streakMaintenance.riskLevel === 'high' ? 'text-red-700' :
            streakAnalytics.streakMaintenance.riskLevel === 'medium' ? 'text-yellow-700' :
            'text-green-700'
          }`}>
            {streakAnalytics.streakMaintenance.suggestion}
          </p>
        </div>
      </div>

      {/* Weakness Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Kelemahan & Kekuatan</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Weaknesses */}
          <div>
            <h4 className="font-medium text-red-900 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Area Kritis
            </h4>
            {weaknessAnalysis.criticalWeaknesses.length > 0 ? (
              <div className="space-y-3">
                {weaknessAnalysis.criticalWeaknesses.map((weakness, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-red-900">{weakness.skill}</div>
                        <div className="text-sm text-red-700">{weakness.area}</div>
                      </div>
                      <span className="text-red-600 font-medium">{weakness.accuracy}%</span>
                    </div>
                    <div className="text-xs text-red-600">
                      {weakness.suggestedExercises.slice(0, 2).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada area kritis yang teridentifikasi! 🎉</p>
            )}
          </div>

          {/* Strengths */}
          <div>
            <h4 className="font-medium text-green-900 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Kekuatan
            </h4>
            <div className="space-y-3">
              {weaknessAnalysis.strengthsToLeverage.map((strength, idx) => (
                <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-green-900">{strength.skill}</div>
                      <div className="text-sm text-green-700">{strength.area}</div>
                    </div>
                    <span className="text-green-600 font-medium">{strength.accuracy}%</span>
                  </div>
                  <div className="text-xs text-green-600">{strength.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Focus Recommendations */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Rekomendasi Fokus Belajar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknessAnalysis.focusRecommendations.map((focus, idx) => (
              <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-blue-900">
                    {focus.skill === 'balanced' ? 'Belajar Seimbang' : `Fokus ${focus.skill}`}
                  </div>
                  <span className="text-blue-600 font-medium">{focus.timeAllocation}%</span>
                </div>
                <div className="text-sm text-blue-700 mb-2">
                  Target: {focus.expectedImprovement}
                </div>
                <div className="text-xs text-blue-600">
                  Area: {focus.specificAreas.join(', ')}
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