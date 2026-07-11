import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, Handshake, Verified, Shield, Zap, Compass, Heart, Lock, Calendar, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userId = user._id || (user as any).id;
        const res = await axios.get(`${API_BASE}/api/users/${userId}/reports`);
        if (res.data && res.data.success) {
          const losts = (res.data.lostItems || []).map((item: any) => ({
            ...item,
            historyType: 'lost',
            title: item.itemName,
            dateLabel: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            statusLabel: item.status === 'active' ? 'Reported Lost' : item.status,
          }));
          const founds = (res.data.foundItems || []).map((item: any) => ({
            ...item,
            historyType: 'found',
            title: item.itemName,
            dateLabel: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            statusLabel: item.status,
          }));
          const combined = [...losts, ...founds].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setHistory(combined);
        }
      } catch (err) {
        console.error('Failed to load profile reports', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [user]);

  const handleAction = (actionName: string) => {
    alert(`Action triggered: ${actionName}`);
  };

  const name = user?.name || 'Alex Rivers';
  const role = user?.role === 'admin' ? 'Campus Admin' : 'Student Helper';
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const badges = user?.badges || ['Newcomer'];
  const itemsReturned = user?.itemsReturned || 0;
  const profilePic = user?.profilePic || "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-8 shadow-sm relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md border border-border-default transition-colors duration-300">
          <div className="relative flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl rotate-3">
                <img 
                  className="w-full h-full object-cover" 
                  alt={`${name} Profile`}
                  src={profilePic} 
                />
              </div>
              {level >= 5 && (
                <div className="absolute -bottom-2 -right-2 bg-warning text-white p-2 rounded-xl shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-white" />
                  <span className="text-xs font-bold">TOP FINDER</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-primary">{name}</h1>
              <p className="text-text-secondary text-lg mt-1">{role} · Helper Level {level}</p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                {badges.map((badge: string, idx: number) => (
                  <span key={idx} className="px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary flex items-center justify-center">
                  {xp}<span className="ml-2 text-3xl">🏆</span>
                </div>
                <div className="text-sm font-bold text-text-secondary uppercase tracking-widest mt-1">Reputation</div>
              </div>
              <button 
                onClick={() => handleAction('Share Profile')}
                className="mt-2 bg-[#5b5fef] text-white px-6 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-md text-sm"
              >
                Share Profile
              </button>
            </div>
          </div>
        </div>        <div className="md:col-span-4 bg-gradient-to-br from-[#4143d5] to-[#6b38d4] rounded-3xl p-8 shadow-xl text-white flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles className="w-24 h-24" />
          </div>
          <div>
            <h3 className="text-xl opacity-90 font-semibold">Explorer Level</h3>
            <div className="text-5xl font-black mt-1">LVL {level}</div>
          </div>
          <div className="space-y-2 mt-8 z-10">
            <div className="flex justify-between text-sm font-bold">
              <span>PROGRESS TO LVL {level + 1}</span>
              <span>{xp % 100} / 100 XP</span>
            </div>
            <div className="w-full h-4 bg-surface-container-lowest dark:bg-surface-container/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-warning to-[#f9bd22] rounded-full" style={{ width: `${xp % 100}%` }}></div>
            </div>
            <p className="text-sm opacity-80 italic">"Earn {100 - (xp % 100)} more XP to reach level {level + 1}!"</p>
          </div>
        </div>
      </section>

      {/* Statistics & Badges Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quick Stats */}
        <div className="md:col-span-3 grid grid-rows-2 gap-6">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 shadow-sm border border-border-default flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <Handshake className="text-primary w-8 h-8 mb-2" />
            <div className="text-3xl font-bold text-text-primary">{itemsReturned}</div>
            <div className="text-sm text-text-secondary mt-1">Items Returned</div>
          </div>
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 shadow-sm border border-border-default flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
            <Verified className="text-[#6b38d4] w-8 h-8 mb-2" />
            <div className="text-3xl font-bold text-text-primary">100%</div>
            <div className="text-sm text-text-secondary mt-1">Honesty Score</div>
          </div>
        </div>

        {/* Badge Gallery */}
        <div className="md:col-span-9 bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-8 shadow-sm border border-border-default">
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
      <section className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl shadow-sm overflow-hidden border border-border-default">
        <div className="p-8 border-b border-border-default flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold">Item History</h2>
          <div className="flex bg-surface rounded-xl p-1 w-full md:w-auto overflow-x-auto">
            <button onClick={() => navigate('/history')} className="px-4 py-1 bg-surface-container-lowest dark:bg-surface-container shadow-sm rounded-lg text-sm font-bold text-primary whitespace-nowrap cursor-pointer hover:bg-surface-container transition-colors">All Activity</button>
          </div>
        </div>

        <div className="divide-y divide-border-default">
          {loading ? (
            <p className="p-8 text-center text-text-secondary">Loading history...</p>
          ) : history.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-text-secondary mx-auto mb-2" />
              <p className="font-semibold text-text-secondary">No items reported yet</p>
              <p className="text-sm text-text-secondary mt-1">Start by reporting lost or found items.</p>
            </div>
          ) : (
            history.map((item: any) => {
              const isLost = item.historyType === 'lost';
              const detailUrl = `/item/${item._id}`;
              return (
                <div key={item._id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-surface transition-colors">
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-surface-container-low flex items-center justify-center">
                    {item.images && item.images[0] ? (
                      <img className="w-full h-full object-cover" src={item.images[0]} alt={item.title} />
                    ) : (
                      <Package className="w-12 h-12 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isLost ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                        }`}>
                          {item.statusLabel}
                        </span>
                      </div>
                      <p className="text-text-secondary text-base mt-2">{item.description || 'No description provided.'}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <Calendar className="w-4 h-4 text-primary" /> {item.dateLabel}
                        </div>
                      </div>
                      <button onClick={() => navigate(detailUrl)} className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all group">
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
