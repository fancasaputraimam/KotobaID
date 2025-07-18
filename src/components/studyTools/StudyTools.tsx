import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Search, 
  MessageSquare, 
  Target, 
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-react';
import Dictionary from './Dictionary';
import SentenceAnalyzer from './SentenceAnalyzer';

const StudyTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'analyzer'>('dictionary');

  const tabs = [
    { 
      id: 'dictionary' as const, 
      label: 'Kamus Jepang', 
      icon: BookOpen,
      description: 'Cari kata, kanji, dan frasa dengan detail lengkap'
    },
    { 
      id: 'analyzer' as const, 
      label: 'Analisis Kalimat', 
      icon: Brain,
      description: 'Analisis mendalam struktur dan tata bahasa kalimat'
    }
  ];

  const stats = [
    {
      label: 'Kata Tersedia',
      value: '5,000+',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Pola Grammar',
      value: '200+',
      icon: Target,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Contoh Kalimat',
      value: '10,000+',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'AI Accuracy',
      value: '95%+',
      icon: Brain,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const features = [
    {
      icon: Search,
      title: 'Pencarian Canggih',
      description: 'Cari berdasarkan kata, reading, atau terjemahan Indonesia',
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Analisis kalimat menggunakan teknologi AI terdepan',
      color: 'text-purple-600'
    },
    {
      icon: Lightbulb,
      title: 'Saran Belajar',
      description: 'Rekomendasi personal untuk meningkatkan kemampuan',
      color: 'text-yellow-600'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Lacak kemajuan dan vocabulary yang sudah dipelajari',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-r ${stat.color} p-4 rounded-lg text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-3 px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs text-gray-500 hidden md:block">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'dictionary' && <Dictionary />}
          {activeTab === 'analyzer' && <SentenceAnalyzer />}
        </div>
    </div>
  );
};

export default StudyTools;