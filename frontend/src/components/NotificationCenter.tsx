import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Users, Medal, ArrowRight, QrCode } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Important'>('All');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the popover is open, and the click is outside the popover element, close it
      if (isOpen && popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        // Also ensure we aren't clicking the notification bell itself which toggles it.
        // We can just rely on the bell's onClick stopping propagation, or just standard behavior since the bell button sets state.
        // Wait, if the bell is clicked, it might immediately reopen. Let's let the bell handle its own logic or just check if it's the bell.
        // Actually the safest way without modifying the bell is just calling onClose. 
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/20 z-50 lg:hidden backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popover Container */}
      <div ref={popoverRef} className="fixed lg:absolute top-16 right-0 lg:right-8 w-full h-[calc(100vh-4rem)] lg:h-auto lg:w-[450px] lg:max-h-[80vh] bg-surface z-50 shadow-2xl lg:rounded-3xl border border-border-default flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border-default bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Notifications</h2>
              <p className="text-sm text-text-secondary mt-1">Keep track of matches, claims, and tips.</p>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 bg-surface-container-low rounded-full text-text-secondary hover:text-text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex bg-surface-container-low p-1 rounded-2xl w-fit">
            {['All', 'Unread', 'Important'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  filter === f 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]">
          
          {/* AI Match Card */}
          <div className="group relative overflow-hidden bg-white rounded-[20px] p-5 shadow-sm border-l-4 border-info-ai hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-info-ai/10 flex items-center justify-center text-info-ai shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-text-primary flex flex-wrap items-center gap-2">
                    Potential Match Found!
                    <span className="px-2 py-0.5 bg-info-ai/10 text-info-ai text-[10px] font-bold uppercase rounded-md">AI Matching</span>
                  </h3>
                  <span className="text-xs text-text-secondary whitespace-nowrap ml-2">2m ago</span>
                </div>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  ✨ Our algorithm found a <span className="font-semibold text-text-primary">Silver MacBook</span> reported at the Engineering Library that matches your recent "Lost Item" report.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="px-4 py-2 bg-info-ai text-white rounded-lg text-xs font-bold hover:bg-info-ai/90 active:scale-95 transition-all">
                    View Match
                  </button>
                  <button className="px-4 py-2 bg-surface-container-low text-text-secondary rounded-lg text-xs font-bold hover:bg-surface-container transition-all">
                    Not Mine
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Approved Card */}
          <div className="group relative overflow-hidden bg-white rounded-[20px] p-5 shadow-sm border-l-4 border-success hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-text-primary">Claim Approved!</h3>
                  <span className="text-xs text-text-secondary">1h ago</span>
                </div>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  ✅ Great news! Your claim for <span className="font-semibold text-text-primary">'Blue JBL Earbuds'</span> has been verified. They are ready for pickup at the Student Union Hub.
                </p>
                <div className="mt-3">
                  <button className="px-4 py-2 bg-success text-white rounded-lg text-xs font-bold hover:bg-success/90 active:scale-95 transition-all flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    Get QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Community Suggestion Card */}
          <div className="group relative overflow-hidden bg-white rounded-[20px] p-5 shadow-sm border-l-4 border-warning hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-text-primary">New Suggestion</h3>
                  <span className="text-xs text-text-secondary">3h ago</span>
                </div>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  🙋 <span className="font-semibold text-text-primary">Alex</span> thinks your <span className="font-semibold text-text-primary">'Black Wallet'</span> might be at the <span className="text-primary underline underline-offset-4 cursor-pointer">Cafeteria</span>.
                </p>
                <div className="mt-3">
                  <button className="px-4 py-2 bg-surface-container-high text-text-primary rounded-lg text-xs font-bold hover:bg-surface-variant active:scale-95 transition-all flex items-center gap-1.5">
                    Check it out
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* XP Reward Card */}
          <div className="bg-gradient-to-br from-primary to-[#6b38d4] rounded-[20px] p-5 shadow-sm text-white flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
              <Medal className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">You're making a difference!</p>
              <p className="text-xs text-white/80 mt-0.5">Helping others earned you +50 XP.</p>
              <div className="mt-2 bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[75%] rounded-full"></div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-white border-t border-border-default text-center">
          <button className="text-sm font-bold text-primary hover:underline">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
};
