import React from 'react';
import { Search, PlusSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReportSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      <div className="absolute inset-0 bg-surface -z-10" style={{
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(91, 95, 239, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(107, 56, 212, 0.05) 0px, transparent 50%)'
      }}></div>
      
      <div className="max-w-5xl w-full px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">What happened?</h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Choose the action that best fits your situation. Our AI assistant is ready to help you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Report Lost Item Card */}
          <button 
            onClick={() => navigate('/report/lost')}
            className="group text-left bg-surface-container-lowest dark:bg-surface-container p-8 lg:p-10 rounded-[24px] shadow-sm border border-border-default hover:border-primary/50 hover:-translate-y-2 hover:shadow-md transition-all duration-300 flex flex-col items-start relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300 relative z-10">
              <Search className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">Report Lost Item</h3>
            <p className="text-base text-text-secondary mb-10 leading-relaxed relative z-10">
              Tell our AI what you're looking for, and we'll start searching the campus immediately.
            </p>
            
            <div className="mt-auto flex items-center gap-2 font-semibold text-primary group-hover:gap-4 transition-all duration-300 relative z-10">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Report Found Item Card */}
          <button 
            onClick={() => navigate('/report/found')}
            className="group text-left bg-surface-container-lowest dark:bg-surface-container p-8 lg:p-10 rounded-[24px] shadow-sm border border-border-default hover:border-[#6b38d4]/50 hover:-translate-y-2 hover:shadow-md transition-all duration-300 flex flex-col items-start relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#6b38d4]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="w-16 h-16 bg-[#e9ddff] rounded-2xl flex items-center justify-center text-[#6b38d4] mb-8 group-hover:bg-[#6b38d4] group-hover:text-white transition-colors duration-300 relative z-10">
              <PlusSquare className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">Report Found Item</h3>
            <p className="text-base text-text-secondary mb-10 leading-relaxed relative z-10">
              Help a fellow student get their belongings back and earn reputation points.
            </p>
            
            <div className="mt-auto flex items-center gap-2 font-semibold text-[#6b38d4] group-hover:gap-4 transition-all duration-300 relative z-10">
              <span>Earn XP Points</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Motivational Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Sparkles className="text-primary w-5 h-5 fill-current" />
            <span className="text-sm font-medium text-primary">Over 450 items recovered this week by the community</span>
          </div>
        </div>
      </div>
    </div>
  );
};
