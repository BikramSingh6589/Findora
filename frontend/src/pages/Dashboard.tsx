import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Package, Sparkles, Filter, Medal, Users, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        // Load AI Matches
        const matchesRes = await axios.get(`${API_BASE}/api/ai/matches`);
        if (matchesRes.data && matchesRes.data.success) {
          setMatches(matchesRes.data.matches || []);
        }

        // Load User Reports history
        const userId = user._id || (user as any).id;
        const reportsRes = await axios.get(`${API_BASE}/api/users/${userId}/reports`);
        if (reportsRes.data && reportsRes.data.success) {
          const losts = (reportsRes.data.lostItems || []).map((item: any) => ({
            ...item,
            historyType: 'lost',
            title: item.itemName,
            dateLabel: `Reported ${new Date(item.createdAt).toLocaleDateString()}`,
            statusLabel: item.status,
          }));
          const founds = (reportsRes.data.foundItems || []).map((item: any) => ({
            ...item,
            historyType: 'found',
            title: item.itemName,
            dateLabel: `Found ${new Date(item.createdAt).toLocaleDateString()}`,
            statusLabel: item.status,
          }));
          const combined = [...losts, ...founds].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setHistory(combined);
        }
      } catch (err) {
        console.error('Error loading dashboard details', err);
      }
    };
    loadDashboardData();
  }, [user]);

  const userName = user?.name || 'Explorer';
  const userXP = user?.xp || 0;
  const userLevel = user?.level || 1;
  const xpNeeded = userLevel * 100; // e.g. level up milestones
  const xpPercent = Math.min(Math.round((userXP / xpNeeded) * 100), 100);

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting & Level Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface-container-lowest dark:bg-surface-container md:p-8 p-6 rounded-[20px] shadow-sm relative overflow-hidden border border-border-default transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover" alt="background pattern" />
        </div>
        <div className="absolute right-0 top-0 -z-10 opacity-20 w-32 h-32 overflow-hidden md:hidden">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover rounded-bl-full" alt="background pattern" />
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl hidden md:block"></div>

        <div className="z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Welcome, {userName} 👋</h1>
          <p className="text-sm md:text-lg text-text-secondary mt-1 md:mt-2">Campus helper</p>
        </div>

        {/* XP Progress Card */}
        <div className="w-full md:w-80 z-10 bg-surface-container-lowest/70 dark:bg-surface-container/70 backdrop-blur-md md:bg-transparent md:backdrop-blur-none rounded-2xl md:p-0 p-4 shadow-lg md:shadow-none border md:border-none border-white/20 dark:border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <Medal className="w-5 h-5 text-[#f9bd22]" />
              <span className="font-semibold text-text-primary md:text-primary text-sm md:text-base">Level {userLevel} Explorer</span>
            </div>
            <span className="text-sm font-semibold text-primary">{userXP} / {xpNeeded} XP</span>
          </div>
          <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden mb-1">
            <div className="h-full bg-gradient-to-r from-[#F9BD22] to-[#FB923C] rounded-full shadow-[0_0_10px_rgba(249,189,34,0.4)]" style={{ width: `${xpPercent}%` }}></div>
          </div>
          <p className="text-xs text-text-secondary italic md:hidden">{xpNeeded - userXP} XP until your next badge!</p>
        </div>
      </section>

      {/* Debug Actions (Temporary) */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/chats')}
          className="w-full p-4 bg-primary/10 border border-primary text-primary rounded-[20px] flex flex-col items-center justify-center gap-2 hover:bg-primary/20 transition-all font-semibold text-sm"
        >
          Chat Window
        </button>
      </div>

      {/* Quick Actions (Bento Grid on Mobile) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary hidden md:block">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <div
            onClick={() => navigate('/report/lost')}
            className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-2 md:gap-6 p-4 md:p-6 bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer border border-border-default group"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full md:rounded-2xl bg-danger/10 text-danger flex items-center justify-center group-hover:bg-danger group-hover:text-white transition-colors">
              <FileSearch className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-sm md:text-xl font-bold text-text-primary">Report Lost</h3>
              <p className="text-xs md:text-sm text-text-secondary hidden md:block">AI will start searching immediately</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/report/found')}
            className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-2 md:gap-6 p-4 md:p-6 bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer border border-border-default group"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full md:rounded-2xl bg-success/10 text-success flex items-center justify-center group-hover:bg-success group-hover:text-white transition-colors">
              <Package className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-sm md:text-xl font-bold text-text-primary">Report Found</h3>
              <p className="text-xs md:text-sm text-text-secondary hidden md:block">Earn XP and help a fellow student</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/community')}
            className="col-span-2 md:col-span-1 flex flex-row items-center justify-center md:justify-start gap-4 md:gap-6 p-4 md:p-6 bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer border border-border-default group"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full md:rounded-2xl bg-info-ai/10 text-info-ai flex items-center justify-center group-hover:bg-info-ai group-hover:text-white transition-colors">
              <Users className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-sm md:text-xl font-bold text-text-primary">Community Board</h3>
              <p className="text-xs md:text-sm text-text-secondary hidden md:block">See what others are looking for</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: AI Matches & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* AI Matches Section */}
        <section className="xl:col-span-2 flex flex-col gap-6 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-info-ai fill-current" />
              AI Matches
              <span className="ml-2">✨</span>
            </h3>
            <button className="text-primary font-semibold hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.length === 0 ? (
              <div className="md:col-span-2 p-8 bg-surface-container-lowest dark:bg-surface-container rounded-[20px] text-center border border-border-default">
                <AlertCircle className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                <p className="font-semibold text-text-secondary">No AI matches found yet</p>
                <p className="text-xs text-text-secondary mt-1">Report a lost or found item to see matches instantly.</p>
              </div>
            ) : (
              matches.slice(0, 4).map((match: any) => {
                const isLostSource = match.lostItem?.owner === (user?._id || (user as any)?.id);
                const matchItem = isLostSource ? match.foundItem : match.lostItem;
                if (!matchItem) return null;
                const matchPercent = match.score;
                return (
                  <div key={match._id} className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[20px] shadow-sm border border-border-default border-l-4 border-l-info-ai flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-4 right-4 bg-info-ai/10 text-info-ai font-bold px-2 py-1 rounded-full text-xs">
                      {matchPercent}% Match
                    </div>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center shrink-0">
                        {matchItem.images && matchItem.images[0] ? (
                          <img src={matchItem.images[0]} alt={matchItem.itemName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-text-secondary" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-lg font-bold text-text-primary truncate max-w-[150px]">{matchItem.itemName}</h4>
                        <p className="text-sm text-text-secondary truncate max-w-[150px]">
                          {matchItem.locationLost || matchItem.locationFound || 'Campus'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="flex-1 py-2 bg-info-ai text-white rounded-xl font-semibold hover:brightness-105 transition-all text-xs"
                        onClick={() => navigate(`/item/${matchItem._id || matchItem.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Live Map View */}
          <div className="h-64 rounded-[20px] overflow-hidden relative shadow-sm border border-border-default">
            <div className="bg-cover bg-center w-full h-full bg-surface-variant flex items-center justify-center">
              {/* Map Placeholder */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div className="text-white">
                <h4 className="text-xl font-bold">Live Map View</h4>
                <p className="text-sm opacity-90">3 new items found in your vicinity today</p>
              </div>
            </div>
          </div>
        </section>

        {/* My History / Recent Activity */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-text-primary">My History</h3>
            <button className="text-text-secondary hover:text-primary">
              <Filter className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {history.length === 0 ? (
              <div className="p-6 bg-surface-container-lowest dark:bg-surface-container rounded-xl text-center border border-border-default">
                <Clock className="w-6 h-6 text-text-secondary mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-secondary">No history found</p>
                <p className="text-xs text-text-secondary mt-1">Items you report will appear here.</p>
              </div>
            ) : (
              history.slice(0, 3).map((item: any) => {
                const isLost = item.historyType === 'lost';
                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/item/${item._id}`)}
                    className="bg-surface-container-lowest dark:bg-surface-container p-4 rounded-xl shadow-sm flex items-center gap-4 border border-border-default hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-surface flex items-center justify-center ${isLost ? 'text-danger' : 'text-success'}`}>
                      {isLost ? <FileSearch className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div className="grow truncate">
                      <h4 className="font-semibold text-text-primary truncate">{item.title}</h4>
                      <p className="text-xs text-text-secondary">{item.dateLabel}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${item.statusLabel === 'active' ? 'bg-primary/10 text-primary' :
                      item.statusLabel === 'claimed' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>
                      {item.statusLabel}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Achievement Card */}
          <div className="mt-4 bg-[#ffdf9f] p-6 rounded-[20px] flex flex-col gap-2 relative overflow-hidden group">
            <Medal className="absolute -bottom-4 -right-4 w-32 h-32 text-[#5c4300]/10 group-hover:rotate-12 transition-transform duration-500" />
            <h4 className="font-semibold text-[#5c4300]">Upcoming Milestone</h4>
            <p className="text-sm text-[#5c4300]/80 relative z-10">Return 1 more item to unlock the 'Guardian of the Quad' badge!</p>
            <div className="mt-2 relative z-10">
              <div className="w-full h-2 bg-[#5c4300]/10 rounded-full">
                <div className="w-4/5 h-full bg-[#5c4300] rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
