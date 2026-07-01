import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, AtSign, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

export const Register: React.FC = () => {
  const { register, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Frontend validations
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        studentId,
        password,
        confirmPassword
      });
      
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-surface relative">
      {/* Premium Alert/Toast Popup */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce border border-white/20">
          <Sparkles className="w-6 h-6 animate-spin" />
          <div>
            <p className="font-bold text-sm">Account Created Successfully! 🎉</p>
            <p className="text-xs text-white/80">Welcome to the Campus Lost & Found community.</p>
          </div>
        </div>
      )}

      {/* Left Side: Illustration Area */}
      <section className="hidden md:flex relative md:w-1/2 bg-gradient-to-br from-[#5B5FEF] to-[#8B5CF6] overflow-hidden flex-col p-12 justify-center">
        <div className="absolute top-12 left-12 flex items-center gap-2">
          <div className="bg-surface-container-lowest dark:bg-surface-container/20 p-2 rounded-xl backdrop-blur-md">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">Lost&Found AI</span>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 max-w-lg text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Your Helpful <br />Senior Student Assistant.
            </h1>
            <p className="text-white/80 text-lg">
              We use advanced AI to match lost items across campus in seconds. Join 15,000+ students reclaiming their peace of mind.
            </p>
          </div>

          <div className="relative mt-8">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80" 
              alt="Students" 
              className="w-80 h-96 object-cover rounded-2xl shadow-2xl border-4 border-white/20 z-10 relative"
            />
            <div className="absolute -bottom-8 -right-16 bg-surface-container-lowest dark:bg-surface-container/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4 z-20 shadow-xl">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-lowest dark:bg-surface-container">
                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">AI Assistant</p>
                <p className="text-white/80 text-sm">"I found your keys!"</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 w-full text-center">
          <p className="text-white/60 text-xs font-semibold tracking-widest">TRUSTED BY 24+ UNIVERSITIES WORLDWIDE</p>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-4 md:p-12 bg-surface-container-lowest dark:bg-surface-container">
        <div className="w-full max-w-[480px] flex flex-col">
          <div className="md:hidden flex justify-center mb-6">
            <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20">
              <Sparkles className="text-white w-8 h-8" />
            </div>
          </div>
          
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Create an account 🎉</h2>
            <p className="text-text-secondary">Never lose your belongings again. Join the community today.</p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-4 rounded-2xl bg-danger/10 text-danger text-sm font-semibold border border-danger/20">
              {localError || error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-text-primary ml-1" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                  id="fullName" 
                  placeholder="e.g. Alex Johnson" 
                  required 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-text-primary ml-1" htmlFor="email">University Email</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                  id="email" 
                  placeholder="e.g. alex.johnson@university.edu" 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-text-secondary ml-1">Must be a valid university domain address</p>
            </div>

            {/* Student ID */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-text-primary ml-1" htmlFor="studentId">Student ID / Registration ID</label>
              <input 
                className="w-full px-4 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                id="studentId" 
                placeholder="e.g. 2026CS4501" 
                required 
                type="text" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-text-primary ml-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    className="w-full px-4 pr-12 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                    id="password" 
                    placeholder="Min 8 characters" 
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

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-text-primary ml-1" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  className="w-full px-4 py-4 bg-surface rounded-2xl border-2 border-transparent focus:border-primary focus:bg-surface-container-lowest dark:bg-surface-container focus:ring-0 transition-all outline-none" 
                  id="confirmPassword" 
                  placeholder="Repeat password" 
                  required 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 flex justify-center items-center gap-2">
              {isSubmitting ? 'Creating Account...' : 'Create My Account'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </Button>

            <p className="text-center text-sm text-text-secondary mt-6 leading-relaxed">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
              <br />
              <span className="mt-2 block">Registering as Admin? <Link to="/admin/login" className="text-primary font-bold hover:underline">Contact IT Support</Link></span>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};
