import { azureOpenAI } from './azureOpenAI';
import { AnalyticsService } from './analyticsService';

export interface PersonalizedRecommendation {
  id: string;
  type: 'content' | 'study-method' | 'schedule' | 'focus-area' | 'difficulty-adjustment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  actionItems: ActionItem[];
  estimatedBenefit: string;
  timeframe: string;
  category: string;
  confidence: number; // 0-100
  personalizedFor: string; // user learning style/pattern
}

export interface ActionItem {
  id: string;
  action: string;
  description: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resources?: string[];
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "2 weeks", "1 month"
  dailyCommitment: string; // e.g., "30 minutes"
  phases: StudyPhase[];
  targetSkills: string[];
  adaptations: string[];
}

export interface StudyPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  dailyActivities: DailyActivity[];
  milestones: string[];
  assessments: string[];
}

export interface DailyActivity {
  type: string;
  title: string;
  description: string;
  estimatedTime: string;
  skills: string[];
  resources: string[];
}

export interface LearningStyleProfile {
  primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  secondary?: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  preferredSessionLength: 'short' | 'medium' | 'long'; // 15min, 30min, 60min+
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  motivationStyle: 'competitive' | 'collaborative' | 'self-paced' | 'goal-oriented';
  challengePreference: 'gradual' | 'moderate' | 'intensive';
  feedbackPreference: 'immediate' | 'periodic' | 'summary';
}

export class RecommendationService {
  
  static async generatePersonalizedRecommendations(uid: string): Promise<PersonalizedRecommendation[]> {
    try {
      // Get user analytics data
      const analytics = await AnalyticsService.generateLearningAnalytics(uid);
      
      // Determine learning style profile
      const learningProfile = this.analyzeLearningStyle(analytics);
      
      // Generate AI-powered recommendations
      const aiRecommendations = await this.generateAIRecommendations(analytics, learningProfile);
      
      // Generate rule-based recommendations
      const ruleBasedRecommendations = this.generateRuleBasedRecommendations(analytics, learningProfile);
      
      // Combine and prioritize recommendations
      const allRecommendations = [...aiRecommendations, ...ruleBasedRecommendations];
      
      // Remove duplicates and sort by priority and confidence
      const uniqueRecommendations = this.deduplicateAndPrioritize(allRecommendations);
      
      return uniqueRecommendations.slice(0, 8); // Return top 8 recommendations
      
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  static async generateStudyPlan(
    uid: string, 
    goals: string[], 
    timeCommitment: string,
    duration: string
  ): Promise<StudyPlan> {
    try {
      const analytics = await AnalyticsService.generateLearningAnalytics(uid);
      const learningProfile = this.analyzeLearningStyle(analytics);
      
      const prompt = `
        Create a personalized Japanese study plan based on:
        
        User Goals: ${goals.join(', ')}
        Time Commitment: ${timeCommitment} per day
        Duration: ${duration}
        
        Current Performance:
        - Overall Accuracy: ${analytics.overview.overallAccuracy}%
        - Study Time: ${analytics.overview.totalStudyTime} minutes total
        - Current Streak: ${analytics.overview.currentStreak} days
        - Weak Areas: ${analytics.weaknessAnalysis.criticalWeaknesses.map(w => w.area).join(', ')}
        - Strong Areas: ${analytics.weaknessAnalysis.strengthsToLeverage.map(s => s.area).join(', ')}
        
        Learning Style: ${learningProfile.primary}
        Session Preference: ${learningProfile.preferredSessionLength}
        
        Please create a detailed study plan in JSON format with phases, daily activities, and milestones.
        Focus on addressing weak areas while leveraging strengths.
        Make it practical and achievable for the given time commitment.
      `;

      const aiResponse = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      // Parse AI response and create structured study plan
      const studyPlan = this.parseStudyPlanFromAI(aiResponse, goals, timeCommitment, duration);
      
      return studyPlan;
      
    } catch (error) {
      console.error('Error generating study plan:', error);
      return this.getFallbackStudyPlan(goals, timeCommitment, duration);
    }
  }

  private static analyzeLearningStyle(analytics: any): LearningStyleProfile {
    const { skillBreakdown, timeAnalytics, studyPatterns } = analytics;
    
    // Analyze preferred learning modalities based on performance
    let primary: LearningStyleProfile['primary'] = 'visual';
    
    if (skillBreakdown.listening.averageAccuracy > skillBreakdown.reading.averageAccuracy + 10) {
      primary = 'auditory';
    } else if (skillBreakdown.writing.averageAccuracy > skillBreakdown.reading.averageAccuracy + 10) {
      primary = 'kinesthetic';
    } else if (skillBreakdown.reading.averageAccuracy > skillBreakdown.listening.averageAccuracy + 10) {
      primary = 'reading-writing';
    }

    // Determine session length preference
    let preferredSessionLength: LearningStyleProfile['preferredSessionLength'] = 'medium';
    if (timeAnalytics.averageSessionTime < 20) {
      preferredSessionLength = 'short';
    } else if (timeAnalytics.averageSessionTime > 45) {
      preferredSessionLength = 'long';
    }

    // Determine best time of day
    let bestTimeOfDay: LearningStyleProfile['bestTimeOfDay'] = 'flexible';
    const hourlyStats = timeAnalytics.studyTimeByHour;
    const topHour = Object.entries(hourlyStats).reduce((a, b) => hourlyStats[a[0]] > hourlyStats[b[0]] ? a : b);
    
    if (topHour) {
      const hour = parseInt(topHour[0]);
      if (hour >= 6 && hour < 12) bestTimeOfDay = 'morning';
      else if (hour >= 12 && hour < 18) bestTimeOfDay = 'afternoon';
      else if (hour >= 18 && hour < 24) bestTimeOfDay = 'evening';
    }

    // Analyze motivation style based on streak and consistency
    let motivationStyle: LearningStyleProfile['motivationStyle'] = 'self-paced';
    if (analytics.streakAnalytics.current > 7) {
      motivationStyle = 'goal-oriented';
    }

    return {
      primary,
      preferredSessionLength,
      bestTimeOfDay,
      motivationStyle,
      challengePreference: 'moderate',
      feedbackPreference: 'immediate'
    };
  }

  private static async generateAIRecommendations(
    analytics: any, 
    profile: LearningStyleProfile
  ): Promise<PersonalizedRecommendation[]> {
    const prompt = `
      Analyze this Japanese learner's data and provide personalized recommendations:

      Performance Data:
      - Overall Accuracy: ${analytics.overview.overallAccuracy}%
      - Study Time: ${analytics.overview.totalStudyTime} minutes
      - Current Streak: ${analytics.overview.currentStreak} days
      - Consistency Score: ${analytics.performanceMetrics.consistencyScore}%
      
      Skill Breakdown:
      ${Object.entries(analytics.skillBreakdown).map(([skill, data]: [string, any]) => 
        `- ${skill}: ${data.averageAccuracy}% accuracy, ${data.totalPracticed} practiced, ${data.mastered} mastered`
      ).join('\n')}
      
      Learning Style: ${profile.primary} learner, prefers ${profile.preferredSessionLength} sessions
      
      Weak Areas: ${analytics.weaknessAnalysis.criticalWeaknesses.map((w: any) => w.area).join(', ')}
      
      Provide 4 specific, actionable recommendations in Indonesian language.
      Focus on practical improvements that match their learning style.
      Each recommendation should include reasoning and concrete action items.
    `;

    try {
      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      return this.parseAIRecommendations(response, profile);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  }

  private static generateRuleBasedRecommendations(
    analytics: any, 
    profile: LearningStyleProfile
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const { overview, skillBreakdown, performanceMetrics, streakAnalytics } = analytics;

    // Low accuracy recommendation
    if (overview.overallAccuracy < 70) {
      recommendations.push({
        id: 'improve-accuracy',
        type: 'study-method',
        priority: 'high',
        title: 'Tingkatkan Akurasi dengan Review Targeted',
        description: 'Akurasi Anda saat ini di bawah 70%. Fokus pada review materi yang sudah dipelajari.',
        reasoning: `Dengan akurasi ${overview.overallAccuracy}%, Anda perlu memperkuat pemahaman dasar sebelum mempelajari materi baru.`,
        actionItems: [
          {
            id: 'review-weak',
            action: 'Review materi dengan akurasi rendah',
            description: 'Fokus 70% waktu belajar untuk review, 30% untuk materi baru',
            estimatedTime: '20 menit/hari',
            difficulty: 'medium'
          },
          {
            id: 'practice-basics',
            action: 'Latihan dasar-dasar',
            description: 'Ulangi fundamental yang belum dikuasai',
            estimatedTime: '15 menit/hari',
            difficulty: 'easy'
          }
        ],
        estimatedBenefit: 'Peningkatan akurasi 15-20% dalam 3 minggu',
        timeframe: '3 minggu',
        category: 'Performance',
        confidence: 90,
        personalizedFor: `${profile.primary} learner dengan fokus accuracy`
      });
    }

    // Low consistency recommendation
    if (performanceMetrics.consistencyScore < 75) {
      recommendations.push({
        id: 'improve-consistency',
        type: 'schedule',
        priority: 'high',
        title: 'Bangun Kebiasaan Belajar Konsisten',
        description: 'Skor konsistensi Anda perlu ditingkatkan untuk hasil belajar yang optimal.',
        reasoning: `Dengan skor konsistensi ${performanceMetrics.consistencyScore}%, Anda akan lebih efektif dengan jadwal tetap.`,
        actionItems: [
          {
            id: 'fixed-schedule',
            action: 'Tetapkan waktu belajar yang sama setiap hari',
            description: `Belajar setiap hari pada ${profile.bestTimeOfDay === 'flexible' ? 'waktu yang sama' : profile.bestTimeOfDay}`,
            estimatedTime: '30 menit',
            difficulty: 'medium'
          },
          {
            id: 'reminder-system',
            action: 'Buat sistem pengingat',
            description: 'Gunakan alarm atau notifikasi untuk mengingatkan waktu belajar',
            estimatedTime: '5 menit setup',
            difficulty: 'easy'
          }
        ],
        estimatedBenefit: 'Peningkatan retensi dan progress yang lebih stabil',
        timeframe: '2 minggu',
        category: 'Habit Building',
        confidence: 85,
        personalizedFor: `Learner yang perlu struktur ${profile.bestTimeOfDay}`
      });
    }

    // Weak skill recommendation
    const weakestSkill = Object.entries(skillBreakdown).reduce((weakest, current) => 
      (current[1] as any).averageAccuracy < (weakest[1] as any).averageAccuracy ? current : weakest
    );

    if ((weakestSkill[1] as any).averageAccuracy < 65) {
      const skillName = weakestSkill[0];
      const skillData = weakestSkill[1] as any;

      recommendations.push({
        id: `focus-${skillName}`,
        type: 'focus-area',
        priority: 'medium',
        title: `Fokus Intensif pada ${skillName.charAt(0).toUpperCase() + skillName.slice(1)}`,
        description: `${skillName} adalah area terlemah Anda dengan akurasi ${skillData.averageAccuracy}%.`,
        reasoning: `Menguasai ${skillName} akan meningkatkan performa keseluruhan karena ini fondasi penting.`,
        actionItems: [
          {
            id: `practice-${skillName}`,
            action: `Latihan ${skillName} fokus`,
            description: `Alokasikan 40% waktu belajar untuk ${skillName}`,
            estimatedTime: profile.preferredSessionLength === 'short' ? '10 menit' : '20 menit',
            difficulty: 'medium',
            resources: this.getSkillResources(skillName)
          }
        ],
        estimatedBenefit: `Peningkatan ${skillName} 20-25%`,
        timeframe: '4 minggu',
        category: 'Skill Focus',
        confidence: 88,
        personalizedFor: `${profile.primary} learner focusing on ${skillName}`
      });
    }

    // Streak motivation
    if (streakAnalytics.current < 7 && streakAnalytics.longest > 7) {
      recommendations.push({
        id: 'rebuild-streak',
        type: 'schedule',
        priority: 'medium',
        title: 'Bangun Kembali Momentum Belajar',
        description: 'Anda pernah memiliki streak yang baik. Mari bangun kembali momentum tersebut.',
        reasoning: `Streak terpanjang Anda ${streakAnalytics.longest} hari menunjukkan Anda mampu konsisten.`,
        actionItems: [
          {
            id: 'micro-sessions',
            action: 'Mulai dengan sesi mini',
            description: 'Belajar minimal 10 menit setiap hari untuk membangun momentum',
            estimatedTime: '10 menit',
            difficulty: 'easy'
          },
          {
            id: 'streak-tracking',
            action: 'Track progress harian',
            description: 'Catat kemajuan harian untuk motivasi visual',
            estimatedTime: '2 menit',
            difficulty: 'easy'
          }
        ],
        estimatedBenefit: 'Kembali ke kebiasaan belajar rutin',
        timeframe: '2 minggu',
        category: 'Motivation',
        confidence: 75,
        personalizedFor: 'Learner yang perlu motivasi konsistensi'
      });
    }

    return Promise.resolve(recommendations);
  }

  private static parseAIRecommendations(
    aiResponse: string, 
    profile: LearningStyleProfile
  ): PersonalizedRecommendation[] {
    // Simplified AI response parsing
    // In production, this would be more sophisticated
    const recommendations: PersonalizedRecommendation[] = [];

    // Mock AI-generated recommendations based on response
    if (aiResponse.includes('fokus') || aiResponse.includes('focus')) {
      recommendations.push({
        id: 'ai-focus-rec',
        type: 'content',
        priority: 'high',
        title: 'Rekomendasi AI: Fokus pada Area Prioritas',
        description: 'Berdasarkan analisis AI, Anda perlu fokus pada area tertentu untuk kemajuan optimal.',
        reasoning: 'AI menganalisis pola belajar Anda dan mengidentifikasi area yang akan memberikan ROI tertinggi.',
        actionItems: [
          {
            id: 'ai-practice',
            action: 'Ikuti rencana latihan AI',
            description: 'Latihan yang disesuaikan dengan gaya belajar Anda',
            estimatedTime: '25 menit',
            difficulty: 'medium'
          }
        ],
        estimatedBenefit: 'Kemajuan 30% lebih cepat',
        timeframe: '3 minggu',
        category: 'AI Insight',
        confidence: 92,
        personalizedFor: `AI-optimized for ${profile.primary} learner`
      });
    }

    return recommendations;
  }

  private static parseStudyPlanFromAI(
    aiResponse: string,
    goals: string[],
    timeCommitment: string,
    duration: string
  ): StudyPlan {
    // Simplified study plan generation
    // In production, this would parse actual AI JSON response
    
    return {
      id: 'ai-study-plan',
      title: `Rencana Belajar Personal - ${duration}`,
      description: `Rencana belajar yang disesuaikan untuk mencapai tujuan: ${goals.join(', ')}`,
      duration,
      dailyCommitment: timeCommitment,
      phases: [
        {
          id: 'foundation',
          title: 'Fase Fondasi (Minggu 1-2)',
          description: 'Membangun dasar yang kuat',
          duration: '2 minggu',
          dailyActivities: [
            {
              type: 'review',
              title: 'Review Hiragana/Katakana',
              description: 'Pastikan penguasaan sistem tulisan dasar',
              estimatedTime: '10 menit',
              skills: ['writing', 'reading'],
              resources: ['flashcards', 'writing practice']
            },
            {
              type: 'vocabulary',
              title: 'Kosakata Dasar',
              description: 'Pelajari 5 kata baru setiap hari',
              estimatedTime: '15 menit',
              skills: ['vocabulary'],
              resources: ['SRS flashcards', 'example sentences']
            }
          ],
          milestones: ['Akurasi hiragana/katakana 95%', '50 kata baru dikuasai'],
          assessments: ['Tes tulisan', 'Kuis kosakata']
        },
        {
          id: 'building',
          title: 'Fase Pengembangan (Minggu 3-4)',
          description: 'Mengembangkan kemampuan secara bertahap',
          duration: '2 minggu',
          dailyActivities: [
            {
              type: 'grammar',
              title: 'Pola Kalimat Dasar',
              description: 'Pelajari struktur kalimat fundamental',
              estimatedTime: '15 menit',
              skills: ['grammar'],
              resources: ['grammar guides', 'example sentences']
            },
            {
              type: 'listening',
              title: 'Latihan Mendengar',
              description: 'Dengarkan dialog sederhana',
              estimatedTime: '10 menit',
              skills: ['listening'],
              resources: ['audio materials', 'pronunciation guide']
            }
          ],
          milestones: ['Pemahaman 10 pola grammar', 'Listening accuracy 70%'],
          assessments: ['Grammar quiz', 'Listening test']
        }
      ],
      targetSkills: goals,
      adaptations: [
        'Sesuaikan kecepatan berdasarkan progress',
        'Tambah waktu untuk area yang sulit',
        'Variasikan metode jika perlu'
      ]
    };
  }

  private static getSkillResources(skill: string): string[] {
    const resources: {[key: string]: string[]} = {
      kanji: ['Kanji stroke order app', 'Radicals practice', 'Kanji stories'],
      vocabulary: ['Anki flashcards', 'Context sentences', 'Word association'],
      grammar: ['Grammar workbook', 'Sentence patterns', 'Conjugation practice'],
      listening: ['Podcast beginner', 'Shadowing exercise', 'Audio drills'],
      reading: ['Graded readers', 'News articles', 'Manga with furigana'],
      writing: ['Stroke order practice', 'Composition exercises', 'Handwriting drills']
    };
    
    return resources[skill] || ['General study materials'];
  }

  private static deduplicateAndPrioritize(recommendations: PersonalizedRecommendation[]): PersonalizedRecommendation[] {
    // Remove duplicates based on type and title similarity
    const seen = new Set<string>();
    const unique = recommendations.filter(rec => {
      const key = `${rec.type}-${rec.title.substring(0, 20)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by priority and confidence
    return unique.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.confidence - a.confidence;
    });
  }

  private static getFallbackRecommendations(): PersonalizedRecommendation[] {
    return [
      {
        id: 'fallback-consistency',
        type: 'schedule',
        priority: 'high',
        title: 'Bangun Kebiasaan Belajar Rutin',
        description: 'Konsistensi adalah kunci sukses dalam belajar bahasa Jepang.',
        reasoning: 'Kebiasaan belajar yang konsisten lebih efektif daripada sesi panjang yang sporadis.',
        actionItems: [
          {
            id: 'daily-practice',
            action: 'Belajar 20 menit setiap hari',
            description: 'Tetapkan waktu yang sama setiap hari untuk belajar',
            estimatedTime: '20 menit',
            difficulty: 'easy'
          }
        ],
        estimatedBenefit: 'Peningkatan retensi dan kemajuan yang stabil',
        timeframe: '2 minggu',
        category: 'Foundation',
        confidence: 80,
        personalizedFor: 'General learner'
      }
    ];
  }

  private static getFallbackStudyPlan(goals: string[], timeCommitment: string, duration: string): StudyPlan {
    return {
      id: 'fallback-plan',
      title: `Rencana Belajar Umum - ${duration}`,
      description: 'Rencana belajar yang disesuaikan untuk pemula hingga menengah',
      duration,
      dailyCommitment: timeCommitment,
      phases: [
        {
          id: 'basic',
          title: 'Fase Dasar',
          description: 'Membangun fondasi bahasa Jepang',
          duration: '50% dari waktu total',
          dailyActivities: [
            {
              type: 'writing',
              title: 'Latihan Menulis',
              description: 'Hiragana, Katakana, dan Kanji dasar',
              estimatedTime: '40% dari waktu harian',
              skills: ['writing'],
              resources: ['Stroke order guide', 'Practice sheets']
            },
            {
              type: 'vocabulary',
              title: 'Kosakata',
              description: 'Kata-kata dasar sehari-hari',
              estimatedTime: '30% dari waktu harian',
              skills: ['vocabulary'],
              resources: ['Flashcards', 'Example sentences']
            },
            {
              type: 'grammar',
              title: 'Tata Bahasa',
              description: 'Struktur kalimat dasar',
              estimatedTime: '30% dari waktu harian',
              skills: ['grammar'],
              resources: ['Grammar guide', 'Pattern practice']
            }
          ],
          milestones: ['Menguasai hiragana/katakana', '100 kosakata dasar', '10 pola grammar'],
          assessments: ['Quiz mingguan', 'Writing test']
        }
      ],
      targetSkills: goals,
      adaptations: ['Sesuaikan dengan kemajuan individual']
    };
  }
}