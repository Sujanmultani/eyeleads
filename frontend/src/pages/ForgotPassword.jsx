import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Direct post check to backend endpoint
      await api.post('/api/auth/forgot-password', { email: email.toLowerCase().trim() });
      setSubmitted(true);
      toast.success('Reset email successfully dispatched!');
    } catch (err) {
      console.error('Forgot password request failed:', err);
      toast.error(err.response?.data?.message || 'Could not send reset email. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-slate-50 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-luxury border border-slate-100 p-8 sm:p-10 text-center space-y-6">
        
        {submitted ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 shadow-sm">
              <CheckCircle className="h-8 w-8 fill-current" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Check Your Inbox</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                If <strong>{email}</strong> is registered on EyeLeads, you will receive an active reset passcode link shortly.
              </p>
            </div>

            <div className="pt-2">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-xs font-black text-[#1B3F6E] hover:text-[#B8952A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight">Recover Password</h2>
              <p className="text-xs text-slate-400">Enter your credentials to receive an email recovery link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Email Coordinates
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border border-slate-200 focus:border-[#1B3F6E] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B3F6E] hover:bg-[#2E6DB4] disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing Reset...</span>
                  </>
                ) : (
                  <span>Send Recovery Email</span>
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

export default ForgotPassword;
