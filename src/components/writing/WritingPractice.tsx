import React, { useState } from 'react';
import VectorWritingPractice from './VectorWritingPractice';
import { 
  PenTool, 
  Zap, 
  Target
} from 'lucide-react';

const WritingPractice: React.FC = () => {
  const [practiceType, setPracticeType] = useState<'vector' | 'legacy'>('vector');

  return (
    <div className="space-y-6">
      {/* Practice Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latihan Menulis</h2>
              <p className="text-gray-600">Pilih jenis latihan menulis yang ingin Anda gunakan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setPracticeType('vector')}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              practiceType === 'vector' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Target className="h-8 w-8 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Vector Stroke Matching</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Sistem latihan dengan urutan goresan resmi. Mirip aplikasi Mazii dengan validasi real-time.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Urutan goresan yang benar
              </div>
              <div className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Auto-snap ke jalur yang benar
              </div>
              <div className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Animasi urutan goresan
              </div>
              <div className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Validasi real-time
              </div>
            </div>
          </div>

          <div 
            onClick={() => setPracticeType('legacy')}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              practiceType === 'legacy' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="h-8 w-8 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Latihan Bebas</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Latihan menulis bebas dengan feedback AI dan berbagai fitur tambahan.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Latihan bebas tanpa batasan
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Feedback AI
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Multiple input methods
              </div>
              <div className="flex items-center text-sm text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Asisten AI chat
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Component */}
      {practiceType === 'vector' ? (
        <VectorWritingPractice />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
              <Zap className="h-8 w-8 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Latihan Bebas Akan Segera Hadir
            </h3>
            <p className="text-gray-600 mb-6">
              Fitur latihan bebas sedang dalam pengembangan. Gunakan Vector Stroke Matching untuk pengalaman terbaik.
            </p>
            <button
              onClick={() => setPracticeType('vector')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Gunakan Vector Stroke Matching
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingPractice;