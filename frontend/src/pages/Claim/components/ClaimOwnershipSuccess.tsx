import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Home, Timer, ShieldCheck, Medal } from 'lucide-react';

export const ClaimOwnershipSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full animate-in fade-in zoom-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        
        {/* Illustration & Header Section */}
        <div className="md:col-span-12 bg-white rounded-[20px] p-8 md:p-12 shadow-sm border border-border-default overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <img 
                  className="w-full h-full object-contain" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9rJzF0KgmtngfiSTU6NyWfGRgnovFzMAfghInTDjW454VNhMyU3YjYjeCr5RHjpgZI6IINN410aca2PyAk3gOJEYJLiklvI_le5RShb-bqvBc4A6kWSe5yYNSqnhi9yx-jcYIHfL1jMSldFiINOd4hQe9_e_M-ZiVl6qK-Goazo10TMMZLnOkCPJ8mv5vvaWlJ79xSRmVNm2_mUUOUsr0fcbczrH2yJ3MseaJQ1K-CrTNymg09tW0pU3Ta9COWQkQQQqc3ldGlbk"
                  alt="Claim Illustration"
                />
                {/* Floating interactive element */}
                <div className="absolute -top-4 -right-4 bg-primary/10 text-primary px-4 py-1.5 rounded-full shadow-sm font-bold text-sm animate-bounce border border-primary/20">
                  Analyzing Proof...
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-success/10 text-success font-bold text-sm mb-4">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Ownership Claim Submitted
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Claim Under Review</h1>
              <p className="text-lg text-text-secondary mb-8">
                Great job! We've sent your proof to the office. Our campus admins are currently verifying the details to make sure the item returns to its rightful owner.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => navigate('/profile')}
                  className="bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Track Claim Status
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="border-2 border-primary text-primary font-bold px-8 py-3.5 rounded-full hover:bg-primary/5 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper / Progress Section */}
        <div className="md:col-span-12 bg-white rounded-[20px] p-8 shadow-sm border border-border-default">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center justify-between">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: '50%' }}></div>
              </div>
              
              {/* Step 1: Done */}
              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-bold text-sm text-primary">Claim Submitted</p>
                  <p className="text-xs text-text-secondary">Today, 10:45 AM</p>
                </div>
              </div>
              
              {/* Step 2: Current */}
              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-sm animate-pulse transition-transform group-hover:scale-110">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-bold text-sm text-text-primary">Admin Review</p>
                  <p className="text-xs text-primary font-bold">In Progress</p>
                </div>
              </div>
              
              {/* Step 3: Future */}
              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-text-secondary flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                  <Home className="w-6 h-6" />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-bold text-sm text-text-secondary">QR Generation</p>
                  <p className="text-xs text-text-secondary">Expected Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Information Bento */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f0f9ff] p-6 rounded-xl border border-[#bae6fd] hover:border-info-ai/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-info-ai/20 flex items-center justify-center mb-4">
              <Timer className="text-info-ai w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-info-ai-dark mb-1">24h Response</h3>
            <p className="text-sm text-text-secondary">Expect an update within 24 hours. Most claims are processed even faster!</p>
          </div>
          
          <div className="bg-[#fffbeb] p-6 rounded-xl border border-[#fde68a] hover:border-warning/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center mb-4">
              <ShieldCheck className="text-warning-dark w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-warning-dark mb-1">Secure Return</h3>
            <p className="text-sm text-text-secondary">Once approved, you'll receive a unique QR code for secure pickup at the Main Office.</p>
          </div>
          
          <div className="bg-[#f0fdf4] p-6 rounded-xl border border-[#bbf7d0] hover:border-success/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
              <Medal className="text-success-dark w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-success-dark mb-1">+50 XP Pending</h3>
            <p className="text-sm text-text-secondary">Successful returns earn you campus rewards and reputation points!</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};
