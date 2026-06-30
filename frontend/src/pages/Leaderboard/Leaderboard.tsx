import React, { useState } from 'react';
import { Medal, ChevronLeft, ChevronRight, Award, Users } from 'lucide-react';

const topUsers = [
  { rank: 2, name: 'Alex Chen', level: '18', role: 'Architecture Junior', xp: '12,450 XP', returned: '24', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn6QvDSXrpyeEv0thwPPqf5nYJRF3AylJmVn5TJWPhXgimaBfXoia-vC1VQJ97OqD7OKgXHwbQD0IYFPyb4FSvq6omuA3sewHa2JI9O9_iWWnrrZOKJMwtswREIR9ReS3njb92_jr7R2MDAN5EpVk7Axaq4acvZ0-vR4LWB7N1yXOXspZ4B1GTPBkQuKwjsozKu6q0gPG6MJtu_HT44ukf3XvAat0jT0QfJE45nI_M7xeQshlIhL7m_ye4DTqz69IvshtUY8CBj1g' },
  { rank: 1, name: 'Maya Rodriguez', level: '25', role: 'Psychology Senior', xp: '18,200 XP', returned: '42', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADI6taO_kqaS1iB-caFtzyrzUdNH_c3LzpwFInmjPzRwZfjJO6hN82RMpNu-K43LKvePweFytZ_mhTAB14b8XDUDoLkall9GuzX7G8brWybEb0Vrdja-PJ40RaLdkzYQkHCwFUQ8VTcSLFGJTdfjnDyRciNk1ra3AchwJNfXGw04-OtriGD2ariTUw0DsW6Son9NuIoEZex4D6okW1m21bF_sLc-VsO5uZt30JGWUf4z62YJO5GWJn5o-05GDJe2c6Ez2762I4duo' },
  { rank: 3, name: 'Jordan Smith', level: '14', role: 'CS Sophomore', xp: '9,820 XP', returned: '19', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT8hmRT2NQE460dqL0G-DbdDTSThrsQcVKDY8x25ynowwx0su2wDcXrslwUz9enYYStA8iL0fMngQKrcwBAzGsdtgWCZYxY3y_w1LbeOIkjDxmwqed9w2T4JQmzWPgN9bZXZImnLVWl6_9EFjLzSo8alq1r_gZjkGKuMykwoywa7HXFgQ0HlIoSds_Ry45b4HQNBEMstRb8Q0AZLMQ6qhcv8yqtTGrbS7EZX_8N3hS5U25yRm3Qw_J_p-sQp60xY7qc1DgGWKNkmA' },
];

const rankingTable = [
  { rank: 4, name: 'Liam Wilson', level: '12', role: 'Bio-Med Senior', xp: '8,450 XP', returned: '15', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRhZCkGUq87b721znc1p9gdXIG0UJuFe9NtHuXf5Ef9a3IPu4TfKQRPj1dzIgOhkY19KFqTl1OYZgjyDFJzi7KlSaTp3dZgTly5ltzskJagj14FdT6tux6FgPxtHCgPx5RqUUogWQtghE-2KokcIOmRbF49QF8Kaz26uD5G6WMRrRBebrOSTwGi3OGn6MPhnilZzLMfng9MCtF65zAJfNqjcLqDtFD_XtOMulvNmH5f-xkXLbHdu-ZJ7XlIrt6caPurMIR4X2iY-Q' },
  { rank: 5, name: 'Sarah Parker', level: '11', role: 'Law Freshman', xp: '7,900 XP', returned: '12', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBosQYRv2b1UFSXZmG3tceU0oKEq4ns_FTr-OaBDP_XzbEfRTKqcC60N6NrHJr2DNm3WkHbt65Ulosz-RnQ1lzFPmop3xU1rVi90beniszbQ2iJG6LxsdDa38JKwMniZFPbgL0OY17KkF8wg7ICIBISz7VP3hLww4KaU93tyy5eKh8VDEnGMx3ebFh5KSLXvurBeqZf64cgvao5zzJfkJvron2atLYtsJdoq-TJTKJjHri2afhglT9mBkaxtcZZa02JgOtyL7IZtLw' },
  { rank: 6, name: 'James Miller', level: '9', role: 'Art History Junior', xp: '6,320 XP', returned: '11', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQHYAsQmoqoaT_mcfPv-S_M-9T5o6KhIJl5dHDyt2lwrrtLVEeI13LFWoCnNehVzp-U0WGCruuBSawGe7jKj9THxv2cS-khLbKrChF4wtkrJ9_cDjMI5Veieyf3gh-wCW6zU-EqictHja4sbey06qPlbgrve43BJa3ZmISpEM4EEdQvdO9fM_cKmQTDF_SJ0BYgNTvJl8SFAgjj0pK-nN8RFcgQN0_QTHNB-qMDNyrLsfT-6N87ajIMRNb4nI_cDZui2ueUxmOo9w' },
  { rank: 7, name: 'Elena Petrova', level: '8', role: 'Engineering Ph.D.', xp: '5,980 XP', returned: '10', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXSrLBVPaIfQ59y6SMtgRjxDnqM3OvIWGt49_mxddorgneUz60ikGH8QsjXGrhPkfTfod_6HhVi08BJU8oAjvbOXSlLTg1P5Zi3FwI-srkYytu0ZmFv8uO8MUM5M4GjD8D3dMYbrzzInY_e-jIEsyMB7KqxGr_WcwdSxV0JhQ3Kc20wiJ_NvYGQuh1mdQgKtnxLsJ5JGHDr3rXtxhJ4Bq-K7_aN6ogN8IablBk1CD1X3EUjr-kDeZ5J0pa8ptMZZ31BslDvclwxZo' }
];

export const Leaderboard: React.FC = () => {
  const [filter, setFilter] = useState('This Month');

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
        {topUsers.map((user) => {
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
