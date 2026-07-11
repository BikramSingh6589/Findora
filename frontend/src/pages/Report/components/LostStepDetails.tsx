import React from 'react';
import { FileText, Camera, UploadCloud, Image as ImageIcon, Sparkles, Brain, ChevronRight, Check } from 'lucide-react';
import type { LostFormData } from '../types';

interface Props {
  data: LostFormData;
  updateData: (data: Partial<LostFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LostStepDetails: React.FC<Props> = ({ data, updateData, onNext, onPrev }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const images = data.images || [];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const combined = [...images, ...selectedFiles].slice(0, 4);
      updateData({ images: combined });
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    updateData({ images: updated });
  };

  const getContextualTip = () => {
    const category = (data.category || '').toLowerCase();
    const name = (data.itemName || '').toLowerCase();

    if (category.includes('electronic') || name.includes('laptop') || name.includes('macbook') || name.includes('phone') || name.includes('ipad')) {
      return "Adding a reference photo with clear visibility of unique details helps our AI visual matching recognize your device instantly.";
    }
    if (category.includes('document') || name.includes('id') || name.includes('card') || name.includes('passport')) {
      return "Adding a placeholder reference photo of the document type (e.g. standard ID layout) assists the AI in scanning text/OCR regions.";
    }
    if (name.includes('wallet') || name.includes('purse') || name.includes('bag')) {
      return "Uploading a photo showing the exact color, shape, and exterior logo helps visual matching confirm a match.";
    }
    if (name.includes('key')) {
      return "Uploading a photo of standard keys or keychains matching yours helps the AI distinguish them.";
    }
    if (name.includes('bottle') || name.includes('flask') || name.includes('mug')) {
      return "Uploading a photo of the brand/color of your bottle helps AI visual matching find it.";
    }
    return "Adding a reference photo of a similar item or the actual item can boost our AI visual matching accuracy by up to 90%!";
  };

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
          <section className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Item Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Lost Date/Time */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Approximate Date & Time Lost</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-surface transition-all"
                  value={data.lostDateTime}
                  onChange={(e) => updateData({ lostDateTime: e.target.value })}
                />
              </div>

              {/* Color & Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-text-primary block">Color</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-surface transition-all"
                    placeholder="e.g. Space Gray"
                    value={data.color}
                    onChange={(e) => updateData({ color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-text-primary block">Brand / Model</label>
                  <input
                    className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-surface transition-all"
                    placeholder="e.g. Apple MacBook Air"
                    value={data.brand}
                    onChange={(e) => updateData({ brand: e.target.value })}
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Unique Details</label>
                <textarea
                  className="w-full px-4 py-3.5 rounded-xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-surface resize-none transition-all"
                  placeholder="Describe your item details, stickers, scratches, case type..."
                  rows={5}
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                ></textarea>
              </div>

              {/* Reference Photo */}
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary block">Reference photo (optional)</label>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Upload & Tip */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Image Upload */}
          <section className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border-2 border-dashed border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#6b38d4]/10 text-[#6b38d4] rounded-lg">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Reference Photos</h3>
              </div>
              <span className="font-semibold text-xs text-text-secondary">{images.length} / 4</span>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />

            <div className="grid grid-cols-2 gap-4">
              {images.length < 4 && (
                <button 
                  type="button" 
                  onClick={handleUploadClick}
                  className="col-span-2 aspect-[16/9] rounded-2xl bg-surface flex flex-col items-center justify-center gap-2 group hover:bg-primary/5 hover:border-primary transition-all border border-transparent cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest dark:bg-surface-container shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-primary">Upload Reference Photo</p>
                    <p className="text-xs text-text-secondary">PNG, JPG up to 10MB</p>
                  </div>
                </button>
              )}
              
              {/* Display Uploaded Previews */}
              {images.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border-default bg-surface group">
                  <img 
                    src={URL.createObjectURL(file as Blob)} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-danger text-white rounded-full hover:bg-danger/80 flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">delete</span>
                  </button>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: Math.max(0, 4 - images.length) }).slice(images.length < 4 ? 2 : 0).map((_, idx) => (
                <div key={idx} className="aspect-square rounded-xl bg-surface border border-border-default border-dashed flex items-center justify-center text-text-secondary/30">
                  <ImageIcon className="w-6 h-6" />
                </div>
              ))}
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
                {getContextualTip()}
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
