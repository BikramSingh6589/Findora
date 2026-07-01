import React, { useState } from 'react';
import { User as UserIcon, Shield, Bell, Lock, Contrast, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary flex items-center gap-3">
            Settings 🛠️
          </h2>
          <p className="text-text-secondary mt-1">Customize your experience and manage your security.</p>
        </div>

        {/* Theme Toggle Action Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container p-3 rounded-2xl shadow-sm flex items-center gap-4 border border-border-default">
          <Contrast className="text-primary w-5 h-5" />
          <div className="flex bg-surface-container p-1 rounded-full">
            <button 
              onClick={() => setTheme('light')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === 'light' ? 'bg-surface-container-lowest dark:bg-surface-container shadow-sm text-primary' : 'text-text-secondary'}`}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === 'dark' ? 'bg-surface-container-lowest dark:bg-surface-container shadow-sm text-primary' : 'text-text-secondary'}`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Settings Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Account & Profile */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Account Card */}
          <section className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-6">
              <UserIcon className="text-primary w-6 h-6" />
              <h3 className="font-bold text-xl text-text-primary">Account Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-text-secondary block">Full Name</label>
                <input 
                  className="w-full bg-surface-container-low border border-border-default rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-primary" 
                  type="text" 
                  defaultValue={user?.name || "Alex Johnson"}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-text-secondary block">Student ID</label>
                <input 
                  className="w-full bg-surface-container-high border border-border-default text-text-secondary rounded-xl p-3 cursor-not-allowed" 
                  disabled 
                  type="text" 
                  value={user?.studentId || "SU-2024-8842"}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-bold text-text-secondary block">Email Address</label>
                <input 
                  className="w-full bg-surface-container-low border border-border-default rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-primary" 
                  type="email" 
                  defaultValue={user?.email || "alex.johnson@campus.edu"}
                />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border-default flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h4 className="text-sm font-bold mb-2 text-text-primary">Security</h4>
                <button className="flex items-center gap-2 text-primary font-bold hover:underline transition-all">
                  <Lock className="w-5 h-5" />
                  Change Password
                </button>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/25 font-bold px-6 py-3 rounded-2xl transition-all shadow-sm"
              >
                <LogOut className="w-5 h-5" />
                Sign Out / Logout
              </button>
            </div>
          </section>

          {/* Privacy Card */}
          <section className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-primary w-6 h-6" />
              <h3 className="font-bold text-xl text-text-primary">Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface transition-colors">
                <div>
                  <p className="font-bold text-sm text-text-primary">Profile Visibility</p>
                  <p className="text-xs text-text-secondary mt-1">Allow other students to see your lost item history.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest dark:bg-surface-container after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface transition-colors">
                <div>
                  <p className="font-bold text-sm text-text-primary">Direct Messages</p>
                  <p className="text-xs text-text-secondary mt-1">Let users contact you directly about found items.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest dark:bg-surface-container after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Notifications & Visuals */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Notification Preferences */}
          <section className="bg-surface-container-lowest dark:bg-surface-container p-8 rounded-[20px] shadow-sm border border-border-default">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="text-primary w-6 h-6" />
              <h3 className="font-bold text-xl text-text-primary">Notifications</h3>
            </div>
            <div className="space-y-2">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                  Highly Recommended
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-text-primary">Email Alerts</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest dark:bg-surface-container after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-xs text-text-secondary mt-2">Instant updates when an item matches your report.</p>
              </div>
              
              <div className="flex items-center justify-between p-4">
                <span className="font-bold text-sm text-text-primary">Push Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest dark:bg-surface-container after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4">
                <span className="font-bold text-sm text-text-primary">Weekly Summary</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest dark:bg-surface-container after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Interactive Mascot Card */}
          <section className="bg-gradient-to-br from-primary to-[#6b38d4] p-8 rounded-[20px] text-white relative overflow-hidden shadow-lg group">
            <div className="relative z-10">
              <h4 className="font-bold text-xl mb-2">Need a Hand? 🤝</h4>
              <p className="text-white/90 text-sm mb-6">Our AI assistant is always ready to help you find your lost items faster!</p>
              <button className="bg-surface-container-lowest dark:bg-surface-container text-primary font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform shadow-md text-sm">
                Contact Support
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
