import React from 'react';
import { Check, Image, FileText, Edit3, MapPin, Clock, Lock, ShieldCheck, Send, ArrowLeft } from 'lucide-react';
import type { ClaimFormData } from '../types';

interface Props {
  data: ClaimFormData;
  onEdit: () => void;
  onSubmit: () => void;
}

export const ClaimReview: React.FC<Props> = ({ data, onEdit, onSubmit }) => {
  return (
    <div>
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
            disabled
            className="flex-1 px-6 py-3 rounded-full border-2 border-border-default text-text-secondary font-bold bg-surface cursor-not-allowed flex items-center justify-center gap-2 opacity-60 text-sm"
          >
            <Lock className="w-4 h-4" /> Waiting for Finder Permission
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-8 py-3 rounded-full bg-primary text-white font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg text-sm group"
          >
            Submit Claim
            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-text-secondary">
        By clicking "Submit Claim", you agree to our <button className="text-primary hover:underline">Community Guidelines</button> and confirm the accuracy of your statements.
      </p>
    </div>
  );
};
