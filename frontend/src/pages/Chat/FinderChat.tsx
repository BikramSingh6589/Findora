import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, MoreVertical, Shield, Verified, 
  Send, CheckCircle2, Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const FinderChat: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { user } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Poll messages every 5 seconds for simulation
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/chat/${itemId}/messages`);
        if (res.data && res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [itemId]);

  // Scroll to bottom on load or new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/api/chat/${itemId}/messages`, {
        content: inputText,
        type: 'text'
      });
      if (res.data && res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        setInputText('');
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const currentUserId = user?._id || (user as any)?.id;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] -mt-6 -mx-6 md:m-0 bg-surface">
      {/* Header */}
      <header className="bg-surface-container-lowest dark:bg-surface-container/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-primary-fixed ring-2 ring-white bg-primary/10 flex items-center justify-center font-bold text-primary">
                Chat
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-text-primary text-sm md:text-base">Campus Messenger</h2>
              <span className="text-xs text-text-secondary">Discussion Room</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => navigate(`/handover/qr/${itemId}`)} 
            className="hidden md:flex items-center gap-1.5 bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:scale-[1.03] transition-all shadow-sm"
          >
            <Verified className="w-4 h-4" /> Resolve Handover
          </button>

          {/* Mobile Actions */}
          <div className="flex gap-2 md:hidden">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <MoreVertical className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-surface relative"
      >
        {/* Match Info Bar */}
        <div className="flex justify-center mb-6">
          <div className="bg-info-ai/10 border border-info-ai/30 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Shield className="text-info-ai w-4 h-4" />
            <span className="text-xs font-bold text-info-ai uppercase tracking-wider">Secure Handover Chat</span>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-text-secondary text-xs">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-text-secondary mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-text-secondary">Start the conversation!</p>
            <p className="text-xs text-text-secondary mt-1">Coordinate a safe campus meetup location to finalize the return.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = msg.sender?._id || msg.sender?.id;
            const isMe = senderId === currentUserId;
            
            if (isMe) {
              return (
                <div key={msg._id || index} className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-2xl ml-auto">
                  <div className="bg-primary text-white p-3 rounded-2xl rounded-br-none shadow-md text-sm">
                    <p>{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] text-text-secondary">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              );
            } else {
              const profilePic = msg.sender?.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
              const senderName = msg.sender?.name || 'Helper';
              
              return (
                <div key={msg._id || index} className="flex gap-3 max-w-[85%] md:max-w-2xl">
                  <img 
                    src={profilePic} 
                    alt={senderName} 
                    className="w-8 h-8 rounded-full self-end mb-1 object-cover bg-surface-container-low"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="bg-surface-container-lowest dark:bg-surface-container p-3 rounded-2xl rounded-bl-none shadow-sm border border-border-default text-sm text-text-primary">
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-text-secondary px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>

      {/* Mobile Confirm Button (Fixed above input) */}
      <div className="md:hidden absolute bottom-[72px] left-0 w-full px-4 z-30">
        <button 
          onClick={() => navigate(`/handover/qr/${itemId}`)}
          className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <Verified className="w-5 h-5" />
          Resolve Handover
        </button>
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSendMessage} className="bg-surface-container-lowest dark:bg-surface-container p-3 md:p-4 border-t border-border-default z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container p-1 md:p-1.5 rounded-full border border-border-default focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 outline-none" 
            placeholder="Send a message..." 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button type="submit" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:brightness-110 active:scale-90 transition-transform flex-shrink-0">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
export default FinderChat;
