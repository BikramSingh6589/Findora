import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, MapPin, Tag, Info, CheckCircle2, X,
  Clock, Trophy, ChevronRight
} from 'lucide-react';

interface MatchScore {
  label: string;
  value: number;
  color: string;
}

interface LostItem {
  id: string;
  name: string;
  date: string;
  matchCount: number;
  img: string;
}

interface MatchCard {
  id: string;
  confidence: number;
  label?: string;
  title: string;
  location: string;
  timeAgo: string;
  category: string;
  description: string;
  yourImg: string;
  foundImg: string;
  scores: MatchScore[];
  tags?: { text: string; danger?: boolean }[];
}

const lostItems: LostItem[] = [
  {
    id: '1',
    name: 'Blue Hydro Flask',
    date: 'Lost Oct 12',
    matchCount: 2,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMpqlU1VcH1ttYId6edM1XEJSzY1Vp748Xpd87J3-Gc9p3aCpDw4VWb65vztGw5Pv44MZvbS0S1CwlE5Qs5pfkaZqTJRzY7ucLJiGntUtEvy7gyXOrajMTVPhBIpqpIcC07Z1RURJ8TRSucv7BfPVVQg6TEXB0hZq1mxqVLcI2STZHVIF6IK40jvG822L4x1rI9AeZHqsot0CKoQsxgnVG3Ve53OhtodRfheKjEZBgjwWPWJcQeJ0eELUdouid9CVdzhBfqW7XqqQ',
  },
  {
    id: '2',
    name: 'AirPods Pro',
    date: 'Lost Oct 10',
    matchCount: 1,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3shWSau20hw4TsrSBaCHCar-5pBB1djrKjcndp15LCi6M_QlNr73FvVGbK7QfKjLRpwrq6hI1G4MuRwo4Awc6BNgiNDHvHlt9LEHwrYfyppEEjgqIzrw3_SzPR18F_WfY0PCsiDrzJfFwn_ZTKaVd6C7FRV_ghASac7wlC5TUYl9iFl1bGgmlxp4eBQ05KCffCapjwqjdPEuJs_xVGTey4Os1BC9FGqQ3Y4n6P_2xOWleeQLvHpXHe-zdxkYz0HpRio8s1oXaBHw',
  },
];

const matchCards: MatchCard[] = [
  {
    id: 'match-1',
    confidence: 98,
    label: 'Top Pick',
    title: 'Hydro Flask – Cobalt Blue',
    location: 'Student Union, Floor 2 (Cafe Area)',
    timeAgo: 'Found 2 hours ago',
    category: 'Accessories • Water Bottle',
    description: '"Found near the window seats. Blue metallic finish with \'CS Department\' and \'SpaceX\' stickers. Shows some wear on the bottom."',
    yourImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeTcReX9h-q8H6VYiRmNKmKOgB9W6gZ753I3KHDMLzkwjKbmHfWNy6VRFbmQKjoPwfGICTClj1Qfn6tuIF9oRK3N0ystrlqh2VFfIBBPifr6cVIQioxtvT37DcEJsEjZJh1qHl8KKMg6xF_l5B8PLEOwk3RZzRadGTL-BgDYH76lwWWwoS7-ytSbCAV_3aGZujmz3ybxwR0eDutpuRbUMRm3-ndT5Zdjs8uMd1bCoaYZMGjRAzaqs3uTxivIYKr9FEVO48QuSJ7vQ',
    foundImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtojkNIMqAdK3VGO2AngeA2qyt6efBxTWJ32X1lme4mNs7iwJscjVXmDjoxNQGM9eQYo4XUYCkFGAvo5vrJLKuJ_dyopvk90CwU6870HWYR1R59jj5K78ikOYnViuKZYx-afBTYyucIOXxDlqFs0u7YU6FkXGN3NkAjX5aSerZa9-B71J1BkzjOtoFwEgkYxaNao8-broU0yn-LsNtS2VWlAaa1pk4-Yh1kWt6YVyrw8cWAB0y6UYGkrxlbC3fvbGE3Udx-uZ_HKo',
    scores: [
      { label: 'Image Similarity', value: 95, color: 'bg-primary' },
      { label: 'Brand Match', value: 100, color: 'bg-success' },
      { label: 'Location Proximity', value: 82, color: 'bg-warning' },
    ],
  },
  {
    id: 'match-2',
    confidence: 72,
    title: 'Dark Blue Insulated Bottle',
    location: 'Campus Library',
    timeAgo: 'Found yesterday',
    category: 'Accessories • Water Bottle',
    description: '',
    yourImg: '',
    foundImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB04zAioRN76SsqlOU17wX-e48A7dKdXNflywq3rI26uNr8l3jw7uuPu8VQ11VqIWMuojBWXbG-KIwNW7KL4ecwt4ZqXVcp_BouZiFHd-45D1Gbm2kcqvGD8tviN8yb8KtQkjwOr4SwaZgiFuyv-8z4OxJoutPLXaARd9ifjd0JkA8mch9yqL2bYdoYYJyfe5BJn9ZyuAldryAMCFBldQxNobvLdFnyvjOK8zPvuwaOHyfIM_jjK85tND__UBHE3qLnfwlsRniq-Wg',
    scores: [],
    tags: [
      { text: 'Same Color' },
      { text: 'Same Category' },
      { text: 'Missing Stickers', danger: true },
    ],
  },
];

export const AIMatches: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState('1');
  const [dismissed, setDismissed] = useState<string[]>([]);

  const confidenceColor = (c: number) =>
    c >= 90 ? 'text-info-ai border-info-ai/30 bg-info-ai/10'
      : c >= 70 ? 'text-warning border-warning/30 bg-warning/10'
      : 'text-text-secondary border-border-default bg-surface-container-low';

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">AI Smart Matches</h1>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl">
            Our student-trained AI found potential matches for your lost items. Review the confidence scores and details below to reclaim your belongings.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-info-ai/10 text-info-ai rounded-full border border-info-ai/20 self-start md:self-auto whitespace-nowrap">
          <Sparkles className="w-4 h-4 fill-current" />
          <span className="font-bold text-sm">3 New Matches</span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Left Sidebar: Your Lost Items */}
        <aside className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">Your Lost Items</h3>
          <div className="space-y-3">
            {lostItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selectedItem === item.id
                    ? 'bg-surface-container-lowest dark:bg-surface-container border-2 border-primary shadow-md'
                    : 'bg-surface-container-lowest/60 dark:bg-surface-container/60 border-border-default hover:border-primary/40'
                }`}
              >
                <div className={`flex items-center gap-3 ${selectedItem !== item.id ? 'opacity-70' : ''}`}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-secondary">{item.date}</p>
                  </div>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0 ${selectedItem === item.id ? 'bg-primary' : 'bg-border-default'}`}>
                    {item.matchCount}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Help Card */}
          <div className="mt-6 p-5 bg-[#e9ddff] rounded-3xl border border-[#d0bcff]/30 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold text-sm text-[#23005c] mb-2">Need Help?</h4>
              <p className="text-xs text-[#5516be]/80 mb-4 leading-relaxed">Don't see your item? Try updating your report with more photos!</p>
              <button className="text-[#5516be] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                Update Report <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <Sparkles className="absolute -bottom-3 -right-3 w-20 h-20 text-[#5516be] opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </aside>

        {/* Match Results */}
        <section className="lg:col-span-9 space-y-6">

          {/* Match Card 1 – High Confidence */}
          {!dismissed.includes('match-1') && (
            <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[32px] p-6 shadow-sm border border-border-default hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              {/* AI Badge */}
              <div className="absolute top-0 right-0 p-4">
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-bold ${confidenceColor(matchCards[0].confidence)}`}>
                  <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                  {matchCards[0].confidence}% Match
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                {/* Visual Comparison */}
                <div className="md:col-span-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 h-48">
                    <div className="relative rounded-2xl overflow-hidden border border-border-default">
                      <img src={matchCards[0].yourImg} alt="Your Report" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[9px] rounded font-bold uppercase">Your Report</div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border-2 border-info-ai shadow-lg shadow-info-ai/20">
                      <img src={matchCards[0].foundImg} alt="Found Item" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-info-ai text-white text-[9px] rounded font-bold uppercase">Found Item</div>
                    </div>
                  </div>
                  {/* Score Bars */}
                  <div className="p-4 bg-surface-container-low rounded-2xl space-y-3">
                    {matchCards[0].scores.map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-text-secondary font-medium">{s.label}</span>
                          <span className={`font-bold ${s.color.replace('bg-', 'text-')}`}>{s.value}%</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Details */}
                <div className="md:col-span-7 flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded">
                        {matchCards[0].label}
                      </span>
                      <span className="text-text-secondary text-xs">{matchCards[0].timeAgo}</span>
                    </div>
                    <h3 className="font-bold text-xl text-text-primary mb-4">{matchCards[0].title}</h3>
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-3 text-text-secondary text-sm">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{matchCards[0].location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-text-secondary text-sm">
                        <Tag className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{matchCards[0].category}</span>
                      </div>
                      <div className="flex items-start gap-3 text-text-secondary text-sm">
                        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="leading-relaxed">{matchCards[0].description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-border-default">
                    <button
                      onClick={() => navigate('/claim')}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all text-sm"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      This is mine! (Claim)
                    </button>
                    <button
                      onClick={() => setDismissed(d => [...d, 'match-1'])}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-border-default text-text-secondary font-bold rounded-2xl hover:bg-surface-container transition-all text-sm"
                    >
                      <X className="w-5 h-5" />
                      Not a match
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Match Card 2 – Lower Confidence */}
          {!dismissed.includes('match-2') && (
            <div className="bg-surface-container-lowest/70 dark:bg-surface-container/70 rounded-[32px] p-6 border border-border-default hover:bg-surface-container-lowest dark:hover:bg-surface-container transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                  <img src={matchCards[1].foundImg} alt={matchCards[1].title} className="w-full h-full object-cover" />
                  <div className={`absolute top-2 right-2 text-white text-[10px] px-2 py-1 rounded-lg font-bold ${confidenceColor(matchCards[1].confidence).replace('text-', 'bg-').replace('border-warning/30', '').replace('bg-warning/10', '')}`}
                    style={{ background: '#FB923C' }}
                  >
                    {matchCards[1].confidence}% MATCH
                  </div>
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-text-primary mb-2">{matchCards[1].title}</h3>
                    <p className="text-text-secondary text-xs mb-4 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> {matchCards[1].timeAgo} at {matchCards[1].location}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {matchCards[1].tags?.map(tag => (
                        <span
                          key={tag.text}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${tag.danger ? 'bg-danger/10 text-danger' : 'bg-surface-container text-text-secondary'}`}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/item/123')}
                      className="px-5 py-2 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setDismissed(d => [...d, 'match-2'])}
                      className="px-5 py-2 text-text-secondary font-bold rounded-xl hover:bg-surface-container transition-all text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* How AI Works */}
            <div className="md:col-span-2 bg-gradient-to-br from-info-ai to-primary p-7 rounded-[32px] text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">How the AI Works</h3>
                <p className="text-white/90 text-sm max-w-lg mb-6 leading-relaxed">
                  Our Computer Vision model analyzes millions of campus photos to detect visual patterns, textures, and specific branding to provide you with the most accurate matches.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: '4.2M', label: 'Images Trained' },
                    { value: '0.4s', label: 'Match Speed' },
                    { value: '95%', label: 'Precision' },
                    { value: '24/7', label: 'Monitoring' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface-container-lowest/10 dark:bg-surface-container/10 backdrop-blur-md p-3 rounded-2xl text-center">
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-[9px] uppercase font-bold opacity-75 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div 
              onClick={() => navigate('/leaderboard')}
              className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-[32px] shadow-sm border border-border-default flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="text-warning w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-text-primary mb-2">Verify & Win!</h4>
              <p className="text-xs text-text-secondary px-2 leading-relaxed">
                Helping others find their items earns you +50 XP and exclusive campus rewards.
              </p>
              <button className="mt-5 text-primary font-bold text-xs hover:underline">See Rewards</button>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};
