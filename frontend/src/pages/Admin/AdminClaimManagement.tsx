import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Search } from 'lucide-react';

const allClaims = [
  { id: 'CLM-001', item: 'Sony XM5 Headphones', claimant: 'Kevin S.', studentId: 'SU-2024-0012', time: '10 mins ago', status: 'pending', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=70', confidence: 92 },
  { id: 'CLM-002', item: 'Leather Wallet', claimant: 'Maya R.', studentId: 'SU-2024-0289', time: '25 mins ago', status: 'pending', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&q=70', confidence: 87 },
  { id: 'CLM-003', item: 'MacBook Air M2', claimant: 'Daniel F.', studentId: 'SU-2023-4411', time: '1h ago', status: 'reviewing', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=70', confidence: 79 },
  { id: 'CLM-004', item: 'Blue JBL Earbuds', claimant: 'Sarah T.', studentId: 'SU-2024-1102', time: '2h ago', status: 'pending', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&q=70', confidence: 95 },
  { id: 'CLM-005', item: 'Student ID Card', claimant: 'Alex W.', studentId: 'SU-2024-0778', time: '3h ago', status: 'reviewing', img: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70', confidence: 100 },
  { id: 'CLM-006', item: 'Umbrella (Black)', claimant: 'Chris L.', studentId: 'SU-2022-9901', time: '4h ago', status: 'approved', img: 'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=80&q=70', confidence: 88 },
  { id: 'CLM-007', item: 'Library Book Set', claimant: 'Priya M.', studentId: 'SU-2024-0443', time: '5h ago', status: 'rejected', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=80&q=70', confidence: 45 },
];

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
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(allClaims.map(c => [c.id, c.status]))
  );

  const approve = (id: string) => setStatuses(s => ({ ...s, [id]: 'approved' }));
  const reject = (id: string) => setStatuses(s => ({ ...s, [id]: 'rejected' }));

  const tabs = ['All', 'Pending', 'Reviewing', 'Approved', 'Rejected'];
  const filtered = allClaims.filter(c => {
    const matchesFilter = filter === 'All' || statuses[c.id].toLowerCase() === filter.toLowerCase();
    const matchesSearch = c.item.toLowerCase().includes(search.toLowerCase()) || c.claimant.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = { pending: allClaims.filter(c => statuses[c.id] === 'pending').length, reviewing: allClaims.filter(c => statuses[c.id] === 'reviewing').length };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary">Claim Management</h2>
          <p className="text-text-secondary mt-1">Review ownership claims and submitted evidence.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-border-default rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-extrabold text-warning">{counts.pending}</p>
            <p className="text-xs text-text-secondary">Pending</p>
          </div>
          <div className="bg-white border border-border-default rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-extrabold text-info-ai">{counts.reviewing}</p>
            <p className="text-xs text-text-secondary">Reviewing</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: '247', icon: <Clock className="w-5 h-5 text-primary" />, color: 'bg-primary/10', border: 'border-primary' },
          { label: 'Approved', value: '189', icon: <CheckCircle2 className="w-5 h-5 text-success" />, color: 'bg-success/10', border: 'border-success' },
          { label: 'Rejected', value: '41', icon: <XCircle className="w-5 h-5 text-danger" />, color: 'bg-danger/10', border: 'border-danger' },
          { label: 'Avg. Resolution', value: '4.2h', icon: <Eye className="w-5 h-5 text-info-ai" />, color: 'bg-info-ai/10', border: 'border-info-ai' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${s.border} flex items-center gap-3`}>
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>
        <div className="flex bg-white border border-border-default rounded-xl p-1">
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
      <div className="bg-white rounded-2xl shadow-sm border border-border-default overflow-hidden">
        {/* Desktop */}
        <table className="hidden md:table w-full">
          <thead className="bg-surface-container-low border-b border-border-default">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Claimant</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {filtered.map(claim => (
              <tr key={claim.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={claim.img} alt={claim.item} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-sm text-text-primary">{claim.item}</p>
                      <p className="text-xs text-text-secondary">{claim.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-text-primary">{claim.claimant}</p>
                  <p className="text-xs text-text-secondary">{claim.studentId}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${claim.confidence > 80 ? 'bg-success' : claim.confidence > 60 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${claim.confidence}%` }} />
                    </div>
                    <span className="text-xs font-bold text-text-secondary">{claim.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-text-secondary">{claim.time}</td>
                <td className="px-6 py-4"><StatusBadge status={statuses[claim.id]} /></td>
                <td className="px-6 py-4">
                  {statuses[claim.id] === 'approved' || statuses[claim.id] === 'rejected' ? (
                    <span className="text-xs text-text-secondary italic">Closed</span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => approve(claim.id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors" title="Approve">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => reject(claim.id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors" title="Reject">
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
          {filtered.map(claim => (
            <div key={claim.id} className="p-4">
              <div className="flex gap-3 mb-3">
                <img src={claim.img} alt={claim.item} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text-primary">{claim.item}</h4>
                  <p className="text-xs text-text-secondary">Claimed by {claim.claimant} · {claim.studentId}</p>
                  <p className="text-xs text-text-secondary">{claim.time}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={statuses[claim.id]} />
                    <span className="text-xs text-text-secondary">{claim.confidence}% confidence</span>
                  </div>
                </div>
              </div>
              {statuses[claim.id] !== 'approved' && statuses[claim.id] !== 'rejected' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(claim.id)} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => reject(claim.id)} className="flex-1 py-2 border border-danger text-danger rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
