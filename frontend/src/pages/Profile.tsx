import React from 'react';
import { Star, Sparkles, Handshake, Verified, Shield, Zap, Compass, Heart, Lock, Calendar, PlusCircle, ArrowRight, Bot } from 'lucide-react';


export const Profile: React.FC = () => {
  const handleAction = (actionName: string) => {
    alert(`Action triggered: ${actionName}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Profile Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Identity Card */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md border border-border-default">
          <div className="relative flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl rotate-3">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Alex Rivers Profile"
                  src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80" 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-warning text-white p-2 rounded-xl shadow-lg flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-white" />
                <span className="text-xs font-bold">TOP FINDER</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-primary">Alex Rivers</h1>
              <p className="text-text-secondary text-lg mt-1">Senior Student AI · Helper Level 12</p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">Class of 2026</span>
                <span className="px-4 py-1 bg-[#ffdf9f] text-[#5c4300] rounded-full text-sm font-bold">Design Major</span>
                <span className="px-4 py-1 bg-surface-variant text-on-surface-variant rounded-full text-sm">Student Ambassador</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary flex items-center">
                  982<span className="ml-2 text-3xl">🏆</span>
                </div>
                <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mt-1">Reputation</div>
              </div>
              <button 
                onClick={() => handleAction('Share Profile')}
                className="mt-2 bg-[#5b5fef] text-white px-6 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* XP / Explorer Level Card */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#4143d5] to-[#6b38d4] rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles className="w-24 h-24" />
          </div>
          <div>
            <h3 className="text-xl opacity-90 font-semibold">Explorer Level</h3>
            <div className="text-5xl font-black mt-1">LVL 12</div>
          </div>
          <div className="space-y-2 mt-8 z-10">
            <div className="flex justify-between text-sm font-bold">
              <span>PROGRESS TO LVL 13</span>
              <span>2,450 / 3,000 XP</span>
            </div>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-warning to-[#f9bd22] rounded-full" style={{ width: '82%' }}></div>
            </div>
            <p className="text-sm opacity-80 italic">"Return 1 more high-value item to reach level 13!"</p>
          </div>
        </div>
      </section>

      {/* Statistics & Badges Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quick Stats */}
        <div className="md:col-span-3 grid grid-rows-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-default flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <Handshake className="text-primary w-8 h-8 mb-2" />
            <div className="text-3xl font-bold text-text-primary">14</div>
            <div className="text-sm text-text-secondary mt-1">Items Returned</div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-default flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <Verified className="text-[#6b38d4] w-8 h-8 mb-2" />
            <div className="text-3xl font-bold text-text-primary">100%</div>
            <div className="text-sm text-text-secondary mt-1">Honesty Score</div>
          </div>
        </div>

        {/* Badge Gallery */}
        <div className="md:col-span-9 bg-white rounded-3xl p-8 shadow-sm border border-border-default">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Earned Badges</h2>
            <button onClick={() => handleAction('View All Badges')} className="text-primary font-bold hover:underline">View All Badges</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Badge 1 */}
            <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => handleAction('Badge: Honest Finder')}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative transition-transform group-hover:scale-110 bg-success/10">
                <Shield className="text-success w-10 h-10 fill-current" />
              </div>
              <span className="mt-2 font-bold text-sm">Honest Finder</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-tighter">Level 3</span>
            </div>
            {/* Badge 2 */}
            <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => handleAction('Badge: Quick Match')}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative transition-transform group-hover:scale-110 bg-primary/10">
                <Zap className="text-primary w-10 h-10 fill-current" />
              </div>
              <span className="mt-2 font-bold text-sm">Quick Match</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-tighter">Level 2</span>
            </div>
            {/* Badge 3 */}
            <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => handleAction('Badge: Eagle Eye')}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative transition-transform group-hover:scale-110 bg-warning/10">
                <Compass className="text-warning w-10 h-10 fill-current" />
              </div>
              <span className="mt-2 font-bold text-sm">Eagle Eye</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-tighter">Gold</span>
            </div>
            {/* Badge 4 */}
            <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => handleAction('Badge: Kind Soul')}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative transition-transform group-hover:scale-110 bg-[#6b38d4]/10">
                <Heart className="text-[#6b38d4] w-10 h-10 fill-current" />
                <div className="absolute -top-1 -right-1 bg-primary text-white text-[8px] px-1 rounded-full font-bold">NEW</div>
              </div>
              <span className="mt-2 font-bold text-sm">Kind Soul</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-tighter">Level 5</span>
            </div>
            {/* Badge 5 Locked */}
            <div className="flex flex-col items-center text-center opacity-40 grayscale cursor-not-allowed">
              <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center">
                <Lock className="text-text-secondary w-10 h-10" />
              </div>
              <span className="mt-2 font-bold text-sm">Legendary</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-tighter">Locked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Activity History Section */}
      <section className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border-default">
        <div className="p-8 border-b border-border-default flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold">Item History</h2>
          <div className="flex bg-surface rounded-xl p-1 w-full md:w-auto overflow-x-auto">
            <button className="px-4 py-1 bg-white shadow-sm rounded-lg text-sm font-bold text-primary whitespace-nowrap">All Activity</button>
            <button onClick={() => handleAction('Filter: Found')} className="px-4 py-1 text-sm font-medium text-text-secondary hover:text-primary whitespace-nowrap">Found</button>
            <button onClick={() => handleAction('Filter: Lost')} className="px-4 py-1 text-sm font-medium text-text-secondary hover:text-primary whitespace-nowrap">Lost</button>
          </div>
        </div>

        <div className="divide-y divide-border-default">
          {/* History Item 1 */}
          <div className="p-6 flex flex-col md:flex-row gap-6 hover:bg-surface transition-colors">
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80" alt="Keys" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-text-primary">Keys with Blue Lanyard</h3>
                  <span className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase">Returned</span>
                </div>
                <p className="text-text-secondary text-base mt-2">Found near the Main Library Cafeteria. Handed over to the front desk after owner verification.</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Calendar className="w-4 h-4 text-primary" /> Oct 12, 2026
                  </div>
                  <div className="flex items-center gap-1 text-sm text-primary font-bold">
                    <PlusCircle className="w-4 h-4 fill-current" /> +50 Reputation
                  </div>
                </div>
                <button onClick={() => handleAction('View Case Details: Keys')} className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all group">
                  View Case Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* History Item 2 */}
          <div className="p-6 flex flex-col md:flex-row gap-6 hover:bg-surface transition-colors">
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" alt="Headphones" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-text-primary">Bose Headphones</h3>
                  <span className="px-3 py-1 bg-[#e1e0ff]/50 text-[#2c2cc3] rounded-full text-[10px] font-bold uppercase">Reported Lost</span>
                </div>
                <p className="text-text-secondary text-base mt-2">Left behind in the Engineering Lab. Still waiting for a verified finder to match.</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Calendar className="w-4 h-4 text-primary" /> Oct 05, 2026
                  </div>
                  <div className="flex items-center gap-1 text-sm text-info-ai font-bold">
                    <Bot className="w-4 h-4 text-primary" /> 2 AI Matches
                  </div>
                </div>
                <button onClick={() => handleAction('Check Matches: Headphones')} className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all group">
                  Check Matches <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-surface text-center border-t border-border-default">
          <button onClick={() => handleAction('Load More History')} className="text-primary font-bold hover:scale-105 transition-all">Load More History</button>
        </div>
      </section>
    </div>
  );
};
