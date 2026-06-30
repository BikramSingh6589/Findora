import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Sparkles, MapPin as MapPinIcon, Medal, ShieldCheck, ArrowRight as ArrowRightIcon } from 'lucide-react';

export const ReportFoundSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full animate-in fade-in zoom-in duration-500 pb-12">
      <div className="space-y-12">
        
        {/* Hero Header Section */}
        <section className="text-center space-y-6 pt-8">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-8 py-2 mb-2 animate-bounce shadow-sm border border-primary/20">
            <Sparkles className="mr-2 w-5 h-5" />
            <span className="font-bold">Success! Item Logged</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">
            You're a Campus Hero!
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Thanks for being an awesome member of our community. Your honesty just made someone's day a lot better.
          </p>
        </section>

        {/* Visual Hero Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg h-[300px] md:h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLtOhExekaDGuOHaDdP5_GjMklfARCuGrQZ-9Pg3cinp_gHdNr29bE3DsuREaYv0aPDejwLWlMXiqbgyOxms7AdY8Fd6W5iiBDEG6QtSHS1lEqdC6pNNK6z3vwC28K9u5YdkBxxWLxJcDyd4lfzgwMTNvS2xSJMYhc0Qupb-at6JqO317jIXI4Z-1Fgol2RrSyieMeihWr-mFQY-uJ3TQtTS2PxMmwLsK7HT3XFpsFOeJlsNY7CasCj37To"
            alt="Hero Illustration"
          />
          <div className="absolute bottom-8 left-8 z-20 text-white">
            <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container/20 backdrop-blur-md px-4 py-1.5 rounded-full">
              <MapPinIcon className="w-5 h-5" />
              <span className="font-bold text-sm">Main Courtyard</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Stats & Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Reputation Points Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[20px] shadow-sm border border-border-default flex flex-col justify-between hover:scale-[1.03] transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <Medal className="text-secondary w-8 h-8" />
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold">+50 Rep</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-primary">Reputation Boost</h3>
              <p className="text-text-secondary text-sm mt-2">Your +50 Reputation Points have been added to your profile.</p>
            </div>
          </div>

          {/* Badge Pending Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[20px] shadow-sm border border-border-default flex flex-col justify-between hover:scale-[1.03] transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck className="text-warning w-8 h-8" />
              <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-xs font-bold">In Review</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-primary">Good Samaritan</h3>
              <p className="text-text-secondary text-sm mt-2">Your Badge is currently pending verification from the campus office.</p>
            </div>
          </div>

          {/* Next Steps Bento Card */}
          <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary to-[#6b38d4] text-white p-6 rounded-[20px] shadow-lg flex flex-col gap-6">
            <h3 className="font-bold text-xl">Next Steps</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="bg-surface-container-lowest dark:bg-surface-container/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-sm">1</span>
                <span className="text-sm text-white/90">Item added to 24h Community Board for maximum visibility.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-surface-container-lowest dark:bg-surface-container/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-sm">2</span>
                <span className="text-sm text-white/90">Our AI is actively notifying potential owners based on item descriptions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <button 
            onClick={() => navigate('/community')}
            className="flex-1 max-w-sm bg-gradient-to-r from-primary to-[#8455ef] text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-[1.03] active:scale-95 transition-all duration-200 flex items-center justify-center gap-3"
          >
            View Community Board
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 max-w-sm border-2 border-primary text-primary font-bold px-8 py-4 rounded-full hover:bg-primary/5 transition-all duration-200 flex items-center justify-center"
          >
            Return to Dashboard
          </button>
        </div>

        {/* XP Progress Bar (Gamification) */}
        <div className="bg-[#f8f9fa] p-8 rounded-[20px] border border-border-default mt-8 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-text-primary text-sm">Level 12 Progress</span>
            <span className="font-bold text-primary text-sm">450 / 500 XP</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-[#6b38d4] to-warning h-full rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
          </div>
          <p className="text-xs text-text-secondary mt-3 text-center">Just 50 XP more to reach 'Elite Guardian' status!</p>
        </div>
      </div>
    </div>
  );
};
