import React, { useState } from 'react';
import { ArrowRight, Package, BookOpen, Wallet, Key, MoreHorizontal, MapPin, Calendar, AlignLeft, Sparkles, ChevronDown } from 'lucide-react';
import type { LostFormData } from '../types';

interface Props {
  data: LostFormData;
  updateData: (data: Partial<LostFormData>) => void;
  onNext: () => void;
}

const CATEGORIES = [
  { id: 'Electronics', label: 'Electronics', Icon: Package },
  { id: 'Books', label: 'Books', Icon: BookOpen },
  { id: 'Wallet/ID', label: 'Wallet/ID', Icon: Wallet },
  { id: 'Keys', label: 'Keys', Icon: Key },
  { id: 'Other', label: 'Other', Icon: MoreHorizontal },
];

const LOCATIONS = ['Main Library', 'Student Union', 'Engineering Quad', 'Cafeteria', 'Gym', 'Sports Complex', 'Dormitory'];

export const LostStepBasicInfo: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [selectedCategory, setSelectedCategory] = useState(data.category);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    updateData({ category: cat });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div>
      {/* Stepper */}
      <section className="mb-10">
        <div className="flex justify-between items-center relative px-4">
          <div className="absolute top-5 left-0 w-full h-1 bg-surface-variant -z-10 rounded-full">
            <div className="h-full w-1/3 bg-gradient-to-r from-primary to-[#6b38d4] rounded-full"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#6b38d4] flex items-center justify-center text-white shadow-lg shadow-primary/25 ring-4 ring-white">
              <span className="text-sm font-bold">1</span>
            </div>
            <span className="font-semibold text-sm text-primary">Item Details</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-border-default flex items-center justify-center text-text-secondary font-bold">2</div>
            <span className="font-semibold text-sm text-text-secondary">Detail & Image</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-text-secondary font-bold">3</div>
            <span className="font-semibold text-sm text-text-secondary">Confirm</span>
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Let's find your item 🎒</h2>
        <p className="text-base text-text-secondary max-w-xl">Don't worry, the campus community and our AI are here to help. Just give us a few details to start the search.</p>
      </div>

      {/* Main Form Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Primary Form Card */}
        <div className="md:col-span-8 bg-white rounded-[20px] p-8 shadow-sm border border-border-default">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Item Name */}
            <div className="space-y-2">
              <label className="font-semibold text-sm text-text-primary ml-1 block">What did you lose?</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  required
                  className="w-full bg-surface border border-border-default rounded-2xl py-3.5 pl-12 pr-4 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="e.g., Red Hydroflask, Blue Backpack"
                  value={data.itemName}
                  onChange={e => updateData({ itemName: e.target.value })}
                />
              </div>
            </div>

            {/* Category Pill Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-sm text-text-primary ml-1 block">Category</label>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map(({ id, label, Icon }) => {
                  const isActive = selectedCategory === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleCategorySelect(id)}
                      className={`px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 border-2 transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary border-primary'
                          : 'bg-surface border-border-default text-text-secondary hover:border-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary ml-1 block">Where was it last seen?</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <select
                    required
                    className="w-full bg-surface border border-border-default rounded-2xl py-3.5 pl-12 pr-4 appearance-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    value={data.lastSeenLocation}
                    onChange={e => updateData({ lastSeenLocation: e.target.value })}
                  >
                    <option value="" disabled>Select location</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm text-text-primary ml-1 block">When did you lose it?</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input
                    required
                    type="datetime-local"
                    className="w-full bg-surface border border-border-default rounded-2xl py-3.5 pl-12 pr-4 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    value={data.lostDateTime}
                    onChange={e => updateData({ lostDateTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <label className="font-semibold text-sm text-text-primary ml-1 block">Any specific identifiers?</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-text-secondary w-5 h-5" />
                <textarea
                  className="w-full bg-surface border border-border-default rounded-[20px] py-3.5 pl-12 pr-4 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                  placeholder="e.g., Scratched corner, blue sticker on the back, name tag inside..."
                  rows={4}
                  value={data.description}
                  onChange={e => updateData({ description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" className="px-6 py-3 rounded-full font-semibold text-text-secondary hover:bg-surface transition-all">
                Save Draft
              </button>
              <button type="submit" className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2">
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Bento Cards */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* AI Suggestion Card */}
          <div className="bg-gradient-to-br from-primary to-[#6b38d4] text-white p-6 rounded-[20px] shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 fill-current" />
                <h3 className="font-semibold text-base">AI Suggestion</h3>
              </div>
              <p className="text-sm opacity-90 leading-relaxed mb-4">
                Students often find lost items near the <strong>Charging Stations</strong> in the Main Library. Have you checked the Lost & Found box there?
              </p>
              <button className="w-full py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm font-semibold text-sm transition-all active:scale-95">
                Check Library Box
              </button>
            </div>
          </div>

          {/* XP Card */}
          <div className="bg-white p-6 rounded-[20px] shadow-sm border-t-4 border-warning">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base text-text-primary">Reward XP</h3>
              <span className="text-warning font-bold">+50 XP</span>
            </div>
            <p className="text-xs text-text-secondary mb-4">Reporting items accurately helps our community grow! You're only 150 XP away from "Campus Guardian" status.</p>
            <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-warning to-[#fb923c] w-[65%] rounded-full shadow-sm"></div>
            </div>
            <p className="text-xs text-text-secondary mt-1 text-right">2450 / 3000 XP</p>
          </div>

          {/* AI Scan Card */}
          <div className="bg-info-ai/5 border border-info-ai/20 p-6 rounded-[20px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-info-ai w-5 h-5 fill-current" />
              <h3 className="font-semibold text-sm text-info-ai">AI Scanning Tip</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              The more detail you provide (colors, brands, unique marks), the better our AI can scan through thousands of found items to find yours!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
