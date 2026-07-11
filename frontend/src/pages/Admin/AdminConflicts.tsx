import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AdminConflicts: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/api/claims`);
      if (res.data && res.data.success) {
        const allClaims = res.data.claims || res.data.data?.claims || [];
        const conflicts = allClaims.filter((c: any) => 
          (c.mediationRequested || c.mediationStatus === 'pending') && 
          c.foundItemId?.status === 'disputed'
        );
        
        // Group by foundItemId to avoid duplicate cards for the same disputed item
        const uniqueConflicts = [];
        const seenItems = new Set();
        for (const claim of conflicts) {
          const itemId = claim.foundItemId?._id || claim.foundItemId;
          if (!seenItems.has(itemId)) {
            seenItems.add(itemId);
            uniqueConflicts.push(claim);
          }
        }
        setClaims(uniqueConflicts);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch conflicts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = io(API_BASE, { auth: { token } });
    socket.on('admin_claims_updated', () => fetchClaims());
    return () => { socket.disconnect(); };
  }, []);

  if (loading) {
    return <div className="p-8 text-white font-bold animate-pulse text-center">Loading Conflicts...</div>;
  }

  if (error) {
    return <div className="p-8 text-danger text-center bg-danger/10 border border-danger/30 rounded-2xl m-8">{error}</div>;
  }

  const filteredClaims = claims.filter(c => {
    const query = searchQuery.toLowerCase();
    const itemName = c.foundItemId?.itemName?.toLowerCase() || '';
    const code = c.conflictCode?.toLowerCase() || '';
    const claimantName = c.claimant?.name?.toLowerCase() || '';
    return itemName.includes(query) || code.includes(query) || claimantName.includes(query);
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">Conflict Resolution</h2>
            <p className="text-text-secondary">Manage and resolve disputed claims.</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by code, item, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-12 text-center border border-border-default shadow-xl">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Active Conflicts</h3>
          <p className="text-text-secondary">All clear! There are currently no disputed items requiring admin mediation matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => {
            const isPendingHandover = claim.mediationStatus === 'pending_handover';
            
            return (
              <div key={claim._id} className="bg-surface-container-low rounded-3xl border border-warning/30 p-6 flex flex-col shadow-xl hover:border-warning/60 transition-colors">
                <div className="flex gap-4 mb-4">
                  <img src={claim.foundItemId?.images?.[0] || 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=80&q=70'} alt={claim.foundItemId?.itemName} className="w-20 h-20 rounded-2xl object-cover" />
                  <div>
                    <h4 className="font-bold text-lg text-white mb-1 line-clamp-1">{claim.foundItemId?.itemName}</h4>
                    {isPendingHandover && claim.conflictCode && (
                      <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-bold mb-2">
                        {claim.conflictCode}
                      </span>
                    )}
                    <p className="text-sm text-text-secondary">Disputed by <strong className="text-white">{claim.claimant?.name || 'Multiple Users'}</strong></p>
                    <p className="text-xs text-text-tertiary mt-1">{new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/5">
                  {isPendingHandover ? (
                    <button 
                      onClick={() => navigate(`/admin/conflict/${claim.foundItemId?._id || claim.foundItemId}`)}
                      className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
                    >
                      Pending In-Person...
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/admin/conflict/${claim.foundItemId?._id || claim.foundItemId}`)}
                      className="w-full py-3 bg-warning text-white font-bold rounded-xl hover:bg-warning/90 transition-colors shadow-lg shadow-warning/20 flex justify-center items-center gap-2"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      Resolve Conflict
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
