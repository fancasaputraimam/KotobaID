import React, { useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { Target, Save, Clock } from 'lucide-react';

const DailyGoalSetting: React.FC = () => {
  const { userProgress, updateDailyGoal } = useProgress();
  const [newGoal, setNewGoal] = useState(userProgress?.dailyGoal || 30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDailyGoal(newGoal);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error updating daily goal:', error);
    } finally {
      setSaving(false);
    }
  };

  const presetGoals = [15, 30, 45, 60, 90, 120];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Target className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Target Belajar Harian</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target waktu belajar per hari (menit)
          </label>
          
          {/* Preset Options */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            {presetGoals.map((minutes) => (
              <button
                key={minutes}
                onClick={() => setNewGoal(minutes)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  newGoal === minutes
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={newGoal}
                  onChange={(e) => setNewGoal(parseInt(e.target.value) || 30)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan target kustom..."
                />
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving || newGoal === userProgress?.dailyGoal}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                saved
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {saved ? (
                <>
                  <span>✓</span>
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Goal Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Target yang Direkomendasikan</h4>
              <p className="text-sm text-blue-700">
                Untuk pemula: 15-30 menit per hari sudah sangat baik untuk membangun kebiasaan belajar. 
                Anda bisa meningkatkan target secara bertahap seiring waktu.
              </p>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-gray-900">Pemula</div>
                  <div className="text-gray-600">15-30 menit</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-gray-900">Menengah</div>
                  <div className="text-gray-600">30-60 menit</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="font-medium text-gray-900">Lanjutan</div>
                  <div className="text-gray-600">60+ menit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Progress Preview */}
        {userProgress && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Pratinjau dengan Target Baru</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Target harian baru:</span>
                <span className="font-medium">{newGoal} menit</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress hari ini:</span>
                <span>{userProgress.totalStudyTime} menit</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((userProgress.totalStudyTime / newGoal) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {Math.round((userProgress.totalStudyTime / newGoal) * 100)}% tercapai
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyGoalSetting;