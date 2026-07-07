import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Medal, QrCode, Bell, AlertTriangle, MessageCircle, MessageSquare } from 'lucide-react';
import { useNotification, type AppNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Important'>('All');
  const popoverRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Important') return ['match', 'claim_approved', 'claim_rejected', 'new_message'].includes(n.type);
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return <div className="w-10 h-10 rounded-xl bg-info-ai/10 flex items-center justify-center text-info-ai shrink-0"><Sparkles className="w-5 h-5" /></div>;
      case 'claim_approved': return <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0"><CheckCircle2 className="w-5 h-5" /></div>;
      case 'claim_rejected': return <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger shrink-0"><AlertTriangle className="w-5 h-5" /></div>;
      case 'new_message': return <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><MessageCircle className="w-5 h-5" /></div>;
      case 'system': return <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Medal className="w-5 h-5" /></div>;
      default: return <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-text-primary shrink-0"><Bell className="w-5 h-5" /></div>;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'match': return 'border-info-ai';
      case 'claim_approved': return 'border-success';
      case 'claim_rejected': return 'border-danger';
      case 'new_message': return 'border-primary';
      case 'system': return 'border-primary';
      default: return 'border-border-default';
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markAsRead(notif._id);
    }
    
    // Navigate based on type
    if (notif.type === 'match' && notif.relatedItemId) {
      navigate(`/item/${notif.relatedItemId}`);
    } else if (notif.type === 'new_message' && notif.relatedClaimId) {
      navigate(`/chat/finder/${notif.relatedClaimId}`);
    } else if (notif.type.startsWith('claim') && notif.relatedClaimId) {
      navigate('/chats');
    }
    onClose();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-50 lg:hidden backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div ref={popoverRef} className="fixed top-16 right-0 lg:right-8 w-full h-[calc(100vh-4rem)] lg:h-auto lg:w-[450px] lg:max-h-[80vh] bg-surface dark:bg-surface z-50 shadow-2xl dark:shadow-lg lg:rounded-3xl border border-border-default transition-colors duration-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        
        <div className="p-6 pb-4 border-b border-border-default bg-surface-container-lowest dark:bg-surface-container transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Notifications</h2>
              <p className="text-sm text-text-secondary mt-1">Keep track of matches, claims, and tips.</p>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 bg-surface-container-low rounded-full text-text-secondary hover:text-text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="flex bg-surface-container-low dark:bg-surface-container-high p-1 rounded-2xl w-fit">
            {['All', 'Unread', 'Important'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  filter === f 
                    ? 'bg-surface-container-lowest dark:bg-surface-container shadow-sm text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low dark:bg-surface">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-secondary">
              <Bell className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-bold">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div 
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative overflow-hidden bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-5 shadow-sm dark:shadow-md border-l-4 ${getBorderColor(notif.type)} hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer ${!notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
              >
                {!notif.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
                )}
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notif.type)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start pr-4">
                      <h3 className="font-bold text-sm text-text-primary flex flex-wrap items-center gap-2">
                        {notif.title}
                        {notif.type === 'match' && <span className="px-2 py-0.5 bg-info-ai/10 text-info-ai text-[10px] font-bold uppercase rounded-md">AI Matching</span>}
                      </h3>
                      <span className="text-xs text-text-secondary whitespace-nowrap ml-2">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    <div className="mt-3 flex gap-2">
                      {notif.type === 'match' && (
                        <button className="px-4 py-2 bg-info-ai text-white rounded-lg text-xs font-bold hover:bg-info-ai/90 active:scale-95 transition-all">
                          View Match
                        </button>
                      )}
                      {notif.type === 'claim_approved' && (
                        <button className="px-4 py-2 bg-success text-white rounded-lg text-xs font-bold hover:bg-success/90 active:scale-95 transition-all flex items-center gap-1.5">
                          <QrCode className="w-4 h-4" />
                          View Claim
                        </button>
                      )}
                      {notif.type === 'new_message' && (
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 bg-surface-container-lowest dark:bg-surface-container border-t border-border-default text-center transition-colors duration-300">
          <button 
            onClick={() => markAllAsRead()}
            className="text-sm font-bold text-primary dark:text-primary hover:underline disabled:opacity-50"
            disabled={filteredNotifications.filter(n => !n.read).length === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
};
