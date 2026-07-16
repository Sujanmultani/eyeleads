import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft, Loader, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast.error('Password is required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // FIXED: ForgotPassword page exists but has NO backend endpoint - POST /api/auth/reset-password
      await api.post('/api/auth/reset-password', {
        token,
        email: email.toLowerCase().trim(),
        newPassword
      });

      setSuccess(true);
      toast.success('Your password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password failed:', err);
      toast.error(err.response?.data?.message || 'This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-slate-50 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-luxury border border-slate-100 p-8 sm:p-10 text-center space-y-6">
        
        {success ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 shadow-sm">
              <CheckCircle className="h-8 w-8 fill-current" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Password Reset Complete</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Your credentials have been securely updated. Redirecting you to the login screen...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Create New Password</h2>
              <p className="text-xs text-slate-400">Please enter your secure new passcode coordinates below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 focus:border-[#1B3F6E] focus:outline-none rounded-xl px-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 focus:border-[#1B3F6E] focus:outline-none rounded-xl px-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B3F6E] hover:bg-[#2E6DB4] disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-[#1B3F6E] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
