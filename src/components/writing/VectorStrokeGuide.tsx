import React, { useState } from 'react';
import { 
  BookOpen, 
  Play, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  X,
  Info,
  Zap,
  PenTool,
  Eye,
  RotateCcw
} from 'lucide-react';

interface VectorStrokeGuideProps {
  onClose: () => void;
}

const VectorStrokeGuide: React.FC<VectorStrokeGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Selamat Datang!",
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-lg">
            Sistem Vector Stroke Writing memungkinkan Anda belajar menulis huruf Jepang dengan urutan goresan yang benar, seperti aplikasi Mazii.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Fitur Utama:</h4>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Validasi urutan goresan real-time
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Auto-snap ke jalur yang benar
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Animasi urutan goresan
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Tiga mode: Hiragana, Katakana, Kanji
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Memilih Mode Latihan",
      icon: <Target className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Pilih mode latihan sesuai dengan huruf yang ingin Anda pelajari:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800">Hiragana</h4>
              <p className="text-sm text-blue-600">Huruf dasar untuk kata-kata Jepang asli</p>
            </div>
            <div className="p-3 border-2 border-green-200 rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-800">Katakana</h4>
              <p className="text-sm text-green-600">Huruf untuk kata serapan dari bahasa asing</p>
            </div>
            <div className="p-3 border-2 border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-semibold text-orange-800">Kanji</h4>
              <p className="text-sm text-orange-600">Huruf Cina dengan arti dan contoh penggunaan</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Menonton Animasi",
      icon: <Eye className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Sebelum menulis, klik tombol <strong>"Animasi"</strong> untuk melihat urutan goresan yang benar.
          </p>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-center mb-2">
              <Play className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Tips Animasi:</span>
            </div>
            <ul className="space-y-1 text-green-700 text-sm">
              <li>• Perhatikan titik hijau (start point)</li>
              <li>• Ikuti arah goresan merah</li>
              <li>• Lihat nomor urutan setiap goresan</li>
              <li>• Perhatikan titik merah (end point)</li>
            </ul>
          </div>
          <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <ArrowRight className="h-4 w-4 text-red-500" />
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600 ml-2">Start → Stroke → End</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Menulis dengan Benar",
      icon: <PenTool className="h-8 w-8 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Sekarang saatnya menulis! Ikuti aturan ini untuk hasil terbaik:
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-blue-800">Mulai dari Titik Hijau</h4>
                <p className="text-sm text-blue-600">Setiap goresan harus dimulai dari titik hijau (start point)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-yellow-800">Ikuti Jalur Abu-abu</h4>
                <p className="text-sm text-yellow-600">Goresan Anda harus mengikuti garis putus-putus abu-abu</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-green-800">Berakhir di Titik Merah</h4>
                <p className="text-sm text-green-600">Selesaikan goresan di titik merah (end point)</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Sistem Validasi",
      icon: <Zap className="h-8 w-8 text-red-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Sistem akan memvalidasi setiap goresan secara real-time:
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border-l-4 border-green-400">
              <div className="flex items-center mb-1">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-semibold text-green-800">Goresan Benar</span>
              </div>
              <p className="text-sm text-green-600">Goresan akan otomatis "snap" ke jalur yang benar dan terlihat rapi</p>
            </div>
            <div className="p-3 bg-red-50 border-l-4 border-red-400">
              <div className="flex items-center mb-1">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-semibold text-red-800">Goresan Salah</span>
              </div>
              <p className="text-sm text-red-600">Sistem akan menampilkan peringatan dan goresan tidak akan muncul</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Pesan Peringatan:</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• "Mulai dari titik yang salah"</li>
              <li>• "Jalur goresan salah"</li>
              <li>• "Arah goresan salah"</li>
              <li>• "Urutan salah, ulangi"</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Tips & Kontrol",
      icon: <Info className="h-8 w-8 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Gunakan kontrol dan tips berikut untuk pengalaman terbaik:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <RotateCcw className="h-4 w-4 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-800">Reset</span>
              </div>
              <p className="text-xs text-gray-600">Hapus semua goresan dan mulai ulang</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="h-4 w-4 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-800">Karakter Baru</span>
              </div>
              <p className="text-xs text-gray-600">Pilih karakter acak untuk latihan</p>
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">💡 Tips Latihan:</h4>
            <ul className="space-y-1 text-sm text-indigo-700">
              <li>• Mulai dengan Hiragana untuk pemula</li>
              <li>• Latih satu karakter berkali-kali</li>
              <li>• Perhatikan progress bar di setiap goresan</li>
              <li>• Gunakan mode Kanji untuk belajar arti</li>
              <li>• Dengarkan pronuncia dengan tombol speaker</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStepData.icon}
              <div>
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-blue-100">
                  Langkah {currentStep + 1} dari {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <span>Mulai Latihan</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VectorStrokeGuide;