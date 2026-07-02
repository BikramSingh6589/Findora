import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle, MessageSquareWarning, Flag } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/admin/community`);
      if (res.data && res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err: any) {
      console.error('Failed to load posts', err);
      setError(err.response?.data?.error || 'Failed to fetch community posts from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const approve = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/api/admin/community/${id}/approve`);
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to keep/approve post');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this post from the community board?')) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/community/${id}`);
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove post');
    }
  };

  const filtered = posts.filter(p =>
    p.author?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase())
  );

  const flaggedCount = posts.filter(p => p.status === 'flagged').length;
  const activeCount = posts.filter(p => p.status === 'active' || p.status === 'approved').length;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-text-secondary mt-4">Loading posts for moderation...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-text-primary">Community Moderation</h2>
        <p className="text-text-secondary mt-1">Review flagged posts, comments, and community board activity.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: String(posts.length), icon: <MessageSquareWarning className="w-5 h-5 text-primary" />, c: 'bg-primary/10', b: 'border-primary' },
          { label: 'Active Posts', value: String(activeCount), icon: <CheckCircle2 className="w-5 h-5 text-success" />, c: 'bg-success/10', b: 'border-success' },
          { label: 'Flagged', value: String(flaggedCount), icon: <Flag className="w-5 h-5 text-danger" />, c: 'bg-danger/10', b: 'border-danger' },
          { label: 'Removed Today', value: String(posts.filter(p => p.status === 'removed').length), icon: <XCircle className="w-5 h-5 text-warning" />, c: 'bg-warning/10', b: 'border-warning' },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts or authors..." className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" />
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No posts found under the active filter.
          </div>
        ) : (
          filtered.map(post => (
            <div
              key={post._id}
              className={`bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 shadow-sm border transition-colors ${
                post.status === 'flagged' ? 'border-danger/30 bg-danger/5' : 'border-border-default'
              }`}
            >
              <div className="flex items-start gap-3">
                <img src={post.author?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=70'} alt={post.author?.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-border-default" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-text-primary">{post.author?.name || 'Unknown'}</h4>
                    <TypePill type={post.type} flagReason={post.flagReason} />
                    <span className="text-xs text-text-secondary ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>

                  <div className="flex items-center justify-between mt-3">
                    <StatusBadge status={post.status} />
                    {post.status !== 'removed' && (
                      <div className="flex gap-2">
                        <button onClick={() => approve(post._id)} className="px-3 py-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Keep
                        </button>
                        <button onClick={() => remove(post._id)} className="px-3 py-1.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-xs font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
