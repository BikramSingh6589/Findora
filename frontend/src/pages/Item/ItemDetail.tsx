import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Maximize2, 
  MapPin, Calendar, User, Sparkles, Verified, MessageSquare, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ItemDetail: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?._id || (user as any)?.id;
  
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/found-items/${itemId}`);
        if (res.data && res.data.success) {
          setItem(res.data.item);
        } else {
          setError('Failed to load item details.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const [claimId, setClaimId] = useState<string | null>(null);
  const isFinder = item?.finder?._id === currentUserId || item?.finder === currentUserId;

  useEffect(() => {
    if (isFinder && item?._id) {
      axios.get(`${API_BASE}/api/claims`).then(res => {
        const matchedClaim = res.data?.claims?.find((c: any) => c.foundItemId?._id === item._id || c.foundItemId === item._id);
        if (matchedClaim) {
          setClaimId(matchedClaim._id);
        }
      }).catch(err => console.error(err));
    }
  }, [isFinder, item]);
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-surface-container-lowest dark:bg-surface-container rounded-3xl border border-border-default text-center">
        <h2 className="text-xl font-bold text-danger mb-4">Error</h2>
        <p className="text-text-secondary mb-6">{error || 'Item not found'}</p>
        <button onClick={() => navigate('/community')} className="px-6 py-2 bg-primary text-white font-bold rounded-xl">
          Back to Community
        </button>
      </div>
    );
  }

  const images = item.images && item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600"];

  return (
    <div className="flex flex-col min-h-screen bg-surface -mt-6 -mx-6 md:m-0 pb-24 md:pb-0">
      
      {/* Mobile Header (Hidden on Desktop since AppLayout handles it) */}
      <header className="md:hidden bg-surface-container-lowest dark:bg-surface-container/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 py-3 shadow-sm border-b border-border-default">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h1 className="font-bold text-lg text-primary">Item Details</h1>
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <Share2 className="w-5 h-5 text-text-secondary" />
        </button>
      </header>
 
      {/* Main Content */}
      <main className="flex-1 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumbs (Desktop) */}
        <nav className="hidden md:flex mb-6 items-center gap-2 text-sm text-text-secondary font-semibold">
          <button onClick={() => navigate('/community')} className="hover:text-primary transition-colors">Community</button>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-primary cursor-pointer transition-colors">{item.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-primary">Item #{item._id.substring(item._id.length - 6).toUpperCase()}</span>
        </nav>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Left Column: Image Gallery & Description */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Image Gallery */}
            <div className="flex flex-col gap-3 md:gap-4 px-4 md:px-0 pt-4 md:pt-0">
              {/* Main Image */}
              <div className="relative group aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-sm bg-surface-container">
                <img 
                  src={images[activeImage]} 
                  alt={item.itemName} 
                  className="w-full h-full object-cover transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-success/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Status: {item.status}
                  </span>
                  <span className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {item.category}
                  </span>
                </div>
                <button className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-all text-white">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
 
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`aspect-square rounded-xl md:rounded-2xl overflow-hidden transition-all ${activeImage === idx ? 'ring-4 ring-primary/30 border-2 border-primary' : 'hover:opacity-80'}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
 
 
          </div>
 
          {/* Right Column: Details, Map & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6 px-4 md:px-0">
            
            {/* Quick Info Card */}
            <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 shadow-sm border border-border-default">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Item Name</span>
                  <h1 className="text-2xl font-bold text-text-primary mt-1">{item.itemName}</h1>
                </div>
                <button className="hidden md:flex p-2 rounded-full hover:bg-surface-container transition-colors">
                  <Share2 className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
 
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold">Last Seen Location</p>
                    <p className="text-sm font-bold text-text-primary">{item.lastSeen || item.locationFound}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold">Date Reported</p>
                    <p className="text-sm font-bold text-text-primary">
                      {new Date(item.dateFound).toLocaleDateString()} &bull; {new Date(item.dateFound).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold">Found By</p>
                    <p className="text-sm font-bold text-text-primary">{item.finder?.name || 'Community Member'}</p>
                  </div>
                </div>
              </div>
 
              {/* AI Confidence Score */}
              <div className="bg-info-ai/10 rounded-2xl p-4 mb-8 border border-info-ai/20">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-info-ai fill-current" />
                    <span className="text-sm font-bold text-info-ai">AI Match Confidence</span>
                  </div>
                  <span className="text-sm font-bold text-info-ai">95%</span>
                </div>
                <div className="w-full bg-info-ai/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-info-ai h-full rounded-full w-[95%]"></div>
                </div>
                <p className="text-xs text-info-ai/80 mt-2 font-medium">Based on similarity with reported lost items.</p>
              </div>
 
              {/* Actions */}
              <div className="flex flex-col gap-3">
                {isFinder ? (
                  claimId ? (
                    <button
                      onClick={() => navigate(`/chat/finder/${claimId}`)}
                      className="w-full bg-gradient-to-r from-primary to-[#6b38d4] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Open Chat with Claimant
                    </button>
                  ) : (
                    <div className="text-center p-4 bg-surface-container rounded-2xl text-xs text-text-secondary font-medium">
                      No active claims have been filed for this item yet. You will be notified when someone claims it.
                    </div>
                  )
                ) : (
                  <button 
                    disabled={item?.finder?._id === currentUserId || item?.finder === currentUserId}
                    onClick={() => navigate(`/claim/${item._id}`)}
                    className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      (item?.finder?._id === currentUserId || item?.finder === currentUserId)
                        ? 'bg-text-secondary/20 text-text-secondary/50 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-primary to-[#6b38d4] text-white shadow-md hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <Verified className="w-5 h-5" />
                    Claim Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
