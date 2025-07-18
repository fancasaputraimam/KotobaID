import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Globe, 
  Volume2, 
  Moon, 
  Sun, 
  Monitor, 
  Eye,
  Zap,
  Target,
  Clock,
  Save,
  RefreshCw,
  User,
  Shield,
  Database
} from 'lucide-react';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en' | 'ja';
  notifications: {
    studyReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
    soundEnabled: boolean;
  };
  study: {
    dailyGoal: number;
    preferredStudyTime: string;
    autoPlay: boolean;
    showFurigana: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  display: {
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animationsEnabled: boolean;
    highContrast: boolean;
  };
  privacy: {
    analytics: boolean;
    personalization: boolean;
    shareProgress: boolean;
  };
}

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'id',
    notifications: {
      studyReminders: true,
      achievementAlerts: true,
      weeklyReports: false,
      soundEnabled: true,
    },
    study: {
      dailyGoal: 30,
      preferredStudyTime: 'evening',
      autoPlay: true,
      showFurigana: true,
      difficulty: 'beginner',
    },
    display: {
      fontSize: 'medium',
      compactMode: false,
      animationsEnabled: true,
      highContrast: false,
    },
    privacy: {
      analytics: true,
      personalization: true,
      shareProgress: false,
    },
  });
  
  const [activeSection, setActiveSection] = useState('appearance');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [currentUser]);

  const loadSettings = async () => {
    try {
      const saved = localStorage.getItem(`settings_${currentUser?.uid}`);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...settings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!currentUser || !hasChanges) return;
    
    setSaving(true);
    try {
      localStorage.setItem(`settings_${currentUser.uid}`, JSON.stringify(settings));
      applySettings(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const applySettings = (newSettings: UserSettings) => {
    // Apply theme
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }

    // Apply font size
    const root = document.documentElement;
    switch (newSettings.display.fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
    }

    // Apply animations
    if (!newSettings.display.animationsEnabled) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      theme: 'system',
      language: 'id',
      notifications: {
        studyReminders: true,
        achievementAlerts: true,
        weeklyReports: false,
        soundEnabled: true,
      },
      study: {
        dailyGoal: 30,
        preferredStudyTime: 'evening',
        autoPlay: true,
        showFurigana: true,
        difficulty: 'beginner',
      },
      display: {
        fontSize: 'medium',
        compactMode: false,
        animationsEnabled: true,
        highContrast: false,
      },
      privacy: {
        analytics: true,
        personalization: true,
        shareProgress: false,
      },
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const sections = [
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'study', label: 'Pembelajaran', icon: Target },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'display', label: 'Tampilan', icon: Eye },
    { id: 'privacy', label: 'Privasi', icon: Shield },
  ];

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
              <p className="text-gray-600">Kustomisasi pengalaman belajar Anda</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <button
                onClick={resetSettings}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={saveSettings}
              disabled={!hasChanges || saving}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                hasChanges 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Simpan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateSettings('theme', '', theme)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.theme === theme
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {getThemeIcon(theme)}
                          <span className="font-medium capitalize">
                            {theme === 'system' ? 'Sistem' : theme === 'light' ? 'Terang' : 'Gelap'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bahasa Interface</h3>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings('language', '', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            )}

            {/* Study Settings */}
            {activeSection === 'study' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Harian</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="120"
                      value={settings.study.dailyGoal}
                      onChange={(e) => updateSettings('study', 'dailyGoal', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-medium text-gray-900 min-w-[80px]">
                      {settings.study.dailyGoal} menit
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Waktu Belajar Favorit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { value: 'morning', label: 'Pagi', icon: '🌅' },
                      { value: 'afternoon', label: 'Siang', icon: '☀️' },
                      { value: 'evening', label: 'Sore', icon: '🌆' },
                      { value: 'night', label: 'Malam', icon: '🌙' }
                    ].map((time) => (
                      <button
                        key={time.value}
                        onClick={() => updateSettings('study', 'preferredStudyTime', time.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.study.preferredStudyTime === time.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{time.icon}</div>
                          <div className="font-medium">{time.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Kesulitan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'beginner', label: 'Pemula', color: 'green' },
                      { value: 'intermediate', label: 'Menengah', color: 'yellow' },
                      { value: 'advanced', label: 'Mahir', color: 'red' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => updateSettings('study', 'difficulty', level.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.study.difficulty === level.value
                            ? `border-${level.color}-500 bg-${level.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center font-medium">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto-play Audio</h4>
                      <p className="text-sm text-gray-600">Putar audio secara otomatis saat belajar</p>
                    </div>
                    <button
                      onClick={() => updateSettings('study', 'autoPlay', !settings.study.autoPlay)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.study.autoPlay ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.study.autoPlay ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Tampilkan Furigana</h4>
                      <p className="text-sm text-gray-600">Tampilkan bacaan kanji secara default</p>
                    </div>
                    <button
                      onClick={() => updateSettings('study', 'showFurigana', !settings.study.showFurigana)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.study.showFurigana ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.study.showFurigana ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'studyReminders', label: 'Pengingat Belajar', desc: 'Ingatkan saya untuk belajar setiap hari' },
                    { key: 'achievementAlerts', label: 'Notifikasi Pencapaian', desc: 'Beritahu saya ketika mencapai target' },
                    { key: 'weeklyReports', label: 'Laporan Mingguan', desc: 'Kirim ringkasan progress mingguan' },
                    { key: 'soundEnabled', label: 'Suara Notifikasi', desc: 'Aktifkan suara untuk notifikasi' }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.label}</h4>
                        <p className="text-sm text-gray-600">{notification.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSettings('notifications', notification.key, !settings.notifications[notification.key as keyof typeof settings.notifications])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications[notification.key as keyof typeof settings.notifications] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications[notification.key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeSection === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ukuran Font</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'small', label: 'Kecil' },
                      { value: 'medium', label: 'Sedang' },
                      { value: 'large', label: 'Besar' }
                    ].map((size) => (
                      <button
                        key={size.value}
                        onClick={() => updateSettings('display', 'fontSize', size.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.display.fontSize === size.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center font-medium">{size.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'compactMode', label: 'Mode Kompak', desc: 'Tampilkan lebih banyak konten dalam ruang yang lebih kecil' },
                    { key: 'animationsEnabled', label: 'Animasi', desc: 'Aktifkan animasi dan transisi' },
                    { key: 'highContrast', label: 'Kontras Tinggi', desc: 'Tingkatkan kontras untuk aksesibilitas' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{setting.label}</h4>
                        <p className="text-sm text-gray-600">{setting.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSettings('display', setting.key, !settings.display[setting.key as keyof typeof settings.display])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.display[setting.key as keyof typeof settings.display] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.display[setting.key as keyof typeof settings.display] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'analytics', label: 'Analisis Penggunaan', desc: 'Izinkan pengumpulan data untuk meningkatkan layanan' },
                    { key: 'personalization', label: 'Personalisasi', desc: 'Gunakan data saya untuk rekomendasi yang lebih baik' },
                    { key: 'shareProgress', label: 'Bagikan Progress', desc: 'Tampilkan progress saya di leaderboard' }
                  ].map((privacy) => (
                    <div key={privacy.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{privacy.label}</h4>
                        <p className="text-sm text-gray-600">{privacy.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSettings('privacy', privacy.key, !settings.privacy[privacy.key as keyof typeof settings.privacy])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy[privacy.key as keyof typeof settings.privacy] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.privacy[privacy.key as keyof typeof settings.privacy] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Privasi Data</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Data Anda disimpan secara lokal dan hanya digunakan untuk meningkatkan pengalaman belajar. 
                        Kami tidak membagikan informasi pribadi dengan pihak ketiga.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;