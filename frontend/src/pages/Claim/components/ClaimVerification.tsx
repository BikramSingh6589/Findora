import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, AlignLeft, ArrowRight, Sparkles, Trophy, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import type { ClaimFormData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Props {
  data: ClaimFormData;
  updateData: (d: Partial<ClaimFormData>) => void;
  onNext: () => void;
  foundItemId?: string;
  item: any | null;
  loadingItem: boolean;
  match: any | null;
  loadingMatch: boolean;
}

export const ClaimVerification: React.FC<Props> = ({ 
  data, 
  updateData, 
  onNext, 
  foundItemId: _foundItemId,
  item,
  loadingItem,
  match,
  loadingMatch
}) => {
  const { user } = useAuth();
  const [myLostItems, setMyLostItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchMyItems = async () => {
      try {
        const userId = user._id || user.id;
        const res = await axios.get(`${API_BASE}/api/users/${userId}/reports`);
        if (res.data?.success) {
          const activeLost = res.data.data.lostItems.filter((i: any) => i.status === 'active' || i.status === 'claimed');
          setMyLostItems(activeLost);
        }
      } catch (e) {
        console.error('Failed to fetch user reports', e);
      }
    };
    fetchMyItems();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="py-6 md:py-8 px-6 md:px-10">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative px-6">
          <div className="absolute top-5 left-0 w-full h-1 bg-surface-variant -translate-y-0 z-0"></div>
          <div className="absolute top-5 left-0 w-1/3 h-1 bg-primary z-0 transition-all duration-500"></div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/25 ring-4 ring-surface dark:ring-surface">1</div>
            <span className="font-semibold text-sm text-primary">Verification</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-border-default bg-surface-container-lowest dark:bg-surface-container text-text-secondary flex items-center justify-center font-bold ring-4 ring-surface dark:ring-surface">2</div>
            <span className="font-semibold text-sm text-text-secondary">Proof</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-border-default bg-surface-container-lowest dark:bg-surface-container text-text-secondary flex items-center justify-center font-bold ring-4 ring-surface dark:ring-surface">3</div>
            <span className="font-semibold text-sm text-text-secondary">Review</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-8 shadow-sm border border-border-default">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {item ? `Verify Ownership of ${item.itemName}` : 'Verify Ownership'}
              </h1>
              <p className="text-base text-text-secondary">Help us confirm you're the rightful owner by answering a few quick questions about your item.</p>
            </div>

            {loadingItem ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Optional: Select existing Lost Item */}
              {myLostItems.length > 0 && (
                <div className="space-y-2 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <label className="font-semibold text-sm text-text-primary block">Link to Your Reported Lost Item (Optional)</label>
                  <select
                    className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 bg-surface transition-all outline-none"
                    value={data.lostItemId || ''}
                    onChange={e => updateData({ lostItemId: e.target.value })}
                  >
                    <option value="">-- I haven't reported this item yet --</option>
                    {myLostItems.map(item => (
                      <option key={item._id} value={item._id}>{item.itemName} ({item.category})</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary">Linking your report speeds up verification.</p>
                </div>
              )}

              {/* Question 1: Location */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Where exactly did you lose it?</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 bg-surface transition-all outline-none"
                    placeholder="e.g. Science Building, 3rd Floor study nook"
                    value={data.location}
                    onChange={e => updateData({ location: e.target.value })}
                  />
                </div>
                <p className="text-xs text-text-secondary">Be as specific as possible (e.g. room number or near a specific landmark).</p>
              </div>

              {/* Question 2: Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-text-primary block">Approximate Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                    <input
                      required
                      type="date"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 bg-surface transition-all outline-none"
                      value={data.lostDate}
                      onChange={e => updateData({ lostDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-text-primary block">Approximate Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                    <input
                      required
                      type="time"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 bg-surface transition-all outline-none"
                      value={data.lostTime}
                      onChange={e => updateData({ lostTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Question 3: Unique Identifiers */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Unique Identifiers</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-text-secondary w-5 h-5" />
                  <textarea
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 bg-surface transition-all outline-none resize-none"
                    placeholder="Mention any scratches, specific stickers, lock screen wallpaper, or cases..."
                    rows={4}
                    value={data.identifiers}
                    onChange={e => updateData({ identifiers: e.target.value })}
                  ></textarea>
                </div>
                <p className="text-xs text-text-secondary">These details help our AI confirm a match more accurately.</p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-border-default">
                <button type="button" className="px-6 py-3 rounded-full font-semibold text-sm text-text-secondary hover:bg-surface transition-colors">
                  Cancel
                </button>
                <button type="submit" className="group flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-[#6b38d4] text-white font-semibold shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-95 transition-all">
                  Continue to Proof
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Match Card Container */}
          {loadingMatch ? (
            <div className="bg-info-ai/10 border border-info-ai/30 rounded-[20px] p-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-info-ai"></div>
              <p className="text-sm font-semibold text-info-ai">AI is checking possible matches...</p>
            </div>
          ) : !match ? (
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-[20px] p-6 text-center flex flex-col items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-text-secondary opacity-45" />
              <h4 className="font-bold text-sm text-text-primary">No AI matches found yet</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                We will notify you when a similar item appears.
              </p>
            </div>
          ) : (
            <div className="bg-info-ai/10 border-2 border-info-ai rounded-[20px] p-6 overflow-hidden relative animate-fade-in">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-info-ai w-5 h-5 fill-current" />
                  <span className="font-semibold text-sm text-info-ai">
                    {match.score >= 80 ? 'Strong AI Match' : match.score >= 60 ? 'Possible Match' : 'Weak Match'}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-text-primary mb-2">{match.score}% Confidence</h4>
                <p className="text-xs text-text-secondary mb-4">
                  {match.aiReason || 'AI analysis completed.'}
                </p>
                <div className="w-full h-40 rounded-xl overflow-hidden mb-3 shadow-inner bg-surface flex items-center justify-center border border-border-default">
                  {match.foundItem?.images?.[0] || match.lostItem?.images?.[0] ? (
                    <img
                      className="w-full h-full object-cover"
                      src={match.foundItem?.images?.[0] || match.lostItem?.images?.[0]}
                      alt={match.foundItem?.itemName || 'Item image'}
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-info-ai/40" />
                  )}
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-info-ai text-white rounded-lg text-xs font-bold">
                    Found near {match.foundItem?.locationFound || match.foundItem?.location || 'Campus'}
                  </span>
                </div>

                {/* Score Breakdown Section */}
                {match.breakdown && (
                  <div className="mt-4 pt-4 border-t border-info-ai/20 space-y-2">
                    <h5 className="font-bold text-xs text-text-primary">Match Score Breakdown</h5>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary font-bold">
                      <div>Object: {match.breakdown.objectScore ?? 0}/30</div>
                      <div>Description: {match.breakdown.semanticScore ?? 0}/20</div>
                      <div>Image: {match.missingEvidence?.includes('Image verification unavailable') ? 'Not available' : `${match.breakdown.imageScore ?? 0}/15`}</div>
                      <div>Receipt: {(match.missingEvidence?.includes('No receipt or text image uploaded') || match.missingEvidence?.includes('No matching identifier found')) ? 'Not available' : `${match.breakdown.ocrScore ?? 0}/10`}</div>
                    </div>
                  </div>
                )}

                {/* Missing Evidence Section */}
                {match.missingEvidence && match.missingEvidence.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {match.missingEvidence.map((ev: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px] font-semibold text-warning">
                        <span className="text-sm">⚠</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Match Warnings & Conflicts */}
                {match.negativeSignals && match.negativeSignals.length > 0 && (
                  <div className="mt-3 space-y-1 p-2.5 bg-danger/5 border border-danger/10 rounded-xl">
                    <h5 className="font-bold text-[10px] text-danger uppercase tracking-wider mb-1">Match Warnings & Conflicts</h5>
                    {match.negativeSignals.map((sig: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px] font-bold text-danger">
                        <span className="text-sm">⚠</span>
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Why matched checkmarks */}
                {match.matchedFields && match.matchedFields.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-info-ai/20 space-y-2">
                    <h5 className="font-bold text-xs text-text-primary">Why AI matched:</h5>
                    <div className="grid grid-cols-1 gap-1">
                      {match.matchedFields.slice(0, 4).map((field: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <span className="text-success font-bold">✓</span>
                          <span>{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* XP Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-sm border border-border-default">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-text-primary">Earn +50 XP</h4>
                <p className="text-xs text-text-secondary">For accurate verification</p>
              </div>
            </div>
            <div className="w-full bg-surface h-2 rounded-full mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-warning to-amber-500 h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-text-secondary italic">"Keep being honest! Student reputation scores help the whole campus."</p>
          </div>

          {/* Safety Note */}
          <div className="p-6 bg-surface rounded-[20px] border border-border-default">
            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-text-secondary" />
              Security Note
            </h5>
            <p className="text-xs text-text-secondary">Verifications are manually reviewed by Campus Security to ensure safe item returns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
