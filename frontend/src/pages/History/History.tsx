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
    
    // Status text mapping
    let statusText = '';
    let statusColor = '';
    let StatusIcon = HistoryIcon;
    
    if (isClaim) {
      if (item.status === 'pending') {
        statusText = 'Pending Verification';
        statusColor = 'text-warning bg-warning/10';
        StatusIcon = Info;
      } else if (item.status === 'approved' || item.status === 'resolved') {
        statusText = 'Claim Approved';
        statusColor = 'text-success bg-success/10';
        StatusIcon = CheckCircle;
      } else if (item.type === 'conflict') {
        statusText = 'Conflict Identified';
        statusColor = 'text-danger bg-danger/10';
        StatusIcon = ShieldAlert;
      } else {
        statusText = item.status;
        statusColor = 'text-text-secondary bg-surface-container';
      }
    } else {
      if (item.status === 'resolved') {
        statusText = 'Returned';
        statusColor = 'text-success bg-success/10';
        StatusIcon = CheckCircle;
      } else if (item.status === 'active' && item.aiMatchScore > 80) {
        statusText = 'AI Match Found';
        statusColor = 'text-info-ai bg-info-ai/10';
        StatusIcon = Bot;
      } else {
        statusText = item.status === 'active' ? 'Active' : item.status;
        statusColor = 'text-text-secondary bg-surface-container';
      }
    }

    return (
      <div key={item._id} onClick={() => navigate(`/item/${targetItem?._id}`)} className={`p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 md:col-span-1 cursor-pointer flex flex-col justify-between ${item.type === 'conflict' ? 'bg-white border-danger/20' : 'bg-card-bg'}`}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColor}`}>
              <StatusIcon className="w-4 h-4" /> {statusText}
            </span>
            <span className="text-xs text-text-secondary">{item.date.toLocaleDateString()}</span>
          </div>
          
          <div className="flex gap-4 mb-6">
            <div 
              className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 border border-border-default"
              style={{ backgroundImage: `url(${targetItem?.images?.[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400'})` }}
            />
            <div>
              <h3 className="font-semibold text-lg text-text-primary line-clamp-1">{targetItem?.itemName || 'Unknown Item'}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                {isClaim ? 'Claim placed for found item' : (item.type === 'lost' ? `Lost at ${item.locationLost}` : `Found at ${item.locationFound}`)}
              </p>
            </div>
          </div>
        </div>

        {isClaim && item.status === 'pending' && (
          <div className="p-3 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
              <Info className="w-4 h-4" /> Admin is reviewing your proof
            </div>
            <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
              <div className="bg-warning w-3/4 h-full rounded-full"></div>
            </div>
          </div>
        )}
        
        {item.type === 'conflict' && (
          <button className="w-full py-2.5 mt-2 border border-danger text-danger rounded-xl text-sm font-semibold hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-2">
             Contact Support
          </button>
        )}
        
        {!isClaim && item.type !== 'conflict' && (
           <div className="mt-auto flex items-center justify-end">
             <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline decoration-2 underline-offset-4">
               View Details <ChevronRight className="w-4 h-4" />
             </button>
           </div>
        )}
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
              className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/25 scale-105' 
                  : 'bg-surface-container-highest text-text-primary hover:bg-surface-variant hover:scale-[1.03]'
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
