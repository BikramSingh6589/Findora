import React, { useState, useEffect } from 'react';
import { Medal, ChevronLeft, ChevronRight, Award, Users } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState('This Month');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/users/leaderboard`);
        if (res.data && res.data.success) {
          setUsers(res.data.users || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const podiumUsers: any[] = [];
  if (users.length > 1) {
    podiumUsers.push({
      rank: 2,
      name: users[1].name,
      role: users[1].role === 'admin' ? 'Campus Admin' : 'Student Helper',
      xp: `${users[1].xp} XP`,
      returned: users[1].itemsReturned || 0,
      level: users[1].level || 1,
      img: users[1].profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });
  }
  if (users.length > 0) {
    podiumUsers.push({
      rank: 1,
      name: users[0].name,
      role: users[0].role === 'admin' ? 'Campus Admin' : 'Student Helper',
      xp: `${users[0].xp} XP`,
      returned: users[0].itemsReturned || 0,
      level: users[0].level || 1,
      img: users[0].profilePic || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    });
  }
  if (users.length > 2) {
    podiumUsers.push({
      rank: 3,
      name: users[2].name,
      role: users[2].role === 'admin' ? 'Campus Admin' : 'Student Helper',
      xp: `${users[2].xp} XP`,
      returned: users[2].itemsReturned || 0,
      level: users[2].level || 1,
      img: users[2].profilePic || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    });
  }

  const rankingTable = users.slice(3).map((u, i) => ({
    rank: i + 4,
    name: u.name,
    role: u.role === 'admin' ? 'Campus Admin' : 'Student Helper',
    xp: `${u.xp} XP`,
    returned: u.itemsReturned || 0,
    level: u.level || 1,
    img: u.profilePic || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  }));

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Hero Header */}
      <div className="mb-6 text-center md:text-left">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-2">Campus Legends</h2>
        <p className="text-text-secondary md:text-lg max-w-2xl">
          Celebrating the students who go above and beyond to reconnect lost belongings with their owners. Real heroes don't wear capes, they report found items.
        </p>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end mt-4 mb-8">
        {loading ? (
          <p className="col-span-3 text-center text-text-secondary">Loading podium rankings...</p>
        ) : podiumUsers.length === 0 ? (
          <p className="col-span-3 text-center text-text-secondary">No champions reported yet.</p>
        ) : podiumUsers.map((user) => {
          const isFirst = user.rank === 1;
          const isSecond = user.rank === 2;
          
          return (
            <div key={user.rank} className={`flex flex-col justify-end h-full ${isFirst ? 'order-1 md:order-2 z-10 scale-105' : isSecond ? 'order-2 md:order-1' : 'order-3 md:order-3'}`}>
              <div className={`bg-surface-container-lowest dark:bg-surface-container p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 relative ${
                isFirst ? 'border-b-4 border-[#F9BD22] bg-gradient-to-b from-white to-[#F9BD22]/10' : 
                isSecond ? 'border-b-4 border-[#94A3B8]' : 'border-b-4 border-[#FB923C]'
              }`}>
                
                {isFirst && (
                  <div className="absolute -top-10">
                    <Medal className="w-16 h-16 text-[#F9BD22] fill-current animate-bounce" />
                  </div>
                )}
                
                <div className={`relative mb-6 ${isFirst ? 'mt-4' : ''}`}>
                  <img 
                    src={user.img} 
                    alt={user.name} 
                    className={`rounded-full object-cover border-4 ${
                      isFirst ? 'w-32 h-32 border-[#F9BD22]' : 
                      isSecond ? 'w-24 h-24 border-[#94A3B8]' : 'w-24 h-24 border-[#FB923C]'
                    }`}
                  />
                  <div className={`absolute -bottom-2 -right-2 text-white rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white ${
                    isFirst ? 'w-10 h-10 bg-[#F9BD22] text-xl' : 
                    isSecond ? 'w-8 h-8 bg-[#94A3B8] text-lg' : 'w-8 h-8 bg-[#FB923C] text-lg'
                  }`}>
                    {user.rank}
                  </div>
                </div>
                
                <h3 className={`font-bold text-text-primary ${isFirst ? 'text-2xl mb-1' : 'text-lg mb-1'}`}>{user.name}</h3>
                <p className="text-xs md:text-sm text-text-secondary mb-4">{user.role}</p>
                
                <div className={`px-4 py-2 rounded-full mb-6 ${isFirst ? 'bg-[#F9BD22] text-white shadow-inner px-6 py-3' : 'bg-surface-container-high dark:bg-surface-container'}`}>
                  <span className={`font-bold ${isFirst ? 'text-lg' : 'text-primary'}`}>{user.xp}</span>
                </div>
                
                <div className="grid grid-cols-2 w-full gap-2 pt-4 border-t border-border-default">
                  <div>
                    <p className="text-[10px] md:text-xs text-text-secondary">Returned</p>
                    <p className={`font-bold ${isFirst ? 'text-lg' : ''}`}>{user.returned}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-text-secondary">Level</p>
                    <p className={`font-bold ${isFirst ? 'text-lg text-primary' : ''}`}>{user.level}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl shadow-sm overflow-hidden border border-border-default">
        <div className="p-4 md:p-6 border-b border-border-default flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-text-primary">All-Time Rankings</h3>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {['This Month', 'Semester', 'All-Time'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'hover:bg-surface-container text-text-secondary'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-text-secondary text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Rank</th>
                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Student Name</th>
                <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Level</th>
                <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap hidden md:table-cell">Items Returned</th>
                <th className="px-4 md:px-6 py-4 text-right whitespace-nowrap">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {rankingTable.map(user => (
                <tr key={user.rank} className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <td className="px-4 md:px-6 py-4">
                    <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-text-secondary text-xs md:text-sm">{user.rank}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <img src={user.img} alt={user.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-primary transition-colors text-sm md:text-base">{user.name}</p>
                        <p className="text-[10px] md:text-xs text-text-secondary">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded-lg text-text-secondary font-bold text-[10px] md:text-xs">
                      <Award className="w-3 h-3 text-primary" />
                      {user.level}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center hidden md:table-cell">
                    <span className="font-bold text-sm">{user.returned}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <span className="font-bold text-primary text-sm md:text-base whitespace-nowrap">{user.xp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 md:p-6 bg-surface-container-low flex items-center justify-center gap-2 md:gap-4">
          <button className="p-1.5 md:p-2 rounded-lg border border-border-default hover:bg-surface-container transition-colors disabled:opacity-50">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
          </button>
          <div className="flex items-center gap-1 md:gap-2 text-sm">
            <button className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary text-white font-bold">1</button>
            <button className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-surface-container transition-colors">2</button>
            <button className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-surface-container transition-colors">3</button>
            <span className="px-1 text-text-secondary">...</span>
            <button className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-surface-container transition-colors">12</button>
          </div>
          <button className="p-1.5 md:p-2 rounded-lg border border-border-default hover:bg-surface-container transition-colors">
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Gamification Teasers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-primary text-white p-6 md:p-8 rounded-3xl shadow-lg flex items-center gap-6">
          <div className="p-4 bg-surface-container-lowest dark:bg-surface-container/20 rounded-2xl shrink-0 hidden sm:block">
            <Award className="w-10 h-10 md:w-12 md:h-12 text-white fill-current" />
          </div>
          <div>
            <h4 className="font-bold text-lg md:text-xl mb-2">Join the Elite</h4>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">Reporting items earns you XP, badges, and campus dining vouchers. Start your streak today!</p>
            <button className="bg-surface-container-lowest dark:bg-surface-container text-primary px-5 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all text-sm shadow-md">How it works</button>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest dark:bg-surface-container p-6 md:p-8 rounded-3xl shadow-lg border border-border-default flex items-center gap-6">
          <div className="p-4 bg-[#f9f6ff] rounded-2xl shrink-0 hidden sm:block">
            <Users className="w-10 h-10 md:w-12 md:h-12 text-[#5516be] fill-current" />
          </div>
          <div>
            <h4 className="font-bold text-lg md:text-xl text-text-primary mb-2">Team Leaderboards</h4>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">Compete as a dormitory or a major. The winning team gets a customized common area mural.</p>
            <button className="bg-surface-container-high text-text-primary px-5 py-2.5 rounded-full font-bold hover:bg-surface-container transition-all text-sm">Explore Teams</button>
          </div>
        </div>
      </div>

    </div>
  );
};
