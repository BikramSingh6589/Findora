import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        const matchesRes = await axios.get(`${API_BASE}/api/ai/matches`);
        if (matchesRes.data && matchesRes.data.success) {
          setMatches(matchesRes.data.matches || []);
        }

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
  const xpNeeded = userLevel * 100;
  const xpPercent = Math.min(Math.round((userXP / xpNeeded) * 100), 100);
  const returnsCount = history.filter(h => h.statusLabel === 'claimed' || h.statusLabel === 'resolved').length || 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-surface-container p-6 md:p-8 rounded-3xl md:rounded-[32px] shadow-lg shadow-primary/5 overflow-hidden border border-white dark:border-surface-variant">
        <div className="absolute inset-0 opacity-10 pointer-events-none doodle-bg dark:opacity-5">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLvT8lcDzJvC2ogQ7XNgLfkyRkKGNCnLZteUgreuhbMm6ZppI5K6dsuQ9LUdoVMF4Kln4uFJrW66hhSyYaH2O1kPSkUZvEsEV1Ve51pSrQmhVg4UVnjGKJ2cKnDW-7nApAT8MhZKGWC-0fq6rkvPstTfKvKW3VWDijdrLRMQxtNvZR2OdlOUKF_q8P8U85Fa3g0gf8YzO4xjctWbQsQNZVpECQnso171MCV6MG6SjZI8mBlm6Ba9ZDf90q0" alt="Doodle Background" />
        </div>
        <div className="absolute top-4 right-4 md:top-8 md:right-8 floating-sticker bg-secondary-fixed text-secondary px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs shadow-lg shadow-secondary/10 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm md:text-base">star</span>
          Level {userLevel} Explorer
        </div>
        <div className="relative z-10 max-w-2xl mt-4 md:mt-0">
          <h2 className="text-2xl md:text-4xl font-extrabold text-text-primary leading-tight">Welcome, {userName}! 👋</h2>
          <p className="text-sm md:text-lg text-text-secondary mt-3 font-medium">You've helped return {returnsCount} items this semester. You're a total campus hero!</p>
          <div className="mt-6 md:mt-8 w-full">
            <div className="flex justify-between items-end mb-3">
              <span className="font-bold text-sm md:text-base text-primary">Explorer Progress</span>
              <span className="font-bold text-xs md:text-sm text-text-secondary">{userXP} / {xpNeeded} XP</span>
            </div>
            <div className="w-full h-4 md:h-5 bg-primary-fixed/50 dark:bg-surface-container-high rounded-full p-1 border-2 border-white dark:border-surface-variant">
              <div className="h-full reward-gradient rounded-full shadow-[0_0_15px_rgba(249,189,34,0.3)] transition-all duration-1000" style={{ width: `${xpPercent}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Actions */}
      <section>
        <div onClick={() => navigate('/chats')} className="gen-z-card p-5 md:p-6 group cursor-pointer border border-white dark:border-surface-variant hover:border-info-ai/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#e1f5fe] dark:bg-info-ai/10 flex items-center justify-center text-[#0288d1] dark:text-info-ai group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl md:text-3xl">chat</span>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-text-primary">Message owners and finders</h3>
              <p className="text-xs md:text-sm text-text-secondary mt-0.5">Coordinate returns and say thanks!</p>
            </div>
          </div>
          <div className="flex items-center text-primary font-bold text-xs md:text-sm group-hover:translate-x-2 transition-transform whitespace-nowrap">
            Open Chats <span className="material-symbols-outlined ml-1 text-sm md:text-base">arrow_forward</span>
          </div>
        </div>
      </section>

      {/* Quick Actions Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div onClick={() => navigate('/report/lost')} className="gen-z-card p-6 md:p-10 group cursor-pointer border border-white dark:border-surface-variant hover:border-primary/50">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl md:text-4xl">find_in_page</span>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-text-primary">I Lost Something</h3>
              <p className="text-sm md:text-lg text-text-secondary mt-1">Our AI will track it down for you</p>
            </div>
          </div>
        </div>
        <div onClick={() => navigate('/report/found')} className="gen-z-card p-6 md:p-10 group cursor-pointer border border-white dark:border-surface-variant hover:border-secondary/50">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl md:text-4xl">inventory_2</span>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-text-primary">I Found Something</h3>
              <p className="text-sm md:text-lg text-text-secondary mt-1">Karma points + XP waiting for you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10 items-start">
        {/* AI Matches & Campus Insights */}
        <div className="xl:col-span-2 flex flex-col gap-8 md:gap-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 md:gap-4">
              <span className="material-symbols-outlined text-info-ai text-3xl md:text-4xl">auto_awesome</span>
              AI Super Matches
            </h3>
            <button className="text-primary font-bold text-sm md:text-lg hover:underline underline-offset-4">See All</button>
          </div>
          
          {/* Campus Insights Bubbly Viz */}
          <div className="gen-z-card p-6 md:p-8 border border-white dark:border-surface-variant">
            <h4 className="text-lg md:text-xl font-bold mb-6 md:mb-8 text-text-primary">Campus Insights ✨</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-primary-fixed/20 bubbly-stat dark:bg-primary/10">
                <span className="text-3xl md:text-4xl font-black text-primary">1,240</span>
                <span className="text-xs md:text-sm font-bold text-primary/70 uppercase mt-2">Total Returns</span>
              </div>
              <div className="md:col-span-2 bg-surface-container-low dark:bg-surface-container-high p-6 md:p-8 rounded-[32px] flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning shrink-0">
                      <span className="material-symbols-outlined text-xl">library_books</span>
                    </div>
                    <span className="font-bold text-text-primary truncate">Main Library</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-warning"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-warning opacity-50"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-warning opacity-20"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined text-xl">coffee</span>
                    </div>
                    <span className="font-bold text-text-primary truncate">Student Union</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-secondary"></div>
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-secondary opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards for Matches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {matches.length === 0 ? (
              <div className="md:col-span-2 gen-z-card p-8 border border-white dark:border-surface-variant text-center flex flex-col items-center justify-center min-h-[200px]">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4 opacity-50">search_off</span>
                <p className="font-semibold text-text-secondary text-lg">No AI matches yet</p>
                <p className="text-sm text-text-secondary/70 mt-1">Report an item to let our AI work its magic.</p>
              </div>
            ) : (
              matches.slice(0, 4).map((match: any) => {
                const isLostSource = match.lostItem?.owner === (user?._id || (user as any)?.id);
                const matchItem = isLostSource ? match.foundItem : match.lostItem;
                if (!matchItem) return null;
                const matchPercent = match.score;
                return (
                  <div key={match._id} onClick={() => navigate(`/item/${matchItem._id || matchItem.id}`)} className="gen-z-card p-6 md:p-8 border border-white dark:border-surface-variant flex flex-col gap-6 cursor-pointer hover:border-primary/50 group">
                    <div className="w-full h-40 md:h-48 rounded-2xl bg-surface-container-low dark:bg-surface-container-high overflow-hidden relative flex items-center justify-center">
                      <div className="absolute top-4 left-4 bg-primary text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg z-10">{matchPercent}% Match</div>
                      {matchItem.images && matchItem.images[0] ? (
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={matchItem.images[0]} alt={matchItem.itemName} />
                      ) : (
                        <span className="material-symbols-outlined text-6xl text-text-secondary/30">image</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-text-primary truncate">{matchItem.itemName}</h4>
                      <p className="text-sm text-text-secondary mt-1 md:mt-2 truncate">{matchItem.locationLost || matchItem.locationFound || 'Campus'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="flex flex-col gap-6 md:gap-8">
          <h3 className="text-xl md:text-2xl font-bold text-text-primary">Recent Vibe Check</h3>
          <div className="flex flex-col gap-4">
            {history.length === 0 ? (
              <div className="gen-z-card p-6 border border-white dark:border-surface-variant text-center">
                <span className="material-symbols-outlined text-2xl text-text-secondary mb-2 opacity-50">history</span>
                <p className="text-sm font-semibold text-text-secondary">No history found</p>
              </div>
            ) : (
              history.slice(0, 4).map((item: any) => {
                const isLost = item.historyType === 'lost';
                return (
                  <div key={item._id} onClick={() => navigate(`/item/${item._id}`)} className="gen-z-card p-4 md:p-6 border border-white dark:border-surface-variant flex items-center gap-3 md:gap-4 cursor-pointer hover:border-text-secondary/30">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${isLost ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      <span className="material-symbols-outlined text-2xl md:text-3xl">{isLost ? 'headphones' : 'water_drop'}</span>
                    </div>
                    <div className="grow min-w-0">
                      <h4 className="font-bold text-sm md:text-base text-text-primary truncate">{item.title}</h4>
                      <p className="text-xs md:text-sm text-text-secondary truncate">{item.statusLabel}</p>
                    </div>
                    <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full shrink-0 ${isLost ? 'bg-danger' : 'bg-success'}`}></span>
                  </div>
                );
              })
            )}
          </div>

          {/* Milestone Card */}
          <div className="mt-4 md:mt-8 indigo-purple-gradient p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white relative overflow-hidden group shadow-xl md:shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[120px] md:text-[180px] text-white/10 group-hover:rotate-12 transition-transform duration-700">stars</span>
            <p className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-white/70 mb-3 md:mb-4">Next Achievement</p>
            <h4 className="text-xl md:text-2xl font-black leading-tight">Guardian of the Quad</h4>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-white/80 font-medium">Just {Math.max(0, 10 - returnsCount)} more returns to unlock this legendary badge!</p>
            <div className="mt-6 md:mt-8 flex gap-2">
              <div className="h-1.5 grow bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((returnsCount / 10) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
