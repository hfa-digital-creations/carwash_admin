// ============================================
// FILE: src/pages/auth/LoginPage.jsx
// ============================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Orange Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FF6B1A] p-12 flex-col justify-between text-white">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-16">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#FF6B1A]" fill="currentColor">
                <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Scroosh</h1>
          </div>
          
          {/* Illustration and Content */}
          <div className="mb-12">
            {/* Detailed Car Illustration with Wheels */}
            <div className="w-64 h-40 mx-auto mb-8 flex items-center justify-center">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Shadow/ground */}
                <ellipse cx="100" cy="75" rx="85" ry="20" fill="white" opacity="0.2"/>
                
                {/* Car body */}
                <path 
                  d="M 40 60 Q 100 30 160 60 L 160 75 Q 100 110 40 75 Z" 
                  fill="white" 
                  opacity="0.95"
                />
                
                {/* Left wheel */}
                <circle cx="60" cy="78" r="16" fill="white"/>
                <circle cx="60" cy="78" r="9" fill="#FF6B1A"/>
                <circle cx="60" cy="78" r="4" fill="white"/>
                
                {/* Right wheel */}
                <circle cx="140" cy="78" r="16" fill="white"/>
                <circle cx="140" cy="78" r="9" fill="#FF6B1A"/>
                <circle cx="140" cy="78" r="4" fill="white"/>
                
                {/* Wheel details - spokes */}
                <line x1="60" y1="72" x2="60" y2="84" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                <line x1="54" y1="78" x2="66" y2="78" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                <line x1="140" y1="72" x2="140" y2="84" stroke="white" strokeWidth="1.5" opacity="0.8"/>
                <line x1="134" y1="78" x2="146" y2="78" stroke="white" strokeWidth="1.5" opacity="0.8"/>
              </svg>
            </div>
            
            {/* Tagline */}
            <h2 className="text-2xl font-bold mb-6 text-center">
              Professional Car & Bike Washing Services
            </h2>
            
            {/* Testimonial */}
            <p className="text-white text-base leading-relaxed text-center px-4">
              "Scroosh always keeps my vehicles looking brand new. The staff is professional and thorough!"
            </p>
            <p className="mt-4 text-white text-center">— Satisfied Customer</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-[#FF6B1A] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Scroosh</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Enter your credentials to access the admin dashboard
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#FF6B1A] border-gray-300 rounded focus:ring-[#FF6B1A]"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#FF6B1A] hover:text-[#FF8534] font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#FF8534] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              {/* Security Notice */}
              <p className="text-center text-xs text-gray-500 flex items-center justify-center space-x-1 pt-2">
                <span className="inline-block">🔒</span>
                <span>Secure login with 256-bit encryption</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}