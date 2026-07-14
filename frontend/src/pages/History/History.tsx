import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronRight, Info, CheckCircle, Bot, History as HistoryIcon, Bell, ArrowLeft, ShieldAlert } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type Tab = 'all' | 'lost' | 'found' | 'claims' | 'conflicts';

export const History: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [historyData, setHistoryData] = useState<{ lostItems: any[], foundItems: any[], claims: any[] }>({
    lostItems: [],
    foundItems: [],
    claims: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/users/me/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          setHistoryData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch user history', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const allActivity = useMemo(() => {
    const all = [
      ...(historyData?.lostItems || []).map(item => ({ ...item, type: 'lost', date: new Date(item.createdAt || Date.now()) })),
      ...(historyData?.foundItems || []).map(item => ({ ...item, type: 'found', date: new Date(item.createdAt || Date.now()) })),
      ...(historyData?.claims || []).map(claim => ({ ...claim, type: claim.isConflictClaim ? 'conflict' : 'claim', date: new Date(claim.createdAt || Date.now()) }))
    ];
    return all.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [historyData]);

  const filteredActivity = useMemo(() => {
    switch (activeTab) {
      case 'lost': return allActivity.filter(i => i.type === 'lost');
      case 'found': return allActivity.filter(i => i.type === 'found');
      case 'claims': return allActivity.filter(i => i.type === 'claim');
      case 'conflicts': return allActivity.filter(i => i.type === 'conflict');
      default: return allActivity;
    }
  }, [activeTab, allActivity]);

  const renderCard = (item: any) => {
    const isClaim = item.type === 'claim' || item.type === 'conflict';
    const targetItem = isClaim ? item.foundItemId : item;
    
    // 1. Conflict Card
    if (item.type === 'conflict') {
      return (
        <div key={item._id} onClick={() => navigate(`/item/${targetItem?._id}`)} className="bg-white p-6 rounded-2xl border border-danger/20 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="px-4 py-1 bg-danger/10 text-danger rounded-full text-sm font-semibold">Conflict Identified</span>
              <span className="text-sm text-text-secondary">{item.date.toLocaleDateString()}</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-1">{targetItem?.itemName || 'Unknown Item'}</h3>
            <p className="text-base text-text-secondary mb-6 line-clamp-2">Multiple students have claimed this item. Professional mediation required.</p>
          </div>
          <button className="w-full py-2.5 border-2 border-danger text-danger rounded-xl font-semibold hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Contact Support
          </button>
        </div>
      );
    }

    // 2. Pending Claim Card
    if (isClaim && item.status === 'pending') {
      return (
        <div key={item._id} onClick={() => navigate(`/item/${targetItem?._id}`)} className="bg-card-bg p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="px-4 py-1 bg-warning/10 text-warning rounded-full text-sm font-semibold">Pending Verification</span>
              <span className="text-sm text-text-secondary">{item.date.toLocaleDateString()}</span>
            </div>
            <div className="flex gap-4 mb-6">
              <div 
                className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url(${targetItem?.images?.[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400'})` }}
              />
              <div>
                <h3 className="text-lg font-semibold text-text-primary line-clamp-1">{targetItem?.itemName || 'Unknown Item'}</h3>
                <p className="text-sm text-text-secondary italic line-clamp-2 mt-1">Claim placed for found item</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl mb-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
              <Info className="w-4 h-4" /> Admin is reviewing your proof
            </div>
            <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
              <div className="bg-warning w-3/4 h-full rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    // 3. AI Match Card
    if (!isClaim && item.status === 'active' && item.aiMatchScore > 80) {
      return (
        <div key={item._id} onClick={() => navigate(`/item/${targetItem?._id}`)} className="relative p-6 rounded-2xl bg-white border-2 border-info-ai/30 shadow-lg shadow-info-ai/5 hover:scale-[1.02] cursor-pointer transition-all duration-300 md:col-span-1 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 bg-info-ai/10 rounded-bl-2xl">
            <Bot className="text-info-ai w-6 h-6" />
          </div>
          <div>
            <div className="mb-4">
              <span className="px-4 py-1 bg-info-ai/10 text-info-ai rounded-full text-sm font-semibold animate-pulse">AI Match Found</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2 line-clamp-1">{targetItem?.itemName || 'Unknown Item'}</h3>
            <p className="text-base text-text-secondary mb-6">A high match was found for your report!</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-info-ai text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-info-ai/30 transition-all">It's Mine!</button>
            <button className="px-4 py-2 border border-border-default text-text-secondary rounded-xl hover:bg-surface-container transition-all">Not it</button>
          </div>
        </div>
      );
    }

    // 4. Default / Success Card
    const isReturned = item.status === 'resolved' || item.status === 'approved';
    const statusText = isReturned ? 'Returned' : (item.status === 'active' ? 'Active' : item.status);
    const statusColor = isReturned ? 'bg-success/10 text-success' : 'bg-surface-container-highest text-text-primary';
    
    return (
      <div key={item._id} onClick={() => navigate(`/item/${targetItem?._id}`)} className={`p-6 rounded-2xl border ${isReturned ? 'border-success/30 bg-white/50 backdrop-blur-md' : 'border-border-default bg-card-bg'} shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 md:col-span-1 flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className={`px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusColor}`}>
              {isReturned ? <CheckCircle className="w-4 h-4" /> : <HistoryIcon className="w-4 h-4" />} {statusText}
            </span>
            <span className="text-sm text-text-secondary">{item.date.toLocaleDateString()}</span>
          </div>
          <div className="flex gap-4 mb-6">
            <div 
              className="w-24 h-24 rounded-xl bg-cover bg-center shrink-0 shadow-inner"
              style={{ backgroundImage: `url(${targetItem?.images?.[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400'})` }}
            />
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-semibold text-text-primary line-clamp-1">{targetItem?.itemName || 'Unknown Item'}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                {item.type === 'lost' ? `Lost at ${item.locationLost}` : `Found at ${item.locationFound}`}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between">
          {isReturned ? (
            <>
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-surface object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="User" />
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] text-on-primary font-bold border-2 border-surface">+1</div>
              </div>
              <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline decoration-2 underline-offset-4">
                View Case <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-end">
              <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline decoration-2 underline-offset-4">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col overflow-y-auto scroll-smooth w-full bg-surface">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center w-full px-4 md:px-8 py-4 border-b border-border-default">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold hidden md:inline">Dashboard</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <Bell className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
      </header>
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Heading & Motivation */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary">My History</h2>
          <p className="text-lg text-text-secondary mt-2">Track your heroic acts and lost treasures. We've got your back! 🚀</p>
        </div>

        {/* Tab-based Filtering */}
        <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-8 pb-2">
          {([
            { id: 'all', label: 'All Activity' },
            { id: 'lost', label: 'Lost Reports' },
            { id: 'found', label: 'Found Reports' },
            { id: 'claims', label: 'Claims' },
            { id: 'conflicts', label: 'Conflicts' }
          ] as const).map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/25 transition-transform active:scale-95' 
                  : 'bg-surface-container-highest text-text-primary hover:bg-surface-variant transition-all hover:scale-[1.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bento Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Gamification/XP Reward (Only show on 'all' tab as a special card) */}
          {activeTab === 'all' && (
            <div className="bg-gradient-to-br from-secondary to-primary p-6 rounded-2xl text-on-primary shadow-xl shadow-primary/20 md:col-span-1 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <span className="material-symbols-outlined font-bold">military_tech</span>
                  </div>
                  <span className="font-semibold text-sm">Community Hero</span>
                </div>
                <h3 className="text-3xl font-bold leading-tight">You've saved {user?.itemsReturned || 0} items!</h3>
                <p className="text-sm opacity-90 mt-2">Thanks for keeping the campus safe.</p>
              </div>
              <div className="mt-8">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span>Level {user?.level || 1} Student</span>
                  <span>{user?.xp || 0} XP</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-fixed rounded-full" style={{ width: `${Math.min(100, ((user?.xp || 0) % 500) / 5)}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
             <div className="col-span-full py-20 text-center text-text-secondary animate-pulse">Loading your history...</div>
          ) : filteredActivity.length > 0 ? (
             filteredActivity.map(item => renderCard(item))
          ) : (
             <div className="col-span-full py-20 text-center text-text-secondary">
               <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p className="font-semibold text-lg">No activity found</p>
               <p className="text-sm">You have no {activeTab !== 'all' ? activeTab : ''} history yet.</p>
             </div>
          )}
          
        </div>
      </div>
    </main>
  );
};
