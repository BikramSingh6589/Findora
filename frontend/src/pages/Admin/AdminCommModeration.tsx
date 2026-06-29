import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle, MessageSquareWarning, Flag } from 'lucide-react';

const allPosts = [
  { id: 'POST-001', author: 'Kevin S.', content: 'Found a black wallet near the cafeteria – looks expensive! Come claim it ASAP.', type: 'found', flagReason: '', time: '10 mins ago', status: 'active', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=70' },
  { id: 'POST-002', author: 'Anonymous', content: 'SCAM ALERT: Someone is asking for money to return lost items! Report them immediately!', type: 'warning', flagReason: 'Potential misinformation', time: '25 mins ago', status: 'flagged', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=70' },
  { id: 'POST-003', author: 'Maya R.', content: 'I lost my blue JBL earbuds somewhere near Lecture Hall B. Please message me if found.', type: 'lost', flagReason: '', time: '1h ago', status: 'active', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=70' },
  { id: 'POST-004', author: 'UnknownUser99', content: 'BUY CHEAP ESSAYS HERE! Assignment help guaranteed 100%', type: 'spam', flagReason: 'Spam / Promotional', time: '2h ago', status: 'flagged', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&q=70' },
  { id: 'POST-005', author: 'Daniel F.', content: 'Has anyone seen a silver MacBook with a blue uni sticker? Lost it in the Engineering Library.', type: 'lost', flagReason: '', time: '3h ago', status: 'active', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=70' },
  { id: 'POST-006', author: 'Sarah T.', content: 'Found a student ID near the main gate. Has a photo – please DM me to claim.', type: 'found', flagReason: '', time: '4h ago', status: 'removed', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=70' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-success/10 text-success',
    flagged: 'bg-danger/10 text-danger',
    removed: 'bg-surface-container text-text-secondary',
    approved: 'bg-success/10 text-success',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${map[status] ?? ''}`}>{status}</span>;
};

const TypePill: React.FC<{ type: string; flagReason?: string }> = ({ type, flagReason }) => {
  if (flagReason) return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-danger/10 text-danger">
      <Flag className="w-3 h-3" /> {flagReason}
    </span>
  );
  const map: Record<string, string> = { found: 'bg-info-ai/10 text-info-ai', lost: 'bg-warning/10 text-warning', spam: 'bg-danger/10 text-danger', warning: 'bg-orange-100 text-orange-600' };
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${map[type] ?? 'bg-surface text-text-secondary'}`}>{type}</span>;
};

export const AdminCommModeration: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(allPosts.map(p => [p.id, p.status])));

  const approve = (id: string) => setStatuses(s => ({ ...s, [id]: 'approved' }));
  const remove = (id: string) => setStatuses(s => ({ ...s, [id]: 'removed' }));

  const filtered = allPosts.filter(p =>
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase())
  );

  const flaggedCount = allPosts.filter(p => statuses[p.id] === 'flagged').length;
  const activeCount = allPosts.filter(p => statuses[p.id] === 'active' || statuses[p.id] === 'approved').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-text-primary">Community Moderation</h2>
        <p className="text-text-secondary mt-1">Review flagged posts, comments, and community board activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: String(allPosts.length), icon: <MessageSquareWarning className="w-5 h-5 text-primary" />, c: 'bg-primary/10', b: 'border-primary' },
          { label: 'Active Posts', value: String(activeCount), icon: <CheckCircle2 className="w-5 h-5 text-success" />, c: 'bg-success/10', b: 'border-success' },
          { label: 'Flagged', value: String(flaggedCount), icon: <Flag className="w-5 h-5 text-danger" />, c: 'bg-danger/10', b: 'border-danger' },
          { label: 'Removed Today', value: '7', icon: <XCircle className="w-5 h-5 text-warning" />, c: 'bg-warning/10', b: 'border-warning' },
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

      {/* Flagged Alert */}
      {flaggedCount > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-sm font-bold text-danger">{flaggedCount} posts require immediate attention.</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts or authors..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filtered.map(post => (
          <div
            key={post.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${
              statuses[post.id] === 'flagged' ? 'border-danger/30 bg-danger/5' : 'border-border-default'
            }`}
          >
            <div className="flex items-start gap-3">
              <img src={post.img} alt={post.author} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-border-default" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-bold text-sm text-text-primary">{post.author}</h4>
                  <TypePill type={post.type} flagReason={post.flagReason} />
                  <span className="text-xs text-text-secondary ml-auto">{post.time}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>

                <div className="flex items-center justify-between mt-3">
                  <StatusBadge status={statuses[post.id]} />
                  {statuses[post.id] !== 'removed' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(post.id)} className="px-3 py-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Keep
                      </button>
                      <button onClick={() => remove(post.id)} className="px-3 py-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-xs font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
