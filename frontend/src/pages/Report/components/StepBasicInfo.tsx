import React from 'react';
import { ArrowRight, Calendar, Clock, Info, ChevronDown } from 'lucide-react';
import type { ReportFormData } from '../types';

interface Props {
  data: ReportFormData;
  updateData: (data: Partial<ReportFormData>) => void;
  onNext: () => void;
}

export const StepBasicInfo: React.FC<Props> = ({ data, updateData, onNext }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div>
      {/* Stepper */}
      <div className="mb-10 flex items-center justify-between px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_15px_rgba(65,67,213,0.3)]">
            <span className="font-bold">1</span>
          </div>
          <span className="font-semibold text-sm text-primary">Basic Info</span>
        </div>
        <div className="flex-1 h-1 bg-surface-variant mx-4 rounded-full">
          <div className="h-full bg-primary w-1/2 rounded-full"></div>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-50">
          <div className="w-10 h-10 rounded-full bg-surface-variant text-text-secondary flex items-center justify-center">
            <span className="font-bold">2</span>
          </div>
          <span className="font-semibold text-sm text-text-secondary">Detail & Image</span>
        </div>
        <div className="flex-1 h-1 bg-surface-variant mx-4 rounded-full"></div>
        <div className="flex flex-col items-center gap-2 opacity-50">
          <div className="w-10 h-10 rounded-full bg-surface-variant text-text-secondary flex items-center justify-center">
            <span className="font-bold">3</span>
          </div>
          <span className="font-semibold text-sm text-text-secondary">Review</span>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[20px] shadow-sm p-8 border border-border-default overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        
        <header className="mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Found something?</h1>
          <p className="text-base text-text-secondary">Great job! Let's get this item back to its owner. Start with the basics.</p>
        </header>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Item Name */}
          <div className="md:col-span-2 space-y-2">
            <label className="block font-semibold text-sm text-text-primary">Item Name</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
              placeholder="e.g., Blue Bottle, Silver MacBook Air" 
              value={data.itemName}
              onChange={(e) => updateData({ itemName: e.target.value })}
            />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text-primary">Category</label>
            <div className="relative">
              <select 
                required
                className="w-full appearance-none px-4 py-3 rounded-xl border border-border-default bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                value={data.category}
                onChange={(e) => updateData({ category: e.target.value })}
              >
                <option disabled value="">Select a category</option>
                <option>Electronics</option>
                <option>Books & Stationary</option>
                <option>Clothing & Accessories</option>
                <option>Wallets & IDs</option>
                <option>Keys</option>
                <option>Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary w-5 h-5" />
            </div>
          </div>
          
          {/* AI Info */}
          <div className="hidden md:flex h-full items-center p-4 bg-info-ai/5 rounded-xl border border-info-ai/20 mt-6 md:mt-0">
            <Info className="text-info-ai mr-4 w-6 h-6 flex-shrink-0" />
            <p className="text-sm text-text-secondary">Our AI will use these details to automatically find potential owners once you finish!</p>
          </div>
          
          {/* Found Date */}
          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text-primary">Found Date</label>
            <div className="relative">
              <input 
                required
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                value={data.foundDate}
                onChange={(e) => updateData({ foundDate: e.target.value })}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary w-5 h-5" />
            </div>
          </div>
          
          {/* Found Time */}
          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text-primary">Found Time (Approx.)</label>
            <div className="relative">
              <input 
                required
                type="time"
                className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                value={data.foundTime}
                onChange={(e) => updateData({ foundTime: e.target.value })}
              />
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary w-5 h-5" />
            </div>
          </div>
          
          <div className="md:col-span-2 pt-8 flex justify-end items-center gap-4">
            <button type="button" className="px-6 py-3 rounded-full font-semibold text-text-secondary hover:bg-surface-variant transition-all">
              Save as Draft
            </button>
            <button type="submit" className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2">
              Next Step
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Tip Card */}
      <div className="mt-8 flex flex-col md:flex-row items-center gap-4 p-4 bg-[#e9ddff]/30 rounded-xl border border-[#6b38d4]/20 text-[#5516be]">
        <div className="w-10 h-10 rounded-full bg-[#6b38d4]/10 flex items-center justify-center text-[#6b38d4] flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-sm">
          <strong>Tip:</strong> The more accurate the time and date, the easier it is for our AI to cross-reference schedules and identify the owner.
        </p>
      </div>
    </div>
  );
};
