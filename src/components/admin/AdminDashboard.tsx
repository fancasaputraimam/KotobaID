import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings, 
  Database, 
  BookOpen, 
  Users, 
  Download, 
  Upload,
  LogOut,
  Home
} from 'lucide-react';
import KanjiImport from './KanjiImport';
import VocabularyManager from './VocabularyManager';
import GrammarManager from './GrammarManager';
import UserManager from './UserManager';
import APISettings from './APISettings';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('kanji');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const tabs = [
    { id: 'kanji', label: 'Import Kanji', icon: BookOpen },
    { id: 'vocabulary', label: 'Kosakata', icon: Database },
    { id: 'grammar', label: 'Tata Bahasa', icon: Settings },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'api', label: 'Pengaturan API', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Panel Developer KotobaID</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'kanji' && <KanjiImport />}
          {activeTab === 'vocabulary' && <VocabularyManager />}
          {activeTab === 'grammar' && <GrammarManager />}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'api' && <APISettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;