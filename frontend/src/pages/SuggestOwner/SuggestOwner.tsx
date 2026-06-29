import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, EyeOff, Send, CheckCircle, Rocket, BellRing, ArrowRight, UserSearch, Stars } from 'lucide-react';

export const SuggestOwner: React.FC = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [query, setQuery] = useState('');
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-10 relative min-h-[80vh]">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-[#8455ef]/5 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl w-full z-10 bg-white rounded-[40px] shadow-xl p-8 md:p-12 border border-border-default overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Left Column: Visual & Stats */}
            <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
              <div className="relative w-full max-w-[320px] animate-pulse">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-75"></div>
                <img 
                  alt="Success Illustration" 
                  className="w-full h-auto relative z-10 drop-shadow-2xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEAa66kom0qlxBt5goiz6Zwzvxgcx-A5LoSns4xe_GR8In4XZ_Xc0Hzp6QWsZ_65wJr4_Vw6KZt0R3PYz54-4ikn5fYVvCLanUv3sIk0uYDxcS4n4VkFGubCyh7-qdpp1etH1nalINWZ0lYPnKdbJl6ZZQgMhdzndbzz-wA38cHRfsXlbxhaFLvm35yCwBj4bkaOD_kOGrVNI6aCdimINQCU4c6xV12hD4dX2h_1RlmlDsyqi6kOGGt2Cr3GRX-Wb1JYZb8TWnQ9I"
                />
              </div>
              
              {/* Match Confidence Card */}
              <div className="w-full bg-surface-container-low rounded-3xl p-6 border border-border-default flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-text-secondary uppercase tracking-wider">Match Confidence</span>
                  <Stars className="w-5 h-5 text-info-ai fill-current" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-extrabold text-4xl text-primary leading-none">85%</span>
                  <span className="font-bold text-sm text-text-secondary mb-1">Probability</span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-primary to-[#8455ef] rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-text-secondary mt-1">Based on user profile tags and historical item proximity.</p>
              </div>
            </div>
            
            {/* Right Column: Success Messaging & Actions */}
            <div className="w-full lg:w-7/12 flex flex-col gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full">
                  <CheckCircle className="w-5 h-5 fill-current text-white" />
                  <span className="font-bold text-sm">Contribution Successfully Logged</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
                  Thank You for Your Help!
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Your suggestion has been logged! Our AI is now checking if <span className="font-bold text-text-primary">Alex Rivera</span> has a matching lost item report in the campus database.
                </p>
              </div>
              
              {/* Info Bento Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border-default flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-text-primary">XP Awarded</h4>
                    <p className="text-xs text-text-secondary">+50 Points for helping the community.</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border-default flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <BellRing className="w-6 h-6 text-warning" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-text-primary">Alex Notified</h4>
                    <p className="text-xs text-text-secondary">We've sent a discreet ping to Alex to verify.</p>
                  </div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-default">
                <button 
                  onClick={() => navigate('/community')}
                  className="flex-1 bg-gradient-to-r from-primary to-[#8455ef] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  Return to Community Board
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className="flex-1 bg-transparent border-2 border-primary text-primary font-bold py-3.5 px-6 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <UserSearch className="w-5 h-5" />
                  View Leaderboard
                </button>
              </div>
              <p className="text-center md:text-left text-xs text-text-secondary">
                Helping a fellow student reduces campus stress by 25%. You're a hero! 🎓
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-primary mb-2">Suggest an Owner</h1>
        <p className="text-text-secondary">Do you recognize this item? Help us reconnect it with its owner!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Item Context */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            <h3 className="font-bold text-text-primary mb-4 text-lg">Item Details</h3>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0">
                <img 
                  alt="Item" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLuZvCgyHr43N0iFlOKyk6UiEoE0zimYrO69w8_AHQ8wkOimQ_lDiQavSvRYS9r-JEJoj726-4HVicEqIuvmsDoTUaIfckvI4Q2Hdhbwou3_7ZRBWuEz0RATnEwV0bpv8GEJ44d-8g-mNEt96uyyu-Udm3-tCEI0NRQXXlICHkTozaHjHmAH5nAYF0uq2UAbrJxMfUFfQzyRlW2kWXmLjMwab74EQcE2ZKBpxgrOAlXt5sYCxyy3JqV5HA" 
                />
              </div>
              <div>
                <p className="font-bold text-text-primary">Silver MacBook Air</p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wide mt-1 inline-block">Electronics</span>
                <p className="text-xs text-text-secondary mt-2 line-clamp-2">Left near the window study carrels. Has a "Computer Science" sticker on the lid.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#f9f6ff] to-white rounded-2xl p-6 border border-[#d0bcff]/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8455ef] text-white flex items-center justify-center shrink-0 shadow-md">
              <Stars className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-[#5516be]">Earn 50 XP</h4>
              <p className="text-xs text-text-secondary mt-1">Accurate owner suggestions build your Campus Helper level!</p>
            </div>
          </div>
        </section>

        {/* Right Panel: Form */}
        <section className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-border-default">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Student ID Input */}
              <div className="space-y-2">
                <label className="font-bold text-text-primary flex items-center justify-between text-sm">
                  Student Name or ID
                  <span className="text-text-secondary text-[10px] font-normal">Campus Directory Verified</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border-default bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none" 
                    placeholder="Start typing name or @username..." 
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowAutoSuggest(e.target.value.length > 2);
                      setSelectedUser(null);
                    }}
                  />
                  
                  {/* Mock Auto-suggest dropdown */}
                  {showAutoSuggest && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-xl border border-border-default overflow-hidden z-20">
                      <div 
                        className="px-4 py-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3"
                        onClick={() => { setQuery('John Doe'); setShowAutoSuggest(false); setSelectedUser('JD'); }}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">JD</div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">John Doe</p>
                          <p className="text-[10px] text-text-secondary">Computer Science · @johndoe24</p>
                        </div>
                      </div>
                      <div 
                        className="px-4 py-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3"
                        onClick={() => { setQuery('Jane Smith'); setShowAutoSuggest(false); setSelectedUser('JS'); }}
                      >
                        <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning text-xs font-bold">JS</div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">Jane Smith</p>
                          <p className="text-[10px] text-text-secondary">Digital Arts · @jsmith_art</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reasoning Textarea */}
              <div className="space-y-2">
                <label className="font-bold text-text-primary text-sm">Why do you think this belongs to them?</label>
                <textarea 
                  className="w-full p-4 rounded-2xl border border-border-default bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none resize-none" 
                  placeholder="e.g., 'I saw them wearing these in the cafe yesterday' or 'They posted about losing this on their story'." 
                  rows={4}
                ></textarea>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-sm">Anonymously Suggest</p>
                    <p className="text-text-secondary text-[10px] md:text-xs">Your name won't be shown to the suggested owner.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={!selectedUser}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Submit Suggestion
                  <Send className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border-2 border-border-default text-text-secondary font-bold hover:bg-surface-container transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
              <p className="text-center text-[10px] text-text-secondary px-2 mt-4">
                By submitting, you agree to the Campus Trust Guidelines. Intentional false suggestions may result in a temporary suspension of community features.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
