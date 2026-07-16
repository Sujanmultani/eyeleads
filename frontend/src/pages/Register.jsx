import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Glasses, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';


const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-100', width: 'w-0', textColor: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4', textColor: 'text-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-blue-500', width: 'w-3/4', textColor: 'text-blue-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500', width: 'w-full', textColor: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(password);
  const doPasswordsMatch = confirmPassword ? password === confirmPassword : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // FIXED: Register validation aligned with backend criteria
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }


    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/account');
    } else {
      setError(result.message || 'Registration unsuccessful. Please try again.');
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
        <h2 className="mt-4 text-2xl font-bold text-text-primary">Create your brand new account</h2>
        <p className="mt-2 text-sm text-text-muted">
          Or{' '}
          <Link to="/login" className="font-semibold text-navy-primary hover:text-sky-hover hover:underline">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md pl-10 pr-4 py-2.5 text-sm bg-white text-text-primary"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min. 8 chars, 1 uppercase, 1 digit)"
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md pl-10 pr-10 py-2.5 text-sm bg-white text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              {/* Strength Meter UI */}
              {password && (
                <div className="mt-2 space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-text-muted uppercase tracking-wider">Password Strength:</span>
                    <span className={`uppercase tracking-wider ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Combine uppercase letters, digits, and special symbols for maximum security.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md pl-10 pr-10 py-2.5 text-sm bg-white text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              {/* Password Match Confirmation Alerts */}
              {doPasswordsMatch !== null && (
                <div className="mt-2 text-[11px] font-bold tracking-wide animate-fadeIn">
                  {doPasswordsMatch ? (
                    <span className="text-emerald-600">✓ Passwords match</span>
                  ) : (
                    <span className="text-rose-500">✗ Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
