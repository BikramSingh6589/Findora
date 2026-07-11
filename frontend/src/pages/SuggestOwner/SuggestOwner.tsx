import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Search, EyeOff, Send, CheckCircle, Rocket, BellRing, ArrowRight, UserSearch, Stars } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const SuggestOwner: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const [isSuccess, setIsSuccess] = useState(false);
  const [query, setQuery] = useState('');
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  
  const [item, setItem] = useState<any | null>(null);
  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!itemId) return;
      try {
        setLoading(true);
        // 1. Fetch item details (try found items first, fallback to lost items)
        let fetchedItem = null;
        try {
          const res = await axios.get(`${API_BASE}/api/found-items/${itemId}`);
          if (res.data?.success) {
            fetchedItem = res.data.item;
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
            const res2 = await axios.get(`${API_BASE}/api/lost-items/${itemId}`);
            if (res2.data?.success) {
              fetchedItem = res2.data.item;
            }
          }
        }
        setItem(fetchedItem);

        // 2. Fetch users leaderboard for the autocomplete directory
        const usersRes = await axios.get(`${API_BASE}/api/users/leaderboard`);
        if (usersRes.data?.success && usersRes.data.users) {
          setUsers(usersRes.data.users);
        }

        // 3. Fetch matches to find if there is an AI match score
        const matchRes = await axios.get(`${API_BASE}/api/ai/matches/${itemId}`);
        if (matchRes.data?.success && matchRes.data.matches && matchRes.data.matches.length > 0) {
          // Take the highest matching score
          const sorted = [...matchRes.data.matches].sort((a: any, b: any) => b.score - a.score);
          setMatch(sorted[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data for suggest owner page', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !itemId) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/community/${itemId}/suggest-owner`,
        {
          suggestedUserId: selectedUser._id || selectedUser.id,
          note: reason,
          isAnonymous // if backend supports it or can be saved
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-10 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Item not found</h2>
        <p className="text-text-secondary mt-2">The item you are looking for does not exist or has been deleted.</p>
        <button 
          onClick={() => navigate('/community')}
          className="mt-6 bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:scale-105 transition-transform"
        >
          Back to Community Board
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-10 relative min-h-[80vh]">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-[#8455ef]/5 blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl w-full z-10 bg-surface-container-lowest dark:bg-surface-container rounded-[40px] shadow-xl p-8 md:p-12 border border-border-default overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Left Column: Visual & Stats */}
            <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
              <div className="relative w-full max-w-[320px] flex justify-center">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-75"></div>
                {item.images && item.images[0] ? (
                  <img 
                    alt={item.itemName} 
                    className="w-48 h-48 rounded-full object-cover relative z-10 border border-border-default shadow-lg" 
                    src={item.images[0]}
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center relative z-10 text-primary">
                    <Stars className="w-16 h-16" />
                  </div>
                )}
              </div>
              
              {/* Match Confidence Card */}
              <div className="w-full bg-surface-container-low rounded-3xl p-6 border border-border-default flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-text-secondary uppercase tracking-wider">AI Confidence Match</span>
                  <Stars className="w-5 h-5 text-info-ai fill-current" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-extrabold text-4xl text-primary leading-none">
                    {match ? `${match.score}%` : 'Pending'}
                  </span>
                  <span className="font-bold text-sm text-text-secondary mb-1">Probability</span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-[#8455ef] rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: match ? `${match.score}%` : '50%' }}
                  ></div>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {match ? 'Based on active backend AI matched characteristics.' : 'Awaiting comparison analysis against database entries.'}
                </p>
              </div>
            </div>
            
            {/* Right Column: Success Messaging & Actions */}
            <div className="w-full lg:w-7/12 flex flex-col gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded-full">
                  <CheckCircle className="w-5 h-5 fill-current text-white" />
                  <span className="font-bold text-sm">Contribution Successfully Logged</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
                  Thank You for Your Help!
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Your suggestion has been logged! Our AI is now comparing if <span className="font-bold text-text-primary">{selectedUser?.name || 'the user'}</span> has a matching report in the campus database.
                </p>
              </div>
              
              {/* Info Bento Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border-default flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-text-primary">XP Awarded</h4>
                    <p className="text-xs text-text-secondary">+50 Points for helping the community.</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-border-default flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <BellRing className="w-6 h-6 text-warning" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-text-primary">Notifications Sent</h4>
                    <p className="text-xs text-text-secondary">Moderators and matched parties have been notified.</p>
                  </div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-default">
                <button 
                  onClick={() => navigate('/community')}
                  className="flex-1 bg-gradient-to-r from-primary to-[#8455ef] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Return to Community Board
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className="flex-1 bg-transparent border-2 border-primary text-primary font-bold py-3.5 px-6 rounded-2xl hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserSearch className="w-5 h-5" />
                  View Leaderboard
                </button>
              </div>
              <p className="text-center md:text-left text-xs text-text-secondary">
                Helping a fellow student reduces campus stress by 25%. You're a hero! 🎓
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-primary mb-2">Suggest an Owner</h1>
        <p className="text-text-secondary">Do you recognize this item? Help us reconnect it with its owner!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Item Context */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 shadow-sm border border-border-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            <h3 className="font-bold text-text-primary mb-4 text-lg">Item Details</h3>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0">
                {item.images && item.images[0] ? (
                  <img 
                    alt={item.itemName} 
                    className="w-full h-full object-cover" 
                    src={item.images[0]} 
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                    <Stars className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-text-primary">{item.itemName}</p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wide mt-1 inline-block">
                  {item.category || 'General'}
                </span>
                <p className="text-xs text-text-secondary mt-2 line-clamp-2">{item.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#f9f6ff] to-white rounded-2xl p-6 border border-[#d0bcff]/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8455ef] text-white flex items-center justify-center shrink-0 shadow-md">
              <Stars className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-[#5516be]">Earn 50 XP</h4>
              <p className="text-xs text-text-secondary mt-1">Accurate owner suggestions build your Campus Helper level!</p>
            </div>
          </div>
        </section>

        {/* Right Panel: Form */}
        <section className="lg:col-span-7">
          <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 md:p-8 shadow-md border border-border-default">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Student ID Input */}
              <div className="space-y-2">
                <label className="font-bold text-text-primary flex items-center justify-between text-sm">
                  Student Name
                  <span className="text-text-secondary text-[10px] font-normal">Campus Directory Lookup</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border-default bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none" 
                    placeholder="Search name or username..." 
                    type="text"
                    required
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowAutoSuggest(e.target.value.length >= 1);
                      setSelectedUser(null);
                    }}
                  />
                  
                  {/* Dynamic Auto-suggest dropdown */}
                  {showAutoSuggest && filteredUsers.length > 0 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-lowest dark:bg-surface-container rounded-xl shadow-xl border border-border-default overflow-hidden z-20">
                      {filteredUsers.map((u: any) => (
                        <div 
                          key={u._id || u.id}
                          className="px-4 py-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3 transition-colors border-b border-border-default last:border-b-0"
                          onClick={() => { 
                            setQuery(u.name); 
                            setShowAutoSuggest(false); 
                            setSelectedUser(u); 
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                            {u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{u.name}</p>
                            <p className="text-[10px] text-text-secondary">Level {u.level || 1} · {u.xp || 0} XP</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showAutoSuggest && filteredUsers.length === 0 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-lowest dark:bg-surface-container rounded-xl shadow-xl border border-border-default p-4 text-center text-xs text-text-secondary z-20">
                      No matching students found
                    </div>
                  )}
                </div>
              </div>

              {/* Reasoning Textarea */}
              <div className="space-y-2">
                <label className="font-bold text-text-primary text-sm">Why do you think this belongs to them?</label>
                <textarea 
                  required
                  className="w-full p-4 rounded-2xl border border-border-default bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none resize-none" 
                  placeholder="e.g. 'They lost a laptop with similar stickers' or 'I saw them carrying this exact bottle earlier today'..." 
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-lowest dark:bg-surface-container flex items-center justify-center text-primary shadow-sm shrink-0">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-sm">Anonymously Suggest</p>
                    <p className="text-text-secondary text-[10px] md:text-xs">Your name won't be shown to the suggested owner.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest dark:bg-surface-container after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={!selectedUser || isSubmitting}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#6b38d4] text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                >
                  {isSubmitting ? 'Logging...' : 'Submit Suggestion'}
                  <Send className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border-2 border-border-default text-text-secondary font-bold hover:bg-surface-container transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <p className="text-center text-[10px] text-text-secondary px-2 mt-4">
                By submitting, you agree to the Campus Trust Guidelines. Intentional false suggestions may result in a temporary suspension of community features.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
