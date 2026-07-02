import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    reviewing: 'bg-info-ai/10 text-info-ai',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-danger/10 text-danger',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] ?? 'bg-surface text-text-secondary'}`}>
      {status}
    </span>
  );
};

export const AdminClaimManagement: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Let's call /api/claims (which returns all claims for admins)
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
  }, []);

  const approve = async (id: string) => {
    const remarks = prompt('Enter remarks for approval (optional):') || 'Approved by admin';
    try {
      await axios.post(`${API_BASE}/api/claims/${id}/approve`, { remarks });
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve claim');
    }
  };

  const reject = async (id: string) => {
    const reason = prompt('Enter reason for rejection:') || 'Insufficient proof of ownership';
    try {
      await axios.post(`${API_BASE}/api/claims/${id}/reject`, { reason });
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject claim');
    }
  };

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  const filtered = claims.filter(c => {
    const statusVal = c.status?.toLowerCase();
    const filterVal = filter.toLowerCase();
    const matchesFilter = filter === 'All' || statusVal === filterVal;
    
    const itemName = c.foundItemId?.itemName || '';
    const claimantName = c.claimant?.name || '';
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase()) || 
                          claimantName.toLowerCase().includes(search.toLowerCase());
                          
    return matchesFilter && matchesSearch;
  });

  const counts = {
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
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
            <p className="text-xs text-text-secondary">Pending</p>
          </div>
          <div className="bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-extrabold text-success">{counts.approved}</p>
            <p className="text-xs text-text-secondary">Approved</p>
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
        {filtered.length === 0 ? (
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
                {filtered.map((claim: any) => (
                  <tr key={claim._id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-sm text-text-primary">{claim.foundItemId?.itemName || 'Deleted Found Item'}</p>
                          <p className="text-xs text-text-secondary">{claim.claimId}</p>
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
                    <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                    <td className="px-6 py-4">
                      {claim.status === 'approved' || claim.status === 'rejected' ? (
                        <span className="text-xs text-text-secondary italic">Closed</span>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => approve(claim._id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors" title="Approve">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => reject(claim._id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border-default">
              {filtered.map((claim: any) => (
                <div key={claim._id} className="p-4">
                  <div className="flex gap-3 mb-3">
                    <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-text-primary">{claim.foundItemId?.itemName}</h4>
                      <p className="text-xs text-text-secondary">Claimed by {claim.claimant?.name || 'Unknown'}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={claim.status} />
                        <span className="text-xs text-text-secondary">{claim.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                  {claim.status !== 'approved' && claim.status !== 'rejected' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(claim._id)} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => reject(claim._id)} className="flex-1 py-2 border border-danger text-danger rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
