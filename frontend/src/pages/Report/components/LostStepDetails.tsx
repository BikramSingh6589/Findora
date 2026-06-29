import React from 'react';
import { FileText, MapPin, Camera, UploadCloud, Image as ImageIcon, Sparkles, Brain, ChevronRight, Check } from 'lucide-react';
import type { LostFormData } from '../types';

interface Props {
  data: LostFormData;
  updateData: (data: Partial<LostFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LostStepDetails: React.FC<Props> = ({ data, updateData, onNext, onPrev }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div>
      {/* Stepper */}
      <div className="relative flex justify-between items-center max-w-2xl mx-auto py-8 mb-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-variant -translate-y-1/2 z-0 rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-[50%] h-1 bg-primary -translate-y-1/2 z-0 rounded-full"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
            <Check className="w-5 h-5" />
          </div>
          <span className="font-semibold text-xs text-primary">Item Details</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border-4 border-white shadow-lg scale-110">
            <span className="font-bold">2</span>
          </div>
          <span className="font-bold text-sm text-primary">Detail & Image</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface-variant text-text-secondary flex items-center justify-center border-4 border-white">
            <span className="font-bold">3</span>
          </div>
          <span className="font-semibold text-xs text-text-secondary">Confirm</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Details */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <section className="bg-white p-8 rounded-[20px] shadow-sm border border-border-default">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Additional Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-text-primary block">Color</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-surface"
                    placeholder="e.g., Space Gray"
                    value={data.color}
                    onChange={e => updateData({ color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-text-primary block">Brand / Model</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-surface"
                    placeholder="e.g., Apple, JBL"
                    value={data.brand}
                    onChange={e => updateData({ brand: e.target.value })}
                  />
                </div>
              </div>

              {/* Where last seen - more specific */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Exact spot (if known)</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-surface"
                    placeholder="e.g., Table near the window on Floor 2"
                    value={data.description}
                    onChange={e => updateData({ description: e.target.value })}
                  />
                </div>
              </div>

              {/* Reference Photo */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Reference photo (optional)</label>
                <p className="text-xs text-text-secondary">Upload any photo of the item (from your gallery or similar images online).</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Upload & Tip */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Image Upload */}
          <section className="bg-white p-8 rounded-[20px] shadow-sm border-2 border-dashed border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6b38d4]/10 text-[#6b38d4] rounded-lg">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Reference Photos</h3>
              </div>
              <span className="font-semibold text-xs text-text-secondary">0 / 4</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="col-span-2 aspect-[16/9] rounded-2xl bg-surface flex flex-col items-center justify-center gap-2 group hover:bg-primary/5 hover:border-primary transition-all border border-transparent">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-primary">Upload Reference Photo</p>
                  <p className="text-xs text-text-secondary">PNG, JPG up to 10MB</p>
                </div>
              </button>
              <div className="aspect-square rounded-xl bg-surface border border-border-default border-dashed flex items-center justify-center text-text-secondary/30">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="aspect-square rounded-xl bg-surface border border-border-default border-dashed flex items-center justify-center text-text-secondary/30">
                <ImageIcon className="w-6 h-6" />
              </div>
            </div>
          </section>

          {/* AI Tip */}
          <section className="bg-gradient-to-br from-info-ai/10 to-primary/10 p-6 rounded-[20px] border border-info-ai/30 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-info-ai w-5 h-5 fill-current" />
                <h4 className="font-semibold text-sm text-primary">AI Tip</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Adding a reference photo can boost our <span className="font-bold text-primary">AI visual matching</span> accuracy by up to 90%!
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Brain className="w-32 h-32" />
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button type="button" onClick={onPrev} className="flex-1 px-6 py-4 rounded-xl font-semibold text-sm text-primary border-2 border-primary/20 hover:bg-primary/5 transition-all">
              Go Back
            </button>
            <button type="submit" className="flex-[2] px-6 py-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-primary to-[#6b38d4] shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2">
              Continue to Review
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
