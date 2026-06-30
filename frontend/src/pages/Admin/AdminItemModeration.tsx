import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search, AlertTriangle, Package } from 'lucide-react';

const allItems = [
  { id: 'ITM-101', name: 'MacBook Air M2', type: 'lost', reporter: 'Daniel F.', location: 'Engineering Library', date: '2h ago', status: 'pending', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=70' },
  { id: 'ITM-102', name: 'Sony XM5 Headphones', type: 'found', reporter: 'Kevin S.', location: 'Student Cafeteria', date: '3h ago', status: 'pending', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=70' },
  { id: 'ITM-103', name: 'Student ID Card', type: 'found', reporter: 'Alex W.', location: 'Main Gate', date: '4h ago', status: 'approved', img: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70' },
  { id: 'ITM-104', name: 'Leather Wallet', type: 'lost', reporter: 'Maya R.', location: 'Sports Complex', date: '5h ago', status: 'flagged', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&q=70' },
  { id: 'ITM-105', name: 'Blue JBL Earbuds', type: 'found', reporter: 'Sarah T.', location: 'Lecture Hall B', date: '6h ago', status: 'approved', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&q=70' },
  { id: 'ITM-106', name: 'Black Umbrella', type: 'found', reporter: 'Chris L.', location: 'Science Block', date: '8h ago', status: 'pending', img: 'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=80&q=70' },
  { id: 'ITM-107', name: 'Water Bottle (Blue)', type: 'lost', reporter: 'Priya M.', location: 'Gym', date: '10h ago', status: 'rejected', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=80&q=70' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    flagged: 'bg-danger/10 text-danger',
    rejected: 'bg-surface-container text-text-secondary',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] ?? ''}`}>{status}</span>;
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${type === 'lost' ? 'bg-warning/10 text-warning' : 'bg-info-ai/10 text-info-ai'}`}>
    {type}
  </span>
);

export const AdminItemModeration: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('All Items');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(allItems.map(i => [i.id, i.status])));

  const approve = (id: string) => setStatuses(s => ({ ...s, [id]: 'approved' }));
  const reject = (id: string) => setStatuses(s => ({ ...s, [id]: 'rejected' }));

  const filtered = allItems.filter(item => {
    const matchType = typeFilter === 'All Items' || item.type === typeFilter.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.reporter.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: '24', icon: <AlertTriangle className="w-5 h-5 text-warning" />, c: 'bg-warning/10', b: 'border-warning' },
          { label: 'Approved Today', value: '142', icon: <CheckCircle2 className="w-5 h-5 text-success" />, c: 'bg-success/10', b: 'border-success' },
          { label: 'Flagged Items', value: '3', icon: <XCircle className="w-5 h-5 text-danger" />, c: 'bg-danger/10', b: 'border-danger' },
          { label: 'Total Active', value: '1,284', icon: <Package className="w-5 h-5 text-primary" />, c: 'bg-primary/10', b: 'border-primary' },
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
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-sm text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.id} Â· {item.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><TypeBadge type={item.type} /></td>
                <td className="px-6 py-4 text-sm text-text-secondary">{item.reporter}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{item.location}</td>
                <td className="px-6 py-4"><StatusBadge status={statuses[item.id]} /></td>
                <td className="px-6 py-4">
                  {statuses[item.id] === 'approved' || statuses[item.id] === 'rejected' ? (
                    <span className="text-xs text-text-secondary italic">Closed</span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => approve(item.id)} className="p-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                      <button onClick={() => reject(item.id)} className="p-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border-default">
          {filtered.map(item => (
            <div key={item.id} className="p-4">
              <div className="flex gap-3 mb-3">
                <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text-primary">{item.name}</h4>
                  <p className="text-xs text-text-secondary">{item.reporter} Â· {item.location}</p>
                  <p className="text-xs text-text-secondary">{item.date}</p>
                  <div className="mt-1 flex gap-2">
                    <TypeBadge type={item.type} />
                    <StatusBadge status={statuses[item.id]} />
                  </div>
                </div>
              </div>
              {statuses[item.id] !== 'approved' && statuses[item.id] !== 'rejected' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(item.id)} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"><CheckCircle2 className="w-4 h-4" /> Approve</button>
                  <button onClick={() => reject(item.id)} className="flex-1 py-2 border border-danger text-danger rounded-xl font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"><XCircle className="w-4 h-4" /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
