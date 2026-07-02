import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send, Lightbulb, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your university email');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setSuccess(true);
      setTimeout(() => {
        navigate('/verify-otp', { state: { email, purpose: 'reset' } });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-primary flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 md:px-8 border-b border-border-default bg-card-bg">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 duration-200"
            >
              <ArrowLeft className="text-primary w-6 h-6" />
            </button>
            <span className="font-bold text-2xl text-primary">Lost&Found AI</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-xl z-10">
          <div className="bg-card-bg rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 md:p-12 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
            
            {/* Success Toast */}
            {success && (
              <div className="mb-6 flex items-center gap-3 bg-success/10 text-success px-4 py-3 rounded-xl border border-success/20">
                <Sparkles className="w-5 h-5 animate-spin" />
                <p className="font-semibold text-sm">OTP code successfully sent to your email!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold border border-danger/20">
                {error}
              </div>
            )}

            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <img 
                  className="w-full h-full object-contain"
                  src="/images/forgot_password_illustration.png" 
                  alt="Student telescope illustration"
                />
              </div>
            </div>

            {/* Text Header */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                Lost your key? 🔐
              </h1>
              <p className="text-lg text-text-secondary max-w-sm mx-auto">
                Don't worry! Just enter your university email and we'll send a code to get you back in.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant block ml-2" htmlFor="email">
                  University Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-border-default bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-base text-text-primary"
                    id="email" 
                    placeholder="name@university.edu" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting || success}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || success}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] active:scale-98 text-white py-4 px-6 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-text-secondary">
                Remembered it? 
                <Link className="text-primary font-bold hover:underline ml-1" to="/login">Back to Login</Link>
              </p>
            </div>
          </div>

          {/* Contextual Tip */}
          <div className="mt-6 flex items-center gap-3 p-4 bg-info-ai/10 border border-info-ai/20 rounded-xl">
            <Lightbulb className="text-info-ai w-5 h-5 flex-shrink-0" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tip: Use your official student email address to receive the verification code instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="py-6 text-center border-t border-border-default bg-card-bg">
        <p className="text-xs text-text-secondary">
          © 2026 Lost&Found AI Network. Secured by University IT.
        </p>
      </footer>
    </main>
  );
};
