import React, { useState, useEffect } from 'react';
import { Check, Image, FileText, Edit3, MapPin, Clock, Lock, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import type { ClaimFormData } from '../types';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

interface Props {
  data: ClaimFormData;
  updateData: (newData: Partial<ClaimFormData>) => void;
  onEdit: () => void;
  onSubmit: () => void;
}

export const ClaimReview: React.FC<Props> = ({ data, updateData, onEdit, onSubmit }) => {
  const { user } = useAuth();
  const [lostItems, setLostItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchLostItems = async () => {
      if (!user?._id) return;
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_BASE}/api/users/${user._id}/reports`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const activeLostItems = res.data?.lostItems?.filter((item: any) => item.status === 'active') || [];
        setLostItems(activeLostItems);
      } catch (err) {
        console.error('Failed to fetch user reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLostItems();
  }, [user]);

  const handleInterceptSubmit = () => {
    if (!data.lostItemId) {
      setShowConfirmModal(true);
    } else {
      onSubmit();
    }
  };

  const confirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit();
  };

  return (
    <div className="py-6 md:py-8 px-6 md:px-10 relative">
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border-default transform transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-warning mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-text-primary">Are you sure?</h3>
            </div>
            <p className="text-text-secondary mb-6">
              There is no lost item selected from your history. Are you sure this is the lost item you claimed?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-text-secondary font-semibold hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-transform"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <nav className="flex items-center justify-between mb-10 px-4">
        {[
          { label: 'Verify Identity', done: true },
          { label: 'Upload Proof', done: true },
          { label: 'Review & Submit', done: false, active: true },
        ].map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-2 relative">
            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold z-10 ${step.active ? 'bg-primary ring-4 ring-primary/20' : 'bg-primary'}`}>
              {step.done && !step.active ? <Check className="w-5 h-5" /> : <span>{i + 1}</span>}
            </div>
            <span className="text-xs font-semibold text-primary">{step.label}</span>
          </div>
        ))}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Review Your Claim</h2>
        <p className="text-base text-text-secondary">Please double-check your information before final submission. Our AI will review this to verify your ownership.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proof Thumbnail */}
        <div className="md:col-span-1">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-5 shadow-sm border border-border-default h-full">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Image className="text-primary w-5 h-5" />
              Proof Provided
            </h3>
            <div className="relative group rounded-xl overflow-hidden aspect-square shadow-sm cursor-zoom-in">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
                alt="Proof of ownership"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-surface-container-lowest dark:bg-surface-container/20 backdrop-blur-md p-2 rounded-full text-white">
                  ðŸ”
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-secondary text-center">proof_of_ownership_id.jpg</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="md:col-span-2">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-sm border border-border-default h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <FileText className="text-primary w-5 h-5" />
                Questionnaire Summary
              </h3>
              <button onClick={onEdit} className="text-primary font-semibold flex items-center gap-1 hover:underline text-sm">
                <Edit3 className="w-4 h-4" /> Edit Answers
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border-l-4 border-primary">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Item Details</p>
                <p className="text-sm text-text-secondary">Where did you last see the item?</p>
                <p className="font-semibold text-sm text-text-primary mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {data.location || 'Main Library, 2nd Floor Study Lounge'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface border-l-4 border-primary">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Unique Features</p>
                <p className="text-sm text-text-secondary">Are there any specific markings or stickers?</p>
                <p className="font-semibold text-sm text-text-primary mt-1">{data.identifiers || 'A small scratch on the bottom left corner and a \'Senior Student\' sticker on the front lid.'}</p>
              </div>

              <div className="p-4 rounded-xl bg-surface border-l-4 border-primary">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Estimated Time</p>
                <p className="text-sm text-text-secondary">Approximate time of loss?</p>
                <p className="font-semibold text-sm text-text-primary mt-1 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {data.lostDate ? `${data.lostDate} at ${data.lostTime || 'N/A'}` : 'Tuesday, Oct 24th, between 2:00 PM and 4:30 PM'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Lost Item Linker */}
      <div className="mt-6 bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-sm border border-border-default">
        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-4">
          <AlertCircle className="text-primary w-5 h-5" />
          Link Your Lost Item (Optional)
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          If you previously reported this item as lost on the platform, please select it below so we can mark it as found.
        </p>
        
        {loading ? (
          <p className="text-sm text-text-secondary animate-pulse">Loading your lost items...</p>
        ) : lostItems.length > 0 ? (
          <select
            value={data.lostItemId || ''}
            onChange={(e) => updateData({ lostItemId: e.target.value })}
            className="w-full h-12 bg-surface border border-border-default rounded-xl px-4 text-text-primary text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          >
            <option value="">-- Select a lost item from your history --</option>
            {lostItems.map(item => (
              <option key={item._id} value={item._id}>
                {item.itemName} ({item.category}) - Lost on {new Date(item.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        ) : (
          <div className="p-4 rounded-xl bg-surface border border-border-default">
            <p className="text-sm text-text-secondary">
              No active lost items found in your history. You can proceed without linking.
            </p>
          </div>
        )}
      </div>

      {/* Reassurance & Action Area */}
      <div className="mt-8 bg-surface rounded-[20px] p-6 border border-border-default flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold mb-2">
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              SAFE & SECURE
            </div>
            <h4 className="font-semibold text-sm text-text-primary">Data Protection Guaranteed</h4>
            <p className="text-xs text-text-secondary">Your proof is encrypted and visible only to verified staff.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleInterceptSubmit}
            className="flex-1 px-8 py-3 rounded-full bg-primary text-white font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg text-sm group"
          >
            Contact Finder
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
