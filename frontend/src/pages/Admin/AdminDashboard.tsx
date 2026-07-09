import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Users, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning uppercase">Pending</span>;
  if (status === 'reviewing') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-info-ai/10 text-info-ai uppercase">Reviewing</span>;
  if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase">Approved</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger/10 text-danger uppercase">Rejected</span>;
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    pendingClaims: 0,
    resolvedToday: 0,
    totalUsers: 0
  });
  const [claims, setClaims] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, claimsRes, matchesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/dashboard`),
        axios.get(`${API_BASE}/api/claims?status=pending`),
        axios.get(`${API_BASE}/api/ai/matches`)
      ]);
      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data);
      }
      if (claimsRes.data && claimsRes.data.success) {
        setClaims(claimsRes.data.claims || claimsRes.data.data?.claims || []);
      }
      if (matchesRes.data && matchesRes.data.success) {
        setMatches(matchesRes.data.matches || []);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError(err.response?.data?.error || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/claims/${id}/approve`, { remarks: 'Approved from dashboard quick action' });
      // Refresh statistics and list
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve claim');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/claims/${id}/reject`, { reason: 'Rejected from dashboard quick action' });
      // Refresh statistics and list
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject claim');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-text-secondary mt-4">Loading dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-text-primary">Campus Overview</h2>
        <p className="text-text-secondary mt-1">Welcome back, Senior Admin.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="System Health" value="24ms" sub="Global Latency · Active" icon={<CheckCircle2 className="w-5 h-5 text-success" />} color="bg-success/10" border="border-success" />
        <StatCard label="Active Items" value={String(stats.totalLost + stats.totalFound)} sub="Total Reported" icon={<Package className="w-5 h-5 text-primary" />} color="bg-primary/10" border="border-primary" />
        <StatCard label="Pending Claims" value={String(stats.pendingClaims)} sub="Needs review" icon={<Clock className="w-5 h-5 text-warning" />} color="bg-warning/10" border="border-warning" />
        <StatCard label="Active Users" value={String(stats.totalUsers)} sub="Total Registered" icon={<Users className="w-5 h-5 text-info-ai" />} color="bg-info-ai/10" border="border-info-ai" />
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
            <span className="ml-auto bg-info-ai text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {matches.filter((m: any) => m.status === 'new').length} NEW
            </span>
          </div>
          <div className="space-y-3">
            {matches.slice(0, 2).map((match: any) => {
              const itemTitle = match.lostItem?.itemName || match.foundItem?.itemName || 'Unknown Item';
              const img = match.lostItem?.images?.[0] || match.foundItem?.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=80&q=70';
              return (
                <Link to="/matches" key={match._id} className="flex gap-3 items-center p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer block">
                  <img src={img} alt={itemTitle} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-text-primary">{itemTitle}</h4>
                    <p className="text-xs text-info-ai font-bold">{match.score}% Match</p>
                  </div>
                  <span className="text-text-secondary">›</span>
                </Link>
              );
            })}
            {matches.length === 0 && (
              <p className="text-xs text-text-secondary text-center py-6">No Suggested Matches available.</p>
            )}
            <Link to="/matches" className="block w-full">
              <button className="w-full py-3 bg-info-ai/10 text-info-ai font-bold rounded-xl hover:bg-info-ai/20 transition-colors text-sm">
                View All Suggested Matches
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 shadow-sm border border-border-default transition-colors duration-300">
          <h3 className="font-bold text-lg text-text-primary mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/claims" className="p-4 bg-warning/5 border border-warning/20 rounded-xl hover:bg-warning/10 transition-colors cursor-pointer text-center">
              <Clock className="w-7 h-7 text-warning mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">{stats.pendingClaims} Pending</p>
              <p className="text-xs text-text-secondary">Claims</p>
            </Link>
            <Link to="/admin/items" className="p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer text-center">
              <Package className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">Manage</p>
              <p className="text-xs text-text-secondary">Items</p>
            </Link>
            <Link to="/admin/users" className="p-4 bg-success/5 border border-success/20 rounded-xl hover:bg-success/10 transition-colors cursor-pointer text-center">
              <Users className="w-7 h-7 text-success mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">{stats.totalUsers}</p>
              <p className="text-xs text-text-secondary">Users</p>
            </Link>
            <Link to="/admin/community" className="p-4 bg-danger/5 border border-danger/20 rounded-xl hover:bg-danger/10 transition-colors cursor-pointer text-center">
              <AlertTriangle className="w-7 h-7 text-danger mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">Moderate</p>
              <p className="text-xs text-text-secondary">Community</p>
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
          {claims.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              No pending claims requiring approval at the moment. Good job!
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
                  {claims.slice(0, 5).map((claim: any) => (
                    <tr key={claim._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-sm text-text-primary">{claim.foundItemId?.itemName}</p>
                            <p className="text-xs text-text-secondary">{claim.claimId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{(claim.claimant as any)?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary font-bold">{claim.confidence}%</td>
                      <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(claim._id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(claim._id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border-default">
                {claims.slice(0, 5).map((claim: any) => (
                  <div key={claim._id} className="p-4">
                    <div className="flex gap-3 mb-3">
                      <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text-primary">{claim.foundItemId?.itemName}</h4>
                        <p className="text-xs text-text-secondary">Claimed by {(claim.claimant as any)?.name || 'Unknown'}</p>
                        <p className="text-xs text-text-secondary">Confidence: {claim.confidence}%</p>
                        <div className="mt-1"><StatusBadge status={claim.status} /></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(claim._id)} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => handleReject(claim._id)} className="flex-1 py-2 border border-danger text-danger rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
