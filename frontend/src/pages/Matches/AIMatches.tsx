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
          // Filter out dismissed matches
          const activeMatches = (res.data.matches || []).filter((m: any) => m.status !== 'dismissed');
          setMatches(activeMatches);
        }
      } catch (err) {
        console.error('Error fetching item matches', err);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchItemMatches();
  }, [selectedItemId]);

  const dismissMatch = async (matchId: string) => {
    try {
      await axios.put(`${API_BASE}/api/ai/matches/${matchId}/status`, { status: 'dismissed' });
      setMatches(prev => prev.filter(m => m._id !== matchId));
    } catch (err) {
      console.error('Error dismissing match', err);
    }
  };

  const handleChatWithOwner = async (match: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/api/claims`, {
        foundItemId: match.foundItem._id || match.foundItem.id,
        lostItemId: match.lostItem._id || match.lostItem.id,
        answers: {
          location: match.foundItem.locationFound || '',
          dateDetails: '',
          colorMatch: 'yes',
          specialMarks: ''
        }
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.success && res.data.claim) {
        const claimId = res.data.claim._id || res.data.claim.id;
        navigate(`/chat/finder/${claimId}`);
      }
    } catch (err) {
      console.error('Failed to initiate chat with owner', err);
      alert('Failed to start chat with the owner.');
    }
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return { text: 'Strong Match', color: 'text-success border-success/30 bg-success/10' };
    if (score >= 60) return { text: 'Possible Match', color: 'text-warning border-warning/30 bg-warning/10' };
    return { text: 'Weak Match', color: 'text-danger border-danger/30 bg-danger/10' };
  };

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
          <span className="font-bold text-sm">{matches.length} Matches Found</span>
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
          ) : activeItem && activeItem.aiData && !activeItem.aiData.processed ? (
            <div className="p-12 text-center bg-surface-container-lowest dark:bg-surface-container rounded-[32px] border border-border-default flex flex-col items-center justify-center gap-4 shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              <h3 className="text-lg font-bold text-text-primary">AI is analyzing...</h3>
              <p className="text-sm text-text-secondary max-w-sm">We are analyzing your item's parameters to generate smart matches.</p>
              <div className="flex flex-wrap gap-4 justify-center text-xs font-semibold text-text-secondary mt-2 bg-surface-container-low px-4 py-2 rounded-full border border-border-default">
                <span className="flex items-center gap-1 text-success">✓ Description</span>
                <span className="flex items-center gap-1 text-success">✓ Images</span>
                <span className="flex items-center gap-1 text-success">✓ Receipts</span>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest dark:bg-surface-container rounded-[32px] border border-border-default shadow-sm">
              <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-text-primary">AI is still searching</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                No similar item found yet.
                <br />
                You will be notified automatically.
              </p>
            </div>
          ) : (
            matches.map((match: any) => {
              const matchItem = isSelectedLost ? match.foundItem : match.lostItem;
              if (!matchItem) return null;
              
              const yourImg = activeItem?.images?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
              const foundImg = matchItem.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80';

              const breakdown = match.breakdown || {
                objectScore: 0,
                brandScore: 0,
                colorScore: 0,
                semanticScore: 0,
                ocrScore: 0,
                imageScore: 0
              };

              const missingEvidence = match.missingEvidence || [];

              const breakdownItems = [
                { label: 'Object Match', value: breakdown.objectScore ?? 0, max: 30, color: 'bg-success', isAvailable: true },
                { label: 'Brand Match', value: breakdown.brandScore ?? 0, max: 15, color: 'bg-primary', isAvailable: true },
                { label: 'Color Match', value: breakdown.colorScore ?? 0, max: 10, color: 'bg-warning', isAvailable: true },
                { label: 'Description (Semantic)', value: breakdown.semanticScore ?? 0, max: 20, color: 'bg-info-ai', isAvailable: true },
                { label: 'Image Match', value: breakdown.imageScore ?? 0, max: 15, color: 'bg-danger', isAvailable: !missingEvidence.includes('Image not available') && !missingEvidence.includes('Image verification unavailable') },
                { label: 'Receipt Match (OCR)', value: breakdown.ocrScore ?? 0, max: 10, color: 'bg-[#8455ef]', isAvailable: !missingEvidence.includes('Receipt not available') && !missingEvidence.includes('No receipt or text image uploaded') && !missingEvidence.includes('No matching identifier found') }
              ];

              const conf = getConfidenceLevel(match.score);

              return (
                <div key={match._id} className="bg-surface-container-lowest dark:bg-surface-container rounded-[32px] p-6 shadow-sm border border-border-default hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  
                  {/* AI Badge */}
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-bold ${conf.color}`}>
                      <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                      {conf.text} ({match.score}%)
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
                      
                      {/* Score Breakdown Card */}
                      <div className="p-4 bg-surface-container-low rounded-2xl space-y-3">
                        <h4 className="font-bold text-xs text-text-primary mb-1">Match Score Breakdown</h4>
                        {breakdownItems.map(s => {
                          const percent = s.isAvailable ? (s.max > 0 ? Math.round((s.value / s.max) * 100) : 0) : 0;
                          return (
                            <div key={s.label}>
                              <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-text-secondary font-medium">{s.label}</span>
                                <span className={`font-bold ${s.isAvailable ? s.color.replace('bg-', 'text-') : 'text-text-secondary'}`}>
                                  {s.isAvailable ? `${s.value}/${s.max}` : 'Not available'}
                                </span>
                              </div>
                              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${s.isAvailable ? s.color : 'bg-border-default/40'} rounded-full transition-all duration-700`} style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
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

                        {/* AI Explanation Section */}
                        {match.matchedFields && match.matchedFields.length > 0 && (
                          <div className="p-4 bg-surface-container-low rounded-2xl mt-4">
                            <h4 className="font-bold text-xs text-text-primary mb-2">Why AI Matched</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {match.matchedFields.map((field: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-text-secondary">
                                  <span className="text-success font-bold">✓</span>
                                  <span>{field}</span>
                                </div>
                              ))}
                            </div>
                            {match.aiReason && (
                              <p className="text-xs text-text-secondary italic mt-3 border-t border-border-default pt-2">
                                "{match.aiReason}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Missing Evidence Section */}
                        {missingEvidence && missingEvidence.length > 0 && (
                          <div className="p-4 bg-warning/5 rounded-2xl mt-3 border border-warning/15">
                            <h4 className="font-bold text-xs text-warning mb-2">Missing Evidence</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {missingEvidence.map((ev: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-warning font-medium">
                                  <span>⚠</span>
                                  <span>{ev}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Match Warnings & Conflicts Section */}
                        {match.negativeSignals && match.negativeSignals.length > 0 && (
                          <div className="p-4 bg-danger/5 rounded-2xl mt-3 border border-danger/15">
                            <h4 className="font-bold text-xs text-danger mb-2">Match Warnings & Conflicts</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {match.negativeSignals.map((sig: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-danger font-semibold">
                                  <span>⚠</span>
                                  <span>{sig}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-border-default mt-4">
                        {isSelectedLost ? (
                          <button
                            onClick={() => navigate(`/claim/${matchItem._id || matchItem.id}`)}
                            className="flex-grow flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            This is my item
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChatWithOwner(match)}
                            className="flex-grow flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat with Owner
                          </button>
                        )}
                        <button
                          onClick={() => dismissMatch(match._id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-default text-text-secondary font-bold rounded-2xl hover:bg-surface-container transition-all text-sm"
                        >
                          <X className="w-4 h-4" />
                          Not my item
                        </button>
                        <button
                          onClick={() => navigate(`/item/${matchItem._id || matchItem.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-default text-primary font-bold rounded-2xl hover:bg-surface-container transition-all text-sm"
                        >
                          <Info className="w-4 h-4" />
                          View details
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
                    { value: 'Category', label: 'Weight: 15%' },
                    { value: 'Brand', label: 'Weight: 15%' },
                    { value: 'Color', label: 'Weight: 10%' },
                    { value: 'Semantic', label: 'Weight: 20%' },
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
