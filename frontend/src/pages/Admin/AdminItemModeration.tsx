import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Search, AlertTriangle, Package, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-success/10 text-success',
    archived: 'bg-danger/10 text-danger',
    claimed: 'bg-info-ai/10 text-info-ai',
    resolved: 'bg-info-ai/10 text-info-ai',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] ?? 'bg-surface text-text-secondary'}`}>{status}</span>;
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${type === 'lost' ? 'bg-warning/10 text-warning' : 'bg-info-ai/10 text-info-ai'}`}>
    {type}
  </span>
);

export const AdminItemModeration: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('All Items');
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/admin/items`);
      if (res.data && res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err: any) {
      console.error('Failed to load items', err);
      setError(err.response?.data?.error || 'Failed to fetch items from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/api/admin/items/${id}/approve`);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve item');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/api/admin/items/${id}/reject`);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject/archive item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this item?')) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/items/${id}`);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const filtered = items.filter(item => {
    const matchType = typeFilter === 'All Items' || item.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || 
                        item.reporter?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    pending: items.filter(i => i.status === 'pending').length,
    active: items.filter(i => i.status === 'active').length,
    archived: items.filter(i => i.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-text-secondary mt-4">Loading items for moderation...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary">Item Moderation</h2>
          <p className="text-text-secondary mt-1">Review and validate reported lost and found items from the campus community.</p>
        </div>
        <div className="flex items-center bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl p-1">
          {['All Items', 'Lost', 'Found'].map(tab => (
            <button key={tab} onClick={() => setTypeFilter(tab)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${typeFilter === tab ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>{tab}</button>
          ))}
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
          { label: 'Active Items', value: String(stats.active), icon: <Package className="w-5 h-5 text-success" />, c: 'bg-success/10', b: 'border-success' },
          { label: 'Archived', value: String(stats.archived), icon: <XCircle className="w-5 h-5 text-danger" />, c: 'bg-danger/10', b: 'border-danger' },
          { label: 'Total Reports', value: String(items.length), icon: <AlertTriangle className="w-5 h-5 text-primary" />, c: 'bg-primary/10', b: 'border-primary' },
          { label: 'System Health', value: 'Optimal', icon: <CheckCircle2 className="w-5 h-5 text-info-ai" />, c: 'bg-info-ai/10', b: 'border-info-ai' },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by item name, reporter or ID..." className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl shadow-sm border border-border-default overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No items match the selected filter.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <table className="hidden md:table w-full">
              <thead className="bg-surface-container-low border-b border-border-default">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.img || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-sm text-text-primary">{item.name}</p>
                          <p className="text-xs text-text-secondary">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><TypeBadge type={item.type} /></td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{item.reporter}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{item.location}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {item.status !== 'active' && (
                          <button onClick={() => handleApprove(item.id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors" title="Activate/Approve"><CheckCircle2 className="w-4 h-4" /></button>
                        )}
                        {item.status !== 'archived' && (
                          <button onClick={() => handleReject(item.id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors" title="Reject/Archive"><XCircle className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors" title="Permanently Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-border-default">
              {filtered.map((item: any) => (
                <div key={item.id} className="p-4">
                  <div className="flex gap-3 mb-3">
                    <img src={item.img || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-text-primary">{item.name}</h4>
                      <p className="text-xs text-text-secondary">{item.reporter} Â· {item.location}</p>
                      <p className="text-xs text-text-secondary">{new Date(item.date).toLocaleDateString()}</p>
                      <div className="mt-1 flex gap-2">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.status !== 'active' && (
                      <button onClick={() => handleApprove(item.id)} className="flex-1 py-2 bg-success text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"><CheckCircle2 className="w-4 h-4" /> Approve</button>
                    )}
                    {item.status !== 'archived' && (
                      <button onClick={() => handleReject(item.id)} className="flex-1 py-2 border border-danger text-danger rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"><XCircle className="w-4 h-4" /> Reject</button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-danger/10 text-danger rounded-xl font-bold text-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
