import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PersonalizedRecommendation, 
  StudyPlan, 
  RecommendationService 
} from '../../services/recommendationService';
import { 
  Brain, 
  Target, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Play,
  BookOpen,
  Zap,
  Star,
  ArrowRight,
  Settings,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const AIRecommendations: React.FC = () => {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'recommendations' | 'study-plan'>('recommendations');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [planGoals, setPlanGoals] = useState<string[]>([]);
  const [planTimeCommitment, setPlanTimeCommitment] = useState('30 menit');
  const [planDuration, setPlanDuration] = useState('4 minggu');

  useEffect(() => {
    loadRecommendations();
  }, [currentUser]);

  const loadRecommendations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const recs = await RecommendationService.generatePersonalizedRecommendations(currentUser.uid);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!currentUser || planGoals.length === 0) return;

    try {
      setLoading(true);
      const plan = await RecommendationService.generateStudyPlan(
        currentUser.uid,
        planGoals,
        planTimeCommitment,
        planDuration
      );
      setStudyPlan(plan);
      setSelectedView('study-plan');
      setShowPlanGenerator(false);
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionComplete = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <BookOpen className="h-5 w-5" />;
      case 'study-method': return <Brain className="h-5 w-5" />;
      case 'schedule': return <Calendar className="h-5 w-5" />;
      case 'focus-area': return <Target className="h-5 w-5" />;
      case 'difficulty-adjustment': return <Settings className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const goalOptions = [
    'Menguasai Hiragana & Katakana',
    'Belajar Kanji Dasar',
    'Meningkatkan Vocabulary',
    'Memahami Grammar Dasar',
    'Latihan Listening',
    'Praktik Speaking',
    'Membaca Teks Sederhana',
    'Persiapan JLPT N5',
    'Persiapan JLPT N4',
    'Komunikasi Sehari-hari'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
              <p className="text-gray-600">Rekomendasi personal berdasarkan analisis AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={loadRecommendations}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedView('recommendations')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedView === 'recommendations'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rekomendasi
              </button>
              <button
                onClick={() => setSelectedView('study-plan')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedView === 'study-plan'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rencana Belajar
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedView === 'recommendations' && (
        <>
          {/* Recommendations Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">High Priority</p>
                  <p className="text-2xl font-bold">
                    {recommendations.filter(r => r.priority === 'high').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Medium Priority</p>
                  <p className="text-2xl font-bold">
                    {recommendations.filter(r => r.priority === 'medium').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">AI Confidence</p>
                  <p className="text-2xl font-bold">
                    {Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)}%
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className={`bg-white rounded-xl shadow-sm border p-6 ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getTypeIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPriorityIcon(rec.priority)}
                        <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{rec.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📈 {rec.estimatedBenefit}</span>
                        <span>⏱️ {rec.timeframe}</span>
                        <span>🎯 Confidence: {rec.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Mengapa rekomendasi ini?</h4>
                  <p className="text-sm text-gray-700">{rec.reasoning}</p>
                </div>

                {/* Action Items */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Action Items:</h4>
                  {rec.actionItems.map((action) => (
                    <div key={action.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => toggleActionComplete(action.id)}
                        className={`mt-1 p-1 rounded-full ${
                          completedActions.has(action.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      
                      <div className="flex-1">
                        <div className={`font-medium ${completedActions.has(action.id) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {action.action}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>⏱️ {action.estimatedTime}</span>
                          <span className={`px-2 py-1 rounded ${
                            action.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            action.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {action.difficulty}
                          </span>
                        </div>
                        {action.resources && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Resources: </span>
                            {action.resources.map((resource, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded mr-1">
                                {resource}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personalization Info */}
                <div className="mt-4 p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-purple-700">
                    <Star className="h-4 w-4" />
                    <span>Personalized for: {rec.personalizedFor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Rekomendasi</h3>
              <p className="text-gray-600">AI sedang menganalisis data Anda. Coba lagi setelah beberapa aktivitas belajar.</p>
            </div>
          )}
        </>
      )}

      {selectedView === 'study-plan' && (
        <div className="space-y-6">
          {!studyPlan && !showPlanGenerator && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Buat Rencana Belajar Personal</h3>
              <p className="text-gray-600 mb-6">AI akan membuat rencana belajar yang disesuaikan dengan tujuan dan waktu Anda.</p>
              <button
                onClick={() => setShowPlanGenerator(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
              >
                <Play className="h-5 w-5" />
                <span>Buat Rencana Belajar</span>
              </button>
            </div>
          )}

          {showPlanGenerator && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfigurasi Rencana Belajar</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan Belajar (pilih minimal 2):
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {goalOptions.map((goal) => (
                      <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={planGoals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlanGoals([...planGoals, goal]);
                            } else {
                              setPlanGoals(planGoals.filter(g => g !== goal));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Komitmen Waktu Harian:
                    </label>
                    <select
                      value={planTimeCommitment}
                      onChange={(e) => setPlanTimeCommitment(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="15 menit">15 menit</option>
                      <option value="30 menit">30 menit</option>
                      <option value="45 menit">45 menit</option>
                      <option value="1 jam">1 jam</option>
                      <option value="1.5 jam">1.5 jam</option>
                      <option value="2 jam">2 jam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durasi Program:
                    </label>
                    <select
                      value={planDuration}
                      onChange={(e) => setPlanDuration(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="2 minggu">2 minggu</option>
                      <option value="4 minggu">4 minggu</option>
                      <option value="8 minggu">8 minggu</option>
                      <option value="3 bulan">3 bulan</option>
                      <option value="6 bulan">6 bulan</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={generateStudyPlan}
                    disabled={planGoals.length < 2}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Generate dengan AI</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPlanGenerator(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {studyPlan && (
            <div className="space-y-6">
              {/* Study Plan Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{studyPlan.title}</h3>
                    <p className="text-gray-600 mb-4">{studyPlan.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{studyPlan.dailyCommitment}/hari</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>{studyPlan.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span>{studyPlan.targetSkills.length} tujuan</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPlanGenerator(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>

              {/* Study Plan Phases */}
              {studyPlan.phases.map((phase, phaseIdx) => (
                <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {phaseIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{phase.title}</h4>
                      <p className="text-gray-600">{phase.description}</p>
                    </div>
                  </div>

                  {/* Daily Activities */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-3">Aktivitas Harian:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phase.dailyActivities.map((activity, actIdx) => (
                        <div key={actIdx} className="p-4 bg-gray-50 rounded-lg">
                          <h6 className="font-medium text-gray-900 mb-2">{activity.title}</h6>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>⏱️ {activity.estimatedTime}</span>
                            <div className="flex space-x-1">
                              {activity.skills.map((skill, skillIdx) => (
                                <span key={skillIdx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Target Pencapaian:</h5>
                      <ul className="space-y-2">
                        {phase.milestones.map((milestone, milIdx) => (
                          <li key={milIdx} className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-700">{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Evaluasi:</h5>
                      <ul className="space-y-2">
                        {phase.assessments.map((assessment, assIdx) => (
                          <li key={assIdx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-700">{assessment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {/* Adaptations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Tips Adaptasi
                </h4>
                <ul className="space-y-2">
                  {studyPlan.adaptations.map((adaptation, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <ArrowRight className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{adaptation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;