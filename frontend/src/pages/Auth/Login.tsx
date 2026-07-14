import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit, Users, AtSign, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { usePopup } from '../../contexts/PopupContext';

export const Login: React.FC = () => {
  const { login, error } = useAuth();
  const { showLoginSuccess, showFailure } = usePopup();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Front-end validations
    if (!email) {
      setLocalError('Please enter your university email');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password, rememberMe);
      
      const username = email.split('@')[0];
      const displayName = username.charAt(0).toUpperCase() + username.slice(1);
      
      showLoginSuccess(displayName, () => {
        navigate('/');
      });
    } catch (err: any) {
      const errMsg = err.message || 'Login failed';
      setLocalError(errMsg);
      if (errMsg.toLowerCase().includes('verify') || errMsg.toLowerCase().includes('otp')) {
        setTimeout(() => {
          navigate('/verify-otp', { state: { email, purpose: 'signup', rememberMe } });
        }, 1500);
      } else {
        showFailure('Oops! Something went wrong 🤷', errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-surface relative">

      {/* Left Side: Brand Panel (Visible on md+) */}
      <section className="hidden md:flex relative md:w-1/2 bg-gradient-to-br from-[#5B5FEF] to-[#8B5CF6] overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-surface-container-lowest dark:bg-surface-container/20 p-2 rounded-xl backdrop-blur-md">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <span className="text-4xl font-bold text-white tracking-tight">Lost&Found AI</span>
          </div>
          
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Welcome Back! <br />
              <span className="text-white/80 font-medium text-4xl">Find what's lost, celebrate what's found.</span>
            </h1>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-surface-container-lowest dark:bg-surface-container/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col gap-2">
                <BrainCircuit className="text-[#c0c1ff] w-8 h-8" />
                <p className="text-white font-bold text-lg">AI Matching</p>
                <p className="text-white/70 text-sm">Our neural network finds your keys in seconds.</p>
              </div>
              <div className="bg-surface-container-lowest dark:bg-surface-container/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col gap-2 translate-y-8">
                <Users className="text-warning w-8 h-8" />
                <p className="text-white font-bold text-lg">Active Community</p>
                <p className="text-white/70 text-sm">Join 5,000+ students helping each other daily.</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-white/60 text-sm">
            <p>© 2026 Campus Connect AI Network</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white">Privacy</span>
              <span className="cursor-pointer hover:text-white">Terms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-4 md:p-12 bg-surface-container-lowest dark:bg-surface-container">
        <div className="w-full max-w-[480px] flex flex-col">
          {/* Mobile Branding */}
          <div className="md:hidden flex flex-col items-center gap-2 mb-8">
            <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-primary">Lost&Found AI</h2>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Sign In</h2>
            <p className="text-text-secondary">Enter your campus credentials to continue.</p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-4 rounded-2xl bg-danger/10 text-danger text-sm font-semibold border border-danger/20">
              {localError || error}
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-text-primary ml-1" htmlFor="email">University Email</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                  id="email" 
                  placeholder="e.g. student@university.edu" 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-semibold text-text-primary" htmlFor="password">Password</label>
                <Link className="text-sm text-primary hover:underline font-semibold" to="/forgot-password">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-12 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                  id="password" 
                  placeholder="Enter your password" 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input 
                className="w-5 h-5 rounded-lg border-border-default text-primary focus:ring-primary" 
                id="remember" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm text-text-secondary select-none" htmlFor="remember">Remember this device for 30 days</label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 flex justify-center items-center gap-2">
              {isSubmitting ? 'Connecting...' : 'Sign In'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </Button>

            <div className="flex justify-center mt-4">
              <Link to="/admin/login" className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Admin Portal Login
              </Link>
            </div>

            <p className="text-center text-text-secondary mt-8">
              New on campus? <Link to="/register" className="text-primary font-bold hover:underline">Create an Account</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};
