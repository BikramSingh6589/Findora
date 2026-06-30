import React from 'react';
import { Eye, Edit3, Laptop, MapPin, Calendar, Image as ImageIcon, ZoomIn, Camera, Star, Medal, ArrowLeft, Send, Check } from 'lucide-react';
import type { ReportFormData } from '../types';

interface Props {
  data: ReportFormData;
  onEdit: () => void;
  onSubmit: () => void;
}

export const StepReview: React.FC<Props> = ({ data, onEdit, onSubmit }) => {
  return (
    <div>
      {/* Header & Progress */}
      <header className="max-w-5xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Review & Submit</h1>
            <p className="text-base text-text-secondary">Double-check the details before we alert the campus!</p>
          </div>
          
          {/* Progress Stepper */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 opacity-40">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-text-primary font-bold">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs">Details</span>
            </div>
            <div className="w-12 h-0.5 bg-surface-variant opacity-40"></div>
            <div className="flex flex-col items-center gap-1 opacity-40">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-text-primary font-bold">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-xs">Media</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg font-bold animate-pulse">3</div>
              <span className="text-xs font-bold text-primary">Review</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Information Grid (Left Column) */}
        <div className="md:col-span-8 space-y-8">
          {/* Summary Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] shadow-sm border border-border-default overflow-hidden">
            <div className="p-6 border-b border-border-default bg-surface flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Eye className="text-primary w-6 h-6" />
                Report Summary
              </h2>
              <button onClick={onEdit} className="text-primary font-semibold hover:underline flex items-center gap-1 text-sm">
                <Edit3 className="w-4 h-4" /> Edit Info
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Item Name</p>
                <p className="text-lg font-semibold">{data.itemName || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Category</p>
                <div className="flex items-center gap-2">
                  <Laptop className="text-secondary w-5 h-5" />
                  <p className="text-lg">{data.category || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Found At</p>
                <div className="flex items-center gap-2">
                  <MapPin className="text-danger w-5 h-5" />
                  <p className="text-lg">{data.location || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Date Found</p>
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary w-5 h-5" />
                  <p className="text-lg">{data.foundDate || 'Not provided'}</p>
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Description</p>
                <p className="text-base text-on-surface-variant leading-relaxed p-4 bg-surface rounded-xl italic">
                  "{data.description || 'No description provided.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] shadow-sm border border-border-default p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <ImageIcon className="text-primary w-6 h-6" />
                Photo Previews
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden border border-border-default hover:-translate-y-1 transition-transform cursor-zoom-in relative group">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80" alt="Item" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="aspect-square rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors cursor-pointer group">
                <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Add More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification & Actions (Right Column) */}
        <div className="md:col-span-4 space-y-6">
          {/* Reward Card */}
          <div className="bg-gradient-to-br from-[#f9bd22]/20 to-[#fb923c]/20 p-6 rounded-[20px] border border-[#f9bd22]/30 relative overflow-hidden">
            <Star className="absolute -top-4 -right-4 w-24 h-24 text-[#f9bd22]/20" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f9bd22] to-[#fb923c] rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(249,189,34,0.4)] mb-4">
                <Medal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#b47a00] mb-2">Estimated Reward</h3>
              <div className="text-3xl font-black text-[#8c5e00] mb-2 drop-shadow-sm">+50 XP</div>
              <p className="text-sm text-[#8c5e00]/80">Reporting found items helps level up your Campus Guardian status.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={onSubmit}
              className="w-full py-4 rounded-xl font-bold text-lg text-white bg-primary shadow-[0_8px_25px_rgba(91,95,239,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              Submit Report
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            
            <button 
              onClick={onEdit}
              className="w-full py-4 rounded-xl font-bold text-text-secondary bg-surface-variant hover:bg-surface border border-transparent hover:border-border-default transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back & Edit
            </button>
          </div>
          
          <p className="text-center text-xs text-text-secondary">
            By submitting, you agree to safely hold the item or turn it in to the nearest campus security desk within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};
