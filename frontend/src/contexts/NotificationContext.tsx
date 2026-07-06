import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Sparkles, CheckCircle2, Bell, AlertTriangle, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface AppNotification {
  _id: string;
  type: 'match' | 'claim_approved' | 'claim_rejected' | 'pickup_reminder' | 'system' | 'new_message';
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
  fetchNotifications: () => Promise<void>;
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
const Toast = ({ notification, onClose }: { notification: AppNotification; onClose: () => void }) => {
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
    <div className="fixed bottom-4 right-4 z-[9999] bg-surface-container-lowest dark:bg-surface-container rounded-xl p-4 shadow-xl dark:shadow-md border border-border-default min-w-[300px] max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="shrink-0 p-2 rounded-lg bg-surface-container-low dark:bg-surface">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-text-primary">{notification.title}</h4>
        <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
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

  useEffect(() => {
    if (user && token) {
      fetchNotifications();

      const newSocket = io(API_BASE, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        newSocket.emit('join_user');
      });

      newSocket.on('new_notification', (notif: AppNotification) => {
        setNotifications(prev => [notif, ...prev]);
        setToastNotification(notif);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setNotifications([]);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user, token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
      {toastNotification && (
        <Toast notification={toastNotification} onClose={() => setToastNotification(null)} />
      )}
    </NotificationContext.Provider>
  );
};
