import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, MoreVertical, Shield, Gavel, Verified, 
  Send, PlusCircle, CheckCircle2, Phone 
} from 'lucide-react';

export const FinderChat: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on load
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] -mt-6 -mx-6 md:m-0 bg-surface">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX-krxrwDVIHwOkj05KW6yjgKLg4voWInC_JLaEcQJC3cMZY8oMfymKdSsZiCRRyO8F0czpadjj4hegBSxDrd5N2URDWMvM4UT9K1r1cLZQqSmb0LU-na9-HdtJzCe9fxbRjCdmj-kBHkcNkZ_WiC2NtuG0ORprxOn-8qsZ0HxO7tQaM4AuQLiitxYtKwjzYpu6cX4qZ8oMQdN10KlGAvTwpSWDXD3bcF4bhxUH3nvgb3IpPFU_j8-XjjVeTya-647uR4af9DkBXQ" 
                alt="Alex Chen" 
                className="w-10 h-10 rounded-full border-2 border-primary-fixed ring-2 ring-white object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-text-primary text-sm md:text-base">Alex Chen</h2>
              <span className="text-xs text-text-secondary">Level 15 Helper</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="hidden md:flex items-center gap-1.5 bg-surface-container text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-surface-container-high transition-all">
            <Gavel className="w-4 h-4" /> Admin Mediation
          </button>
          <button 
            onClick={() => navigate(`/handover/qr/${itemId || '123'}`)} 
            className="hidden md:flex items-center gap-1.5 bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:scale-[1.03] transition-all shadow-sm"
          >
            <Verified className="w-4 h-4" /> Confirm Ownership & Resolve
          </button>

          {/* Mobile Actions */}
          <div className="flex gap-2 md:hidden">
            <button className="flex items-center gap-1 bg-text-primary text-white px-2.5 py-1 rounded-lg hover:bg-surface-container-highest transition-colors active:scale-95 shadow-sm">
              <Gavel className="w-3.5 h-3.5 text-warning" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Admin</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <MoreVertical className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-surface relative"
      >
        {/* Match Info Bar */}
        <div className="flex justify-center mb-6">
          <div className="bg-info-ai/10 border border-info-ai/30 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Shield className="text-info-ai w-4 h-4" />
            <span className="text-xs font-bold text-info-ai uppercase tracking-wider">94% Match Confidence</span>
          </div>
        </div>
        
        <div className="flex justify-center my-4">
          <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-wider">Today</span>
        </div>

        {/* Receiver Message (The Finder) */}
        <div className="flex gap-3 max-w-[85%] md:max-w-2xl">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOujjZXMYAO-dMUlx94zp_T78uEHlUPGsQnEwrPST6NHbq7tdpmwbeLAxT3HazIHzNx0KbPmQk4vmp80uBaa3_8h1oPLvML8Put8dBwG37ne3sk7PYVnR0-BS0bUo5v3gIIH1Be0yMU86tkc_ZFG8oOCmEnqX38zxwDEjjwTrE8gman0EwL_dBF41jmP7_1SXJXrun-kRJPI02rsgw76U8Jjzn9GgO8SmitX8g0jIgH4kWhdQMabZFN6hI09Qv09S9GC3mKFS3rfw" 
            alt="Sender" 
            className="w-8 h-8 rounded-full self-end mb-1 object-cover"
          />
          <div className="flex flex-col gap-1">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-border-default text-sm text-text-primary">
              <p>Hey! I found your AirPods near the South Quad library. 🎧</p>
            </div>
            <span className="text-[10px] text-text-secondary px-1">09:41 AM</span>
          </div>
        </div>

        {/* Sender Message (Current User) */}
        <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-2xl ml-auto">
          <div className="bg-primary text-white p-3 rounded-2xl rounded-br-none shadow-md text-sm">
            <p>Oh my god, thank you so much! I was panicking. Are you still on campus?</p>
          </div>
          <div className="flex items-center gap-1 px-1">
            <span className="text-[10px] text-text-secondary">09:42 AM</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        {/* Item Card Context */}
        <div className="flex gap-3 max-w-[85%] md:max-w-2xl">
          <div className="w-8 h-8"></div> {/* Avatar Placeholder */}
          <div className="bg-info-ai/5 border border-info-ai/20 p-3 rounded-2xl shadow-sm w-full max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-info-ai/20" 
                style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9rYT9Anx2qtM1wEEtTzZrHNh8aMkqdegCV2cbuiuD673-XWPhDZlSziGWftEr2qXgmvS2_SF7qBx7yjreA-cTsQbD-xld4muHE9wuYqjB9bH70GMv1NcJVjcpOFTGjNxRLNGc3VcN7GorfOm7QT-_Q-Axddnm2ztjqpBxG2JACUzGwFPjjP4sNvXtk_JPJ0PaELlvkYp4q-6VMX5QJCmPRXAMgjqiSoReA02DTWg2w3K3eUUy2ummk9H9WVkEravWHq1TddZV4rE')"}}
              ></div>
              <div className="flex flex-col">
                <h4 className="font-bold text-sm text-text-primary">Found: AirPods Pro</h4>
                <p className="text-xs text-text-secondary mt-0.5">Library South Entrance</p>
              </div>
            </div>
            <button className="w-full bg-info-ai text-white py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform">
              Confirm this is yours
            </button>
          </div>
        </div>

        {/* Receiver Message */}
        <div className="flex gap-3 max-w-[85%] md:max-w-2xl mb-12">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7so8dY6wEat613DdPhcXVHLrea_V3isYsSPcRc93HeL4GX1Nj6JwejSyZxgEz1COTWaCorEyIrq6ddoXp5XIOqyKAiSg3FNFUEJbS4fMzBHioE4fwrm0y6U_Nwo_ClA8eP5GpC_BAQ44jsEUukUFhFKqI49J6njxPnaY8yfkbiv_5nA5tP20gxakp9zwXp0l-wHJ-BmjOOF387NUM9t7PVu6OqG5HvP4-VK8Jqpnqe_EFbziHupKYxdebEr2F7hO7ftKB270SuDA" 
            alt="Sender" 
            className="w-8 h-8 rounded-full self-end mb-1 object-cover"
          />
          <div className="flex flex-col gap-1">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-border-default text-sm text-text-primary">
              <p>Yeah! I'm at the Student Union cafe for the next hour. You can swing by and pick them up whenever you're free.</p>
            </div>
            <span className="text-[10px] text-text-secondary px-1">09:44 AM</span>
          </div>
        </div>

      </div>

      {/* Mobile Confirm Button (Fixed above input) */}
      <div className="md:hidden absolute bottom-[72px] left-0 w-full px-4 z-30">
        <button 
          onClick={() => navigate(`/handover/qr/${itemId || '123'}`)}
          className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <Verified className="w-5 h-5" />
          Confirm Ownership & Resolve
        </button>
      </div>

      {/* Message Input Area */}
      <div className="bg-white p-3 md:p-4 border-t border-border-default z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container p-1 md:p-1.5 rounded-full border border-border-default focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high text-primary transition-colors flex-shrink-0">
            <PlusCircle className="w-6 h-6" />
          </button>
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-2" 
            placeholder="Send a message..." 
            type="text" 
          />
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:brightness-110 active:scale-90 transition-transform flex-shrink-0">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
