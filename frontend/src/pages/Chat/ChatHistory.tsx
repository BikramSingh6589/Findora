import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ChatHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || (user as any)?.id;

  const [claims, setClaims] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/claims`);
        if (res.data && res.data.success) {
          setClaims(res.data.claims || []);
        }
      } catch (err) {
        console.error('Failed to load chat history claims', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChatHistory();
  }, []);

  const filteredClaims = claims.filter(claim => {
    const itemName = claim.foundItemId?.itemName || '';
    const claimantName = claim.claimant?.name || '';
    const finderName = claim.foundItemId?.finder?.name || '';
    const searchLower = searchQuery.toLowerCase();
    return (
      itemName.toLowerCase().includes(searchLower) ||
      claimantName.toLowerCase().includes(searchLower) ||
      finderName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-8 bg-surface min-h-[80vh] relative overflow-hidden">
      
      {/* Background Whimsical Elements (inspired by Stitch) */}
      <div className="absolute top-10 right-10 opacity-5 pointer-events-none hidden lg:block">
        <MessageSquare className="w-48 h-48 text-primary" />
      </div>

      {/* Header Section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary mb-1 tracking-tight">Messages</h2>
          <p className="text-text-secondary text-sm font-medium">Coordinate item returns with fellow students.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              className="pl-12 pr-4 py-2.5 w-full bg-surface-container border border-border-default rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none text-text-primary" 
              placeholder="Search chats..." 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Chat Session List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-text-secondary text-sm py-12">Loading conversation list...</p>
        ) : filteredClaims.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest dark:bg-surface-container rounded-3xl border border-border-default shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container text-text-secondary mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="font-bold text-text-primary">No conversations yet</p>
            <p className="text-xs text-text-secondary mt-1">Chats will appear here after you file or receive a claim on an item.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const foundItem = claim.foundItemId || {};
            const finder = foundItem.finder || {};
            const claimant = claim.claimant || {};

            const isFinder = finder._id === currentUserId || finder === currentUserId;
            const partner = isFinder ? claimant : finder;
            
            const partnerName = partner?.name || 'Helper';
            const partnerPic = partner?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
            
            // Determine status badge
            let statusLabel = 'Open';
            let badgeStyle = 'bg-success/10 text-success';
            
            if (claim.status === 'resolved') {
              if (claim.qrToken) {
                statusLabel = 'Waiting to scan';
                badgeStyle = 'bg-warning/10 text-warning';
              } else {
                statusLabel = 'Resolved';
                badgeStyle = 'bg-success/10 text-success';
              }
            } else if (claim.status === 'rejected') {
              statusLabel = 'Rejected';
              badgeStyle = 'bg-danger/10 text-danger';
            } else if (claim.status === 'approved') {
              statusLabel = 'Admin Approved';
              badgeStyle = 'bg-info-ai/10 text-info-ai';
            }

            return (
              <div 
                key={claim._id}
                onClick={() => navigate(`/chat/finder/${claim._id}`)}
                className="bg-surface-container-lowest dark:bg-surface-container p-5 rounded-3xl shadow-sm flex items-center justify-between border border-border-default hover:border-primary/20 hover:shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={partnerPic} 
                      alt={partnerName} 
                      className="w-14 h-14 rounded-2xl object-cover bg-surface-container-low border border-border-default"
                    />
                    {statusLabel === 'Open' && (
                      <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-success border-4 border-white dark:border-surface rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-text-primary text-sm md:text-base leading-none">
                        {foundItem.itemName || 'Found Item'}
                      </h3>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}>
                        {statusLabel}
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-sm text-text-secondary line-clamp-1">
                      <span className="font-bold text-text-primary">{partnerName}:</span> Coordinate return of this item.
                    </p>
                    
                    <span className="text-[10px] text-text-secondary mt-1">
                      {new Date(claim.updatedAt).toLocaleDateString()} at {new Date(claim.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer support */}
      <div className="mt-12 text-center">
        <p className="text-xs text-text-secondary">
          Need assistance or mediation? <button onClick={() => navigate('/help')} className="text-primary font-bold hover:underline">Contact Support</button>
        </p>
      </div>

    </div>
  );
};

export default ChatHistory;
