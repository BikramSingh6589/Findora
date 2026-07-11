import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Eye, Search, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StatusBadge: React.FC<{ claim: any }> = ({ claim }) => {
  let text = claim.status || 'pending';
  let badgeClass = 'bg-warning/10 text-warning';

  // Priority: resolved/approved/rejected status wins over mediationStatus
  if (claim.status === 'approved') {
    text = 'Approved';
    badgeClass = 'bg-success/10 text-success';
  } else if (claim.status === 'resolved') {
    text = 'Mutual Resolved';
    badgeClass = 'bg-success/10 text-success';
  } else if (claim.status === 'rejected') {
    text = 'Rejected';
    badgeClass = 'bg-danger/10 text-danger';
  } else if (claim.status === 'mediated') {
    text = 'Mediated';
    badgeClass = 'bg-success/10 text-success';
  } else if (claim.mediationStatus === 'pending' || claim.mediationRequested) {
    // Only show this banner if NOT yet resolved
    text = 'Mediation Pending';
    badgeClass = 'bg-info-ai/10 text-info-ai animate-pulse';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
      {text}
    </span>
  );
};

export const AdminClaimManagement: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  
  const [claimAIMatch, setClaimAIMatch] = useState<any | null>(null);
  const [loadingAIMatch, setLoadingAIMatch] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/claims`);
      if (res.data && res.data.success) {
        setClaims(res.data.claims || res.data.data?.claims || []);
      }
    } catch (err: any) {
      console.error('Failed to load claims', err);
      setError(err.response?.data?.error || 'Failed to fetch claims from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(API_BASE, { auth: { token } });
    socket.on('admin_claims_updated', () => {
      fetchClaims();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchAIMatch = async () => {
      if (!selectedClaim || !selectedClaim.lostItemId) {
        setClaimAIMatch(null);
        return;
      }
      try {
        setLoadingAIMatch(true);
        const foundId = selectedClaim.foundItemId?._id || selectedClaim.foundItemId;
        const lostId = selectedClaim.lostItemId?._id || selectedClaim.lostItemId;
        const res = await axios.get(`${API_BASE}/api/ai/matches/${foundId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data && res.data.success) {
          const matches = res.data.matches || [];
          const matching = matches.find((m: any) => {
            const mLostId = m.lostItem?._id || m.lostItem;
            return String(mLostId) === String(lostId);
          });
          setClaimAIMatch(matching || null);
        }
      } catch (err) {
        console.error('Failed to fetch AI match details for claim', err);
        setClaimAIMatch(null);
      } finally {
        setLoadingAIMatch(false);
      }
    };
    fetchAIMatch();
  }, [selectedClaim]);

  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'approve' | 'reject' | 'verifyCode' | 'verifyLocation'; claimId: string; inputText: string; }>({ 
    isOpen: false, type: 'approve', claimId: '', inputText: '' 
  });

  const confirmAction = async () => {
    const { type, claimId, inputText } = actionModal;
    const value = inputText.trim();
    
    try {
      if (type === 'approve' || type === 'reject') {
        const payload = type === 'approve' ? { remarks: value || 'Approved by admin' } : { reason: value || 'Insufficient proof of ownership' };
        setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status: type === 'approve' ? 'approved' : 'rejected', mediationStatus: type === 'approve' ? 'approved' : 'rejected' } : c));
        
        await axios.post(`${API_BASE}/api/claims/${claimId}/${type}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else if (type === 'verifyCode') {
        await axios.post(`${API_BASE}/api/claims/${claimId}/admin-verify-code`, { code: value }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else if (type === 'verifyLocation') {
        await axios.post(`${API_BASE}/api/claims/${claimId}/admin-verify-location`, { found: value === 'true' }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      setActionModal(prev => ({ ...prev, isOpen: false }));
      setSelectedClaim(null);
      let successMsg = `Claim successfully ${type}d.`;
      if (type === 'verifyCode') successMsg = 'Code verified successfully.';
      if (type === 'verifyLocation') successMsg = 'Location verified successfully.';
      setSuccessModal({ isOpen: true, message: successMsg });
      await fetchClaims();
    } catch (err: any) {
      setSuccessModal({ isOpen: true, message: err.response?.data?.error || `Failed action.` });
      fetchClaims();
    }
  };

  const [verifyFlow, setVerifyFlow] = useState<{
    isOpen: boolean;
    step: 'input' | 'details';
    claim: any | null;
    inputCode: string;
    error: string;
  }>({ isOpen: false, step: 'input', claim: null, inputCode: '', error: '' });

  const startVerifyFlow = (claim: any) => {
    setVerifyFlow({ isOpen: true, step: 'input', claim, inputCode: '', error: '' });
  };

  const handleVerifySubmit = () => {
    if (verifyFlow.inputCode === verifyFlow.claim.finderDropoffCode) {
      setVerifyFlow(prev => ({ ...prev, step: 'details', error: '' }));
    } else {
      setVerifyFlow(prev => ({ ...prev, error: 'Invalid drop-off code. Please check again.' }));
    }
  };

  const handleNotifyClaimant = async () => {
    try {
      await axios.post(`${API_BASE}/api/claims/${verifyFlow.claim._id}/admin-verify-code`, { code: verifyFlow.inputCode }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccessModal({ isOpen: true, message: 'Code verified! Claimant has been notified.' });
      setVerifyFlow(prev => ({ ...prev, isOpen: false }));
      setSelectedClaim(null);
      await fetchClaims();
    } catch (err: any) {
      setVerifyFlow(prev => ({ ...prev, error: err.response?.data?.error || 'Failed to notify claimant.' }));
    }
  };

  const approve = (id: string) => {
    setActionModal({ isOpen: true, type: 'approve', claimId: id, inputText: '' });
  };

  const reject = (id: string) => {
    setActionModal({ isOpen: true, type: 'reject', claimId: id, inputText: '' });
  };
  
  // verifyLocation was unused in AdminClaimManagement.tsx

  const notifyClaimantLocation = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/claims/${id}/admin-notify-location`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccessModal({ isOpen: true, message: 'Claimant notified of location successfully.' });
      await fetchClaims();
    } catch (err: any) {
      setSuccessModal({ isOpen: true, message: err.response?.data?.error || 'Failed to notify claimant.' });
    }
  };

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  const filtered = claims.filter(c => {
    // Custom filter matching
    let matchesFilter = filter === 'All';
    if (filter === 'Pending') {
      matchesFilter = c.status === 'pending' || c.mediationStatus === 'pending';
    } else if (filter === 'Approved') {
      matchesFilter = c.status === 'approved' || c.status === 'resolved';
    } else if (filter === 'Rejected') {
      matchesFilter = c.status === 'rejected';
    }
    
    const itemName = c.foundItemId?.itemName || '';
    const claimantName = c.claimant?.name || '';
    const claimId = c.claimId || '';
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase()) || 
                          claimantName.toLowerCase().includes(search.toLowerCase()) ||
                          claimId.toLowerCase().includes(search.toLowerCase());
                          
    return matchesFilter && matchesSearch;
  });

  // Sort claims: Admin request / Mediation pending first, normal pending second, mutually resolved third, closed fourth.
  const sortedClaims = [...filtered].sort((a, b) => {
    const getPriority = (c: any) => {
      if (c.mediationStatus === 'pending' || c.mediationRequested) return 1;
      if (c.status === 'pending') return 2;
      if (c.status === 'resolved') return 3;
      return 4;
    };
    return getPriority(a) - getPriority(b);
  });

  const counts = {
    pending: claims.filter(c => c.status === 'pending' || c.mediationStatus === 'pending').length,
    approved: claims.filter(c => c.status === 'approved' || c.status === 'resolved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-text-secondary mt-4">Loading claims...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary">Claim Management</h2>
          <p className="text-text-secondary mt-1">Review ownership claims and submitted evidence.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-extrabold text-warning">{counts.pending}</p>
            <p className="text-xs text-text-secondary">Pending / Review</p>
          </div>
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-extrabold text-success">{counts.approved}</p>
            <p className="text-xs text-text-secondary">Resolved / Closed</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: String(claims.length), icon: <Clock className="w-5 h-5 text-primary" />, color: 'bg-primary/10', border: 'border-primary' },
          { label: 'Approved', value: String(counts.approved), icon: <CheckCircle2 className="w-5 h-5 text-success" />, color: 'bg-success/10', border: 'border-success' },
          { label: 'Rejected', value: String(counts.rejected), icon: <XCircle className="w-5 h-5 text-danger" />, color: 'bg-danger/10', border: 'border-danger' },
          { label: 'Avg. Resolution', value: 'Instant', icon: <Eye className="w-5 h-5 text-info-ai" />, color: 'bg-info-ai/10', border: 'border-info-ai' },
        ].map((s, i) => (
          <div key={i} className={`bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-4 shadow-sm border-l-4 ${s.border} flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">{s.label}</p>
              <p className="text-xl font-extrabold text-text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search claims, items, or users..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>
        <div className="flex bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === tab ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm border border-border-default overflow-hidden">
        {sortedClaims.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No claims matched your filters.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="hidden md:table w-full">
              <thead className="bg-surface-container-low border-b border-border-default">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Claimant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {sortedClaims.map((claim: any) => {
                  const isClosed = claim.status === 'approved' || 
                                   claim.status === 'rejected' || 
                                   claim.status === 'resolved' || 
                                   claim.status === 'mediated';
                  return (
                    <tr 
                      key={claim._id} 
                      onClick={() => setSelectedClaim(claim)} 
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-sm text-text-primary">{claim.foundItemId?.itemName || 'Deleted Found Item'}</p>
                            <p className="text-[10px] text-text-secondary tracking-wider">{claim.claimId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-text-primary">{claim.claimant?.name || 'Unknown'}</p>
                        <p className="text-xs text-text-secondary">{claim.claimant?.email || ''} {claim.claimant?.studentId ? `· ${claim.claimant.studentId}` : ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${claim.confidence > 80 ? 'bg-success' : claim.confidence > 60 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${claim.confidence || 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-text-secondary">{claim.confidence || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge claim={claim} /></td>
                      <td className="px-6 py-4">
                        {isClosed ? (
                          <span className="text-xs text-text-secondary italic">Closed</span>
                        ) : claim.status === 'approved' && claim.finderHandoverChoice === 'me' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); startVerifyFlow(claim); }}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            Verify Drop-off
                          </button>
                        ) : claim.mediationRequested || claim.mediationStatus === 'pending' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/admin/conflict/${claim.foundItemId?._id || claim.foundItemId}`); }} 
                              className="px-3 py-1.5 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors text-xs font-bold" 
                              title="Resolve Conflict"
                            >
                              Resolve Conflict
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary italic">Awaiting Mediation</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border-default">
              {sortedClaims.map((claim: any) => {
                const isClosed = claim.status === 'rejected' || 
                                 claim.status === 'resolved' || 
                                 claim.status === 'mediated';
                return (
                  <div key={claim._id} onClick={() => setSelectedClaim(claim)} className="p-4 cursor-pointer hover:bg-surface-container-low/30 transition-colors">
                    <div className="flex gap-3 mb-3">
                      <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text-primary">{claim.foundItemId?.itemName}</h4>
                        <p className="text-xs text-text-secondary">Claimed by {claim.claimant?.name || 'Unknown'}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <StatusBadge claim={claim} />
                          <span className="text-xs text-text-secondary">{claim.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                    {!isClosed && claim.status === 'approved' && claim.finderHandoverChoice === 'me' ? (
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); startVerifyFlow(claim); }} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors">
                          Verify Drop-off
                        </button>
                      </div>
                    ) : !isClosed && (claim.mediationRequested || claim.mediationStatus === 'pending') ? (
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/conflict/${claim.foundItemId?._id || claim.foundItemId}`); }} className="flex-1 py-2 bg-warning text-white rounded-xl font-bold text-xs hover:bg-warning/90 transition-colors">
                          Resolve Conflict
                        </button>
                      </div>
                    ) : !isClosed && (
                      <div className="mt-2 text-xs text-text-secondary italic">Awaiting Mediation</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Claim Detail & Proof Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-default animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border-default flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="text-xl font-black text-text-primary">Claim Details & Proof</h3>
                <p className="text-xs text-text-secondary mt-0.5">ID: {selectedClaim.claimId}</p>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)} 
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Found Item Section */}
              <div className="bg-surface-container-low p-4 rounded-2xl flex gap-4 border border-border-default/50">
                <img 
                  src={selectedClaim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=150&q=70'} 
                  alt={selectedClaim.foundItemId?.itemName} 
                  className="w-20 h-20 rounded-xl object-cover border border-border-default"
                />
                <div>
                  <h4 className="font-extrabold text-text-primary text-base">{selectedClaim.foundItemId?.itemName}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Category: {selectedClaim.foundItemId?.category}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Found Location: {selectedClaim.foundItemId?.locationFound}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Reported By: {selectedClaim.foundItemId?.finder?.name || 'Helper'}</p>
                </div>
              </div>

              {/* AI Matching Insights (Task 7) */}
              {selectedClaim.lostItemId ? (
                <div className="bg-info-ai/5 border border-info-ai/20 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-info-ai">
                    <Sparkles className="w-5 h-5 fill-current" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">AI Match Insights</h4>
                  </div>
                  
                  {loadingAIMatch ? (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-primary"></div>
                      <span>Retrieving AI match details...</span>
                    </div>
                  ) : claimAIMatch ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-text-primary">{claimAIMatch.score}% AI Match Confidence</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          claimAIMatch.score >= 80 ? 'bg-success/10 text-success' : claimAIMatch.score >= 60 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                        }`}>
                          {claimAIMatch.score >= 80 ? 'Strong Match' : claimAIMatch.score >= 60 ? 'Possible Match' : 'Weak Match'}
                        </span>
                      </div>
                      
                      {claimAIMatch.aiReason && (
                        <p className="text-xs text-text-secondary italic">"{claimAIMatch.aiReason}"</p>
                      )}

                      {/* Matched Fields */}
                      {claimAIMatch.matchedFields && claimAIMatch.matchedFields.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-text-primary">Why AI Matched:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-text-secondary font-medium">
                            {claimAIMatch.matchedFields.map((field: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="text-success font-bold">✓</span>
                                <span>{field}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Evidence */}
                      {claimAIMatch.missingEvidence && claimAIMatch.missingEvidence.length > 0 && (
                        <div className="p-3 bg-warning/5 rounded-xl border border-warning/15 space-y-1">
                          <h5 className="font-bold text-xs text-warning">Evidence Warnings:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-warning/90 font-medium">
                            {claimAIMatch.missingEvidence.map((ev: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span>⚠</span>
                                <span>{ev}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Match Warnings & Conflicts */}
                      {claimAIMatch.negativeSignals && claimAIMatch.negativeSignals.length > 0 && (
                        <div className="p-3 bg-danger/5 rounded-xl border border-danger/15 space-y-1">
                          <h5 className="font-bold text-xs text-danger">Match Warnings & Conflicts:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-danger/90 font-semibold">
                            {claimAIMatch.negativeSignals.map((sig: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span>⚠</span>
                                <span>{sig}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Score Breakdown */}
                      {claimAIMatch.breakdown && (
                        <div className="space-y-2 pt-3 border-t border-border-default/50">
                          <h5 className="font-bold text-xs text-text-primary">AI Similarity Breakdown:</h5>
                          <div className="grid grid-cols-2 gap-3 text-[11px] text-text-secondary font-bold">
                            <div>Object Type Match: {claimAIMatch.breakdown.objectScore ?? 0}/30</div>
                            <div>Brand Resemblance: {claimAIMatch.breakdown.brandScore ?? 0}/15</div>
                            <div>Color Similarity: {claimAIMatch.breakdown.colorScore ?? 0}/10</div>
                            <div>Semantic Description: {claimAIMatch.breakdown.semanticScore ?? 0}/20</div>
                            <div>Image Match: {claimAIMatch.missingEvidence?.includes('Image verification unavailable') ? 'Not available' : `${claimAIMatch.breakdown.imageScore ?? 0}/15`}</div>
                            <div>Receipt/OCR: {(claimAIMatch.missingEvidence?.includes('No receipt or text image uploaded') || claimAIMatch.missingEvidence?.includes('No matching identifier found')) ? 'Not available' : `${claimAIMatch.breakdown.ocrScore ?? 0}/10`}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary">No AI matching details found for these linked items.</p>
                  )}
                </div>
              ) : (
                <div className="bg-surface-container-low p-4 rounded-2xl border border-border-default/50 text-center text-xs text-text-secondary">
                  No linked Lost Item reported by this claimant. Purely manual verification based on answers.
                </div>
              )}

              {/* Claimant & Finder Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-extrabold text-text-primary text-sm uppercase tracking-wider mb-2">Claimant Info</h4>
                  <div className="flex flex-col gap-3 bg-surface-container-low/40 p-4 rounded-xl border border-border-default/30">
                    <div>
                      <p className="text-[11px] text-text-secondary">Name</p>
                      <p className="font-semibold text-sm text-text-primary">{selectedClaim.claimant?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-secondary">Email</p>
                      <p className="font-semibold text-sm text-text-primary">{selectedClaim.claimant?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-text-primary text-sm uppercase tracking-wider mb-2">Finder Info</h4>
                  <div className="flex flex-col gap-3 bg-surface-container-low/40 p-4 rounded-xl border border-border-default/30">
                    <div>
                      <p className="text-[11px] text-text-secondary">Name</p>
                      <p className="font-semibold text-sm text-text-primary">{selectedClaim.foundItemId?.finder?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-secondary">Email</p>
                      <p className="font-semibold text-sm text-text-primary">{selectedClaim.foundItemId?.finder?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted Answers */}
              <div>
                <h4 className="font-extrabold text-text-primary text-sm uppercase tracking-wider mb-2">Submitted Answers</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Lost Location Details', val: selectedClaim.answers?.location },
                    { label: 'Lost Date & Time Details', val: selectedClaim.answers?.dateDetails },
                    { label: 'Identifiers & Color Match', val: selectedClaim.answers?.colorMatch },
                    { label: 'Special Marks / Additional Info', val: selectedClaim.answers?.specialMarks }
                  ].map((ans, idx) => (
                    <div key={idx} className="p-3 bg-surface-container-low rounded-xl border border-border-default/40">
                      <p className="text-xs font-bold text-primary mb-1">{ans.label}</p>
                      <p className="text-sm text-text-primary leading-relaxed font-medium">{ans.val || 'No answer provided.'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              {selectedClaim.status === 'pending' && selectedClaim.mediationStatus !== 'approved' && selectedClaim.status !== 'resolved' && (
                <div className="pt-4 border-t border-border-default">
                  {(selectedClaim.mediationRequested || selectedClaim.mediationStatus === 'pending') ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => approve(selectedClaim._id)}
                        className="flex-1 py-3 bg-success text-white font-bold rounded-xl text-sm hover:bg-success/90 transition-colors shadow-md"
                      >
                        Approve Claim
                      </button>
                      <button 
                        onClick={() => reject(selectedClaim._id)}
                        className="flex-1 py-3 bg-danger text-white font-bold rounded-xl text-sm hover:bg-danger/90 transition-colors shadow-md"
                      >
                        Reject Claim
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-surface-container-low rounded-xl border border-border-default text-center">
                      <p className="text-sm font-bold text-text-secondary">Awaiting Mediation</p>
                      <p className="text-xs text-text-secondary mt-1">Actions will become available if a user requests admin mediation.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Handover Actions inside Modal */}
              {selectedClaim.status === 'approved' && (
                <div className="pt-4 border-t border-border-default space-y-4">
                  <h4 className="font-extrabold text-text-primary text-sm uppercase tracking-wider mb-2">Admin Handover Actions</h4>
                  
                  {selectedClaim.finderHandoverChoice === 'me' && (
                    <div className="bg-surface-container-low p-4 rounded-xl border border-border-default flex flex-col gap-3">
                      <p className="text-sm text-text-primary">Finder is dropping off at admin location.</p>
                      <button 
                        onClick={() => { setSelectedClaim(null); startVerifyFlow(selectedClaim); }}
                        className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:brightness-110 transition-colors shadow-md"
                      >
                        Verify Dropoff Code
                      </button>
                    </div>
                  )}

                  {selectedClaim.finderHandoverChoice === 'other' && (
                    <div className="bg-surface-container-low p-4 rounded-xl border border-border-default flex flex-col gap-3">
                      <p className="text-sm text-text-primary">Finder left item at: <span className="font-bold">{selectedClaim.finderHandoverLocation}</span></p>
                      {selectedClaim.locationNotifiedToClaimant ? (
                        <p className="text-sm font-bold text-success">Claimant has been notified to check the location.</p>
                      ) : (
                        <button 
                          onClick={() => notifyClaimantLocation(selectedClaim._id)}
                          className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:brightness-110 transition-colors shadow-md"
                        >
                          Send to claimant
                        </button>
                      )}
                    </div>
                  )}

                  {!selectedClaim.finderHandoverChoice || selectedClaim.finderHandoverChoice === 'none' && (
                    <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
                      <p className="text-xs font-bold text-warning-text">Waiting for finder to select handover method...</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                {actionModal.type === 'approve' ? 'Approve Claim' : actionModal.type === 'verifyCode' ? 'Verify Code' : 'Reject Claim'}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {actionModal.type === 'approve' 
                  ? 'Enter remarks for approval (optional):' 
                  : actionModal.type === 'verifyCode'
                  ? 'Enter the 6-digit dropoff code provided by the finder:'
                  : 'Enter reason for rejection (optional):'}
              </p>
              {actionModal.type === 'verifyCode' ? (
                <input
                  type="text"
                  value={actionModal.inputText}
                  onChange={e => setActionModal(prev => ({ ...prev, inputText: e.target.value }))}
                  placeholder="e.g., 123456"
                  className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface transition-all outline-none"
                />
              ) : (
                <textarea
                  value={actionModal.inputText}
                  onChange={e => setActionModal(prev => ({ ...prev, inputText: e.target.value }))}
                  placeholder={actionModal.type === 'approve' ? 'e.g., Ownership verified' : 'e.g., Insufficient proof'}
                  className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface transition-all resize-none h-24 outline-none"
                ></textarea>
              )}
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 bg-surface-container text-text-primary font-bold rounded-xl text-sm hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAction}
                  className={`flex-1 py-3 font-bold rounded-xl text-sm text-white shadow-md transition-colors ${actionModal.type === 'approve' ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Flow Modal */}
      {verifyFlow.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 md:p-8 rounded-[24px] max-w-lg w-full shadow-2xl border border-border-default my-auto">
            {verifyFlow.step === 'input' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-text-primary">Verify Drop-off Code</h3>
                  <button onClick={() => setVerifyFlow({ isOpen: false, step: 'input', claim: null, inputCode: '', error: '' })} className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  Enter the 6-digit code provided by the finder to verify the handover.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verifyFlow.inputCode}
                    onChange={(e) => setVerifyFlow(prev => ({ ...prev, inputCode: e.target.value, error: '' }))}
                    className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface transition-all text-center text-xl tracking-[0.2em] font-mono outline-none"
                    maxLength={6}
                  />
                  {verifyFlow.error && <p className="text-danger text-sm font-bold text-center">{verifyFlow.error}</p>}
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setVerifyFlow({ isOpen: false, step: 'input', claim: null, inputCode: '', error: '' })} className="flex-1 py-3 bg-surface-container text-text-primary font-bold rounded-xl text-sm hover:bg-surface-container-high transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleVerifySubmit} className="flex-1 py-3 font-bold rounded-xl text-sm text-white shadow-md transition-colors bg-primary hover:bg-primary/90">
                    Verify Code
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-success flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" /> Code Verified
                  </h3>
                  <button onClick={() => setVerifyFlow({ isOpen: false, step: 'input', claim: null, inputCode: '', error: '' })} className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-surface-container-low p-4 rounded-xl border border-border-default">
                    <div className="flex gap-4">
                      {verifyFlow.claim?.foundItemId?.images?.[0] && (
                        <img src={verifyFlow.claim.foundItemId.images[0]} className="w-20 h-20 rounded-lg object-cover" alt="Item" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-text-primary text-lg">{verifyFlow.claim?.foundItemId?.itemName}</h4>
                        <p className="text-sm text-text-secondary mb-1">Claim ID: <span className="font-mono text-text-primary">{verifyFlow.claim?.claimId}</span></p>
                        <p className="text-xs text-text-secondary"><span className="uppercase tracking-wider font-bold">Claimant:</span> {verifyFlow.claim?.claimant?.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                    <p className="text-sm text-primary font-bold mb-2">Item is now secured at the Admin Office.</p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Click the button below to officially resolve the claim and notify the claimant that they can come collect their product from the admin office.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setVerifyFlow({ isOpen: false, step: 'input', claim: null, inputCode: '', error: '' })} className="flex-1 py-3 bg-surface-container text-text-primary font-bold rounded-xl text-sm hover:bg-surface-container-high transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleNotifyClaimant} className="flex-1 py-3 font-bold rounded-xl text-sm text-white shadow-md transition-colors bg-success hover:bg-success/90">
                    Notify Claimant to Collect
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1A1D24] border border-white/10 rounded-2xl p-6 shadow-xl max-w-sm w-full flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Success</h3>
            <p className="text-white/70 text-sm mb-6">
              {successModal.message}
            </p>
            <button
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#4F46E5] hover:bg-[#4F46E5]/90 transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaimManagement;
