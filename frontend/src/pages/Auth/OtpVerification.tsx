import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, ShieldAlert, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const OtpVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  // Get state info passed from Register or ForgotPassword
  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'signup'; // 'signup' | 'reset'
  const rememberMe = location.state?.rememberMe || false;

  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(119); // 1:59 initial timer
  const [canResend, setCanResend] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Format timer into mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Focus helper
  const handleInputChange = (index: number, value: string) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;

    const newValues = [...otpValues];
    newValues[index] = value.slice(-1); // Take only the last entered char
    setOtpValues(newValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
        inputRefs[index - 1].current?.focus();
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canResend) return;

    setError(null);
    try {
      if (purpose === 'signup') {
        // Log in attempts or re-register attempts can trigger this.
        // We trigger OTP generation by calling resend/register endpoint.
        await axios.post(`${API_BASE}/api/auth/login`, { email, password: 'dummy-resend-trigger' }).catch(err => {
          // If we got the 'not verified' error, it sends a new OTP code.
          if (!err.response?.data?.error?.includes('not verified')) {
            throw err;
          }
        });
      } else {
        await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      }
      setTimer(120);
      setCanResend(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullOtp = otpValues.join('');

    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (purpose === 'signup') {
        await verifyOtp(email, fullOtp, rememberMe);
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Password Reset OTP verification
        const res = await axios.post(`${API_BASE}/api/auth/verify-reset-otp`, { email, otp: fullOtp });
        const { resetToken } = res.data.data;
        setSuccess(true);
        setTimeout(() => {
          navigate('/reset-password', { state: { token: resetToken } });
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If page was loaded directly without email, redirect back
  if (!email) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="bg-card-bg rounded-2xl p-8 max-w-md shadow-xl text-center border border-border-default">
          <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Session</h2>
          <p className="text-text-secondary mb-6">No email was found for OTP verification. Please request a new code.</p>
          <Link to="/login" className="px-6 py-3 bg-primary text-white rounded-full font-bold">Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text-primary flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-4 md:px-8 border-b border-border-default bg-card-bg fixed top-0 w-full z-40">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 duration-200"
            >
              <ArrowLeft className="text-primary w-6 h-6" />
            </button>
            <span className="font-bold text-2xl text-primary">Campus Connect</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center pt-28 pb-12 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl"></div>

        <div className="w-full max-w-2xl">
          <div className="bg-card-bg/85 backdrop-blur-md rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/30">
            
            {/* Success message */}
            {success && (
              <div className="mb-6 flex items-center justify-center gap-3 bg-success/10 text-success px-4 py-3 rounded-xl border border-success/20">
                <Sparkles className="w-5 h-5 animate-spin" />
                <p className="font-semibold text-sm">OTP code verified successfully!</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold border border-danger/20">
                {error}
              </div>
            )}

            {/* Secure Mail Illustration Container */}
            <div className="mb-8 flex justify-center relative">
              <div className="w-36 h-36 md:w-44 md:h-44 bg-primary/5 rounded-full flex items-center justify-center animate-bounce duration-[3000ms]">
                <div className="relative">
                  <MailCheck className="w-20 h-20 text-primary" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Description */}
            <h1 className="text-3xl font-bold text-text-primary mb-2">Check your Inbox! 📩</h1>
            <p className="text-base text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
              We've sent a 6-digit code to <span className="text-primary font-semibold">{email}</span>. Please enter it below.
            </p>

            {/* OTP Input Grid */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center items-center gap-2 md:gap-4 mb-8">
                {otpValues.map((val, idx) => (
                  <React.Fragment key={idx}>
                    <input 
                      ref={inputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      placeholder="•"
                      className="w-12 h-16 md:w-16 md:h-20 text-center text-3xl font-bold text-primary bg-surface-container border-2 border-border-default rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                    />
                    {idx === 2 && <div className="text-border-default font-extrabold text-2xl mx-1">-</div>}
                  </React.Fragment>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-6">
                <button 
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-8 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-text-secondary">
                    Didn't receive it?{' '}
                    <button 
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend}
                      className={`font-semibold hover:underline transition-all ${canResend ? 'text-primary' : 'text-text-disabled cursor-not-allowed'}`}
                    >
                      Resend code
                    </button>
                  </p>
                  {!canResend && (
                    <p className="text-xs text-text-secondary italic">
                      You can resend the code in <span className="font-bold text-primary">{formatTimer(timer)}</span>
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Secure Meta Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-text-secondary text-xs font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-primary" /> Secure Protocol</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Campus Trusted</span>
            </div>
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
