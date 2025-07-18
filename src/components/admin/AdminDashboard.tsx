import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { seedDemoData, checkDemoDataExists } from '../../utils/seedDemoData';
import { 
  Settings, 
  Database, 
  BookOpen, 
  Users, 
  Download, 
  Upload,
  LogOut,
  Home,
  BarChart3,
  TrendingUp,
  Clock,
  Globe,
  FileText,
  Activity,
  Shield,
  Server,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Info,
  HelpCircle,
  Bell,
  Mail,
  Calendar,
  Star,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  ExternalLink,
  Layers,
  Grid,
  List,
  Menu,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Flag,
  Tag,
  Hash,
  AtSign,
  Phone,
  MapPin,
  Camera,
  Image,
  Film,
  Music,
  Headphones,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryLow,
  Power,
  PowerOff,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Tv,
  Radio,
  Gamepad2,
  Joystick,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Webcam,
  Microphone,
  Speaker,
  Router,
  Modem,
  Ethernet,
  Usb,
  Hdmi,
  Bluetooth as BluetoothIcon,
  Nfc,
  Qr,
  Code,
  Terminal,
  Command,
  Github,
  Gitlab,
  Bitbucket,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Opera,
  Internet,
  Cloud,
  CloudDownload,
  CloudUpload,
  CloudOff,
  Folder,
  FolderOpen,
  File,
  FileText as FileTextIcon,
  FilePlus,
  FileMinus,
  FileEdit,
  FileCheck,
  FileX,
  FileSearch,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileBarChart,
  Archive,
  Package,
  Box,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Bus,
  Train,
  Subway,
  Taxi,
  Fuel,
  Navigation,
  Compass,
  Map,
  MapPin as MapPinIcon,
  Route,
  Milestone,
  Signpost,
  Construction,
  Wrench,
  Hammer,
  Screwdriver,
  Drill,
  Saw,
  Ruler,
  Scissors,
  Paperclip,
  Pin,
  Pushpin,
  Magnet,
  Lock,
  Unlock,
  Key,
  Shield as ShieldIcon,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  UserSearch,
  UserCog,
  UserEdit,
  UserDelete,
  UserAdd,
  UserRemove,
  UserBlock,
  UserUnblock,
  UserFollow,
  UserUnfollow,
  UserFriend,
  UserUnfriend,
  UserGroup,
  UserCircle,
  UserSquare,
  UserHeart,
  UserStar,
  UserAward,
  UserTrophy,
  UserMedal,
  UserFlag,
  UserTag,
  UserHash,
  UserAt,
  UserPhone,
  UserMail,
  UserLocation,
  UserCamera,
  UserImage,
  UserVideo,
  UserAudio,
  UserFile,
  UserFolder,
  UserCloud,
  UserCode,
  UserTerminal,
  UserCommand,
  UserGithub,
  UserGitlab,
  UserBitbucket,
  UserChrome,
  UserFirefox,
  UserSafari,
  UserEdge,
  UserOpera,
  UserInternet,
  UserWifi,
  UserBluetooth,
  UserNfc,
  UserQr
} from 'lucide-react';
import KanjiImport from './KanjiImport';
import VocabularyManager from './VocabularyManager';
import GrammarManager from './GrammarManager';
import UserManager from './UserManager';
import APISettings from './APISettings';

interface DashboardStats {
  totalUsers: number;
  totalKanji: number;
  totalVocabulary: number;
  totalGrammar: number;
  activeUsers: number;
  apiUsage: number;
  systemStatus: 'online' | 'offline' | 'maintenance';
  lastUpdated: Date;
}

const AdminDashboard: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalKanji: 0,
    totalVocabulary: 0,
    totalGrammar: 0,
    activeUsers: 0,
    apiUsage: 0,
    systemStatus: 'online',
    lastUpdated: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [seedingData, setSeedingData] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSeedDemoData = async () => {
    if (seedingData) return;
    
    try {
      setSeedingData(true);
      const exists = await checkDemoDataExists();
      
      if (exists) {
        if (confirm('Demo data already exists. Are you sure you want to add more data?')) {
          await seedDemoData();
          alert('Demo data seeded successfully!');
        }
      } else {
        await seedDemoData();
        alert('Demo data seeded successfully!');
      }
    } catch (error) {
      console.error('Error seeding demo data:', error);
      alert('Error seeding demo data: ' + error.message);
    } finally {
      setSeedingData(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardStats({
        totalUsers: 1250,
        totalKanji: 2136,
        totalVocabulary: 8500,
        totalGrammar: 350,
        activeUsers: 45,
        apiUsage: 75,
        systemStatus: 'online',
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'kanji', label: 'Impor Kanji', icon: BookOpen },
    { id: 'vocabulary', label: 'Kelola Kosakata', icon: Database },
    { id: 'grammar', label: 'Kelola Tata Bahasa', icon: FileText },
    { id: 'users', label: 'Kelola Pengguna', icon: Users },
    { id: 'api', label: 'Pengaturan API', icon: Settings },
    { id: 'system', label: 'Sistem', icon: Server }
  ];

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSystemStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Admin</h2>
        <p className="text-gray-600">Selamat datang, {currentUser?.displayName || 'Admin'}! Kelola aplikasi KotobaID dari sini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pengguna</p>
              <p className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Kanji</p>
              <p className="text-2xl font-bold">{dashboardStats.totalKanji.toLocaleString()}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Kosakata</p>
              <p className="text-2xl font-bold">{dashboardStats.totalVocabulary.toLocaleString()}</p>
            </div>
            <Database className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Tata Bahasa</p>
              <p className="text-2xl font-bold">{dashboardStats.totalGrammar.toLocaleString()}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* System Status and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status Sistem</h3>
            <button
              onClick={loadDashboardStats}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getSystemStatusColor(dashboardStats.systemStatus)}`}></div>
                <span className="text-sm font-medium">{getSystemStatusText(dashboardStats.systemStatus)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pengguna Aktif</span>
              <span className="text-sm font-medium">{dashboardStats.activeUsers} online</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Penggunaan API</span>
              <span className="text-sm font-medium">{dashboardStats.apiUsage}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardStats.apiUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Pengguna baru bergabung</p>
                <p className="text-xs text-gray-500">5 menit yang lalu</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Data kanji diperbarui</p>
                <p className="text-xs text-gray-500">1 jam yang lalu</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Database className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Backup database berhasil</p>
                <p className="text-xs text-gray-500">2 jam yang lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tindakan Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('kanji')}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Impor Kanji</span>
          </button>
          
          <button
            onClick={() => setActiveTab('vocabulary')}
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Database className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-green-900">Kelola Kosakata</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Users className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Kelola Pengguna</span>
          </button>
          
          <button
            onClick={() => setActiveTab('api')}
            className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Settings className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Pengaturan API</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Terakhir diperbarui: {dashboardStats.lastUpdated.toLocaleString('id-ID')}
      </div>
    </div>
  );

  const renderSystemManagement = () => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Sistem</h2>
        <p className="text-gray-600">Kelola pengaturan sistem dan pemeliharaan aplikasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="h-4 w-4" />
              <span>Backup Database</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              <span>Restore Database</span>
            </button>
            <button 
              onClick={handleSeedDemoData}
              disabled={seedingData}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seedingData ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{seedingData ? 'Seeding...' : 'Seed Demo Data'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pemeliharaan</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              <RefreshCw className="h-4 w-4" />
              <span>Restart Server</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Mode Pemeliharaan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panel Admin KotobaID</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getSystemStatusColor(dashboardStats.systemStatus)}`}></div>
                  <span>{getSystemStatusText(dashboardStats.systemStatus)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(currentUser?.displayName || currentUser?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">
                  {currentUser?.displayName || currentUser?.email || 'Admin'}
                </span>
              </div>
              
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block border-b border-gray-200 mb-6 sm:mb-8">
          <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-all ${
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'kanji' && <KanjiImport />}
          {activeTab === 'vocabulary' && <VocabularyManager />}
          {activeTab === 'grammar' && <GrammarManager />}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'api' && <APISettings />}
          {activeTab === 'system' && renderSystemManagement()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;