import React, { useState, useEffect } from 'react';
import { Zap, Timer, MapPin, Trophy, Image, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
  primaryAction?: { label: string; route?: string };
  secondaryAction?: { label: string; route?: string };
  finderId: string;
  finderName?: string;
  status?: string;
  lockedBy?: string | null;
  lockedUntil?: Date | string | null;
  adminResolved?: boolean;
  createdAt?: string;
}

const getCategoryColor = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('elect')) return 'bg-primary/10 text-primary';
  if (cat.includes('card') || cat.includes('id')) return 'bg-info-ai/10 text-info-ai';
  if (cat.includes('key')) return 'bg-warning/10 text-warning';
  if (cat.includes('fash') || cat.includes('cloth') || cat.includes('access')) return 'bg-success/10 text-success';
  return 'bg-secondary/10 text-secondary';
};

const calculateTimeLeft = (createdAtString: string) => {
  const createdAt = new Date(createdAtString);
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { timeLeft: '00h 00m left', isDanger: true };
  }
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  const pad = (num: number) => String(num).padStart(2, '0');
  return {
    timeLeft: `${pad(diffHrs)}h ${pad(diffMins)}m ${pad(diffSecs)}s left`,
    isDanger: diffHrs < 12,
    rawMs: diffMs
  };
};

const LiveTimer: React.FC<{ createdAt: string | undefined, defaultText: string, dangerFallback: boolean }> = ({ createdAt, defaultText, dangerFallback }) => {
  const [timeState, setTimeState] = useState(() => createdAt ? calculateTimeLeft(createdAt) : { timeLeft: defaultText, isDanger: dangerFallback, rawMs: 0 });

  useEffect(() => {
    if (!createdAt) return;
    const interval = setInterval(() => {
      setTimeState(calculateTimeLeft(createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <span className="whitespace-nowrap">{timeState.timeLeft}</span>
  );
};


export const CommunityBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || (user as any)?.id;
  const [viewMode, _setViewMode] = useState<'found' | 'lost'>('found');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [lostItems, setLostItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All Items', 'Electronics', 'Cards & IDs', 'Fashion', 'Keys'];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/found-items`);
        if (res.data && res.data.success) {
          const mapped = (res.data.items || [])
            .map((dbItem: any) => {
            const { timeLeft, isDanger } = calculateTimeLeft(dbItem.createdAt);
            return {
              id: dbItem._id,
              title: dbItem.itemName,
              category: dbItem.category,
              categoryColor: getCategoryColor(dbItem.category),
              description: dbItem.description,
              location: dbItem.locationFound,
              timeLeft,
              timeLeftDanger: isDanger,
              img: dbItem.images?.[0] || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600',
              imgContain: false,
              isAIMatch: false,
              finderId: dbItem.finder?._id || dbItem.finder,
              finderName: dbItem.finder?.name || 'Someone',
              lockedBy: dbItem.lockedBy,
              lockedUntil: dbItem.lockedUntil,
              adminResolved: dbItem.adminResolved,
              status: dbItem.status,
              createdAt: dbItem.createdAt,
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch community board items:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLostItems = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/lost-items`);
        if (res.data && res.data.success) {
          setLostItems(res.data.items || res.data.lostItems || []);
        }
      } catch (err) {
        console.error('Failed to fetch lost items:', err);
      }
    };

    fetchItems();
    fetchLostItems();
  }, []);

  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(API_BASE, {
      auth: { token }
    });

    socket.on('item_locked', (data: { itemId: string, lockedBy: string, lockedUntil: string }) => {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, lockedBy: data.lockedBy, lockedUntil: data.lockedUntil } 
          : item
      ));
    });

    socket.on('item_unlocked', (data: { itemId: string }) => {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, lockedBy: null, lockedUntil: null } 
          : item
      ));
    });

    socket.on('new_found_item', (dbItem: any) => {
      setItems(prev => {
        // Prevent duplicate items
        if (prev.some(item => item.id === dbItem._id)) return prev;
        
        const { timeLeft, isDanger } = calculateTimeLeft(dbItem.createdAt);
        const newItem = {
          id: dbItem._id,
          title: dbItem.itemName,
          category: dbItem.category,
          categoryColor: getCategoryColor(dbItem.category),
          description: dbItem.description,
          location: dbItem.locationFound,
          timeLeft,
          timeLeftDanger: isDanger,
          img: dbItem.images?.[0] || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600',
          imgContain: false,
          isAIMatch: false,
          finderId: dbItem.finder?._id || dbItem.finder,
          finderName: dbItem.finder?.name || 'Someone',
          lockedBy: dbItem.lockedBy,
          lockedUntil: dbItem.lockedUntil,
          adminResolved: dbItem.adminResolved,
          createdAt: dbItem.createdAt,
        };
        return [newItem, ...prev];
      });
    });

    socket.on('new_lost_item', (dbItem: any) => {
      setLostItems(prev => {
        if (prev.some(item => item._id === dbItem._id || item.id === dbItem._id)) return prev;
        return [dbItem, ...prev];
      });
    });

    socket.on('item_claimed', (data: { itemId: string }) => {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, status: 'claimed', lockedBy: null, lockedUntil: null } 
          : item
      ));
    });

    socket.on('item_resolved', (data: { itemId: string, adminResolved?: boolean }) => {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, status: 'resolved', adminResolved: data.adminResolved, lockedBy: null, lockedUntil: null } 
          : item
      ));
    });

    socket.on('lost_item_claimed', (data: { itemId: string }) => {
      setLostItems(prev => prev.map(item => 
        (item._id === data.itemId || item.id === data.itemId)
          ? { ...item, status: 'claimed' } 
          : item
      ));
    });

    socket.on('lost_item_resolved', (data: { itemId: string }) => {
      setLostItems(prev => prev.map(item => 
        (item._id === data.itemId || item.id === data.itemId)
          ? { ...item, status: 'resolved' } 
          : item
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleClaimClick = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${API_BASE}/api/found-items/${itemId}/lock`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        navigate(`/claim/${itemId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to lock item. It might be currently claimed by someone else.');
    }
  };

  const handleCancelClaim = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_BASE}/api/found-items/${itemId}/unlock`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowCancelModal(true);
    } catch (err) {
      console.error('Failed to unlock item', err);
      alert('Failed to cancel claim. Please try again.');
    }
  };

  const handleAction = (route?: string) => {
    if (route) navigate(route);
  };

  const filteredItems = items.filter(item => {
    // Only hide archived items (keep claimed and resolved ones visible)
    if (item.status === 'archived') {
      return false;
    }
    if (activeCategory === 'All Items') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const filteredLostItems = lostItems.filter(item => {
    // Hide the reporter's own lost item from the list
    const ownerId = item.owner?._id || item.owner;
    if (String(ownerId) === String(currentUserId)) return false;
    // Hide resolved/archived/claimed items
    if (item.status === 'resolved' || item.status === 'archived' || item.status === 'claimed') return false;
    if (activeCategory === 'All Items') return true;
    return (item.category || '').toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="flex flex-col pb-20 pt-4">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary-container to-secondary-container p-6 mb-8 shadow-2xl mx-4 md:mx-8">
        <div className="absolute -right-8 -bottom-8 opacity-20 w-48 h-48 blur-2xl bg-white rounded-full"></div>
        <div className="relative z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-[12px] font-bold mb-3 backdrop-blur-md">
            <Timer className="w-[14px] h-[14px] mr-1.5" />
            Active 24h
          </span>
          <h2 className="text-[28px] md:text-4xl font-bold text-white mb-1">Community Feed</h2>
          <p className="text-white/80 max-w-[240px] text-[14px]">Join the mission to reunite students with their gear.</p>
        </div>
        <button 
          onClick={() => navigate('/leaderboard')}
          className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <Trophy className="w-6 h-6" />
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8 overflow-x-auto hide-scrollbar flex gap-3 px-4 md:px-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-[16px] font-semibold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(99,102,241,0.4)]'
                : 'bg-white/5 text-text-secondary border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Unified Item Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 px-4 md:px-8">
        {viewMode === 'lost' ? (
          /* ── LOST ITEMS ── */
          loading ? (
            /* Skeleton loading cards */
            [...Array(4)].map((_, i) => (
              <div key={`lost-skeleton-${i}`} className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] overflow-hidden shadow-2xl border border-border-default flex flex-col animate-pulse">
                <div className="relative h-48 bg-surface-container flex items-center justify-center">
                  <Image className="w-8 h-8 text-text-secondary opacity-20" />
                </div>
                <div className="p-5 pt-2 space-y-3">
                  <div className="h-5 w-3/4 bg-surface-container rounded mt-4"></div>
                  <div className="h-3 w-1/2 bg-surface-container rounded"></div>
                  <div className="pt-3 h-12 w-full bg-surface-container rounded-xl"></div>
                </div>
              </div>
            ))
          ) : filteredLostItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-secondary font-semibold">
              No lost items reported yet.
            </div>
          ) : (
            filteredLostItems.map((item: any) => (
              <div
                key={item._id}
                onClick={() => navigate(`/item/${item._id}`)}
                className="group bg-surface-container-lowest dark:bg-surface-container rounded-[20px] overflow-hidden shadow-2xl border border-border-default hover:border-primary/50 transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&q=80&w=400'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest dark:from-surface-container via-transparent to-transparent"></div>
                  
                  {/* Status Pill */}
                  <div className="absolute top-4 right-4 bg-danger/90 text-white px-3 py-1.5 rounded-xl text-[13px] font-bold flex items-center shadow-lg backdrop-blur-md">
                    <span className="text-[11px] font-black uppercase tracking-widest">🚨 Lost</span>
                  </div>
                  
                  {/* Category Pill */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-primary/80 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">{item.category}</span>
                  </div>

                  {/* Claimed Stamp Overlay */}
                  {['claimed', 'resolved', 'approved'].includes(item.status) && (
                    <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-success text-white px-8 py-3 rounded-2xl font-black text-2xl shadow-2xl -rotate-12 border-4 border-success/50 backdrop-blur-md">
                        CLAIMED
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-5 pt-2 flex-1 flex flex-col relative z-10">
                  <h3 className="font-bold text-[22px] text-text-primary line-clamp-1 mb-1">{item.itemName}</h3>
                  <div className="flex items-center gap-1.5 text-text-secondary mb-4">
                    <MapPin className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="text-[14px] line-clamp-1">{item.lastSeenLocation || item.locationLost || 'Unknown location'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 p-2 bg-surface-container-low dark:bg-white/5 rounded-xl border border-border-default dark:border-white/10">
                    <img
                      src={item.owner?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                      alt={item.owner?.name}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                    <span className="text-xs font-semibold text-text-secondary">Lost by <strong className="text-text-primary">{item.owner?.name || 'Someone'}</strong></span>
                  </div>

                  <div className="mt-auto">
                    {item.status === 'claimed' || item.status === 'resolved' || item.status === 'approved' ? (
                      <div className="w-full h-12 rounded-xl bg-success/10 border border-success/50 text-success font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Resolved
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/report/found?lostItemId=${item._id}`); }}
                        className="w-full h-12 rounded-xl primary-gradient text-white font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        I Found This!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          /* ── FOUND ITEMS ── */
          loading ? (
            /* Skeleton loading cards */
            [...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] overflow-hidden shadow-2xl border border-border-default flex flex-col animate-pulse">
                <div className="relative h-48 bg-surface-container flex items-center justify-center">
                  <Image className="w-8 h-8 text-text-secondary opacity-20" />
                </div>
                <div className="p-5 pt-2 space-y-3">
                  <div className="h-5 w-3/4 bg-surface-container rounded mt-4"></div>
                  <div className="h-3 w-1/2 bg-surface-container rounded"></div>
                  <div className="pt-3 h-12 w-full bg-surface-container rounded-xl"></div>
                </div>
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-secondary font-semibold">
              No items found matching this category.
            </div>
          ) : (
            filteredItems.map(item => {
              const isResolved = item.status === 'resolved' || item.status === 'approved' || item.status === 'claimed';
              const isDisputed = item.status === 'disputed';
              const isLocked = item.lockedUntil && new Date(item.lockedUntil).getTime() > Date.now();
              const lockedByMe = item.lockedBy === currentUserId;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className={`group relative bg-surface-container-lowest dark:bg-surface-container rounded-[20px] overflow-hidden border shadow-2xl transition-all duration-300 flex flex-col cursor-pointer ${
                    item.isAIMatch ? 'border-info-ai/50 hover:border-info-ai' : 'border-border-default hover:border-primary/50'
                  }`}
                >
                  <div className={`relative h-48 w-full overflow-hidden ${isResolved ? 'opacity-80' : ''}`}>
                    <img
                      alt={item.title}
                      className={`w-full h-full transition-transform duration-700 ${
                        item.imgContain ? 'object-contain p-6 group-hover:scale-105' : 'object-cover group-hover:scale-105'
                      }`}
                      src={item.img}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest dark:from-surface-container via-transparent to-transparent"></div>
                    
                    {/* Timer Badge (Stitch Style) */}
                    <div className={`absolute top-4 right-4 text-white px-3 py-1.5 rounded-xl text-[13px] font-bold flex items-center shadow-lg backdrop-blur-md ${
                      item.timeLeftDanger ? 'bg-danger/90 status-badge-glow animate-pulse' : 'bg-black/70'
                    }`}>
                      <Timer className="w-[16px] h-[16px] mr-1" />
                      <LiveTimer createdAt={item.createdAt} defaultText={item.timeLeft} dangerFallback={item.timeLeftDanger} />
                    </div>
                    
                    {/* Category Pill */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-primary/80 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">{item.category}</span>
                    </div>

                    {/* AI Match Badge */}
                    {item.isAIMatch && (
                      <div className="absolute top-4 left-4 bg-info-ai text-white px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center shadow-md">
                        <Zap className="w-[14px] h-[14px] mr-1 fill-current" />
                        Potential Match
                      </div>
                    )}

                    {/* Claimed Stamp Overlay */}
                    {isResolved && (
                      <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-success text-white px-8 py-3 rounded-2xl font-black text-2xl shadow-2xl -rotate-12 border-4 border-success/50 backdrop-blur-md">
                          CLAIMED
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 pt-2 flex-1 flex flex-col ${isResolved ? 'opacity-80' : ''}`}>
                    <h3 className="font-bold text-[22px] text-text-primary line-clamp-1 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-text-secondary mb-3">
                      <MapPin className="w-[18px] h-[18px] flex-shrink-0" />
                      <span className="text-[14px] line-clamp-1">{item.location || 'Unknown location'}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2 bg-surface-container-low dark:bg-white/5 rounded-xl border border-border-default dark:border-white/10">
                      <User className="w-4 h-4 text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary">Found by <strong className="text-text-primary">@{item.finderName}</strong></span>
                    </div>

                    <div className="mt-auto">
                      {isDisputed ? (
                        <button disabled className="w-full h-12 rounded-xl bg-danger/10 border border-danger/50 text-danger font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
                          <AlertTriangle className="w-5 h-5" />
                          Conflict in Process
                        </button>
                      ) : isResolved ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/conflict/${item.id}`); }}
                          className="w-full h-12 rounded-xl bg-danger/10 border border-danger/50 text-danger font-bold flex items-center justify-center gap-2 hover:bg-danger hover:text-white transition-all active:scale-95"
                        >
                          <AlertTriangle className="w-5 h-5" />
                          Conflict This Claim
                        </button>
                      ) : isLocked && !lockedByMe ? (
                        <button disabled className="w-full h-12 rounded-xl bg-surface-container-low dark:bg-white/5 border border-border-default dark:border-white/10 text-text-secondary font-semibold">
                          In process...
                        </button>
                      ) : isLocked && lockedByMe ? (
                        <div className="flex gap-2 w-full">
                          <button onClick={(e) => handleCancelClaim(e, item.id)} className="flex-1 h-12 rounded-xl bg-danger/10 text-danger text-sm font-bold hover:bg-danger/20 transition-colors">
                            Cancel
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/claim/${item.id}`); }} className="flex-1 h-12 rounded-xl primary-gradient text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Reclaim
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(`/suggest/${item.id}`);
                            }}
                            className="flex-1 h-12 rounded-xl bg-surface-container-low dark:bg-white/5 border border-border-default dark:border-white/10 text-text-secondary dark:text-white font-semibold text-[16px] hover:bg-surface-container hover:dark:bg-white/10 transition-all hover:text-text-primary active:scale-95"
                          >
                            Suggest
                          </button>
                          <button
                            disabled={item.finderId === currentUserId}
                            onClick={(e) => handleClaimClick(e, item.id)}
                            className={`flex-1 h-12 rounded-xl font-semibold text-[16px] transition-all ${
                              item.finderId === currentUserId
                                ? 'bg-surface-container-low dark:bg-white/5 border border-border-default dark:border-white/10 text-text-secondary cursor-not-allowed'
                                : 'primary-gradient text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95'
                            }`}
                          >
                            Claim Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </section>

      {/* Reward CTA Banner */}
      <section className="mt-8 px-4 md:px-8">
        <div className="reward-gradient rounded-[40px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-orange-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12">
            <Zap className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 text-center md:text-left max-w-xl space-y-4">
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">Can't find your item?</h3>
            <p className="text-lg text-white/90 font-medium leading-relaxed">
              Our AI matches found items with lost reports every hour. Post your missing item and let the community help!
            </p>
          </div>
          <button 
            onClick={() => navigate('/report/lost')}
            className="relative z-10 bg-white text-orange-500 font-black py-5 px-10 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-3 shrink-0"
          >
            <AlertTriangle className="w-6 h-6" />
            Report Now
          </button>
        </div>
      </section>

      {/* Cancel Success Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Claim Canceled</h3>
            <p className="text-text-secondary text-sm mb-6">
              Your claim process has been canceled successfully. The item is now available for others to claim.
            </p>
            <button
              onClick={() => setShowCancelModal(false)}
              className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
