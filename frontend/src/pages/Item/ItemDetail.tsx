import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ItemDetail: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?._id || (user as any)?.id;

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [expandedMatches, setExpandedMatches] = useState<{[key: string]: boolean}>({});
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchItemMatches = async () => {
      if (!itemId || !user) return;
      try {
        setLoadingMatch(true);
        setMatchError(null);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/ai/matches/${itemId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data && res.data.success && res.data.matches) {
          const activeMatches = res.data.matches.filter((m: any) => m.status !== 'dismissed');
          const sortedMatches = [...activeMatches].sort((a: any, b: any) => b.score - a.score);
          setMatches(sortedMatches);
        } else {
          setMatches([]);
        }
      } catch (err: any) {
        console.error('Error fetching matches for details page', err);
        setMatchError(err.response?.data?.error || err.message || 'Failed to fetch AI matches');
        setMatches([]);
      } finally {
        setLoadingMatch(false);
      }
    };
    fetchItemMatches();
  }, [itemId, user]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/found-items/${itemId}`);
        if (res.data && res.data.success) {
          setItem({ ...res.data.item, itemType: 'found' });
        } else {
          setError('Failed to load item details.');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            const res2 = await axios.get(`${API_BASE}/api/lost-items/${itemId}`);
            if (res2.data && res2.data.success) {
              setItem({ ...res2.data.item, itemType: 'lost' });
              return;
            }
          } catch (err2: any) {
            console.error(err2);
            if (err2.response?.status === 404) {
              setError('This item could not be found. It may have been deleted or resolved.');
            } else {
              setError(err2.response?.data?.error || 'Failed to load item details.');
            }
          }
        } else {
          console.error(err);
          setError(err.response?.data?.error || 'Failed to load item details.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const [claimId, setClaimId] = useState<string | null>(null);
  const isFinder = item?.finder?._id === currentUserId || item?.finder === currentUserId;
  const isOwner = item?.owner?._id === currentUserId || item?.owner === currentUserId;
  const isFoundItem = item?.itemType === 'found' || !!item?.finder;
  const isLostItem = item?.itemType === 'lost' || !!item?.owner;

  const handleResolve = async () => {
    try {
      setResolving(true);
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/api/lost-items/${item._id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItem({ ...item, status: 'resolved' });
      setShowResolveModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to resolve item');
    } finally {
      setResolving(false);
    }
  };

  const handleRevert = async () => {
    try {
      setReverting(true);
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/api/lost-items/${item._id}/revert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItem({ ...item, status: 'active' });
      setShowRevertModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to revert item');
    } finally {
      setReverting(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/found-items/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowWithdrawModal(false);
      navigate('/community');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to withdraw report');
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    if (item?._id && user) {
      const token = localStorage.getItem('token');
      axios.get(`${API_BASE}/api/claims`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => {
        const matchedClaim = res.data?.claims?.find((c: any) => 
          (c.foundItemId?._id === item._id || c.foundItemId === item._id) &&
          (c.claimant?._id === currentUserId || c.claimant === currentUserId || isFinder)
        );
        if (matchedClaim) {
          setClaimId(matchedClaim._id);
        }
      }).catch(err => console.error(err));
    }
  }, [isFinder, item, user, currentUserId]);
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-surface-container-lowest dark:bg-surface-container rounded-3xl border border-border-default text-center">
        <h2 className="text-xl font-bold text-danger mb-4">Error</h2>
        <p className="text-text-secondary mb-6">{error || 'Item not found'}</p>
        <button onClick={() => navigate('/community')} className="px-6 py-2 bg-primary text-white font-bold rounded-xl">
          Back to Community
        </button>
      </div>
    );
  }

  const images = item.images && item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600"];

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-fixed selection:text-primary pb-24 md:pb-0">
      
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/70 dark:bg-surface-container/80 backdrop-blur-md border-b border-border-default/50 px-4 py-3 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h1 className="font-bold text-lg text-primary">Item Details</h1>
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <Share2 className="w-5 h-5 text-text-secondary" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 lg:py-8 w-full">
        
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors bg-surface-container-low dark:bg-surface-container px-5 py-2.5 rounded-full border border-border-default">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="hidden md:flex items-center gap-3">
            <button className="w-11 h-11 rounded-full border border-border-default flex items-center justify-center hover:bg-white dark:hover:bg-surface-container hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-text-secondary">share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* Left: Media & Details */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            {/* Main Image */}
            <div className="relative group aspect-[4/3] rounded-xl md:rounded-[24px] overflow-hidden shadow-xl md:shadow-2xl shadow-primary/5 border-2 md:border-4 border-white dark:border-surface-variant bg-surface-container">
              <img alt={item.itemName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={images[activeImage]} />
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap gap-2 md:gap-3">
                <div className={`bg-white/90 dark:bg-surface-container/90 backdrop-blur px-4 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm ${isLostItem ? 'text-danger' : 'text-warning'}`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isLostItem ? 'bg-danger' : 'bg-warning'}`}></span>
                  {item.status}
                </div>
                <div className="bg-white/90 dark:bg-surface-container/90 backdrop-blur text-primary px-4 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-wider shadow-sm">
                  {item.category}
                </div>
              </div>
              <button className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-all text-white">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-xl md:rounded-2xl overflow-hidden transition-all border-2 ${activeImage === idx ? 'border-primary ring-2 ring-primary/30 shadow-md' : 'border-transparent hover:opacity-80'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* AI Confidence Highlight & Match List */}
            {loadingMatch ? (
              <div className="glass-card p-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl md:rounded-[24px] border border-primary/10">
                <div className="bg-white dark:bg-surface-container rounded-lg md:rounded-[20px] p-6 md:p-8 space-y-6 flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                  <h4 className="text-base font-bold text-text-primary">Loading AI analysis...</h4>
                </div>
              </div>
            ) : matchError ? (
              <div className="glass-card p-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl md:rounded-[24px] border border-primary/10">
                <div className="bg-white dark:bg-surface-container rounded-lg md:rounded-[20px] p-6 md:p-8 space-y-2 text-center py-8">
                  <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-text-secondary text-2xl">lock</span>
                  </div>
                  <h4 className="text-base font-bold text-text-primary">AI Match Insights Restricted</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">AI match parameters are only visible to the reporter of this item or potential match participants.</p>
                </div>
              </div>
            ) : item.aiData && !item.aiData.processed ? (
              <div className="glass-card p-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl md:rounded-[24px] border border-primary/10">
                <div className="bg-white dark:bg-surface-container rounded-lg md:rounded-[20px] p-6 md:p-8 space-y-6 flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                  <h4 className="text-base font-bold text-text-primary">AI Matching in progress...</h4>
                  <p className="text-xs text-text-secondary max-w-sm">We are analyzing your item's parameters and images to generate matches.</p>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="glass-card p-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl md:rounded-[24px] border border-primary/10">
                <div className="bg-white dark:bg-surface-container rounded-lg md:rounded-[20px] p-6 md:p-8 space-y-2 text-center py-8">
                  <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-text-secondary text-2xl">psychology_alt</span>
                  </div>
                  <h4 className="text-base font-bold text-text-primary">No AI match has been found for this item yet.</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">We'll continue checking as new reports are added.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-extrabold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology_alt</span>
                  AI Smart Matches ({matches.length})
                </h3>
                {matches.map((m: any) => {
                  const counterpartItem = isLostItem ? m.foundItem : m.lostItem;
                  if (!counterpartItem) return null;
                  
                  const isExpanded = !!expandedMatches[m._id];
                  const confidenceText = m.score >= 80 ? 'Strong Match' : m.score >= 60 ? 'Possible Match' : 'Weak Match';
                  const confidenceColor = m.score >= 80 ? 'bg-success/15 text-success' : m.score >= 60 ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger';
                  
                  return (
                    <div key={m._id} className="glass-card p-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl md:rounded-[24px] border border-primary/10">
                      <div className="bg-white dark:bg-surface-container rounded-lg md:rounded-[20px] p-5 md:p-6 space-y-4">
                        
                        {/* Match Summary Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-xl">package</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${confidenceColor}`}>
                                  {confidenceText} ({m.score}%)
                                </span>
                              </div>
                              <h4 className="font-bold text-base text-text-primary mt-1">{counterpartItem.itemName}</h4>
                              <p className="text-xs text-text-secondary mt-0.5">Reported: {new Date(counterpartItem.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedMatches(prev => ({ ...prev, [m._id]: !prev[m._id] }))}
                            className="px-4 py-2 border border-border-default rounded-xl text-xs font-bold hover:bg-surface-container transition-colors select-none bg-transparent text-text-primary"
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="space-y-4 pt-4 border-t border-border-default/50">
                            {m.aiReason && (
                              <p className="text-xs text-text-secondary italic">"{m.aiReason}"</p>
                            )}

                            {/* Why AI Matched */}
                            {m.matchedFields && m.matchedFields.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="font-bold text-xs text-text-primary">Why AI matched:</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary font-medium">
                                  {m.matchedFields.map((field: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <span className="text-success font-bold">✓</span>
                                      <span>{field}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Evidence warnings */}
                            {m.missingEvidence && m.missingEvidence.length > 0 && (
                              <div className="p-3 bg-warning/5 rounded-xl border border-warning/15 space-y-1.5">
                                <h5 className="font-bold text-xs text-warning">Evidence Alerts</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-warning/90 font-medium">
                                  {m.missingEvidence.map((ev: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <span>⚠</span>
                                      <span>{ev}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Match Warnings & Conflicts */}
                            {m.negativeSignals && m.negativeSignals.length > 0 && (
                              <div className="p-3 bg-danger/5 rounded-xl border border-danger/15 space-y-1.5">
                                <h5 className="font-bold text-xs text-danger">Match Warnings & Conflicts</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-danger/90 font-semibold">
                                  {m.negativeSignals.map((sig: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <span>⚠</span>
                                      <span>{sig}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Score Breakdown */}
                            {m.breakdown && (
                              <div className="space-y-3 pt-4 border-t border-border-default/50">
                                <h5 className="font-bold text-xs text-text-primary">AI Similarity Breakdown</h5>
                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                  <div>
                                    <div className="flex justify-between text-text-secondary mb-1">
                                      <span>Object type match</span>
                                      <span>{m.breakdown.objectScore}/30</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full bg-success rounded-full" style={{ width: `${Math.round((m.breakdown.objectScore / 30) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-text-secondary mb-1">
                                      <span>Brand resemblance</span>
                                      <span>{m.breakdown.brandScore}/15</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((m.breakdown.brandScore / 15) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-text-secondary mb-1">
                                      <span>Color similarity</span>
                                      <span>{m.breakdown.colorScore}/10</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full bg-warning rounded-full" style={{ width: `${Math.round((m.breakdown.colorScore / 10) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-text-secondary mb-1">
                                      <span>Semantic description</span>
                                      <span>{m.breakdown.semanticScore}/20</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full bg-info-ai rounded-full" style={{ width: `${Math.round((m.breakdown.semanticScore / 20) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-text-secondary mb-1">
                                      <span>Image analysis</span>
                                      <span>{m.missingEvidence?.includes('Image verification unavailable') ? 'Not available' : `${m.breakdown.imageScore}/15`}</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full bg-danger rounded-full" style={{ width: `${m.missingEvidence?.includes('Image verification unavailable') ? 0 : Math.round((m.breakdown.imageScore / 15) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-text-secondary mb-1">
                                      <span>Receipt / OCR verification</span>
                                      <span>{(m.missingEvidence?.includes('No receipt or text image uploaded') || m.missingEvidence?.includes('No matching identifier found')) ? 'Not available' : `${m.breakdown.ocrScore}/10`}</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                                      <div className="h-full bg-[#8455ef] rounded-full" style={{ width: `${(m.missingEvidence?.includes('No receipt or text image uploaded') || m.missingEvidence?.includes('No matching identifier found')) ? 0 : Math.round((m.breakdown.ocrScore / 10) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons inside Card */}
                            <div className="flex gap-2 pt-4 border-t border-border-default/50">
                              {isLostItem ? (
                                <button
                                  onClick={() => navigate(`/claim/${counterpartItem._id}`)}
                                  className="px-4 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:scale-105 active:scale-95 transition-all select-none border-0 cursor-pointer"
                                >
                                  Claim This Item
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await axios.post(`${API_BASE}/api/claims`, {
                                        foundItemId: item._id,
                                        lostItemId: counterpartItem._id,
                                        answers: {
                                          location: item.locationFound || item.locationLost || '',
                                          dateDetails: '',
                                          colorMatch: 'yes',
                                          specialMarks: ''
                                        }
                                      }, {
                                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                                      });
                                      if (res.data?.success && res.data.claim) {
                                        const cId = res.data.claim._id || res.data.claim.id;
                                        navigate(`/chat/finder/${cId}`);
                                      }
                                    } catch (err) {
                                      console.error('Failed to open finder chat', err);
                                      alert('Failed to open chat with claimant');
                                    }
                                  }}
                                  className="px-4 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:scale-105 active:scale-95 transition-all select-none border-0 cursor-pointer"
                                >
                                  Chat with Owner
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/item/${counterpartItem._id}`)}
                                className="px-4 py-2 border border-border-default text-primary font-bold rounded-xl text-xs hover:bg-surface-container transition-all select-none bg-transparent cursor-pointer"
                              >
                                View Details
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Description */}
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">notes</span>
                Description
              </h3>
              <div className="bg-white dark:bg-surface-container p-6 md:p-8 rounded-xl md:rounded-[24px] border border-border-default leading-relaxed text-base md:text-lg text-text-primary italic shadow-sm">
                "{item.description || 'No description provided.'}"
              </div>
              <div className="flex flex-wrap gap-3">
                {item.brand && (
                  <div className="px-4 py-2 md:px-5 md:py-3 rounded-xl bg-surface-container text-text-secondary text-xs font-bold uppercase tracking-widest border border-border-default flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">sell</span> Brand: {item.brand}
                  </div>
                )}
                {item.color && (
                  <div className="px-4 py-2 md:px-5 md:py-3 rounded-xl bg-surface-container text-text-secondary text-xs font-bold uppercase tracking-widest border border-border-default flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">palette</span> Color: {item.color}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Sidebar */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-6 md:space-y-8">
              
              {/* Claim Card */}
              <div className="bg-white dark:bg-surface-container p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-[32px] shadow-xl border border-border-default relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-2 md:mb-3">{item.itemName}</h2>
                <p className="text-text-secondary mb-6 md:mb-8 text-sm md:text-base">Review the details and coordinate a return securely.</p>
                
                <div className="space-y-4">
                  {['resolved', 'claimed', 'approved'].includes(item.status) ? (
                    <div className="flex flex-col gap-3">
                      {claimId && (
                        <button
                          onClick={() => navigate(`/chat/finder/${claimId}`)}
                          className="w-full bg-gradient-to-r from-primary to-[#6b38d4] text-white py-4 md:py-5 rounded-full font-extrabold text-sm md:text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg neon-shadow-primary flex items-center justify-center gap-3 cursor-pointer border-0"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                          Open Chat
                        </button>
                      )}
                      <div className="w-full bg-[#0B0F1A]/80 dark:bg-surface-container-high text-white py-4 md:py-5 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-sm border border-border-default backdrop-blur-md">
                        <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Item Claimed{item.owner?.name ? ` by ${item.owner.name}` : ''}
                      </div>
                      <button
                        onClick={() => navigate(`/conflict/${item._id}`)}
                        className="w-full py-4 md:py-5 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined">warning</span>
                        Conflict this claim
                      </button>
                      {isOwner && (
                        <button onClick={() => setShowRevertModal(true)} className="text-xs text-text-secondary hover:text-primary transition-colors font-semibold py-2 text-center w-full">
                          Mark as lost again
                        </button>
                      )}
                    </div>
                  ) : isFoundItem ? (
                    isFinder ? (
                      claimId ? (
                        <button
                          onClick={() => navigate(`/chat/finder/${claimId}`)}
                          className="w-full bg-gradient-to-r from-primary to-[#6b38d4] text-white py-4 md:py-5 rounded-full font-extrabold text-sm md:text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg neon-shadow-primary flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                          Open Chat with Claimant
                        </button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="text-center p-4 bg-surface-container rounded-2xl text-xs text-text-secondary font-medium border border-border-default">
                            No active claims have been filed for this item yet. You will be notified when someone claims it.
                          </div>
                          <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 shadow-sm active:scale-95"
                          >
                            Withdraw Found Report
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        disabled={item?.finder?._id === currentUserId || item?.finder === currentUserId}
                        onClick={() => navigate(`/claim/${item._id}`)}
                        className={`w-full py-4 md:py-5 rounded-full font-extrabold text-sm md:text-lg transition-all flex items-center justify-center gap-3 ${(item?.finder?._id === currentUserId || item?.finder === currentUserId)
                            ? 'bg-surface-container-high text-text-secondary/50 cursor-not-allowed border border-border-default'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg neon-shadow-primary active:scale-95'
                          }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Claim This Item
                      </button>
                    )
                  ) : (
                    <>
                      {isOwner ? (
                        <button
                          onClick={() => setShowResolveModal(true)}
                          className="w-full py-4 md:py-5 rounded-full font-extrabold text-sm md:text-lg transition-all bg-surface-container-high text-text-primary shadow-sm hover:scale-[1.02] active:scale-95 border border-border-default flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          I Found This Item
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/report/found?lostItemId=${item._id}`)}
                          className="w-full py-4 md:py-5 rounded-full font-extrabold text-sm md:text-lg transition-all bg-danger text-white shadow-lg active:scale-95 flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          I Found This!
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-border-default space-y-4 md:space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-lg md:text-xl">location_on</span>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest">{isLostItem ? 'Lost At' : 'Found At'}</p>
                      <p className="text-sm md:text-base font-bold text-text-primary truncate">{item.lastSeen || item.locationFound || item.locationLost}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-tertiary text-lg md:text-xl">schedule</span>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest">{isLostItem ? 'Time Lost' : 'Time Reported'}</p>
                      <p className="text-sm md:text-base font-bold text-text-primary">{new Date(item.dateFound || item.dateLost).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Safety Banner */}
                <div className="mt-8 md:mt-10 p-4 md:p-5 bg-warning/5 rounded-xl border border-warning/20 flex gap-3 md:gap-4">
                  <span className="material-symbols-outlined text-warning shrink-0">verified_user</span>
                  <p className="text-xs md:text-sm font-medium text-warning/80 leading-snug">
                    Meet in a public campus space for item handovers. Stay safe, FoundIt fam! 🫶
                  </p>
                </div>
              </div>

              {/* Profile Quick View */}
              <div className="glass-card p-4 md:p-6 rounded-xl md:rounded-2xl flex items-center gap-4 border border-border-default shadow-sm bg-white dark:bg-surface-container">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 border-2 border-white dark:border-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest">{isLostItem ? 'Reported By' : 'Found By'}</p>
                  <h4 className="font-bold text-sm md:text-base text-text-primary truncate">{item.finder?.name || item.owner?.name || 'Community Member'}</h4>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs text-success font-bold mt-0.5">
                    <span className="material-symbols-outlined text-sm">stars</span> Trusted Member
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Resolve Confirmation Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl border border-border-default flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Item Found?</h3>
            <p className="text-sm text-text-secondary mb-8">
              Are you sure you want to mark this item as found? This will close the report and stop any active AI matching.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 py-3 bg-surface-container font-bold text-text-secondary rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="flex-1 py-3 bg-success text-white font-bold rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                {resolving ? 'Confirming...' : 'Yes, I found it'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {showRevertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl border border-border-default flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Revert Status?</h3>
            <p className="text-sm text-text-secondary mb-8">
              Are you sure you want to mark this item as lost again? This will reopen the report for the community to see.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowRevertModal(false)}
                className="flex-1 py-3 bg-surface-container font-bold text-text-secondary rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevert}
                disabled={reverting}
                className="flex-1 py-3 bg-warning text-white font-bold rounded-xl hover:bg-warning/90 transition-colors disabled:opacity-50"
              >
                {reverting ? 'Reverting...' : 'Yes, mark as lost'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl border border-border-default flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Withdraw Report?</h3>
            <p className="text-sm text-text-secondary mb-8">
              Are you sure you want to withdraw this found report? This will permanently delete the item.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 bg-surface-container font-bold text-text-secondary rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 py-3 bg-danger text-white font-bold rounded-xl hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
