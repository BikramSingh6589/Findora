import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckCircle2, ArrowRight as ArrowRightIcon, FileText, Medal, Radar as RadarIcon, Mail as MailIcon, LayoutGrid, Sparkles, BrainCircuit, BellRing } from 'lucide-react';

export const ReportLostSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center mb-12">
        <div className="mb-8">
          <div className="inline-flex items-center px-6 py-2 bg-success/10 text-success rounded-full font-bold text-sm mb-6 border border-success/20">
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Request Logged
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Lost Report Successfully Logged!
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mt-4">
            Great job, detective! We've added your item to our database and our campus-wide search network is officially on the case.
          </p>
        </div>

        {/* Playful Searcher Illustration */}
        <div className="w-full max-w-xl mx-auto mt-8 relative group">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-125 -z-10 transition-transform group-hover:scale-150 duration-700"></div>
          <img 
            className="w-full h-auto drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLv2X8SV2AnEMlKyNDJBdVm2Z-EJbvRjdUQ6HO1hQCp2Es9wWTo9to4YiMfG-js9QA4sl0U8nSQInuMxvMv8smg8aIZ0Z2KjHHIq8TA8WzKgyC-kDLcGcwhMK8hwpwUZ85oI2tSPQXzzz5og034zl5rqovVZJ4qCt0Thvi0uSCSKuAoVOrcvk9oUccn8KysDZXXktPi6U3cpYdtekLwa3RiNe2r8uq9c4JnEkRmDwYE8QsJe8bSzb_5lxcw"
            alt="Searcher Illustration"
          />
        </div>
      </div>

      {/* What Happens Next Section */}
      <section className="w-full text-left mt-8">
        <h2 className="text-2xl font-bold text-text-primary mb-8 flex items-center">
          <Sparkles className="text-primary mr-4 w-8 h-8" />
          What Happens Next?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default hover:scale-[1.03] transition-transform duration-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-primary group-hover:opacity-10 transition-opacity">
              <BrainCircuit className="w-16 h-16" />
            </div>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-8">
              <RadarIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-text-primary mb-2">Scanning for Matches</h3>
            <p className="text-text-secondary text-sm">
              Our AI is currently cross-referencing your report against thousands of "Found" items across campus in real-time.
            </p>
            <div className="mt-8 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary/40 w-1/2 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default hover:scale-[1.03] transition-transform duration-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-secondary group-hover:opacity-10 transition-opacity">
              <BellRing className="w-16 h-16" />
            </div>
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-8">
              <MailIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-text-primary mb-2">Get Notified</h3>
            <p className="text-text-secondary text-sm">
              If a potential match pops up, you'll get an instant push notification and email with the item's location.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="text-xs font-bold text-success">Alerts are active</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default hover:scale-[1.03] transition-transform duration-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-warning group-hover:opacity-10 transition-opacity">
              <LayoutGrid className="w-16 h-16" />
            </div>
            <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center mb-8">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-text-primary mb-2">Check Your Matches</h3>
            <p className="text-text-secondary text-sm">
              Visit your dashboard anytime to review matches. You can chat with finders once a match is confirmed.
            </p>
            <div className="mt-8 flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary/20"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary/20"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-warning/20 flex items-center justify-center text-[10px] font-bold text-warning-dark">+12</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center w-full max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex-1 bg-gradient-to-r from-primary to-[#6b38d4] text-white py-4 px-8 rounded-full font-bold shadow-lg hover:scale-[1.03] transition-transform active:scale-95 duration-200 flex items-center justify-center gap-4"
        >
          Return to Dashboard
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="flex-1 bg-surface-container-lowest dark:bg-surface-container border-2 border-primary text-primary py-4 px-8 rounded-full font-bold hover:bg-primary/5 hover:scale-[1.03] transition-transform active:scale-95 duration-200 flex items-center justify-center gap-4"
        >
          View My Reports
          <FileText className="w-5 h-5" />
        </button>
      </div>

      {/* Gamification Bonus */}
      <div className="mt-12 bg-[#fff7ed] border border-[#ffedd5] p-6 rounded-2xl w-full max-w-xl mx-auto flex items-center gap-6">
        <div className="w-16 h-16 bg-surface-container-lowest dark:bg-surface-container rounded-full flex items-center justify-center shadow-sm shrink-0">
          <Medal className="text-warning w-8 h-8" />
        </div>
        <div className="text-left">
          <h4 className="font-bold text-warning-dark">Quick Finder XP!</h4>
          <p className="text-text-secondary text-xs mt-1">You've earned <span className="font-bold text-warning-dark">+50 XP</span> for completing this report with high-quality details. Keep it up, Level 12!</p>
        </div>
      </div>
    </div>
  );
};
