import React, { useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Users, Sparkles, History, Search, Bell, BarChart2, Settings, HelpCircle, LogOut } from 'lucide-react';
import { NotificationCenter } from '../components/NotificationCenter';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const hoverTimeoutRef = useRef<any>(null);
  
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarCollapsed(false);
    }, 100); // 100ms expand delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsSidebarCollapsed(true);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navItemClass = (path: string) => 
    `flex items-center gap-4 rounded-xl py-2.5 transition-all duration-200 hover:scale-[1.03] ${
      isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
    } ${
      isActive(path)
        ? 'bg-primary-fixed text-on-primary-fixed-variant shadow-sm dark:bg-primary/20 dark:text-primary'
        : 'text-text-secondary hover:bg-surface-container-low dark:hover:bg-surface-container-high'
    }`;

  return (
    <div className="bg-surface dark:bg-surface font-body-md text-text-primary antialiased min-h-screen flex flex-col lg:flex-row relative transition-colors duration-300" onClick={() => setShowDropdown(false)}>
      {/* Desktop Sidebar Navigation */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`h-screen fixed left-0 top-0 hidden lg:flex flex-col bg-surface-container-lowest dark:bg-surface-container shadow-md dark:shadow-lg py-6 gap-6 z-40 border-r border-border-default transition-all duration-300 ${isSidebarCollapsed ? 'w-20 px-3' : 'w-64 p-6'}`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          {!isSidebarCollapsed && <h1 className="text-2xl font-bold text-primary">Findora</h1>}
        </div>
        
        <nav className="flex flex-col gap-2 mt-4">
          <Link to="/" className={navItemClass('/')} title={isSidebarCollapsed ? "Dashboard" : undefined}>
            <Home className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">Dashboard</span>}
          </Link>
          <Link to="/report" className={navItemClass('/report')} title={isSidebarCollapsed ? "Report Item" : undefined}>
            <PlusSquare className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">Report Item</span>}
          </Link>
          <Link to="/community" className={navItemClass('/community')} title={isSidebarCollapsed ? "Community Board" : undefined}>
            <Users className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">Community Board</span>}
          </Link>
          <Link to="/matches" className={navItemClass('/matches')} title={isSidebarCollapsed ? "AI Matches" : undefined}>
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">AI Matches</span>}
          </Link>
          <Link to="/leaderboard" className={navItemClass('/leaderboard')} title={isSidebarCollapsed ? "Leaderboard" : undefined}>
            <BarChart2 className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">Leaderboard</span>}
          </Link>
          <Link to="/profile" className={navItemClass('/profile')} title={isSidebarCollapsed ? "My History" : undefined}>
            <History className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">My History</span>}
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          {isSidebarCollapsed ? (
            <Link to="/profile" className="flex items-center justify-center p-2 bg-surface-container-low dark:bg-surface-container-high rounded-xl hover:bg-surface-variant dark:hover:bg-surface-container-highest transition-all duration-200 border border-transparent hover:border-primary/20 dark:border-border-default/30" title="My Profile">
              <img 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:border-primary transition-colors" 
                src={user?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                alt={user?.name || "User"}
              />
            </Link>
          ) : (
            <Link to="/profile" className="p-4 bg-surface-container-low dark:bg-surface-container-high rounded-2xl mb-2 hover:bg-surface-variant dark:hover:bg-surface-container-highest transition-colors group block cursor-pointer border border-transparent hover:border-primary/20 dark:border-border-default/30">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors" 
                  src={user?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                  alt={user?.name || "User"}
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">Helper Level {user?.level || 1}</p>
                  <p className="text-xs text-text-secondary">{user?.name || "Student"}</p>
                </div>
              </div>
              <div className="w-full bg-border-default h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f9bd22] to-[#ffdf9f] h-full rounded-full" style={{ width: `${(user?.xp % 100) || 30}%` }}></div>
              </div>
              <p className="text-[11px] text-text-secondary mt-1 text-right">{user?.xp || 0} XP</p>
            </Link>
          )}

          <Link to="/settings" className={`flex items-center gap-4 text-text-secondary hover:bg-surface-container-low rounded-xl py-2 transition-all ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`} title={isSidebarCollapsed ? "Settings" : undefined}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">Settings</span>}
          </Link>
          <Link to="/help" className={`flex items-center gap-4 text-text-secondary hover:bg-surface-container-low rounded-xl py-2 transition-all ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`} title={isSidebarCollapsed ? "Help Support" : undefined}>
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold text-base">Help Support</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <header className="lg:hidden fixed top-0 w-full z-40 bg-surface-container-lowest dark:bg-surface-container/80 dark:bg-surface-container/80 dark:border-surface-container-high backdrop-blur-md px-4 py-4 flex justify-between items-center shadow-sm border-b border-border-default transition-colors duration-300">
        <h1 className="text-2xl font-bold text-primary">Findora</h1>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); setShowNotifications(prev => !prev); }} className="relative text-text-secondary hover:text-primary transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-danger w-2 h-2 rounded-full border-2 border-white"></span>
          </button>
          <ThemeToggle />
          
          {/* Mobile Profile Dropdown Trigger */}
          <div className="relative">
            <img 
              onClick={(e) => { e.stopPropagation(); setShowDropdown(prev => !prev); }}
              className="w-8 h-8 rounded-full border-2 border-primary/20 cursor-pointer" 
              src={user?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
              alt="Profile"
            />
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-2xl shadow-xl py-2 z-50">
                <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-surface-container-low">
                  <PlusSquare className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-surface-container-low">
                  <Settings className="w-4 h-4" /> Profile Settings
                </Link>
                <hr className="border-border-default my-1" />
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/10 text-left">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Center Popover */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Main Canvas */}
      <div className={`flex-1 flex flex-col min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Desktop Top Nav */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-surface-container-lowest dark:bg-surface-container/80 dark:bg-surface-container/80 dark:border-surface-container-high backdrop-blur-md px-8 py-4 justify-between items-center shadow-sm border-b border-border-default transition-colors duration-300">
          <div className="flex items-center bg-surface-container-low dark:bg-surface-container-high rounded-full px-4 py-2 w-full max-w-md border border-border-default focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
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
            <ThemeToggle />
            <Link to="/leaderboard" className="text-text-secondary hover:text-primary transition-colors">
              <BarChart2 className="w-6 h-6" />
            </Link>

            {/* Desktop Profile Dropdown Trigger */}
            <div className="relative">
              <img 
                onClick={(e) => { e.stopPropagation(); setShowDropdown(prev => !prev); }}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:border-primary cursor-pointer transition-colors" 
                src={user?.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                alt="Profile"
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-surface-container border border-border-default rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 text-xs text-text-secondary border-b border-border-default">
                    Signed in as <p className="font-bold text-text-primary truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-surface-container-low">
                    <PlusSquare className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-surface-container-low">
                    <Settings className="w-4 h-4" /> Profile Settings
                  </Link>
                  <hr className="border-border-default my-1" />
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-danger/10 text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 bg-surface-container-lowest dark:bg-surface-container dark:bg-surface-container shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] lg:hidden border-t border-border-default pb-safe transition-colors duration-300">
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
      <Link to="/report" className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl shadow-lg dark:shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40">
        <PlusSquare className="w-8 h-8" />
      </Link>
    </div>
  );
};
