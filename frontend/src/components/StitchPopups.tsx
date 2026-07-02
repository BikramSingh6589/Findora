import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X, Sparkles, Trophy, RefreshCw, HelpCircle, GraduationCap, Flame } from 'lucide-react';

interface StitchPopupsProps {
  type: 'success' | 'failure' | 'login_success';
  title: string;
  message: string;
  onClose: () => void;
}

export const StitchPopups: React.FC<StitchPopupsProps> = ({ type, title, message, onClose }) => {
  const [xpWidth, setXpWidth] = useState('w-0');

  useEffect(() => {
    if (type === 'success') {
      const timer = setTimeout(() => {
        setXpWidth('w-[75%]');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [type]);

  // Confetti explosion for login success
  const [confetti, setConfetti] = useState<{ id: number; left: string; size: string; color: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    if (type === 'login_success') {
      const colors = ['bg-[#4143d5]', 'bg-[#6b38d4]', 'bg-[#8455ef]', 'bg-[#38BDF8]', 'bg-[#FB923C]'];
      const items = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 8 + 6}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${Math.random() * 0.5}s`,
        duration: `${Math.random() * 1.5 + 2}s`
      }));
      setConfetti(items);
    }
  }, [type]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-card-bg w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl border border-border-default/50 animate-pop-in flex flex-col items-center">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors cursor-pointer z-20 p-1.5 hover:bg-surface rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SUCCESS POPUP LAYOUT */}
        {type === 'success' && (
          <div className="w-full flex flex-col">
            {/* Hero Banner Area */}
            <div className="relative h-48 bg-primary/5 flex flex-col items-center justify-center overflow-hidden border-b border-border-default/20">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
              
              {/* Badge Icon */}
              <div className="relative z-10 w-24 h-24 bg-card-bg rounded-full flex items-center justify-center shadow-xl border border-primary/10">
                <CheckCircle2 className="w-14 h-14 text-success" />
              </div>
            </div>

            {/* Content area */}
            <div className="p-8 text-center flex flex-col items-center">
              <h1 className="text-3xl font-extrabold text-primary mb-2">{title}</h1>
              <p className="text-base text-text-secondary mb-6 px-4">
                {message}
              </p>

              {/* XP Progress Bar Simulation */}
              <div className="w-full bg-surface-container rounded-full h-4 relative overflow-hidden mb-6">
                <div 
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out ${xpWidth}`}
                ></div>
              </div>

              {/* Chips */}
              <div className="flex justify-center gap-3 mb-8">
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-success/10 text-success rounded-full text-xs font-bold border border-success/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </div>
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-bold border border-warning/20">
                  <Trophy className="w-4 h-4" />
                  Campus Hero
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] active:scale-98 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Footer Message */}
            <div className="bg-surface py-4 text-center border-t border-border-default">
              <p className="text-xs text-text-secondary">You are currently ranked #12 in your dormitory league!</p>
            </div>
          </div>
        )}

        {/* 2. FAILURE POPUP LAYOUT */}
        {type === 'failure' && (
          <div className="w-full flex flex-col p-8 items-center">
            {/* Warning Icon Container */}
            <div className="mb-6 relative mt-4">
              <div className="absolute inset-0 bg-danger/10 blur-3xl rounded-full scale-150"></div>
              <div className="relative bg-danger/10 w-24 h-24 rounded-full flex items-center justify-center border border-danger/20">
                <XCircle className="w-14 h-14 text-danger" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">{title}</h2>
              <p className="text-sm text-text-secondary max-w-[340px] mx-auto leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 bg-danger hover:bg-danger/95 active:scale-95 text-white font-bold rounded-full shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 border border-border-default text-text-secondary font-bold rounded-full hover:bg-surface active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Helpful tip */}
            <div className="mt-8 pt-6 border-t border-border-default w-full">
              <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary font-medium">
                <HelpCircle className="w-4 h-4 text-text-secondary" />
                <span>Pro-tip: Check if your campus Wi-Fi login hasn't expired!</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. LOGIN SUCCESS POPUP LAYOUT */}
        {type === 'login_success' && (
          <div className="w-full flex flex-col">
            {/* Confetti container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {confetti.map((c) => (
                <div 
                  key={c.id} 
                  className={`absolute rounded-sm ${c.color} animate-confetti-fall`} 
                  style={{
                    left: c.left,
                    width: c.size,
                    height: c.size,
                    animationDelay: c.delay,
                    animationDuration: c.duration,
                    top: '-10px'
                  }}
                />
              ))}
            </div>

            {/* Illustration Banner */}
            <div className="w-full relative h-64 bg-[#F0F4FF] flex items-center justify-center overflow-hidden border-b border-border-default/20">
              <div className="absolute inset-0 opacity-40">
                <GraduationCap className="absolute top-8 left-12 text-primary/30 w-8 h-8" />
                <Sparkles className="absolute bottom-12 right-12 text-secondary/30 w-10 h-10" />
                <Flame className="absolute top-12 right-20 text-warning/30 w-6 h-6" />
              </div>
              
              <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                <img 
                  className="h-full w-full object-contain"
                  src="/images/login_success_illustration.png" 
                  alt="Student campus gateway illustration"
                />
              </div>
            </div>

            {/* Text content */}
            <div className="p-8 text-center flex flex-col gap-2 items-center">
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">{title}</h1>
              <p className="text-base text-text-secondary max-w-sm">
                {message}
              </p>
            </div>

            {/* Action buttons */}
            <div className="w-full px-8 pb-8 flex flex-col gap-3">
              <button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] active:scale-98 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary/25 cursor-pointer"
              >
                Go to Home
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2.5 text-text-secondary hover:text-primary font-bold transition-colors active:scale-95 cursor-pointer"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Global CSS declarations for animations inside Popup component */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-confetti-fall {
          animation: confettiFall 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
      `}</style>
    </div>
  );
};
