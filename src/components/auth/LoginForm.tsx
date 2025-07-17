import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ReCaptcha, { ReCaptchaRef } from '../common/ReCaptcha';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCaptchaRef>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      setError('Silakan verifikasi reCAPTCHA terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      // In a real application, you would send the recaptchaToken to your backend
      // for verification before proceeding with the login
      await login(email, password);
    } catch (error: any) {
      setError('Email atau password salah');
      console.error('Login error:', error);
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

        <button
          type="submit"
          disabled={loading || !recaptchaToken}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center font-semibold"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Masuk'}
        </button>
        
        <div className="text-center">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Lupa Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;