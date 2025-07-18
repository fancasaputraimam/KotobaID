import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ReCaptcha, { ReCaptchaRef } from '../common/ReCaptcha';

interface RegisterFormProps {
  onToggleForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCaptchaRef>(null);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      setError('Silakan verifikasi reCAPTCHA terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      // In a real application, you would send the recaptchaToken to your backend
      // for verification before proceeding with the registration
      console.log('Attempting to register user:', email);
      await register(email, password, 'user');
      console.log('Registration successful');
      
      // Show success message
      setSuccess('Akun berhasil dibuat! Anda akan diarahkan ke dashboard...');
      
      // Auto-redirect after 2 seconds (the AuthContext will handle the login state)
      setTimeout(() => {
        // The user should be automatically logged in by AuthContext
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Gagal membuat akun. Silakan coba lagi.';
      
      // Provide more specific error messages based on Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah. Silakan coba lagi.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Tidak memiliki izin untuk membuat akun. Hubungi administrator.';
      } else if (error.name === 'FirestoreError') {
        errorMessage = error.message; // Use the custom message for Firestore errors
      }
      
      setError(errorMessage);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) {
      setError(''); // Clear error when reCAPTCHA is solved
    }
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
    setError('reCAPTCHA kedaluwarsa. Silakan verifikasi ulang.');
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setError('Terjadi kesalahan pada reCAPTCHA. Silakan coba lagi.');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan email Anda"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan password Anda"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            Konfirmasi Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Konfirmasi password Anda"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* reCAPTCHA */}
        <div>
          <ReCaptcha
            ref={recaptchaRef}
            onVerify={handleRecaptchaChange}
            onExpire={handleRecaptchaExpire}
            onError={handleRecaptchaError}
            size="normal"
            theme="light"
            className="mb-4"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !recaptchaToken}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center font-semibold"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Daftar Sekarang'}
        </button>
        
        <div className="text-center text-xs text-gray-500">
          Dengan mendaftar, Anda setuju dengan{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Syarat & Ketentuan</a>
          {' '}dan{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Kebijakan Privasi</a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;