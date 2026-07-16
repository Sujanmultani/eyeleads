import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Glasses, Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';


const Login = () => {
  const { login, verifyOtp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/account';
      navigate(user.role === 'admin' || user.isAdmin ? '/admin' : from, { replace: true });
    }
  }, [user]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedEmail = email ? email.trim().toLowerCase() : '';

    // Call Context login function
    const result = await login(cleanedEmail, password);
    setLoading(false);

    if (result.otpRequired) {
      setOtpStep(true);
      return;
    }

    if (result.success) {
      const from = location.state?.from?.pathname || '/account';
      if (result.user?.role === 'admin' || result.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedEmail = email ? email.trim().toLowerCase() : '';
    const result = await verifyOtp(cleanedEmail, otp);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || 'Invalid or expired code.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-250px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 animate-fadeIn">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center select-none overflow-hidden h-12 w-48 mx-auto">
          <img
            src={logo}
            alt="EyeLeads Logo"
            loading="lazy"
            className="h-10 w-auto object-contain mix-blend-multiply"
          />
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-text-primary">Sign in to your account</h2>
        <p className="mt-2 text-sm text-text-muted">
          Or{' '}
          <Link to="/register" className="font-semibold text-navy-primary hover:text-sky-hover hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-xl sm:px-10">
          {otpStep ? (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-lg">
                  {error}
                </div>
              )}
              <div className="text-center">
                <ShieldCheck className="h-8 w-8 text-navy-primary mx-auto mb-2" />
                <p className="text-sm text-text-muted">
                  We sent a 6-digit code to <strong>{email}</strong>. Enter it below to finish logging in.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2.5 text-center text-lg tracking-[0.5em] font-bold bg-white text-text-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}
                className="w-full text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
              >
                Back to login
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md pl-10 pr-4 py-2.5 text-sm bg-white text-text-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-navy-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md pl-10 pr-10 py-2.5 text-sm bg-white text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
