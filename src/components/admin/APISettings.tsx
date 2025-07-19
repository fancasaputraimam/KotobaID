import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, TestTube, Brain, AlertTriangle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';

const APISettings: React.FC = () => {
  const [settings, setSettings] = useState({
    vertexAI: {
      projectId: 'dark-pipe-465302-g3',
      region: 'us-central1',
      model: 'gemini-pro',
      enabled: false,
      serviceAccountKey: '',
      backendEndpoint: '/api/vertexai'
    },
    kanjiAPI: {
      baseUrl: 'https://kanjiapi.dev/v1',
      enabled: true
    },
    audio: {
      provider: 'google-tts',
      enabled: true
    },
    azureOpenAI: {
      backendEndpoint: 'https://jabal-md08zjyh-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview',
      apiKey: '50Ge3WiF7fMmIuPQ6ssLY7HhFxiMhiMpkDuxLfQwCcOn2m5QLcWDJQQJ99BGACHYHv6XJ3w3AAAAACOGuXbA',
      model: 'gpt-4o',
      enabled: true
    }
  });

  const [testResults, setTestResults] = useState<{
    vertexAI: 'idle' | 'testing' | 'success' | 'error';
    kanjiAPI: 'idle' | 'testing' | 'success' | 'error';
    azureOpenAI: 'idle' | 'testing' | 'success' | 'error';
  }>({
    vertexAI: 'idle',
    kanjiAPI: 'idle',
    azureOpenAI: 'idle'
  });

  const [showServiceAccountKey, setShowServiceAccountKey] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('kotobaid-api-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved settings:', (error as Error).message);
      }
    }
  }, []);

  const handleSave = () => {
    // Save settings to localStorage for frontend configuration
    localStorage.setItem('kotobaid-api-settings', JSON.stringify(settings));
    
    // Update API configuration in real-time
    if (typeof window !== 'undefined' && (window as any).apiConfig) {
      (window as any).apiConfig.updateConfig({
        baseURL: settings.vertexAI.backendEndpoint || 'http://localhost:3001'
      });
    }
    
    console.log('Saving settings:', settings);
    alert('Pengaturan berhasil disimpan!');
  };

  const testVertexAI = async () => {
    setTestResults(prev => ({ ...prev, vertexAI: 'testing' }));
    
    try {
      // Test connection to Vertex AI backend  
      const baseURL = settings.vertexAI.backendEndpoint || 'http://localhost:3001';
      const testURL = baseURL.endsWith('/api/vertexai') ? 
        `${baseURL}/test` : 
        `${baseURL}/api/vertexai/test`;
        
      console.log('Testing Vertex AI connection to:', testURL);
      
      const response = await fetch(testURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Vertex AI test response:', data);
        setTestResults(prev => ({ ...prev, vertexAI: 'success' }));
        alert('✅ Koneksi Vertex AI berhasil!\n\nBackend siap digunakan untuk fitur AI.');
      } else {
        const errorData = await response.text();
        console.error('Vertex AI test failed:', response.status, errorData);
        setTestResults(prev => ({ ...prev, vertexAI: 'error' }));
        alert(`❌ Koneksi Vertex AI gagal!\n\nStatus: ${response.status}\nPastikan backend server berjalan.`);
      }
    } catch (error) {
      console.error('Vertex AI test error:', (error as Error).message);
      setTestResults(prev => ({ ...prev, vertexAI: 'error' }));
      alert(`❌ Koneksi Vertex AI gagal!\n\nError: ${(error as Error).message}\n\nPastikan:\n1. Backend server berjalan\n2. URL backend benar\n3. CORS dikonfigurasi dengan benar`);
    }
  };

  const testKanjiAPI = async () => {
    setTestResults(prev => ({ ...prev, kanjiAPI: 'testing' }));
    
    try {
      console.log('Testing KanjiAPI connection to:', settings.kanjiAPI.baseUrl);
      
      const response = await fetch(`${settings.kanjiAPI.baseUrl}/kanji/grade-1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('KanjiAPI test response:', data.length, 'kanji found');
        setTestResults(prev => ({ ...prev, kanjiAPI: 'success' }));
        alert(`✅ Koneksi KanjiAPI berhasil!\n\nDitemukan ${data.length} kanji Grade 1.`);
      } else {
        console.error('KanjiAPI test failed:', response.status);
        setTestResults(prev => ({ ...prev, kanjiAPI: 'error' }));
        alert(`❌ Koneksi KanjiAPI gagal!\n\nStatus: ${response.status}\nPastikan kanjiapi.dev dapat diakses.`);
      }
    } catch (error) {
      console.error('KanjiAPI test error:', (error as Error).message);
      setTestResults(prev => ({ ...prev, kanjiAPI: 'error' }));
      alert(`❌ Koneksi KanjiAPI gagal!\n\nError: ${(error as Error).message}\n\nPastikan koneksi internet stabil.`);
    }
  };

  const testAzureOpenAI = async () => {
    setTestResults(prev => ({ ...prev, azureOpenAI: 'testing' }));
    try {
      const endpoint = settings.azureOpenAI.backendEndpoint;
      const apiKey = settings.azureOpenAI.apiKey;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1
        }),
      });
      if (response.ok) {
        setTestResults(prev => ({ ...prev, azureOpenAI: 'success' }));
        alert('✅ Koneksi Azure OpenAI berhasil!');
      } else {
        setTestResults(prev => ({ ...prev, azureOpenAI: 'error' }));
        alert(`❌ Koneksi Azure OpenAI gagal!\nStatus: ${response.status}\n${await response.text()}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, azureOpenAI: 'error' }));
      alert(`❌ Koneksi Azure OpenAI gagal!\nError: ${(error as Error).message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Disalin ke clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'testing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'testing': return 'Menguji...';
      case 'success': return 'Berhasil';
      case 'error': return 'Gagal';
      default: return 'Belum diuji';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan API</h2>
          <p className="text-gray-600 mt-1">
            Konfigurasi API dan layanan eksternal untuk fitur AI
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Vertex AI Gemini Settings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Google Vertex AI (Gemini)</h3>
                <p className="text-sm text-gray-600">Konfigurasi untuk fitur AI dan terjemahan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getStatusColor(testResults.vertexAI)}`}>
                {getStatusText(testResults.vertexAI)}
              </span>
              <button
                onClick={testVertexAI}
                disabled={testResults.vertexAI === 'testing'}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <TestTube className="h-4 w-4" />
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Status Alert */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Status: Mock Mode</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Saat ini menggunakan respons simulasi. Untuk mengaktifkan AI sesungguhnya, 
                  implementasikan backend API dengan service account Anda.
                </p>
                <button
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                >
                  {showSetupGuide ? 'Sembunyikan' : 'Lihat'} panduan setup →
                </button>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          {showSetupGuide && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Panduan Setup Vertex AI:</h4>
              <div className="space-y-3 text-sm text-blue-700">
                <div>
                  <p className="font-medium">1. Buat Backend API</p>
                  <div className="bg-blue-100 p-2 rounded font-mono text-xs mt-1">
                    cd backend<br/>
                    npm run setup:vertex-ai<br/>
                    npm run dev
                  </div>
                </div>
                <div>
                  <p className="font-medium">2. Service Account Anda</p>
                  <div className="bg-blue-100 p-2 rounded font-mono text-xs">
                    Project: dark-pipe-465302-g3<br/>
                    Email: kotobaid@dark-pipe-465302-g3.iam.gserviceaccount.com
                  </div>
                </div>
                <div>
                  <p className="font-medium">3. Test Koneksi</p>
                  <p>Setelah backend berjalan, klik "Test" untuk memverifikasi koneksi Vertex AI.</p>
                </div>
                <div>
                  <p className="font-medium">4. URL Backend</p>
                  <div className="bg-blue-100 p-2 rounded font-mono text-xs">
                    Development: http://localhost:3001<br/>
                    Production: https://your-backend-domain.com
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href="#" 
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => alert('Buka VERTEX-AI-SETUP-GUIDE.md untuk panduan lengkap setup backend')}
                  >
                    Panduan Setup Backend Lengkap
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.vertexAI.projectId}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    vertexAI: { ...prev.vertexAI, projectId: e.target.value }
                  }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="dark-pipe-465302-g3"
                />
                <button
                  onClick={() => copyToClipboard(settings.vertexAI.projectId)}
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={settings.vertexAI.region}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  vertexAI: { ...prev.vertexAI, region: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="us-central1">us-central1</option>
                <option value="us-east1">us-east1</option>
                <option value="asia-southeast1">asia-southeast1</option>
                <option value="europe-west1">europe-west1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={settings.vertexAI.model}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  vertexAI: { ...prev.vertexAI, model: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-pro-vision">Gemini Pro Vision</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backend API URL
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={settings.vertexAI.backendEndpoint}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    vertexAI: { ...prev.vertexAI, backendEndpoint: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-backend-domain.com"
                />
                <div className="text-xs text-gray-600">
                  <p><strong>Development:</strong> http://localhost:3001</p>
                  <p><strong>Production:</strong> https://your-backend-domain.com</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Status
              </label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  testResults.vertexAI === 'success' ? 'bg-green-500' :
                  testResults.vertexAI === 'error' ? 'bg-red-500' :
                  testResults.vertexAI === 'testing' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-700">
                  {getStatusText(testResults.vertexAI)}
                </span>
              </div>
            </div>
          </div>

          {/* Service Account Key (Optional for reference) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Account Key (Hanya untuk referensi - JANGAN simpan di frontend!)
            </label>
            <div className="relative">
              <textarea
                value={settings.vertexAI.serviceAccountKey}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  vertexAI: { ...prev.vertexAI, serviceAccountKey: e.target.value }
                }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                rows={3}
                placeholder="Paste service account JSON untuk referensi (akan disimpan di backend)"
              />
              <button
                onClick={() => setShowServiceAccountKey(!showServiceAccountKey)}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showServiceAccountKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Kredensial ini harus disimpan di backend server, bukan di frontend!
            </p>
          </div>

          <div className="mt-4 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.vertexAI.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  vertexAI: { ...prev.vertexAI, enabled: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Aktifkan Vertex AI</span>
            </label>
          </div>
        </div>

        {/* Kanji API Settings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kanji API</h3>
                <p className="text-sm text-gray-600">Konfigurasi untuk kanjiapi.dev</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getStatusColor(testResults.kanjiAPI)}`}>
                {getStatusText(testResults.kanjiAPI)}
              </span>
              <button
                onClick={testKanjiAPI}
                disabled={testResults.kanjiAPI === 'testing'}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <TestTube className="h-4 w-4" />
                <span>Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL
              </label>
              <input
                type="url"
                value={settings.kanjiAPI.baseUrl}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  kanjiAPI: { ...prev.kanjiAPI, baseUrl: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://kanjiapi.dev/v1"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.kanjiAPI.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    kanjiAPI: { ...prev.kanjiAPI, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Aktifkan Kanji API</span>
              </label>
            </div>
          </div>
        </div>

        {/* Azure OpenAI Settings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Azure OpenAI</h3>
                <p className="text-sm text-gray-600">Konfigurasi endpoint backend Azure OpenAI untuk dev panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${getStatusColor(testResults.azureOpenAI)}`}>
                {getStatusText(testResults.azureOpenAI)}
              </span>
              <button
                onClick={testAzureOpenAI}
                disabled={testResults.azureOpenAI === 'testing'}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <TestTube className="h-4 w-4" />
                <span>Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint Azure OpenAI
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.azureOpenAI.backendEndpoint}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    azureOpenAI: { ...prev.azureOpenAI, backendEndpoint: e.target.value }
                  }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-resource.openai.azure.com/openai/deployments/..."
                />
                <button
                  onClick={() => copyToClipboard(settings.azureOpenAI.backendEndpoint)}
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                <p><strong>Format:</strong> https://[resource].openai.azure.com/openai/deployments/[model]/chat/completions?api-version=[version]</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key Azure OpenAI
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={settings.azureOpenAI.apiKey}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    azureOpenAI: { ...prev.azureOpenAI, apiKey: e.target.value }
                  }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan API Key Azure OpenAI"
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                    if (input.type === 'password') {
                      input.type = 'text';
                    } else {
                      input.type = 'password';
                    }
                  }}
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Azure OpenAI
              </label>
              <select
                value={settings.azureOpenAI.model}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  azureOpenAI: { ...prev.azureOpenAI, model: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gpt-35-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-32k">GPT-4 32K</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Status
              </label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  testResults.azureOpenAI === 'success' ? 'bg-green-500' :
                  testResults.azureOpenAI === 'error' ? 'bg-red-500' :
                  testResults.azureOpenAI === 'testing' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-700">
                  {getStatusText(testResults.azureOpenAI)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.azureOpenAI.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  azureOpenAI: { ...prev.azureOpenAI, enabled: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Aktifkan Azure OpenAI</span>
            </label>
          </div>

          {/* Dev Panel Configuration Tips */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Tips Konfigurasi Dev Panel:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Endpoint harus dalam format lengkap termasuk deployment dan API version</p>
              <p>• API Key dapat ditemukan di Azure Portal → Cognitive Services → Keys and Endpoint</p>
              <p>• Model harus sesuai dengan deployment di Azure OpenAI Service</p>
              <p>• Gunakan Test button untuk memverifikasi konfigurasi</p>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Audio</h3>
              <p className="text-sm text-gray-600">Konfigurasi untuk layanan audio</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Audio
              </label>
              <select
                value={settings.audio.provider}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  audio: { ...prev.audio, provider: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="google-tts">Google Text-to-Speech</option>
                <option value="azure-tts">Azure Text-to-Speech</option>
                <option value="aws-polly">Amazon Polly</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.audio.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    audio: { ...prev.audio, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Aktifkan Audio</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notes */}
      <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Catatan Keamanan Penting:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
          <div>
            <h4 className="font-medium mb-2">🔒 Service Account Security:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>JANGAN simpan service account key di frontend</li>
              <li>Gunakan environment variables di backend</li>
              <li>Implementasikan proper authentication</li>
              <li>Batasi akses dengan IAM roles</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🛡️ Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Gunakan HTTPS untuk semua API calls</li>
              <li>Implementasikan rate limiting</li>
              <li>Monitor usage dan costs</li>
              <li>Regular security audits</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white border border-red-200 rounded space-y-2">
          <p className="text-sm text-red-800">
            <strong>Status saat ini:</strong> {testResults.vertexAI === 'success' ? 
              'Backend Vertex AI terhubung dan siap digunakan!' : 
              'Aplikasi menggunakan mock responses untuk fitur AI.'
            }
          </p>
          {testResults.vertexAI !== 'success' && (
            <p className="text-sm text-red-800">
              Untuk mengaktifkan Vertex AI sesungguhnya, setup backend server dan test koneksi di atas.
            </p>
          )}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-medium">Backend URL:</span>
            <code className="bg-red-100 px-2 py-1 rounded">
              {settings.vertexAI.backendEndpoint || 'http://localhost:3001'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APISettings;