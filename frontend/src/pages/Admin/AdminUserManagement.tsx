import React, { useState } from 'react';
import { Search, Ban, ShieldCheck, Star, Users, TrendingUp } from 'lucide-react';

const allUsers = [
  { id: 'USR-001', name: 'Kevin Sanders', studentId: 'SU-2024-0012', email: 'k.sanders@campus.edu', xp: 2450, level: 12, status: 'active', reports: 14, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=70' },
  { id: 'USR-002', name: 'Maya Rodriguez', studentId: 'SU-2024-0289', email: 'm.rodriguez@campus.edu', xp: 1870, level: 9, status: 'active', reports: 8, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=70' },
  { id: 'USR-003', name: 'Daniel Ford', studentId: 'SU-2023-4411', email: 'd.ford@campus.edu', xp: 3200, level: 15, status: 'active', reports: 22, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=70' },
  { id: 'USR-004', name: 'Sarah Thompson', studentId: 'SU-2024-1102', email: 's.thompson@campus.edu', xp: 980, level: 5, status: 'warned', reports: 3, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=70' },
  { id: 'USR-005', name: 'Alex Williams', studentId: 'SU-2024-0778', email: 'a.williams@campus.edu', xp: 450, level: 2, status: 'suspended', reports: 1, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=70' },
  { id: 'USR-006', name: 'Priya Mehta', studentId: 'SU-2024-0443', email: 'p.mehta@campus.edu', xp: 5100, level: 22, status: 'active', reports: 41, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=70' },
  { id: 'USR-007', name: 'Chris Lin', studentId: 'SU-2022-9901', email: 'c.lin@campus.edu', xp: 720, level: 4, status: 'banned', reports: 2, img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&q=70' },
];

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
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(allUsers.map(u => [u.id, u.status])));

  const warn = (id: string) => setStatuses(s => ({ ...s, [id]: 'warned' }));
  const ban = (id: string) => setStatuses(s => ({ ...s, [id]: 'banned' }));
  const restore = (id: string) => setStatuses(s => ({ ...s, [id]: 'active' }));

  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.studentId.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-text-primary">User Management</h2>
        <p className="text-text-secondary mt-1">Monitor and manage user accounts and campus community members.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '3,841', icon: <Users className="w-5 h-5 text-primary" />, c: 'bg-primary/10', b: 'border-primary' },
          { label: 'Active Today', value: '1,204', icon: <TrendingUp className="w-5 h-5 text-success" />, c: 'bg-success/10', b: 'border-success' },
          { label: 'Warned', value: '12', icon: <ShieldCheck className="w-5 h-5 text-warning" />, c: 'bg-warning/10', b: 'border-warning' },
          { label: 'Banned', value: '3', icon: <Ban className="w-5 h-5 text-danger" />, c: 'bg-danger/10', b: 'border-danger' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${s.b} flex items-center gap-3`}>
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, student ID, or email..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-default overflow-hidden">
        <table className="hidden md:table w-full">
          <thead className="bg-surface-container-low border-b border-border-default">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">XP / Level</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Reports</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.img} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-border-default" />
                    <div>
                      <p className="font-bold text-sm text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary font-mono">{user.studentId}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#f9bd22]" />
                    <span className="font-bold text-sm text-text-primary">{user.xp.toLocaleString()} XP</span>
                    <span className="text-xs text-text-secondary">Lv.{user.level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-text-primary">{user.reports}</td>
                <td className="px-6 py-4"><StatusBadge status={statuses[user.id]} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {(statuses[user.id] === 'warned' || statuses[user.id] === 'banned' || statuses[user.id] === 'suspended') && (
                      <button onClick={() => restore(user.id)} className="px-2 py-1 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Restore
                      </button>
                    )}
                    {statuses[user.id] === 'active' && (
                      <button onClick={() => warn(user.id)} className="px-2 py-1 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors text-xs font-bold">Warn</button>
                    )}
                    {statuses[user.id] !== 'banned' && (
                      <button onClick={() => ban(user.id)} className="px-2 py-1 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-xs font-bold flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Ban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border-default">
          {filtered.map(user => (
            <div key={user.id} className="p-4">
              <div className="flex gap-3 mb-3">
                <img src={user.img} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-border-default flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text-primary">{user.name}</h4>
                  <p className="text-xs text-text-secondary">{user.studentId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-[#f9bd22]" />
                    <span className="text-xs font-bold text-text-primary">{user.xp.toLocaleString()} XP · Lv.{user.level}</span>
                  </div>
                  <div className="mt-1"><StatusBadge status={statuses[user.id]} /></div>
                </div>
              </div>
              <div className="flex gap-2">
                {statuses[user.id] !== 'banned' && statuses[user.id] !== 'active' && (
                  <button onClick={() => restore(user.id)} className="flex-1 py-2 bg-success/10 text-success rounded-xl text-xs font-bold">Restore</button>
                )}
                {statuses[user.id] === 'active' && (
                  <button onClick={() => warn(user.id)} className="flex-1 py-2 bg-warning/10 text-warning rounded-xl text-xs font-bold">Warn</button>
                )}
                {statuses[user.id] !== 'banned' && (
                  <button onClick={() => ban(user.id)} className="flex-1 py-2 bg-danger/10 text-danger rounded-xl text-xs font-bold">Ban</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
