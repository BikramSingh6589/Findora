import React from 'react';
import { PlusSquare, Search, Verified, Handshake, Shield, Medal, Mail, MapPin, Send, ChevronDown } from 'lucide-react';

export const HelpSupport: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
            Support Center
          </span>
          <h2 className="text-4xl font-extrabold text-text-primary">How can we help you today?</h2>
          <p className="text-lg text-text-secondary max-w-lg mx-auto md:mx-0">
            Whether you've lost your keys or found a mysterious notebook, our "Helpful Senior AI" is here to guide you through the campus retrieval process.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
            <span className="px-4 py-2 rounded-xl bg-surface-container border border-border-default text-xs text-text-secondary">Popular: <strong className="text-text-primary">AI Matching</strong></span>
            <span className="px-4 py-2 rounded-xl bg-surface-container border border-border-default text-xs text-text-secondary">Popular: <strong className="text-text-primary">Claim Process</strong></span>
          </div>
        </div>
        <div className="w-full md:w-80 h-80 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
          <img 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5MMnl8eoP7RYUu-aSzuJoTeCUkPt8i4wWl-pI4vhU5_HvtTS36jgBeaAedfKpw0YF7UH6rRWFSpwOMj7Hv47Utet3h7Pp3HST3MtWNehxCvLzCArdAG4gx-q98tNhbxr_3SdEQrFMl8UqEo-Mkiqi-hiGHJmalpao6niYQWKOHYjgeV6PRHlZCXTfM5m3uZTKpfnGJKbNykMCQzy14TSLNInVg24WKgF8nnkD8Lfx-2UD2Qkx9rmSj-6GlzGC6p2uUQkc6MZlyOA" 
            alt="AI Mascot"
          />
        </div>
      </section>

      {/* Categorized Help Topics (Bento Style) */}
      <section className="mb-16">
        <h3 className="text-2xl font-extrabold text-text-primary mb-8">Browse by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Reporting */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white shadow-sm border border-border-default hover:-translate-y-1 transition-transform cursor-pointer flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <PlusSquare className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-text-primary">Reporting Items</h4>
              <p className="text-sm text-text-secondary">Learn how to create high-quality reports that get noticed by owners quickly.</p>
            </div>
            <div className="mt-4 flex items-center text-primary font-bold gap-2 text-sm">
              8 Articles <Search className="w-4 h-4" />
            </div>
          </div>

          {/* AI Matching */}
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-border-default hover:-translate-y-1 transition-transform cursor-pointer flex flex-col min-h-[200px]">
            <div className="w-12 h-12 rounded-xl bg-info-ai/10 flex items-center justify-center text-info-ai mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xl mb-2 text-text-primary">AI Matching</h4>
            <p className="text-xs text-text-secondary flex-1">Understanding how our smart algorithms find your lost gear.</p>
            <div className="mt-4 flex items-center text-primary font-bold gap-2 text-sm">
              4 Articles <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Claims */}
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-border-default hover:-translate-y-1 transition-transform cursor-pointer flex flex-col min-h-[200px]">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success mb-4">
              <Verified className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xl mb-2 text-text-primary">Claims</h4>
            <p className="text-xs text-text-secondary flex-1">Proving ownership and the steps to verify found items safely.</p>
            <div className="mt-4 flex items-center text-primary font-bold gap-2 text-sm">
              6 Articles <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Handover */}
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-border-default hover:-translate-y-1 transition-transform cursor-pointer flex flex-col min-h-[200px]">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning mb-4">
              <Handshake className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xl mb-2 text-text-primary">Handover</h4>
            <p className="text-xs text-text-secondary flex-1">Coordinating safe meetups and secure drop-off points.</p>
            <div className="mt-4 flex items-center text-primary font-bold gap-2 text-sm">
              5 Articles <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Security */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white shadow-sm border border-border-default hover:-translate-y-1 transition-transform cursor-pointer flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-text-primary">Privacy & Security</h4>
              <p className="text-sm text-text-secondary">How we keep your campus data safe and your identity protected.</p>
            </div>
            <div className="mt-4 flex items-center text-primary font-bold gap-2 text-sm">
              3 Articles <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Gamification */}
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-border-default hover:-translate-y-1 transition-transform cursor-pointer flex flex-col min-h-[200px]">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Medal className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xl mb-2 text-text-primary">Rewards</h4>
            <p className="text-xs text-text-secondary flex-1">Earning XP, Badges, and "Campus Karma" for your good deeds.</p>
            <div className="mt-4 flex items-center text-primary font-bold gap-2 text-sm">
              2 Articles <Search className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* Contact & Support Section */}
      <section className="flex flex-col lg:flex-row gap-8">
        
        {/* Form Side */}
        <div className="flex-[1.5] bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-border-default">
          <div className="mb-8">
            <h3 className="text-2xl font-extrabold text-text-primary">Still Stuck? Message Us</h3>
            <p className="text-sm text-text-secondary mt-2">Our student support team typically replies within 24 hours.</p>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary px-1">Subject</label>
                <select className="w-full px-4 py-3 rounded-2xl bg-surface border border-border-default focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-text-primary">
                  <option>Select a topic</option>
                  <option>Issue with AI Matching</option>
                  <option>Claim Dispute</option>
                  <option>Technical Bug</option>
                  <option>General Feedback</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary px-1">Item ID (Optional)</label>
                <input 
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-border-default focus:ring-2 focus:ring-primary/20 outline-none text-text-primary" 
                  placeholder="#CC-12345" 
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary px-1">Message</label>
              <textarea 
                className="w-full px-4 py-3 rounded-2xl bg-surface border border-border-default focus:ring-2 focus:ring-primary/20 outline-none resize-none text-text-primary" 
                placeholder="Describe your issue in detail..." 
                rows={4}
              ></textarea>
            </div>
            <button 
              type="button" 
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold rounded-2xl shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Details & FAQ Side */}
        <div className="flex-1 space-y-8">
          
          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20">
            <h4 className="font-bold text-xl text-primary mb-6">Direct Contact</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-primary">Email Support</p>
                  <p className="text-xs text-text-secondary mt-1">support@campusconnect.edu</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-primary">Main Campus Hub</p>
                  <p className="text-xs text-text-secondary mt-1">Student Center, Level 2, Room 204</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Hits */}
          <div className="p-8 rounded-3xl bg-white border border-border-default shadow-sm">
            <h4 className="font-bold text-xl mb-6 text-text-primary">Quick FAQs</h4>
            <div className="space-y-4">
              <details className="group bg-surface rounded-xl border border-border-default transition-all overflow-hidden cursor-pointer">
                <summary className="flex justify-between items-center p-4 list-none font-bold text-sm text-text-primary outline-none">
                  Is Campus Connect free?
                  <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border-default mt-2 pt-4">
                  Yes! Campus Connect is a service provided by the Student Union for all registered students and staff.
                </div>
              </details>
              
              <details className="group bg-surface rounded-xl border border-border-default transition-all overflow-hidden cursor-pointer">
                <summary className="flex justify-between items-center p-4 list-none font-bold text-sm text-text-primary outline-none">
                  How do I prove an item is mine?
                  <ChevronDown className="w-5 h-5 text-text-secondary group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border-default mt-2 pt-4">
                  You can provide unique details, share photos of you with the item, or describe specific identifying marks not listed in the public report.
                </div>
              </details>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
