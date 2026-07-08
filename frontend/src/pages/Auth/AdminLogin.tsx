import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary-container p-2 rounded-xl mb-4">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">FoundIt AI</h1>
          <p className="font-semibold text-text-secondary mt-1">Campus Admin Portal</p>
        </div>

        {/* Login Card */}
        <section className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-8 border border-border-default shadow-card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h2>
            <p className="text-text-secondary">Please enter your details to access the system.</p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-danger/10 text-danger text-sm font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            {/* Admin ID / Email */}
            <div className="space-y-2">
              <label className="font-semibold text-text-primary block" htmlFor="adminId">Admin ID / Email</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-default bg-surface-container-lowest focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                  id="adminId" 
                  placeholder="admin@university.edu" 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-text-primary block" htmlFor="password">Password</label>
                <a className="font-semibold text-primary hover:underline transition-all" href="#">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-border-default bg-surface-container-lowest focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input className="w-5 h-5 rounded border-border-default text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-sm text-text-secondary cursor-pointer" htmlFor="remember">Remember this device for 30 days</label>
            </div>

            {/* Sign In Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full py-4 flex items-center justify-center gap-2">
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
              {!isSubmitting && <LogIn className="w-5 h-5" />}
            </Button>
            {/* Redirect to User Login */}
            <div className="text-center mt-6">
              <a 
                className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
                href="/login"
                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              >
                Not an admin? Go to User Login
              </a>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-border-default flex items-start gap-2">
            <ShieldCheck className="text-warning w-5 h-5 shrink-0" />
            <p className="text-sm text-text-secondary">
              This is a secure campus resource. All access is logged and monitored in compliance with university IT policies.
            </p>
          </div>
        </section>

        {/* Footer Links */}
        <footer className="mt-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-4">
            <a className="text-sm text-text-secondary hover:text-primary transition-colors" href="#">Help Center</a>
            <span className="w-1 h-1 bg-border-default rounded-full"></span>
            <a className="text-sm text-text-secondary hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <span className="w-1 h-1 bg-border-default rounded-full"></span>
            <a className="text-sm text-text-secondary hover:text-primary transition-colors" href="#">Terms of Service</a>
          </div>
          <p className="text-sm text-text-secondary opacity-60">© 2026 FoundIt AI. Powered by Campus Connect.</p>
        </footer>
      </div>
    </main>
  );
};
