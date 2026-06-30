import React from 'react';
import { Check, UploadCloud, FileText, Trash2, Lightbulb, Bot, ChevronRight, ArrowLeft } from 'lucide-react';
import type { ClaimFormData } from '../types';

interface Props {
  data: ClaimFormData;
  updateData: (d: Partial<ClaimFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ClaimProof: React.FC<Props> = ({ data, updateData, onNext, onPrev }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div>
      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-surface-variant -z-10"></div>
          <div className="absolute top-5 left-0 w-1/2 h-0.5 bg-primary -z-10"></div>

          {/* Step 1 - Done */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-surface-container-lowest dark:bg-surface-container pr-4">
            <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-success">Item Details</span>
          </div>
          {/* Step 2 - Active */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-surface-container-lowest dark:bg-surface-container px-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-primary/20">
              <Check className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-primary">Proof of Ownership</span>
          </div>
          {/* Step 3 - Pending */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-surface-container-lowest dark:bg-surface-container pl-4">
            <div className="w-10 h-10 rounded-full bg-surface-variant text-text-secondary flex items-center justify-center">
              <span className="font-bold">3</span>
            </div>
            <span className="font-semibold text-sm text-text-secondary">Final Review</span>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Claim Ownership</h1>
        <p className="text-base text-text-secondary">Upload documents to verify that this item belongs to you. This helps our campus moderators approve your claim faster!</p>
      </div>

      {/* Content Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Upload Zone */}
        <div className="md:col-span-2 space-y-6">
          {/* Upload Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[20px] shadow-sm border border-border-default">
            <h3 className="text-xl font-bold text-text-primary mb-4">Purchase Receipt or Proof of Ownership</h3>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="text-primary w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-primary">Click to upload or drag and drop</p>
                <p className="text-xs text-text-secondary mt-1">PDF, JPG, or PNG (Max 10MB)</p>
              </div>
              <input className="hidden" type="file" />
            </div>

            {/* File Preview */}
            <div className="mt-6 space-y-3">
              <p className="font-semibold text-sm text-text-secondary">Supporting Files</p>
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-default hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary w-5 h-5" />
                  <div>
                    <p className="font-semibold text-sm text-text-primary">receipt_apple_store.pdf</p>
                    <p className="text-xs text-text-secondary">2.4 MB Â· Uploaded 2 mins ago</p>
                  </div>
                </div>
                <button type="button" className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[20px] shadow-sm border border-border-default">
            <h3 className="text-xl font-bold text-text-primary mb-4">Additional Information</h3>
            <div>
              <label className="block font-semibold text-sm mb-2 text-text-primary">Specific Item Identification</label>
              <textarea
                className="w-full rounded-2xl border border-border-default focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all p-4 h-32 outline-none resize-none bg-surface"
                placeholder="Example: Serial number, unique scratches on the side, or stickers on the back..."
                value={data.additionalInfo}
                onChange={e => updateData({ additionalInfo: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button type="button" onClick={onPrev} className="flex-1 px-6 py-4 rounded-xl font-semibold text-sm text-primary border-2 border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Go Back
            </button>
            <button type="submit" className="flex-[2] px-6 py-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-primary to-[#6b38d4] shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2">
              Continue to Review <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Tips */}
        <div className="space-y-6">
          {/* Pro Tip */}
          <div className="bg-[#ffdf9f] p-6 rounded-[20px] shadow-sm relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-surface-container-lowest dark:bg-surface-container/20 rounded-full"></div>
            <div className="flex items-start gap-4 relative z-10">
              <Lightbulb className="text-[#5c4300] w-7 h-7 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-sm text-[#5c4300] mb-2">Pro Tip</h4>
                <p className="text-xs text-[#5c4300]/80 leading-relaxed">
                  High-value items like electronics, jewelry, or designer bags require <strong>clear proof of ownership</strong>. High-resolution photos of receipts or warranty cards significantly speed up the return process.
                </p>
              </div>
            </div>
          </div>

          {/* AI Verification Helper */}
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[20px] shadow-sm border border-info-ai/20 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Bot className="text-info-ai w-5 h-5" />
              <h4 className="font-semibold text-sm text-text-primary">Verification Helper</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              "I noticed you're claiming an <strong>Apple MacBook Air</strong>. Providing the serial number located on the bottom of the device is the gold standard for ownership! Look for the tiny text starting with 'S/N'."
            </p>
            <div className="w-full h-px bg-border-default"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary italic">Trust Score: 85%</span>
              <span className="text-xs font-bold text-success">âœ“ Verified</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
