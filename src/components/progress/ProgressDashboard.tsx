import React from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  BookOpen,
  BarChart3,
  Flame
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ProgressDashboard: React.FC = () => {
  const { 
    userProgress, 
    todayProgress, 
    studyStats, 
    moduleProgresses,
    loading 
  } = useProgress();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!userProgress || !studyStats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Data progress tidak tersedia</p>
      </div>
    );
  }

  const todayStudyTime = todayProgress?.studyTime || 0;
  const dailyGoalProgress = (todayStudyTime / userProgress.dailyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Study Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{todayStudyTime} menit</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Streak</p>
              <p className="text-2xl font-bold text-gray-900">{userProgress.currentStreak} hari</p>
            </div>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pelajaran</p>
              <p className="text-2xl font-bold text-gray-900">{studyStats.totalLessons}</p>
            </div>
          </div>
        </div>

        {/* Total Study Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Waktu</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(userProgress.totalStudyTime / 60)}j {userProgress.totalStudyTime % 60}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Target Harian</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Target className="h-4 w-4 mr-1" />
            {userProgress.dailyGoal} menit/hari
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{todayStudyTime} / {userProgress.dailyGoal} menit</span>
            <span className="font-medium text-gray-900">{Math.round(dailyGoalProgress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                dailyGoalProgress >= 100 ? 'bg-green-500' : 
                dailyGoalProgress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(dailyGoalProgress, 100)}%` }}
            />
          </div>
          
          {dailyGoalProgress >= 100 && (
            <p className="text-sm text-green-600 font-medium">🎉 Target harian tercapai!</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Mingguan</h3>
          
          <div className="space-y-3">
            {studyStats.weeklyProgress.map((day, index) => {
              const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][new Date(day.date).getDay()];
              const progress = (day.studyTime / userProgress.dailyGoal) * 100;
              
              return (
                <div key={day.date} className="flex items-center space-x-3">
                  <div className="w-8 text-sm text-gray-600">{dayName}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        progress >= 100 ? 'bg-green-500' : 
                        progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">{day.studyTime}m</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Modul</h3>
          
          {moduleProgresses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada modul yang dimulai</p>
              <p className="text-sm text-gray-400">Mulai belajar untuk melihat progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moduleProgresses.slice(0, 5).map((module) => (
                <div key={module.moduleId}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{module.moduleName}</h4>
                      <p className="text-sm text-gray-500 capitalize">{module.moduleType}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {module.progressPercentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progressPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{module.completedLessons}/{module.totalLessons} pelajaran</span>
                    <span>{module.timeSpent} menit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pencapaian</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studyStats.achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.earned 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className={`text-2xl mb-2 ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-medium ${achievement.earned ? 'text-green-900' : 'text-gray-500'}`}>
                  {achievement.name}
                </h4>
                <p className={`text-sm ${achievement.earned ? 'text-green-700' : 'text-gray-400'}`}>
                  {achievement.description}
                </p>
                {achievement.earned && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      Tercapai
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;