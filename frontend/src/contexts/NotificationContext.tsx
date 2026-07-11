import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Sparkles, CheckCircle2, Bell, AlertTriangle, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedItemId?: string;
  relatedClaimId?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  extractAndShowCode: (notif: AppNotification) => boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Toast Component
const Toast = ({ notification, onClose, onClick }: { notification: AppNotification; onClose: () => void; onClick: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'match': return <Sparkles className="w-5 h-5 text-info-ai" />;
      case 'claim_approved': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'claim_rejected': return <AlertTriangle className="w-5 h-5 text-danger" />;
      case 'new_message': return <MessageCircle className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] bg-surface-container-lowest dark:bg-surface-container rounded-xl p-4 shadow-xl dark:shadow-md border border-border-default min-w-[300px] max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => { onClick(); onClose(); }}
    >
      <div className="shrink-0 p-2 rounded-lg bg-surface-container-low dark:bg-surface pointer-events-none">
        {getIcon()}
      </div>
      <div className="flex-1 pointer-events-none">
        <h4 className="font-bold text-sm text-text-primary">{notification.title}</h4>
        <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-text-secondary hover:text-text-primary z-10">
        &times;
      </button>
    </div>
  );
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toastNotification, setToastNotification] = useState<AppNotification | null>(null);
  const [activeCodeModal, setActiveCodeModal] = useState<string | null>(null);

  const extractAndShowCode = (notif: AppNotification): boolean => {
    const match = notif.message.match(/CFL-\d+/);
    if (match) {
      setActiveCodeModal(match[0]);
      return true;
    }
    return false;
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      await axios.put(`${API_BASE}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await axios.put(`${API_BASE}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await axios.delete(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();

      const newSocket = io(API_BASE, {
        auth: { token }
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Notification socket connected');
        newSocket.emit('join_user');
      });

      newSocket.on('new_notification', (notif: AppNotification) => {
        setNotifications(prev => [notif, ...prev]);
        setToastNotification(notif);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setNotifications([]);
      setToastNotification(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user, token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, fetchNotifications, extractAndShowCode }}>
      {children}
      {toastNotification && (
        <Toast 
          notification={toastNotification} 
          onClose={() => setToastNotification(null)}
          onClick={() => {
            if (!toastNotification.read) markAsRead(toastNotification._id);
            extractAndShowCode(toastNotification);
          }}
        />
      )}
      
      {/* CFL Code Modal */ }
      {activeCodeModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container w-full max-w-sm rounded-3xl border border-primary/30 shadow-2xl shadow-primary/10 p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/40">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Your Conflict Code</h3>
            <p className="text-text-secondary mb-6 text-sm">Please show this code to the admin during your in-person mediation.</p>
            
            <div className="bg-black/50 border border-primary/20 rounded-2xl p-6 w-full mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
              <span className="relative text-xs font-bold tracking-widest text-primary/70 uppercase block mb-2">Code</span>
              <span className="relative text-4xl font-black text-white tracking-widest font-mono">{activeCodeModal}</span>
            </div>

            <button
              onClick={() => setActiveCodeModal(null)}
              className="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary/90 font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
