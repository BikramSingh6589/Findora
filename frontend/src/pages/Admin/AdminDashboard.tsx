import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Users, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode; color: string; border: string }> = ({ label, value, sub, icon, color, border }) => (
  <div className={`bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 shadow-sm border-l-4 ${border} flex flex-col justify-between transition-colors duration-300`}>
    <div className="flex justify-between items-start">
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</p>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
    </div>
    <div className="mt-4">
      <span className="text-3xl font-extrabold text-text-primary block">{value}</span>
      <span className="text-xs text-text-secondary">{sub}</span>
    </div>
  </div>
);

const pendingClaims = [
  { id: 'CLM-001', item: 'Sony XM5 Headphones', claimant: 'Kevin S.', time: '10 mins ago', status: 'pending', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=70' },
  { id: 'CLM-002', item: 'Leather Wallet', claimant: 'Maya R.', time: '25 mins ago', status: 'pending', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&q=70' },
  { id: 'CLM-003', item: 'MacBook Air M2', claimant: 'Daniel F.', time: '1h ago', status: 'reviewing', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=70' },
  { id: 'CLM-004', item: 'Blue JBL Earbuds', claimant: 'Sarah T.', time: '2h ago', status: 'pending', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&q=70' },
  { id: 'CLM-005', item: 'Student ID Card', claimant: 'Alex W.', time: '3h ago', status: 'reviewing', img: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning uppercase">Pending</span>;
  if (status === 'reviewing') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-info-ai/10 text-info-ai uppercase">Reviewing</span>;
  if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase">Approved</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger/10 text-danger uppercase">Rejected</span>;
};

export const AdminDashboard: React.FC = () => {
  const [claimStatuses, setClaimStatuses] = useState<Record<string, string>>(
    Object.fromEntries(pendingClaims.map(c => [c.id, c.status]))
  );

  const approve = (id: string) => setClaimStatuses(s => ({ ...s, [id]: 'approved' }));
  const reject = (id: string) => setClaimStatuses(s => ({ ...s, [id]: 'rejected' }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-text-primary">Campus Overview</h2>
        <p className="text-text-secondary mt-1">Welcome back, Senior Admin.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="System Health" value="24ms" sub="Global Latency · Active" icon={<CheckCircle2 className="w-5 h-5 text-success" />} color="bg-success/10" border="border-success" />
        <StatCard label="Active Items" value="1,284" sub="+12 today" icon={<Package className="w-5 h-5 text-primary" />} color="bg-primary/10" border="border-primary" />
        <StatCard label="Pending Claims" value="18" sub="Needs review" icon={<Clock className="w-5 h-5 text-warning" />} color="bg-warning/10" border="border-warning" />
        <StatCard label="Active Users" value="3,841" sub="This month" icon={<Users className="w-5 h-5 text-info-ai" />} color="bg-info-ai/10" border="border-info-ai" />
      </div>

      {/* XP Progress */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 shadow-sm border border-border-default transition-colors duration-300">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-sm text-text-primary">Campus XP Goal</p>
          <span className="text-sm font-extrabold text-primary">84%</span>
        </div>
        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-[#6b38d4] w-[84%] rounded-full shadow-[0_0_10px_rgba(91,95,239,0.4)]"></div>
        </div>
        <p className="text-xs text-text-secondary mt-2">2,450 / 3,000 XP to Community Reward</p>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Match Alerts */}
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 shadow-sm border border-info-ai/20 relative overflow-hidden transition-colors duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-info-ai/10 p-2 rounded-xl">
              <Star className="w-5 h-5 text-info-ai" />
            </div>
            <h3 className="font-bold text-lg text-text-primary">AI Match Alerts</h3>
            <span className="ml-auto bg-info-ai text-white text-[10px] px-2 py-0.5 rounded-full font-bold">4 NEW</span>
          </div>
          <div className="space-y-3">
            {[
              { item: 'MacBook Air M2', match: '98% Match', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=70' },
              { item: 'Sony XM5 Headphones', match: '94% Match', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=70' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-3 items-center p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                <img src={alert.img} alt={alert.item} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text-primary">{alert.item}</h4>
                  <p className="text-xs text-info-ai font-bold">{alert.match}</p>
                </div>
                <span className="text-text-secondary">›</span>
              </div>
            ))}
            <button className="w-full py-3 bg-info-ai/10 text-info-ai font-bold rounded-xl hover:bg-info-ai/20 transition-colors text-sm">
              View All Suggested Matches
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 shadow-sm border border-border-default transition-colors duration-300">
          <h3 className="font-bold text-lg text-text-primary mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/claims" className="p-4 bg-warning/5 border border-warning/20 rounded-xl hover:bg-warning/10 transition-colors cursor-pointer text-center">
              <Clock className="w-7 h-7 text-warning mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">18 Pending</p>
              <p className="text-xs text-text-secondary">Claims</p>
            </Link>
            <Link to="/admin/items" className="p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer text-center">
              <Package className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">24 Pending</p>
              <p className="text-xs text-text-secondary">Items</p>
            </Link>
            <Link to="/admin/users" className="p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-colors cursor-pointer text-center">
              <Users className="w-7 h-7 text-success mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">3,841</p>
              <p className="text-xs text-text-secondary">Users</p>
            </Link>
            <Link to="/admin/community" className="p-4 bg-danger/5 border border-danger/20 rounded-xl hover:bg-danger/10 transition-colors cursor-pointer text-center">
              <AlertTriangle className="w-7 h-7 text-danger mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">7 Flagged</p>
              <p className="text-xs text-text-secondary">Posts</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Claims Table */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-extrabold text-text-primary">Pending Claims</h3>
          <Link to="/admin/claims" className="text-sm font-bold text-primary hover:underline">See all</Link>
        </div>
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm border border-border-default overflow-hidden transition-colors duration-300">
          {/* Desktop Table */}
          <table className="hidden md:table w-full">
            <thead className="bg-surface-container-low border-b border-border-default">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Claimant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {pendingClaims.map(claim => (
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
                  <td className="px-6 py-4 text-sm text-text-secondary">{claim.claimant}</td>
                  <td className="px-6 py-4 text-xs text-text-secondary">{claim.time}</td>
                  <td className="px-6 py-4"><StatusBadge status={claimStatuses[claim.id]} /></td>
                  <td className="px-6 py-4">
                    {claimStatuses[claim.id] === 'approved' || claimStatuses[claim.id] === 'rejected' ? (
                      <span className="text-xs text-text-secondary italic">Decision made</span>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => approve(claim.id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => reject(claim.id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors">
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
            {pendingClaims.map(claim => (
              <div key={claim.id} className="p-4">
                <div className="flex gap-3 mb-3">
                  <img src={claim.img} alt={claim.item} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-text-primary">{claim.item}</h4>
                    <p className="text-xs text-text-secondary">Claimed by {claim.claimant}</p>
                    <p className="text-xs text-text-secondary">{claim.time}</p>
                    <div className="mt-1"><StatusBadge status={claimStatuses[claim.id]} /></div>
                  </div>
                </div>
                {claimStatuses[claim.id] !== 'approved' && claimStatuses[claim.id] !== 'rejected' && (
                  <div className="flex gap-2">
                    <button onClick={() => approve(claim.id)} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => reject(claim.id)} className="flex-1 py-2 border border-danger text-danger rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
