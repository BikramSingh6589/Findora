import React, { useState } from 'react';
import { Search, Clock, Zap, Filter, Timer, MapPin, Trophy, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommunityItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  description: string;
  location: string;
  timeLeft: string;
  timeLeftDanger: boolean;
  img: string;
  imgContain?: boolean;
  isAIMatch?: boolean;
  primaryAction: { label: string; route?: string };
  secondaryAction: { label: string; route?: string };
}

const items: CommunityItem[] = [
  {
    id: '1',
    title: 'Silver MacBook Air',
    category: 'Electronics',
    categoryColor: 'bg-primary/10 text-primary',
    description: 'Left near the window study carrels. Has a "Computer Science" sticker on the lid.',
    location: 'Library Level 4',
    timeLeft: '14h 22m left',
    timeLeftDanger: false,
    img: 'https://lh3.googleusercontent.com/aida/AP1WRLuZvCgyHr43N0iFlOKyk6UiEoE0zimYrO69w8_AHQ8wkOimQ_lDiQavSvRYS9r-JEJoj726-4HVicEqIuvmsDoTUaIfckvI4Q2Hdhbwou3_7ZRBWuEz0RATnEwV0bpv8GEJ44d-8g-mNEt96uyyu-Udm3-tCEI0NRQXXlICHkTozaHjHmAH5nAYF0uq2UAbrJxMfUFfQzyRlW2kWXmLjMwab74EQcE2ZKBpxgrOAlXt5sYCxyy3JqV5HA',
    primaryAction: { label: 'Suggest Owner', route: '/suggest/1' },
    secondaryAction: { label: 'Claim Item', route: '/claim' },
  },
  {
    id: '2',
    title: 'Keyring with Airtag',
    category: 'Accessories',
    categoryColor: 'bg-warning/10 text-warning',
    description: 'Blue silicon case Airtag with 3 keys and a small LEGO astronaut keychain.',
    location: 'Gym Lockers',
    timeLeft: '08h 15m left',
    timeLeftDanger: true,
    img: 'https://lh3.googleusercontent.com/aida/AP1WRLsr4JL9xFyttjBMcn_GVYXAmGxl9Md6v7gAlzmVmhaYF1q7VhncS30v3Mzkrtd1YKtbLqO7Gb0vqG35ke9eqsTvQCwztTzVNkO02peOHCjC9UxOWqlH5S5JoTODGuYFDlagBvcgJAKFuxWx9W9twMjtcOOtKDdYDAbHQPuzWqx2_utyIysyhHWx2sDuf62gbVtLIZqA4VAyfCMlP8YGUrey3UzBMj4Oz1EVCQWdW2crDQA6wQQ0xgA_Tw',
    imgContain: true,
    isAIMatch: true,
    primaryAction: { label: 'View Details', route: '/item/123' },
    secondaryAction: { label: 'Claim Item', route: '/claim' },
  },
  {
    id: '3',
    title: 'Sony XM4 Headphones',
    category: 'Electronics',
    categoryColor: 'bg-primary/10 text-primary',
    description: 'Black noise-cancelling headphones found at the Student Union, Level 2.',
    location: 'Student Union, Level 2',
    timeLeft: '21h 05m left',
    timeLeftDanger: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxa9_ydnBjuKRTq-ImOviaQ_SVAbnR8U4Wwl4_CMeztdBCXQvLrGepDf-5zziqnmwQS3yDxIEf2vo5VunlwoKNf6gkE3Fo0btIkr5JBSQ6bThYYzQM_AGmNQMd8NrzgZudENCGaUrB8L-P4JFwC0Dmnnpuo71DFWf_Yva5VksquE9kcv24qxVGEPA_DjoQJweSKbYKPqrKQGw8OM5v8R0A4E14Yg5dc6d1601U0a5kqzZHiRc5N1b-xOKO_vMDwFnI615WFF5fAVg',
    primaryAction: { label: 'Suggest Owner', route: '/suggest/3' },
    secondaryAction: { label: 'Claim Item', route: '/claim' },
  },
  {
    id: '4',
    title: 'Navy Blue Wallet',
    category: 'Cards & IDs',
    categoryColor: 'bg-info-ai/10 text-info-ai',
    description: 'Blue leather wallet with a university student ID card visible inside.',
    location: 'Cafeteria Terrace',
    timeLeft: '02h 44m left',
    timeLeftDanger: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4lshxlz8GQBaAj0-8hG1Nd5MDaarlOYSMQ8ktI3pR-mRbHNVGY8oaLluBSGy8e8nViAaAzKydiRMhQ4muDziBf5eaHHCbMc2Ss2U3ubhpNeDHAB6M3IoOxF3m_oFvnRq5YaejIxrhwJJDJnsEQzDs7pPUpmfhOcD24f6PKnpWufCrsw8dx50kPBZotud0N9retwZVviGXNfj4NG-4wkrRTM7yzhO6rlA1djTwJYFMVEmgl5xZRaUoLGJ9r15zRjTVzsGQwvK2euE',
    primaryAction: { label: 'Suggest Owner', route: '/suggest/4' },
    secondaryAction: { label: 'Claim Item', route: '/claim' },
  },
];

export const CommunityBoard: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Items');

  const categories = ['All Items', 'Electronics', 'Cards & IDs', 'Fashion', 'Keys'];

  const handleAction = (route?: string) => {
    if (route) navigate(route);
  };

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden rounded-[32px] bg-primary-container p-6 md:p-10 md:bg-transparent md:border-none">
        {/* Mobile Background */}
        <div className="absolute inset-0 bg-primary-container md:hidden rounded-[32px] -z-10"></div>
        <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none w-48 h-48 md:hidden">
          <img alt="Playful Doodles" className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLsr4JL9xFyttjBMcn_GVYXAmGxl9Md6v7gAlzmVmhaYF1q7VhncS30v3Mzkrtd1YKtbLqO7Gb0vqG35ke9eqsTvQCwztTzVNkO02peOHCjC9UxOWqlH5S5JoTODGuYFDlagBvcgJAKFuxWx9W9twMjtcOOtKDdYDAbHQPuzWqx2_utyIysyhHWx2sDuf62gbVtLIZqA4VAyfCMlP8YGUrey3UzBMj4Oz1EVCQWdW2crDQA6wQQ0xgA_Tw" />
        </div>

        <div className="z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-on-primary-container/20 md:bg-surface-container-high text-on-primary-container md:text-text-primary text-xs font-semibold mb-3">
            <Clock className="w-4 h-4 mr-1.5" />
            Last 24 Hours
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold text-on-primary-container md:text-primary tracking-tight mb-2">
              Community Board <span className="md:text-[#6b38d4] hidden md:inline">(24h)</span>
            </h2>
            {/* Mobile Leaderboard Button */}
            <button 
              onClick={() => navigate('/leaderboard')}
              className="md:hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-on-primary-container/20 text-on-primary-container flex items-center justify-center hover:bg-on-primary-container/30 transition-colors active:scale-95 shadow-sm"
            >
              <Trophy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm md:text-lg text-on-primary-container/80 md:text-text-secondary max-w-2xl mt-1">
            A live feed of items found across campus within the last 24 hours. Let's help our neighbors reconnect with their lost belongings through the power of community!
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 z-10">
          <div className="flex items-center gap-2 bg-[#e1e0ff] px-5 py-2.5 rounded-full border border-primary/20 shadow-sm">
            <Zap className="w-5 h-5 text-primary fill-current" />
            <span className="font-semibold text-primary">24 Active Matches Found</span>
          </div>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-high text-primary hover:bg-primary/5 transition-all font-semibold border border-primary/20 shadow-sm"
          >
            <Trophy className="w-5 h-5" />
            <span>View Leaderboard</span>
          </button>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="bg-white/80 backdrop-blur-xl md:p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 md:shadow-sm md:border border-border-default">
        {/* Categories (Scrollable on mobile) */}
        <div className="w-full md:w-auto -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto hide-scrollbar flex gap-2 md:gap-3 flex-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary to-[#6b38d4] text-white hover:scale-105 active:scale-95'
                  : 'bg-surface-container-high text-text-secondary hover:text-primary hover:bg-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Dropdown */}
        <div className="w-full md:w-auto flex-1 md:max-w-xs md:ml-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
            <select className="w-full pl-10 pr-4 py-2.5 md:py-2 bg-surface-container-low border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary appearance-none cursor-pointer">
              <option>Recently Found</option>
              <option>Ending Soon</option>
              <option>Near Me</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── MOBILE: Vertical list cards ── */}
      <div className="md:hidden space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className={`group bg-white rounded-[20px] p-4 shadow-sm border transition-all duration-300 transform hover:-translate-y-0.5 ${
              item.isAIMatch ? 'border-2 border-info-ai/40 relative' : 'border-border-default'
            }`}
          >
            {item.isAIMatch && (
              <div className="absolute -top-3 left-4 px-3 py-0.5 bg-info-ai text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center shadow-sm z-10">
                <Zap className="w-3 h-3 mr-1 fill-current" /> Potential Match
              </div>
            )}
            <div className="flex justify-between items-start mb-3 mt-1">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-2xl bg-surface-container overflow-hidden flex-shrink-0">
                  <img src={item.img} alt={item.title} className={`w-full h-full ${item.imgContain ? 'object-contain p-2' : 'object-cover'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base leading-tight">{item.title}</h3>
                  <div className="flex items-center text-text-secondary mt-1">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="text-xs">{item.location}</span>
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center shrink-0 ml-2 ${
                item.timeLeftDanger ? 'bg-danger/10 text-danger' : 'bg-surface-container text-text-secondary'
              }`}>
                <Timer className="w-3.5 h-3.5 mr-1" />
                {item.timeLeft.replace(' left', '')}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(item.primaryAction.route)}
                className="flex-1 h-11 rounded-xl bg-surface-container-high text-primary font-bold text-sm hover:bg-primary/10 transition-colors active:scale-95"
              >
                {item.primaryAction.label}
              </button>
              <button
                onClick={() => handleAction(item.secondaryAction.route)}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95"
              >
                {item.secondaryAction.label}
              </button>
            </div>
          </div>
        ))}

        {/* Mobile Gamification Banner */}
        <div 
          onClick={() => navigate('/leaderboard')}
          className="mt-2 p-4 bg-[#f9f6ff] border border-[#d0bcff]/40 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-[#f0eaff] transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[#8455ef] flex items-center justify-center text-white flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#5516be]">Community Hero Goal</p>
            <p className="text-xs text-text-secondary mt-0.5">Identify 3 owners to earn 50 XP!</p>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-[#8455ef]/20 border-t-[#8455ef] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[#8455ef]">2/3</span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: 4-column Bento Grid ── */}
      <section className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
        {/* Real item cards */}
        {items.slice(0, 2).map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col border ${
              item.isAIMatch ? 'border-info-ai/30' : 'border-border-default/30'
            }`}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                alt={item.title}
                className={`w-full h-full transition-transform duration-500 ${
                  item.imgContain
                    ? 'object-contain p-8 group-hover:rotate-3 bg-surface-container-low'
                    : 'object-cover group-hover:scale-110'
                }`}
                src={item.img}
              />
              {/* Timer badge */}
              <div className={`absolute top-3 right-3 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm ${
                item.timeLeftDanger ? 'bg-danger/90' : 'bg-black/50'
              }`}>
                <Timer className="w-3.5 h-3.5" />
                {item.timeLeft}
              </div>
              {/* Location badge */}
              <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                Found @ {item.location}
              </div>
              {/* AI Match badge */}
              {item.isAIMatch && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-info-ai text-white text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> Potential Match
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-text-primary text-lg line-clamp-1">{item.title}</h3>
                <span className={`text-[10px] ${item.categoryColor} px-2 py-1 rounded font-bold uppercase tracking-wider`}>{item.category}</span>
              </div>
              <p className="text-xs text-text-secondary mb-4 line-clamp-2">{item.description}</p>
              <div className="mt-auto space-y-2">
                <button
                  onClick={() => handleAction(item.primaryAction.route)}
                  className="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm"
                >
                  {item.primaryAction.label}
                </button>
                <button
                  onClick={() => handleAction(item.secondaryAction.route)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold shadow-md active:scale-95 transition-all text-sm"
                >
                  {item.secondaryAction.label}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Skeleton loading cards */}
        {[
          { time: '21h 05m left', danger: false },
          { time: '02h 44m left', danger: true },
        ].map((skeleton, i) => (
          <div key={`skeleton-${i}`} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-border-default/30 flex flex-col">
            <div className="relative h-48 bg-surface-container animate-pulse flex items-center justify-center">
              <Image className="w-12 h-12 text-text-secondary opacity-20" />
              <div className={`absolute top-3 right-3 text-white text-xs font-bold px-3 py-1.5 rounded-full ${
                skeleton.danger ? 'bg-danger/90' : 'bg-black/50'
              }`}>
                {skeleton.time}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-surface-container rounded animate-pulse"></div>
              <div className="h-3 w-full bg-surface-container rounded animate-pulse"></div>
              <div className="h-3 w-4/5 bg-surface-container rounded animate-pulse"></div>
              <div className="pt-3 space-y-2">
                <div className="h-10 w-full bg-surface-container rounded-xl animate-pulse"></div>
                <div className="h-10 w-full bg-surface-container rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Desktop CTA Banner */}
      <section className="hidden md:flex mt-4 rounded-[32px] bg-gradient-to-br from-[#FB923C] to-[#F9BD22] p-10 items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Search className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-extrabold text-white mb-2">Can't find your item?</h3>
          <p className="text-lg text-white/90">Our AI matches found items with lost reports every hour. Post your missing item now!</p>
        </div>
        <button onClick={() => navigate('/report/lost')} className="relative z-10 bg-white text-[#FB923C] font-bold py-4 px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
          Report Now
        </button>
      </section>

    </div>
  );
};
