import React, { useState, useEffect } from 'react';
import { Search, Clock, Zap, Filter, Timer, MapPin, Trophy, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  status?: string;
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
  
  const pad = (num: number) => String(num).padStart(2, '0');
  return {
    timeLeft: `${pad(diffHrs)}h ${pad(diffMins)}m left`,
    isDanger: diffHrs < 12
  };
};

export const CommunityBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || (user as any)?.id;
  const [viewMode, setViewMode] = useState<'found' | 'lost'>('found');
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
          const mapped = (res.data.items || []).map((dbItem: any) => {
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
              status: dbItem.status || 'active',
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
  const handleAction = (route?: string) => {
    if (route) navigate(route);
  };

  const filteredItems = items.filter(item => {
    if (activeCategory === 'All Items') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const filteredLostItems = lostItems.filter(item => {
    // Hide the reporter's own lost item from the list
    const ownerId = item.owner?._id || item.owner;
    if (ownerId === currentUserId) return false;
    // Hide resolved/archived items — item has been found
    if (item.status === 'resolved' || item.status === 'archived') return false;
    if (activeCategory === 'All Items') return true;
    return (item.category || '').toLowerCase() === activeCategory.toLowerCase();
  });

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
      <section className="bg-surface-container-lowest dark:bg-surface-container/80 backdrop-blur-xl md:p-4 rounded-2xl flex flex-col gap-4 md:shadow-sm md:border border-border-default">

        {/* Found / Lost Toggle */}
        <div className="flex gap-2 p-1 bg-surface-container rounded-2xl w-full md:w-fit">
          <button
            onClick={() => setViewMode('found')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              viewMode === 'found'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:text-primary'
            }`}
          >
            🔍 Found Items
          </button>
          <button
            onClick={() => setViewMode('lost')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              viewMode === 'lost'
                ? 'bg-danger text-white shadow-md'
                : 'text-text-secondary hover:text-danger'
            }`}
          >
            🚨 Lost Items
            {filteredLostItems.length > 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                viewMode === 'lost' ? 'bg-white/20 text-white' : 'bg-danger/10 text-danger'
              }`}>{filteredLostItems.length}</span>
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
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
          {viewMode === 'found' && (
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
          )}
        </div>
      </section>

      {/* ── MOBILE: Vertical list cards ── */}
      <div className="md:hidden space-y-4">
        {viewMode === 'lost' ? (
          /* ── LOST ITEMS MOBILE ── */
          loading ? (
            [...Array(3)].map((_, i) => (
              <div key={`lost-skel-${i}`} className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-4 shadow-sm border border-border-default/30 animate-pulse flex gap-3">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-surface-container rounded"></div>
                  <div className="h-3 w-1/2 bg-surface-container-low rounded"></div>
                </div>
              </div>
            ))
          ) : filteredLostItems.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">No lost items reported yet.</div>
          ) : (
            filteredLostItems.map((item: any) => (
              <div
                key={item._id}
                className="group bg-danger/5 border-2 border-danger/20 rounded-[20px] p-4 shadow-sm transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container overflow-hidden flex-shrink-0">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&q=80&w=200'}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-danger bg-danger/10 px-2 py-0.5 rounded-full">🚨 LOST</span>
                      </div>
                      <h3 className="font-bold text-text-primary text-base leading-tight">{item.itemName}</h3>
                      <div className="flex items-center text-text-secondary mt-1">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-xs">{item.lastSeenLocation || item.locationLost || 'Unknown location'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] ${getCategoryColor(item.category || '')} px-2 py-1 rounded font-bold uppercase`}>{item.category}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={item.owner?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                    alt={item.owner?.name}
                    className="w-6 h-6 rounded-full object-cover border border-border-default"
                  />
                  <span className="text-xs text-text-secondary">Lost by <strong className="text-text-primary">{item.owner?.name || 'Someone'}</strong></span>
                </div>
                <button
                  onClick={() => navigate(`/report/found`)}
                  className="w-full h-11 rounded-xl bg-danger text-white font-bold text-sm hover:bg-danger/90 active:scale-95 transition-all"
                >
                  I Found This!
                </button>
              </div>
            ))
          )
        ) : null}
        {viewMode === 'found' ? (
          <>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={`skeleton-mob-${i}`} className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-4 shadow-sm border border-border-default/30 animate-pulse flex gap-3">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-surface-container rounded"></div>
                <div className="h-3 w-1/2 bg-surface-container-low rounded"></div>
              </div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-text-secondary">No items found.</div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/item/${item.id}`)}
              className={`cursor-pointer group bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-4 shadow-sm border transition-all duration-300 transform hover:-translate-y-0.5 ${
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(`/suggest/${item.id}`);
                  }}
                  className="flex-1 h-11 rounded-xl bg-surface-container-high text-primary font-bold text-sm hover:bg-primary/10 transition-colors active:scale-95"
                >
                  Suggest Owner
                </button>
                {item.status === 'claimed' || item.status === 'resolved' || item.status === 'approved' ? (
                  <div className="flex-1 flex flex-col items-center">
                    <button
                      disabled
                      className="w-full h-11 rounded-xl bg-text-secondary/20 text-text-secondary/50 cursor-not-allowed font-bold text-sm"
                    >
                      Claimed
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/conflict/${item.id}`);
                      }}
                      className="text-danger hover:underline text-xs font-bold text-center mt-1"
                    >
                      Conflict this claim
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={item.finderId === currentUserId}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(`/claim/${item.id}`);
                    }}
                    className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${
                      item.finderId === currentUserId
                        ? 'bg-text-secondary/20 text-text-secondary/50 cursor-not-allowed shadow-none'
                        : 'bg-primary text-white shadow-md hover:bg-primary/90 active:scale-95'
                    }`}
                  >
                    Claim Item
                  </button>
                )}
              </div>
            </div>
          ))
        )}

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
        </> ) : null}
      </div>

      {/* ── DESKTOP: 4-column Bento Grid ── */}
      <section className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
        {viewMode === 'lost' ? (
          /* ── LOST ITEMS DESKTOP ── */
          filteredLostItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-secondary">
              No lost items have been reported yet.
            </div>
          ) : (
            filteredLostItems.map((item: any) => (
              <div
                key={item._id}
                className="bg-danger/5 border-2 border-danger/20 rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-surface-container">
                  <img
                    alt={item.itemName}
                    className="w-full h-full object-cover"
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&q=80&w=400'}
                  />
                  <div className="absolute top-3 left-3 bg-danger/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                    🚨 LOST
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                    Last seen @ {item.lastSeenLocation || item.locationLost || 'Unknown'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-text-primary text-lg line-clamp-1">{item.itemName}</h3>
                    <span className={`text-[10px] ${getCategoryColor(item.category || '')} px-2 py-1 rounded font-bold uppercase tracking-wider`}>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={item.owner?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                      alt={item.owner?.name}
                      className="w-7 h-7 rounded-full object-cover border border-border-default"
                    />
                    <span className="text-xs text-text-secondary">Lost by <strong className="text-text-primary">{item.owner?.name || 'Someone'}</strong></span>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate('/report/found')}
                      className="w-full py-2.5 rounded-xl bg-danger text-white font-bold text-sm hover:bg-danger/90 active:scale-95 transition-all shadow-md"
                    >
                      I Found This!
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
        loading ? (
          /* Skeleton loading cards */
          [...Array(4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] overflow-hidden shadow-sm border border-border-default/30 flex flex-col animate-pulse">
              <div className="relative h-48 bg-surface-container flex items-center justify-center">
                <Image className="w-12 h-12 text-text-secondary opacity-20" />
              </div>
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-surface-container rounded"></div>
                <div className="h-3 w-full bg-surface-container rounded"></div>
                <div className="h-3 w-4/5 bg-surface-container rounded"></div>
                <div className="pt-3 space-y-2">
                  <div className="h-10 w-full bg-surface-container rounded-xl animate-pulse"></div>
                  <div className="h-10 w-full bg-surface-container rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary">
            No items found matching this category.
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/item/${item.id}`)}
              className={`cursor-pointer bg-surface-container-lowest dark:bg-surface-container rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col border ${
                item.isAIMatch ? 'border-info-ai/30' : 'border-border-default/30'
              }`}
            >
              <div className="relative h-48 overflow-hidden bg-surface-container">
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
                <div className="mt-auto space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(`/suggest/${item.id}`);
                    }}
                    className="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm"
                  >
                    Suggest Owner
                  </button>
                  {item.status === 'claimed' || item.status === 'resolved' || item.status === 'approved' ? (
                    <div className="flex flex-col items-center w-full">
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-text-secondary/20 text-text-secondary/50 cursor-not-allowed font-bold text-sm"
                      >
                        Claimed
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/conflict/${item.id}`);
                        }}
                        className="text-danger hover:underline text-xs font-bold text-center mt-1"
                      >
                        Conflict this claim
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={item.finderId === currentUserId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(`/claim/${item.id}`);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold transition-all text-sm ${
                        item.finderId === currentUserId
                          ? 'bg-text-secondary/20 text-text-secondary/50 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-primary to-[#6b38d4] text-white shadow-md active:scale-95'
                      }`}
                    >
                      Claim Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )
        )}
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
        <button onClick={() => navigate('/report/lost')} className="relative z-10 bg-surface-container-lowest dark:bg-surface-container text-[#FB923C] font-bold py-4 px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
          Report Now
        </button>
      </section>

    </div>
  );
};
