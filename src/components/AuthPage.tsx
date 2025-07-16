import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Users, Award, TrendingUp } from 'lucide-react';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center text-white">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <BookOpen className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl font-bold">KotobaID</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8">
            Platform pembelajaran bahasa Jepang terdepan dengan teknologi AI
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-200 mr-4" />
            <div>
              <h3 className="font-semibold text-lg">10,000+ Pengguna Aktif</h3>
              <p className="text-blue-100">Bergabung dengan komunitas pembelajar bahasa Jepang</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Award className="h-8 w-8 text-blue-200 mr-4" />
            <div>
              <h3 className="font-semibold text-lg">Persiapan JLPT Terbaik</h3>
              <p className="text-blue-100">Materi lengkap untuk semua level JLPT</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-200 mr-4" />
            <div>
              <h3 className="font-semibold text-lg">Progress Tracking</h3>
              <p className="text-blue-100">Pantau kemajuan belajar Anda secara real-time</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
          <blockquote className="text-white/90 italic">
            "KotobaID mengubah cara saya belajar bahasa Jepang. Dengan AI yang membantu, saya bisa belajar lebih efektif dan menyenangkan!"
          </blockquote>
          <footer className="mt-4 text-blue-100">
            <strong>- Sari Indah</strong>, Mahasiswa
          </footer>
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">KotobaID</h1>
            </div>
            <p className="text-gray-600">
              Platform pembelajaran bahasa Jepang dengan AI
            </p>
          </div>

          {/* Auth Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'Selamat datang kembali! Masuk untuk melanjutkan pembelajaran' 
                : 'Bergabunglah dengan ribuan pembelajar bahasa Jepang'
              }
            </p>
          </div>

          {/* Auth Forms */}
          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setIsLogin(true)} />
          )}
          
          {/* Additional Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <span className="border-t flex-1 mr-4"></span>
              <span>atau</span>
              <span className="border-t flex-1 ml-4"></span>
            </div>
            
            <div className="text-sm text-gray-600">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;