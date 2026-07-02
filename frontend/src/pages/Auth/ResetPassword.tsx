import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { usePopup } from '../../contexts/PopupContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showFailure } = usePopup();

  // Try to find the reset token in URL query parameter first, then fallback to router state
  const token = searchParams.get('token') || location.state?.token || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [strength, setStrength] = useState({ score: 0, text: 'Enter Password', color: 'bg-surface-variant' });

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, text: 'Enter Password', color: 'bg-surface-variant' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = 'Weak';
    let color = 'bg-danger';

    if (score === 2) {
      text = 'Fair';
      color = 'bg-warning';
    } else if (score === 3) {
      text = 'Good';
      color = 'bg-[#3b82f6]'; // blue
    } else if (score === 4) {
      text = 'Strong';
      color = 'bg-success';
    }

    setStrength({ score, text, color });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset token session. Please go back and try again.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });

      showSuccess('Success! 🎉', 'Your password has been reset successfully. You can now log in with your new credentials.', () => {
        navigate('/login');
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to reset password. The link might be expired.';
      setError(errMsg);
      showFailure('Oops! Something went wrong 🤷', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If token is missing, show error card
  if (!token) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="bg-card-bg rounded-2xl p-8 max-w-md shadow-xl text-center border border-border-default">
          <ShieldCheck className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Expired Link</h2>
          <p className="text-text-secondary mb-6">No valid reset token was detected. Please request a new password reset link.</p>
          <button onClick={() => navigate('/forgot-password')} className="px-6 py-3 bg-primary text-white rounded-full font-bold">
            Request Reset Link
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text-primary flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 md:px-8 border-b border-border-default bg-card-bg fixed top-0 w-full z-50">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 duration-200"
            >
              <ArrowLeft className="text-primary w-6 h-6" />
            </button>
            <span className="font-bold text-2xl text-primary">Campus Connect</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="max-w-xl w-full relative z-10">
          <div className="bg-card-bg/90 backdrop-blur-md rounded-[24px] p-6 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-surface-variant/50">

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold border border-danger/20">
                {error}
              </div>
            )}

            {/* Shield Icon Decoration */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>

            {/* Headline */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Password 🛡️</h1>
              <p className="text-base text-text-secondary leading-relaxed">
                Make it strong and memorable, Senior Finder!
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary block" htmlFor="new_password">
                  New Password
                </label>
                <div className="relative group rounded-xl border border-border-default bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input 
                    className="w-full bg-transparent border-none rounded-xl py-4 pl-12 pr-12 focus:ring-0 text-base"
                    id="new_password" 
                    placeholder="••••••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-primary block" htmlFor="confirm_password">
                  Confirm Password
                </label>
                <div className="relative group rounded-xl border border-border-default bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input 
                    className="w-full bg-transparent border-none rounded-xl py-4 pl-12 pr-12 focus:ring-0 text-base"
                    id="confirm_password" 
                    placeholder="••••••••••••" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Strength Indicator */}
              <div className="p-4 bg-surface-container rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Password Security</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {strength.text}
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${strength.color}`} 
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="py-6 text-center border-t border-border-default bg-card-bg">
        <p className="text-xs text-text-secondary">
          © 2026 Campus Connect System. Secured by University IT.
        </p>
      </footer>
    </main>
  );
};
