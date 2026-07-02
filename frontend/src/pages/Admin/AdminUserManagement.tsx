import React, { useState, useEffect } from 'react';
import { Search, Ban, ShieldCheck, Star, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-success/10 text-success',
    warned: 'bg-warning/10 text-warning',
    suspended: 'bg-orange-100 text-orange-600',
    banned: 'bg-danger/10 text-danger',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] ?? ''}`}>{status}</span>;
};

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/admin/users`);
      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err: any) {
      console.error('Failed to load users', err);
      setError(err.response?.data?.error || 'Failed to fetch users from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${API_BASE}/api/admin/users/${id}/status`, { status });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to update status to ${status}`);
    }
  };

  const handleUpdateRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;
    try {
      await axios.put(`${API_BASE}/api/admin/users/${id}/role`, { role: nextRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to change role');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.studentId?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    warned: users.filter(u => u.status === 'warned').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-text-secondary mt-4">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-text-primary">User Management</h2>
        <p className="text-text-secondary mt-1">Monitor and manage user accounts and campus community members.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: String(stats.total), icon: <Users className="w-5 h-5 text-primary" />, c: 'bg-primary/10', b: 'border-primary' },
          { label: 'Active Status', value: String(stats.active), icon: <TrendingUp className="w-5 h-5 text-success" />, c: 'bg-success/10', b: 'border-success' },
          { label: 'Warned', value: String(stats.warned), icon: <ShieldCheck className="w-5 h-5 text-warning" />, c: 'bg-warning/10', b: 'border-warning' },
          { label: 'Banned', value: String(stats.banned), icon: <Ban className="w-5 h-5 text-danger" />, c: 'bg-danger/10', b: 'border-danger' },
        ].map((s, i) => (
          <div key={i} className={`bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-4 shadow-sm border-l-4 ${s.b} flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl ${s.c} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">{s.label}</p>
              <p className="text-xl font-extrabold text-text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, student ID, or email..." className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
      </div>

      {/* Desktop Table */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm border border-border-default overflow-hidden">
        <table className="hidden md:table w-full">
          <thead className="bg-surface-container-low border-b border-border-default">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">XP / Level</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Reports</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {filtered.map((user: any) => (
              <tr key={user._id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=70'} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-border-default" />
                    <div>
                      <p className="font-bold text-sm text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary font-mono">{user.studentId || 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#f9bd22]" />
                    <span className="font-bold text-sm text-text-primary">{(user.xp || 0).toLocaleString()} XP</span>
                    <span className="text-xs text-text-secondary">Lv.{user.level || 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-text-primary">{user.reportsCount || 0}</td>
                <td className="px-6 py-4 text-sm text-text-secondary uppercase font-bold">{user.role}</td>
                <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.status !== 'active' && (
                      <button onClick={() => handleUpdateStatus(user._id, 'active')} className="px-2 py-1 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Restore
                      </button>
                    )}
                    {user.status === 'active' && (
                      <button onClick={() => handleUpdateStatus(user._id, 'warned')} className="px-2 py-1 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors text-xs font-bold">Warn</button>
                    )}
                    {user.status !== 'banned' && (
                      <button onClick={() => handleUpdateStatus(user._id, 'banned')} className="px-2 py-1 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-xs font-bold flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Ban
                      </button>
                    )}
                    <button onClick={() => handleUpdateRole(user._id, user.role)} className="px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-bold">Toggle Admin</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border-default">
          {filtered.map((user: any) => (
            <div key={user._id} className="p-4">
              <div className="flex gap-3 mb-3">
                <img src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=70'} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-border-default flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text-primary">{user.name}</h4>
                  <p className="text-xs text-text-secondary">{user.studentId || 'N/A'} (Role: {user.role})</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-[#f9bd22]" />
                    <span className="text-xs font-bold text-text-primary">{(user.xp || 0).toLocaleString()} XP Â· Lv.{user.level || 1}</span>
                  </div>
                  <div className="mt-1"><StatusBadge status={user.status} /></div>
                </div>
              </div>
              <div className="flex gap-2">
                {user.status !== 'active' && (
                  <button onClick={() => handleUpdateStatus(user._id, 'active')} className="flex-1 py-2 bg-success/10 text-success rounded-xl text-xs font-bold">Restore</button>
                )}
                {user.status === 'active' && (
                  <button onClick={() => handleUpdateStatus(user._id, 'warned')} className="flex-1 py-2 bg-warning/10 text-warning rounded-xl text-xs font-bold">Warn</button>
                )}
                {user.status !== 'banned' && (
                  <button onClick={() => handleUpdateStatus(user._id, 'banned')} className="flex-1 py-2 bg-danger/10 text-danger rounded-xl text-xs font-bold">Ban</button>
                )}
                <button onClick={() => handleUpdateRole(user._id, user.role)} className="flex-1 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold">Toggle Admin</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
