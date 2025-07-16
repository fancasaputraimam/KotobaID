import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, Database, Trash2, RefreshCw, Info, Play } from 'lucide-react';
import { kanjiAPI } from '../../services/kanjiAPI';
import { firestoreService } from '../../services/firestoreService';
import { Kanji } from '../../types';

interface ImportLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const KanjiImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [databaseStats, setDatabaseStats] = useState<{ [grade: number]: number }>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    grade: number;
  } | null>(null);

  const grades = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const addLog = (message: string, type: ImportLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const loadDatabaseStats = async () => {
    setStatsLoading(true);
    addLog('Memuat statistik database...');
    
    try {
      const stats: { [grade: number]: number } = {};
      for (const grade of grades) {
        const kanji = await firestoreService.getKanjiByGrade(grade);
        stats[grade] = kanji.length;
      }
      setDatabaseStats(stats);
      addLog('Statistik database berhasil dimuat', 'success');
    } catch (error) {
      console.error('Error loading database stats:', error);
      addLog(`Error memuat statistik: ${error}`, 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const clearGradeData = async (grade: number) => {
    const count = databaseStats[grade] || 0;
    if (count === 0) {
      addLog(`Grade ${grade} sudah kosong`, 'warning');
      return;
    }

    if (!confirm(`Hapus ${count} kanji Grade ${grade} dari database?`)) {
      return;
    }

    addLog(`Menghapus ${count} kanji Grade ${grade}...`);
    try {
      await firestoreService.clearKanjiByGrade(grade);
      await loadDatabaseStats();
      addLog(`Berhasil menghapus ${count} kanji Grade ${grade}`, 'success');
    } catch (error) {
      console.error('Error clearing grade data:', error);
      addLog(`Gagal menghapus Grade ${grade}: ${error}`, 'error');
    }
  };

  const importSingleGrade = async (grade: number) => {
    if (loading) return;
    
    setLoading(true);
    setImportProgress({ current: 0, total: 0, grade });
    addLog(`=== MULAI IMPORT GRADE ${grade} ===`);

    try {
      // Step 1: Fetch data from API
      addLog(`Mengambil data kanji Grade ${grade} dari API...`);
      const apiResponse = await kanjiAPI.getKanjiByGrade(grade);
      
      if (!apiResponse || apiResponse.length === 0) {
        addLog(`Tidak ada data kanji untuk Grade ${grade}`, 'warning');
        return;
      }

      addLog(`Berhasil mengambil ${apiResponse.length} kanji dari API`, 'success');
      
      // Check if response is array of strings or array of objects
      const isStringArray = typeof apiResponse[0] === 'string';
      addLog(`Format data: ${isStringArray ? 'Array of strings' : 'Array of objects'}`, 'info');
      
      setImportProgress({ current: 0, total: apiResponse.length, grade });

      // Step 2: Process each kanji
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < apiResponse.length; i++) {
        const rawData = apiResponse[i];
        setImportProgress({ current: i + 1, total: apiResponse.length, grade });

        try {
          let kanjiData: any;
          
          if (isStringArray) {
            // If API returns array of strings, fetch individual kanji details
            const kanjiChar = rawData as string;
            addLog(`Mengambil detail untuk kanji: ${kanjiChar}`, 'info');
            kanjiData = await kanjiAPI.getKanjiDetails(kanjiChar);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            // If API returns array of objects
            kanjiData = rawData;
          }
          
          // Debug log untuk melihat struktur data
          if (i < 3) {
            addLog(`Sample data ${i}: ${JSON.stringify(kanjiData)}`, 'info');
          }

          // Validate data
          if (!kanjiData || !kanjiData.kanji || typeof kanjiData.kanji !== 'string') {
            addLog(`Data tidak valid untuk index ${i}: ${JSON.stringify(kanjiData)}`, 'error');
            errorCount++;
            continue;
          }

          // Prepare kanji object
          const kanji: Omit<Kanji, 'id'> = {
            character: kanjiData.kanji,
            meaning: Array.isArray(kanjiData.meanings) ? kanjiData.meanings.join(', ') : 'No meaning',
            grade: kanjiData.grade || grade,
            strokeCount: kanjiData.stroke_count || 0,
            onyomi: Array.isArray(kanjiData.on_readings) ? kanjiData.on_readings : [],
            kunyomi: Array.isArray(kanjiData.kun_readings) ? kanjiData.kun_readings : [],
            examples: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Validate prepared kanji object
          if (!kanji.character || kanji.character.trim() === '') {
            addLog(`Kanji character kosong untuk index ${i}`, 'error');
            errorCount++;
            continue;
          }

          // Save to Firestore
          await firestoreService.saveKanji(kanji);
          successCount++;
          
          if (i < 5) {
            addLog(`Berhasil simpan: ${kanji.character} (${kanji.meaning})`, 'success');
          }
          
          if (i % 10 === 0) {
            addLog(`Progress: ${i + 1}/${apiResponse.length} (${successCount} berhasil, ${errorCount} error)`);
          }

          // Small delay to avoid overwhelming Firestore
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }

        } catch (error) {
          console.error(`Error processing kanji at index ${i}:`, error);
          addLog(`Error memproses kanji index ${i}: ${error}`, 'error');
          errorCount++;
        }
      }

      // Step 3: Final results
      addLog(`=== SELESAI IMPORT GRADE ${grade} ===`, 'success');
      addLog(`Berhasil: ${successCount}, Error: ${errorCount}`, successCount > 0 ? 'success' : 'warning');
      
      // Refresh stats
      await loadDatabaseStats();

    } catch (error) {
      console.error('Import error:', error);
      addLog(`Error import Grade ${grade}: ${error}`, 'error');
    } finally {
      setLoading(false);
      setImportProgress(null);
    }
  };

  const importAllGrades = async () => {
    if (loading) return;
    
    clearLogs();
    addLog('=== MULAI IMPORT SEMUA GRADE ===');
    
    for (const grade of grades) {
      await importSingleGrade(grade);
      // Small delay between grades
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    addLog('=== SELESAI IMPORT SEMUA GRADE ===', 'success');
  };

  const testConnection = async () => {
    addLog('Testing koneksi ke KanjiAPI...');
    try {
      const testData = await kanjiAPI.getKanjiByGrade(1);
      addLog(`Koneksi berhasil! Ditemukan ${testData.length} kanji Grade 1`, 'success');
    } catch (error) {
      addLog(`Koneksi gagal: ${error}`, 'error');
    }
  };

  const totalKanji = Object.values(databaseStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Import Kanji</h2>
          <p className="text-gray-600 mt-1">
            Import kanji dari kanjiapi.dev ke database Firestore
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={testConnection}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            <span>Test Koneksi</span>
          </button>
          <button
            onClick={importAllGrades}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Import Semua</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Controls & Stats */}
        <div className="space-y-6">
          {/* Database Stats */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Database Stats</h3>
                  <p className="text-sm text-gray-600">Total: {totalKanji} kanji</p>
                </div>
              </div>
              <button
                onClick={loadDatabaseStats}
                disabled={statsLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {grades.map((grade) => (
                <div key={grade} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {statsLoading ? '...' : databaseStats[grade] || 0}
                  </div>
                  <div className="text-sm text-gray-600">Grade {grade}</div>
                  <button
                    onClick={() => clearGradeData(grade)}
                    disabled={loading || !databaseStats[grade]}
                    className="mt-2 w-full text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Import Controls */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import per Grade</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
              <button
                onClick={() => importSingleGrade(selectedGrade)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && importProgress?.grade === selectedGrade ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Import</span>
              </button>
            </div>

            {/* Progress Bar */}
            {importProgress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Grade {importProgress.grade}</span>
                  <span>{importProgress.current}/{importProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p>• Import akan menambahkan kanji baru ke database</p>
              <p>• Duplikat mungkin terjadi jika import diulang</p>
              <p>• Gunakan "Hapus" untuk membersihkan grade tertentu</p>
            </div>
          </div>
        </div>

        {/* Right Column: Logs */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Import Logs</h3>
            <button
              onClick={clearLogs}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Logs akan muncul di sini saat import berjalan...
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className={`flex items-start space-x-2 ${
                    log.type === 'error' ? 'text-red-600' :
                    log.type === 'success' ? 'text-green-600' :
                    log.type === 'warning' ? 'text-yellow-600' :
                    'text-gray-700'
                  }`}>
                    <span className="text-gray-400 text-xs">[{log.timestamp}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Panduan Penggunaan:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Langkah Import:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Klik "Test Koneksi" untuk cek API</li>
                  <li>Pilih grade yang ingin diimpor</li>
                  <li>Klik "Import" atau "Import Semua"</li>
                  <li>Pantau progress di logs</li>
                </ol>
              </div>
              <div>
                <p className="font-medium mb-1">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cek browser console (F12) untuk detail error</li>
                  <li>Pastikan koneksi internet stabil</li>
                  <li>Refresh stats setelah import</li>
                  <li>Hapus grade jika ada masalah data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanjiImport;