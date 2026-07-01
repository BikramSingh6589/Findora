import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, ListChecks, Users, 
  MessageSquareWarning, Settings, LogOut 
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');
  };

  const navItemClass = (path: string) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-fixed-dim/20 dark:bg-primary/20 text-primary dark:text-primary border-r-4 border-primary'
        : 'text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary hover:bg-surface-container-high dark:hover:bg-surface-container-highest'
    }`;

  const mobileNavClass = (path: string) => 
    `flex flex-col items-center justify-center p-2 ${
      isActive(path) ? 'text-primary' : 'text-text-secondary'
    }`;

  return (
    <div className="bg-surface dark:bg-surface font-body-md text-text-primary dark:text-text-primary min-h-screen flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container dark:bg-surface-container p-6 border-r border-border-default z-40 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-danger flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-danger leading-tight">Admin Portal</h1>
            <p className="text-xs text-text-secondary font-bold">Lost & Found</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link to="/admin" className={navItemClass('/admin')}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/claims" className={navItemClass('/admin/claims')}>
            <ShieldCheck className="w-5 h-5" />
            <span>Claims</span>
          </Link>
          <Link to="/admin/items" className={navItemClass('/admin/items')}>
            <ListChecks className="w-5 h-5" />
            <span>Items</span>
          </Link>
          <Link to="/admin/users" className={navItemClass('/admin/users')}>
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          <Link to="/admin/community" className={navItemClass('/admin/community')}>
            <MessageSquareWarning className="w-5 h-5" />
            <span>Community</span>
          </Link>
        </nav>
        
        <div className="pt-6 mt-6 border-t border-border-default space-y-2">
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <ThemeToggle />
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-danger dark:text-danger hover:bg-danger/10 dark:hover:bg-danger/20 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 w-full z-40 bg-surface-container-lowest dark:bg-surface-container/90 dark:bg-surface-container/90 dark:border-surface-container-high backdrop-blur-md px-4 py-4 flex justify-between items-center shadow-sm border-b border-border-default transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-danger flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-danger">Admin</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" alt="Admin" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-20 pb-24 md:pt-0 md:pb-0 min-h-screen bg-surface dark:bg-surface relative transition-colors duration-300">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest dark:bg-surface-container border-t border-border-default pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] h-16 flex items-center justify-around px-2 transition-colors duration-300">
        <Link to="/admin" className={mobileNavClass('/admin')}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </Link>
        <Link to="/admin/claims" className={mobileNavClass('/admin/claims')}>
          <ShieldCheck className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Claims</span>
        </Link>
        <Link to="/admin/items" className={mobileNavClass('/admin/items')}>
          <ListChecks className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Items</span>
        </Link>
        <Link to="/admin/users" className={mobileNavClass('/admin/users')}>
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Users</span>
        </Link>
        <Link to="/admin/community" className={mobileNavClass('/admin/community')}>
          <MessageSquareWarning className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Mod</span>
        </Link>
      </nav>

    </div>
  );
};
