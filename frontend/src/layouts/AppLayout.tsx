import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Users, Sparkles, History, Search, Bell, BarChart2, Settings, HelpCircle } from 'lucide-react';
import { NotificationCenter } from '../components/NotificationCenter';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navItemClass = (path: string) => 
    `flex items-center gap-4 rounded-xl px-4 py-2 transition-all duration-200 hover:scale-[1.03] ${
      isActive(path)
        ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-sm'
        : 'text-text-secondary hover:bg-surface-container-low'
    }`;

  return (
    <div className="bg-surface font-body-md text-text-primary antialiased min-h-screen flex flex-col lg:flex-row relative">
      {/* Desktop Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-white shadow-md p-6 gap-6 z-40 border-r border-border-default">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Lost&Found AI</h1>
        </div>
        
        <nav className="flex flex-col gap-2 mt-4">
          <Link to="/" className={navItemClass('/')}>
            <Home className="w-5 h-5" />
            <span className="font-semibold text-base">Dashboard</span>
          </Link>
          <Link to="/report" className={navItemClass('/report')}>
            <PlusSquare className="w-5 h-5" />
            <span className="font-semibold text-base">Report Item</span>
          </Link>
          <Link to="/community" className={navItemClass('/community')}>
            <Users className="w-5 h-5" />
            <span className="font-semibold text-base">Community Board</span>
          </Link>
          <Link to="/matches" className={navItemClass('/matches')}>
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-base">AI Matches</span>
          </Link>
          <Link to="/profile" className={navItemClass('/profile')}>
            <History className="w-5 h-5" />
            <span className="font-semibold text-base">My History</span>
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <Link to="/profile" className="p-4 bg-surface-container-low rounded-2xl mb-2 hover:bg-surface-variant transition-colors group block cursor-pointer border border-transparent hover:border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <img 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors" 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" 
                alt="Alice"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">Helper Level 12</p>
                <p className="text-xs text-text-secondary">Alice</p>
              </div>
            </div>
            <div className="w-full bg-border-default h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#f9bd22] to-[#ffdf9f] h-full w-3/4 rounded-full"></div>
            </div>
            <p className="text-[11px] text-text-secondary mt-1 text-right">2450 / 3000 XP</p>
          </Link>

          <Link to="/settings" className="flex items-center gap-4 text-text-secondary hover:bg-surface-container-low rounded-xl px-4 py-2 transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-base">Settings</span>
          </Link>
          <Link to="/help" className="flex items-center gap-4 text-text-secondary hover:bg-surface-container-low rounded-xl px-4 py-2 transition-all">
            <HelpCircle className="w-5 h-5" />
            <span className="font-semibold text-base">Help Support</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <header className="lg:hidden fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md px-4 py-4 flex justify-between items-center shadow-sm border-b border-border-default">
        <h1 className="text-2xl font-bold text-primary">Lost&Found AI</h1>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); setShowNotifications(prev => !prev); }} className="relative text-text-secondary hover:text-primary transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-danger w-2 h-2 rounded-full border-2 border-white"></span>
          </button>
          <Link to="/profile">
            <img 
              className="w-8 h-8 rounded-full border-2 border-primary/20" 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" 
              alt="Profile"
            />
          </Link>
        </div>
      </header>

      {/* Notification Center Popover */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Main Canvas */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        {/* Desktop Top Nav */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md px-8 py-4 justify-between items-center shadow-sm border-b border-border-default">
          <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 w-full max-w-md border border-border-default focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search className="text-text-secondary mr-2 w-5 h-5" />
            <input className="bg-transparent border-none outline-none w-full text-base" placeholder="Search lost items..." type="text" />
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowNotifications(prev => !prev); }} className="relative text-text-secondary hover:text-primary transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-danger w-2 h-2 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <Sparkles className="w-6 h-6" />
            </button>
            <button className="text-text-secondary hover:text-primary transition-colors">
              <BarChart2 className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden border-t border-border-default pb-safe">
        <Link to="/" className={`flex flex-col items-center justify-center ${isActive('/') ? 'text-primary' : 'text-text-secondary'}`}>
          <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
          <span className="text-xs font-semibold mt-1">Home</span>
        </Link>
        <Link to="/community" className={`flex flex-col items-center justify-center ${isActive('/community') ? 'text-primary' : 'text-text-secondary'}`}>
          <Users className={`w-6 h-6 ${isActive('/community') ? 'fill-current' : ''}`} />
          <span className="text-xs font-semibold mt-1">Community</span>
        </Link>
        <Link to="/matches" className={`flex flex-col items-center justify-center ${isActive('/matches') ? 'text-primary' : 'text-text-secondary'}`}>
          <div className="relative">
            <Sparkles className={`w-6 h-6 ${isActive('/matches') ? 'fill-current' : ''}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
          </div>
          <span className="text-xs font-semibold mt-1">Matches</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center justify-center ${isActive('/profile') ? 'text-primary' : 'text-text-secondary'}`}>
          <History className={`w-6 h-6 ${isActive('/profile') ? 'fill-current' : ''}`} />
          <span className="text-xs font-semibold mt-1">Profile</span>
        </Link>
      </nav>

      {/* FAB for quick report */}
      <Link to="/report" className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-[#6b38d4] text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40">
        <PlusSquare className="w-8 h-8" />
      </Link>
    </div>
  );
};
