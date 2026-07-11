import React from 'react';
import { Eye, Edit3, MapPin, Calendar, Image as ImageIcon, ZoomIn, ArrowLeft, Send, Check, Search } from 'lucide-react';
import axios from 'axios';
import type { LostFormData } from '../types';

interface Props {
  data: LostFormData;
  onEdit: () => void;
  onSubmit: () => void;
}

export const LostStepReview: React.FC<Props> = ({ data, onEdit, onSubmit }) => {
  const [foundCount, setFoundCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    axios.get(`${API_BASE}/api/found-items?limit=1`)
      .then(res => {
        if (res.data?.success && typeof res.data.total === 'number') {
          setFoundCount(res.data.total);
        }
      })
      .catch(err => console.error('Failed to fetch found items count', err));
  }, []);

  return (
    <div>
      {/* Stepper */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 -z-10"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 -z-10 bg-primary"></div>
          {[{ label: 'Details' }, { label: 'Detail & Image' }, { label: 'Review' }].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md bg-primary ${i === 2 ? 'ring-4 ring-primary/10' : ''}`}>
                {i < 2 ? <Check className="w-5 h-5" /> : <span className="font-bold">3</span>}
              </div>
              <span className="text-xs font-semibold text-primary">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Page Title */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Review & Submit</h1>
        <p className="text-base text-text-secondary mt-2">Check everything twice! Our AI is ready to start hunting for matches the moment you hit submit.</p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Review Card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Item Information */}
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-sm border border-border-default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Eye className="text-primary w-6 h-6" />
                Item Information
              </h2>
              <button onClick={onEdit} className="text-primary flex items-center gap-1 hover:underline text-sm font-semibold">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-text-secondary mb-1">Item Type</p>
                <p className="font-bold text-text-primary">{data.itemName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Category</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                  {data.category || 'Not provided'}
                </span>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Lost Date/Time</p>
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary w-4 h-4" />
                  <p className="font-bold text-text-primary">{data.lostDateTime ? new Date(data.lostDateTime).toLocaleString() : 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Color / Brand</p>
                <p className="font-bold text-text-primary">{[data.color, data.brand].filter(Boolean).join(' / ') || 'Not provided'}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border-default">
              <p className="text-xs text-text-secondary mb-2">Detailed Description</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">{data.description || 'No additional details provided.'}</p>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-sm border border-border-default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Last Seen Location</h2>
              <button onClick={onEdit} className="text-primary flex items-center gap-1 hover:underline text-sm font-semibold">
                <MapPin className="w-4 h-4" /> Change
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest dark:bg-surface-container shadow-sm flex items-center justify-center">
                <MapPin className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-text-primary">{data.lastSeenLocation || 'Not specified'}</p>
                <p className="text-xs text-text-secondary">Campus building / area</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Photo Preview */}
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-sm border border-border-default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <ImageIcon className="text-primary w-5 h-5" />
                Photos
              </h2>
              <span className="text-xs font-bold text-text-secondary">{data.images?.length || 0} Files</span>
            </div>

            <div className="space-y-4">
              {data.images && data.images.length > 0 ? (
                data.images.map((file, idx) => (
                  <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-xl h-32 bg-surface flex items-center justify-center border border-border-default">
                    <img
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={URL.createObjectURL(file as Blob)}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="text-white w-6 h-6" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-text-secondary border border-dashed border-border-default rounded-xl bg-surface">
                  No reference photos uploaded.
                </div>
              )}
              {(!data.images || data.images.length < 4) && (
                <button onClick={onEdit} className="w-full py-2 border-2 border-dashed border-border-default rounded-xl text-text-secondary font-bold text-xs hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  + Add Photos
                </button>
              )}
            </div>
          </div>

          {/* AI Scanning Card */}
          <div className="bg-gradient-to-br from-primary to-[#6b38d4] text-white p-6 rounded-[20px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-6 h-6" />
                <h3 className="font-semibold text-base">AI is Ready!</h3>
              </div>
              <p className="text-sm opacity-90 leading-relaxed mb-4">
                Once submitted, our AI will instantly scan <strong>{foundCount !== null ? `${foundCount}+` : 'all'} active found items</strong> across campus to find a match.
              </p>
              <div className="flex justify-between text-xs opacity-80">
                <span>Avg match time</span>
                <span className="font-bold">~4 minutes</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Search className="w-32 h-32" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onSubmit}
              className="w-full py-4 rounded-xl font-bold text-lg text-white bg-primary shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              Submit Report
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button
              onClick={onEdit}
              className="w-full py-4 rounded-xl font-bold text-text-secondary bg-surface hover:bg-surface-variant border border-border-default transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back & Edit
            </button>
          </div>

          <p className="text-center text-xs text-text-secondary">
            You'll receive email & push notifications when a match is found.
          </p>
        </div>
      </div>
    </div>
  );
};
