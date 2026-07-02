import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, MapPin, Tag, Info, CheckCircle2, X,
  Trophy, ChevronRight, Package, AlertCircle, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AIMatches: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myItems, setMyItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        setLoadingItems(true);
        const userId = user._id || (user as any).id;
        const res = await axios.get(`${API_BASE}/api/users/${userId}/reports`);
        if (res.data && res.data.success) {
          const losts = (res.data.lostItems || []).map((item: any) => ({ ...item, type: 'lost' }));
          const founds = (res.data.foundItems || []).map((item: any) => ({ ...item, type: 'found' }));
          const combined = [...losts, ...founds];
          setMyItems(combined);
          if (combined.length > 0) {
            setSelectedItemId(combined[0]._id || combined[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching user reports for matches', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchReports();
  }, [user]);

  useEffect(() => {
    const fetchItemMatches = async () => {
      if (!selectedItemId) return;
      try {
        setLoadingMatches(true);
        const res = await axios.get(`${API_BASE}/api/ai/matches/${selectedItemId}`);
        if (res.data && res.data.success) {
          setMatches(res.data.matches || []);
        }
      } catch (err) {
        console.error('Error fetching item matches', err);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchItemMatches();
  }, [selectedItemId]);

  const confidenceColor = (c: number) =>
    c >= 90 ? 'text-info-ai border-info-ai/30 bg-info-ai/10'
      : c >= 70 ? 'text-warning border-warning/30 bg-warning/10'
      : 'text-text-secondary border-border-default bg-surface-container-low';

  const visibleMatches = matches.filter(m => !dismissed.includes(m._id));
  const activeItem = myItems.find(i => (i._id || i.id) === selectedItemId);
  const isSelectedLost = activeItem?.type === 'lost';

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">AI Smart Matches</h1>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl">
            Our student-trained AI found potential matches for your reported items. Review the confidence scores and details below to resolve listings.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-info-ai/10 text-info-ai rounded-full border border-info-ai/20 self-start md:self-auto whitespace-nowrap">
          <Sparkles className="w-4 h-4 fill-current animate-pulse" />
          <span className="font-bold text-sm">{visibleMatches.length} Matches Found</span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Left Sidebar: Your Reported Items */}
        <aside className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">Your Reported Items</h3>
          {loadingItems ? (
            <p className="text-xs text-text-secondary">Loading items...</p>
          ) : myItems.length === 0 ? (
            <div className="p-4 bg-surface-container-low rounded-2xl text-center text-xs text-text-secondary border border-border-default">
              No items reported yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myItems.map(item => {
                const itemId = item._id || item.id;
                const isSelected = selectedItemId === itemId;
                const isLost = item.type === 'lost';
                return (
                  <button
                    key={itemId}
                    onClick={() => setSelectedItemId(itemId)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-surface-container-lowest dark:bg-surface-container border-2 border-primary shadow-md'
                        : 'bg-surface-container-lowest/60 dark:bg-surface-container/60 border-border-default hover:border-primary/40'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${!isSelected ? 'opacity-70' : ''}`}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low flex items-center justify-center">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.itemName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-text-secondary" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-extrabold uppercase px-1 py-0.5 rounded ${
                            isLost ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-text-primary truncate mt-1">{item.itemName}</p>
                        <p className="text-xs text-text-secondary">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown Date'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Help Card */}
          <div className="mt-6 p-5 bg-[#e9ddff] rounded-3xl border border-[#d0bcff]/30 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold text-sm text-[#23005c] mb-2">Need Help?</h4>
              <p className="text-xs text-[#5516be]/80 mb-4 leading-relaxed">Don't see your item? Try updating your report with more photos!</p>
              <button 
                onClick={() => navigate('/report')}
                className="text-[#5516be] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Update Report <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <Sparkles className="absolute -bottom-3 -right-3 w-20 h-20 text-[#5516be] opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </aside>

        {/* Match Results */}
        <section className="lg:col-span-9 space-y-6">
          {loadingMatches ? (
            <p className="text-center text-text-secondary py-12">Loading matching results...</p>
          ) : visibleMatches.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest dark:bg-surface-container rounded-[32px] border border-border-default">
              <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-text-primary">No Smart Matches</h3>
              <p className="text-sm text-text-secondary mt-1">Our AI is continuously parsing listings. We will alert you immediately once a match is registered.</p>
            </div>
          ) : (
            visibleMatches.map((match: any) => {
              const matchItem = isSelectedLost ? match.foundItem : match.lostItem;
              if (!matchItem) return null;
              
              const yourImg = activeItem?.images?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
              const foundImg = matchItem.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80';

              const matchScores = [
                { label: 'Category Match', value: activeItem?.category === matchItem.category ? 100 : 0, color: 'bg-success' },
                { label: 'Color Similarity', value: activeItem?.color?.toLowerCase() === matchItem.color?.toLowerCase() ? 100 : 0, color: 'bg-primary' },
                { label: 'AI Text Match Score', value: match.score, color: 'bg-info-ai' }
              ];

              return (
                <div key={match._id} className="bg-surface-container-lowest dark:bg-surface-container rounded-[32px] p-6 shadow-sm border border-border-default hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  
                  {/* AI Badge */}
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-bold ${confidenceColor(match.score)}`}>
                      <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                      {match.score}% Match
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                    {/* Visual Comparison */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3 h-48">
                        <div className="relative rounded-2xl overflow-hidden border border-border-default bg-surface-container-low flex items-center justify-center">
                          {activeItem?.images?.[0] ? (
                            <img src={yourImg} alt="Your Report" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-text-secondary" />
                          )}
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[9px] rounded font-bold uppercase">Your Report</div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden border-2 border-info-ai shadow-lg shadow-info-ai/20 bg-surface-container-low flex items-center justify-center">
                          {matchItem.images?.[0] ? (
                            <img src={foundImg} alt="Matching Item" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-text-secondary" />
                          )}
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-info-ai text-white text-[9px] rounded font-bold uppercase">
                            {isSelectedLost ? 'Found Item' : 'Lost Item'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Score Bars */}
                      <div className="p-4 bg-surface-container-low rounded-2xl space-y-3">
                        {matchScores.map(s => (
                          <div key={s.label}>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-text-secondary font-medium">{s.label}</span>
                              <span className={`font-bold ${s.color.replace('bg-', 'text-')}`}>{s.value}%</span>
                            </div>
                            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="md:col-span-7 flex flex-col">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded">
                            Verified Suggestion
                          </span>
                          <span className="text-text-secondary text-xs">
                            {new Date(matchItem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl text-text-primary mb-4">{matchItem.itemName}</h3>
                        <div className="space-y-2.5 mb-5">
                          <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-medium">
                              {isSelectedLost ? (matchItem.locationFound || 'Campus') : (matchItem.locationLost || 'Campus')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <Tag className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-medium">{matchItem.category}</span>
                          </div>
                          <div className="flex items-start gap-3 text-text-secondary text-sm">
                            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">{matchItem.description || 'No description available.'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-border-default">
                        {isSelectedLost ? (
                          <button
                            onClick={() => navigate(`/claim/${matchItem._id || matchItem.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            This is mine! (Claim)
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/chat/${matchItem._id || matchItem.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Chat with Owner
                          </button>
                        )}
                        <button
                          onClick={() => setDismissed(d => [...d, match._id])}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-border-default text-text-secondary font-bold rounded-2xl hover:bg-surface-container transition-all text-sm"
                        >
                          <X className="w-5 h-5" />
                          Not a match
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* AI Insights Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* How AI Works */}
            <div className="md:col-span-2 bg-gradient-to-br from-info-ai to-primary p-7 rounded-[32px] text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">How the AI Works</h3>
                <p className="text-white/90 text-sm max-w-lg mb-6 leading-relaxed">
                  Our custom text similarity model compares reported categories, colors, brands, and description strings to instantly output real-time match recommendations.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'Category', label: 'Weight: 20%' },
                    { value: 'Brand', label: 'Weight: 15%' },
                    { value: 'Color', label: 'Weight: 10%' },
                    { value: 'Text', label: 'Weight: 55%' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface-container-lowest/10 dark:bg-surface-container/10 backdrop-blur-md p-3 rounded-2xl text-center">
                      <p className="text-base font-bold">{stat.value}</p>
                      <p className="text-[9px] uppercase font-bold opacity-75 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div 
              onClick={() => navigate('/leaderboard')}
              className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[32px] shadow-sm border border-border-default flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="text-warning w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-text-primary mb-2">Verify & Win!</h4>
              <p className="text-xs text-text-secondary px-2 leading-relaxed">
                Helping others find their items earns you +50 XP and exclusive campus rewards.
              </p>
              <button className="mt-5 text-primary font-bold text-xs hover:underline">See Rewards</button>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};
