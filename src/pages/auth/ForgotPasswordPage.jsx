// ============================================
// FILE: src/pages/auth/ForgotPasswordPage.jsx
// ============================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import { apiCall } from '../../utils/apiHelper';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Request OTP → POST /admin/request-password-reset
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiCall('/admin/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP → POST /admin/verify-otp
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiCall('/admin/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password → POST /admin/reset-password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiCall('/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP → POST /admin/resend-otp
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await apiCall('/admin/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      startResendTimer();
      setOtp('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-[#FF6B1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#FF8534] transition-colors text-sm"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FF6B1A] p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center space-x-2 mb-16">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#FF6B1A]" fill="currentColor">
                <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Scroosh</h1>
          </div>

          <div className="mb-12">
            <div className="w-64 h-40 mx-auto mb-8 flex items-center justify-center">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                <ellipse cx="100" cy="75" rx="85" ry="20" fill="white" opacity="0.2"/>
                <path d="M 40 60 Q 100 30 160 60 L 160 75 Q 100 110 40 75 Z" fill="white" opacity="0.95"/>
                <circle cx="60" cy="78" r="16" fill="white"/>
                <circle cx="60" cy="78" r="9" fill="#FF6B1A"/>
                <circle cx="60" cy="78" r="4" fill="white"/>
                <circle cx="140" cy="78" r="16" fill="white"/>
                <circle cx="140" cy="78" r="9" fill="#FF6B1A"/>
                <circle cx="140" cy="78" r="4" fill="white"/>
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-center">
              {step === 1 && "Reset Your Password"}
              {step === 2 && "Verify Your Identity"}
              {step === 3 && "Create New Password"}
            </h2>

            <p className="text-white text-base leading-relaxed text-center px-4">
              {step === 1 && "Don't worry! Just enter your email and we'll send you a verification code."}
              {step === 2 && "We've sent a 4-digit code to your email. Enter it below to continue."}
              {step === 3 && "Choose a strong password to secure your account."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
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

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Step Indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? 'bg-[#FF6B1A] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {s}
                    </div>
                    {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-[#FF6B1A]' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "New Password"}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && "Enter the 4-digit code sent to your email"}
              {step === 3 && "Create a strong password for your account"}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF6B1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#FF8534] transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="0000"
                    maxLength="4"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-2">Code sent to {email}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 4}
                  className="w-full bg-[#FF6B1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#FF8534] transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="w-full flex items-center justify-center text-sm text-[#FF6B1A] hover:text-[#FF8534] font-medium disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF6B1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#FF8534] transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-[#FF6B1A] font-medium mt-5"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}