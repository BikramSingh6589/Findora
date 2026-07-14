import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  ArrowLeft, Shield, Send, CheckCircle2, Package, 
  AlertTriangle, Check, QrCode
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const FinderChat: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams(); // Representing claimId in this route context
  const { user, token } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const [claim, setClaim] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Dialogs/Modals State
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [qrExpiresHours, setQrExpiresHours] = useState(24);
  const [resolving, setResolving] = useState(false);

  // Chat access state
  const [chatFrozen, setChatFrozen] = useState<{ frozen: boolean; reason: string }>({ frozen: false, reason: '' });

  // Handover state
  const [handoverChoice, setHandoverChoice] = useState<'me' | 'other'>('me');
  const [handoverLocation, setHandoverLocation] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const currentUserId = user?._id || (user as any)?.id;

  // 1. Fetch Claim Details
  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/claims/${itemId}`);
        if (res.data && res.data.success) {
          const fetchedClaim = res.data.claim;
          setClaim(fetchedClaim);
          // Auto-show success popup if admin has already approved this claim
          const alreadyResolved =
            fetchedClaim.status === 'resolved' ||
            fetchedClaim.status === 'approved' ||
            fetchedClaim.mediationStatus === 'approved';
          if (alreadyResolved) {
            setShowSuccessPopup(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch claim details', err);
      }
    };
    fetchClaimDetails();
  }, [itemId]);

  // 2. Initialize Socket.IO Client
  useEffect(() => {
    if (!token || !itemId || !currentUserId) return;

    // Connect to real-time server
    const socket = io(API_BASE, {
      auth: { token }
    });

    socketRef.current = socket;

    // Join room
    socket.emit('join_room', { claimId: itemId });

    // Listen for history
    socket.on('message_history', (history: any[]) => {
      setMessages(history);
      setLoading(false);
    });

    // Listen for incoming messages
    socket.on('receive_message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
      // Reset typing indicator when message received
      const msgSenderId = msg.sender?._id || msg.sender?.id || msg.sender;
      if (msgSenderId !== currentUserId) {
        setPartnerTyping(false);
      }
    });

    // Listen for typing events
    socket.on('user_typing', ({ userId: typingUserId, isTyping: typingState }) => {
      if (typingUserId !== currentUserId) {
        setPartnerTyping(typingState);
      }
    });
    // Listen for real-time resolution
    socket.on('claim_resolved', (data: any) => {
      setClaim((prev: any) => prev ? { 
        ...prev, 
        status: data.status || 'resolved', 
        qrCodeUrl: data.qrCodeUrl, 
        qrExpiresAt: data.qrExpiresAt,
        mediationStatus: data.mediationStatus || prev.mediationStatus
      } : prev);
      setShowSuccessPopup(true);
    });
    // Listen for real-time approval
    socket.on('claim_approved', (data: any) => {
      setClaim((prev: any) => prev ? { 
        ...prev, 
        status: 'approved',
        mediationStatus: 'approved',
        remarks: data.remarks
      } : prev);
      setShowSuccessPopup(true);
    });
    // Listen for real-time rejection
    socket.on('claim_rejected', (data: any) => {
      setClaim((prev: any) => prev ? { 
        ...prev, 
        status: 'rejected',
        reason: data.reason
      } : prev);
      alert(`This claim was rejected by the admin. Reason: ${data.reason || 'Insufficient proof'}`);
    });
    // Listen for mediation updates
    socket.on('mediation_status', (data: any) => {
      setClaim((prev: any) => prev ? { 
        ...prev, 
        mediationRequested: data.mediationRequested, 
        mediationStatus: data.mediationStatus 
      } : prev);
    });
    
    // Listen for handover confirmed
    socket.on('handover_confirmed', () => {
      setClaim((prev: any) => prev ? { 
        ...prev, 
        status: 'resolved',
        qrToken: ''
      } : prev);
      setShowSuccessPopup(true);
    });

    socket.on('finder_handover_submitted', (data: any) => {
      setClaim((prev: any) => prev ? {
        ...prev,
        finderHandoverChoice: data.choice,
        finderHandoverLocation: data.location
      } : prev);
    });

    socket.on('location_notified', () => {
      setClaim((prev: any) => prev ? {
        ...prev,
        locationNotifiedToClaimant: true
      } : prev);
    });

    // Conflict claim blocked — no socket room for conflict parties
    socket.on('conflict_chat_blocked', () => {
      setLoading(false);
    });

    // Resolved claim — chat is frozen, history is still visible
    socket.on('chat_frozen', (data: any) => {
      setChatFrozen({ frozen: true, reason: data.message });
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [itemId, token, currentUserId]);

  // 3. Scroll to Bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, partnerTyping]);

  // 4. Handle Typing Notifications
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!socketRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', { claimId: itemId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit('typing', { claimId: itemId, isTyping: false });
    }, 2000);
  };

  // 5. Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      claimId: itemId,
      content: inputText
    });

    setInputText('');
    
    // Clear typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    socketRef.current.emit('typing', { claimId: itemId, isTyping: false });
  };
  // 6. Action: Confirm Ownership & Resolve Handover
  const handleConfirmResolve = async () => {
    setResolving(true);
    try {
      await axios.post(`${API_BASE}/api/claims/${itemId}/resolve`, {
        qrExpiresHours
      });
      setShowResolveModal(false);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error('Failed to resolve claim', err);
    } finally {
      setResolving(false);
    }
  };
  // 7. Action: Request Admin Mediation
  const handleRequestMediation = async () => {
    try {
      await axios.post(`${API_BASE}/api/claims/${itemId}/mediate`);
    } catch (err) {
      console.error('Failed to request mediation', err);
    }
  };

  // 8. Action: Submit Handover Choice (Admin Approved)
  const handleHandoverSubmit = async () => {
    setSubmittingHandover(true);
    try {
      const res = await axios.post(`${API_BASE}/api/claims/${itemId}/finder-handover`, {
        choice: handoverChoice,
        location: handoverChoice === 'other' ? handoverLocation : undefined
      });
      if (res.data && res.data.success) {
        setClaim(res.data.claim);
      }
    } catch (err) {
      console.error('Failed to submit handover choice', err);
    } finally {
      setSubmittingHandover(false);
    }
  };

  if (!claim) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-secondary text-sm">Loading chat room details...</p>
      </div>
    );
  }

  // CONFLICT CLAIM — show appropriate screen based on actual claim status from REST API
  if (claim.isConflictClaim) {
    // Admin resolved in FAVOR of this conflict claimant
    if (claim.status === 'resolved') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6 border border-success/20">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Conflict Resolved — You Won!</h2>
          <p className="text-text-secondary max-w-md mb-2">
            The admin has reviewed all evidence and resolved the conflict in your favor. The item belongs to you.
          </p>
          <div className="mt-6 p-4 bg-surface-container rounded-2xl border border-success/30 max-w-sm w-full">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest mb-1">Status</p>
            <p className="text-success font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Admin Resolved — In Your Favor
            </p>
          </div>
          <button onClick={() => navigate('/chats')} className="mt-6 px-6 py-3 bg-surface-container border border-border-default rounded-xl text-sm font-bold text-text-primary hover:border-primary/50 transition-colors">
            Back to Messages
          </button>
        </div>
      );
    }

    // Admin resolved AGAINST this conflict claimant (or denied the conflict)
    if (claim.status === 'rejected') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center mb-6 border border-danger/20">
            <AlertTriangle className="w-12 h-12 text-danger" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Conflict Resolved — Claim Denied</h2>
          <p className="text-text-secondary max-w-md mb-2">
            The admin has reviewed all evidence and resolved the conflict against your claim. The item was awarded to the other party.
          </p>
          <div className="mt-6 p-4 bg-surface-container rounded-2xl border border-danger/30 max-w-sm w-full">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest mb-1">Status</p>
            <p className="text-danger font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Conflict Claim Rejected
            </p>
            {claim.remarks && <p className="text-xs text-text-secondary mt-2">{claim.remarks}</p>}
          </div>
          <button onClick={() => navigate('/chats')} className="mt-6 px-6 py-3 bg-surface-container border border-border-default rounded-xl text-sm font-bold text-text-primary hover:border-primary/50 transition-colors">
            Back to Messages
          </button>
        </div>
      );
    }

    // Still pending — admin has not made a decision yet
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mb-6 border border-warning/20">
          <Shield className="w-12 h-12 text-warning" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Conflict Under Admin Review</h2>
        <p className="text-text-secondary max-w-md mb-2">
          Your conflict claim has been submitted. The admin is reviewing evidence from both parties and will make a final decision.
        </p>
        <p className="text-text-secondary/60 text-sm max-w-md">
          You will receive an in-app notification with your <strong className="text-primary">CFL code</strong> once the admin initiates the in-person handover.
        </p>
        <div className="mt-8 p-4 bg-surface-container rounded-2xl border border-border-default max-w-sm w-full">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest mb-1">Status</p>
          <p className="text-warning font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Pending Admin Decision
          </p>
        </div>
        <button onClick={() => navigate('/chats')} className="mt-6 px-6 py-3 bg-surface-container border border-border-default rounded-xl text-sm font-bold text-text-primary hover:border-primary/50 transition-colors">
          Back to Messages
        </button>
      </div>
    );
  }



  const foundItem = claim.foundItemId || {};
  const finder = foundItem.finder || {};
  const claimant = claim.claimant || {};

  // Check roles
  const finderId = finder._id || finder;
  const claimantId = claimant._id || claimant;
  const isFinder = finderId === currentUserId;
  const isClaimant = claimantId === currentUserId;

  const partner = isClaimant ? finder : claimant;
  const partnerName = partner?.name || 'Helper';
  const partnerPic = partner?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';  
  
  const isAdminApproved = claim.status === 'approved' || claim.mediationStatus === 'approved';
  const isPeerResolved = claim.status === 'resolved' && !isAdminApproved;
  
  const isResolved =
    claim.status === 'resolved' || isAdminApproved;

  // Only show pending mediation banner if NOT yet resolved by admin
  const isPendingMediation =
    claim.mediationStatus === 'pending' && !isResolved;
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] -mt-6 -mx-6 md:m-0 bg-surface">
      {/* Header */}
      <header className="bg-surface-container-lowest dark:bg-surface-container/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={partnerPic} 
                alt={partnerName} 
                className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover bg-surface-container-low"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-text-primary text-sm md:text-base">{partnerName}</h2>
              <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                {isFinder ? 'Claimant' : 'Item Finder'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Resolve Handover Button (Finder Only) */}
          {isFinder && !isResolved && (
            <button 
              onClick={() => setShowResolveModal(true)} 
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full font-bold text-xs hover:scale-[1.03] transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm & Resolve
            </button>
          )}

          {/* Mediation Request button */}
          {!isResolved && !isPendingMediation && (
            <button 
              onClick={handleRequestMediation}
              className="flex items-center gap-1 bg-surface-container border border-border-default text-text-secondary px-4 py-2 rounded-full font-bold text-xs hover:bg-surface-container-high transition-all"
            >
              <Shield className="w-4 h-4" /> Mediate
            </button>
          )}
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Chat Window */}
        <div className="flex-1 flex flex-col justify-between bg-surface min-w-0">
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-surface relative"
          >
            {/* Status Information Overlays */}
            {isPeerResolved ? (
              <div className="bg-success/10 border border-success/30 p-4 rounded-2xl flex items-center gap-3 max-w-xl mx-auto mb-6">
                <Check className="text-success w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-success text-sm">Claim Handover Resolved</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Ownership has been confirmed! {isClaimant ? 'Show the QR code below to the finder to verify the handover.' : 'Please scan the claimant\'s QR code to confirm transfer.'}
                  </p>
                </div>
              </div>
            ) : isAdminApproved ? (
              <div className="bg-info-ai/10 border border-info-ai/30 p-4 rounded-2xl flex items-center gap-3 max-w-xl mx-auto mb-6">
                <Shield className="text-info-ai w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-info-ai text-sm">Mediated to Admin</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    This issue has been mediated to the admin. The admin will resolve this issue. Please follow admin instructions.
                  </p>
                </div>
              </div>
            ) : isPendingMediation ? (
              <div className="bg-warning/10 border border-warning/30 p-4 rounded-2xl flex items-center gap-3 max-w-xl mx-auto mb-6">
                <AlertTriangle className="text-warning w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-warning text-sm">Mediation Requested</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    An admin has been requested to review this claim. Conversations are frozen pending decision.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="bg-info-ai/10 border border-info-ai/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <Shield className="text-info-ai w-4 h-4" />
                  <span className="text-xs font-bold text-info-ai uppercase tracking-wider">AI Protected Handover Chat</span>
                </div>
              </div>
            )}

            {/* AI Insights Bar */}
            {claim.confidence && !isResolved && (
              <div className="flex justify-center mb-6">
                <div className="max-w-md bg-info-ai/5 border border-info-ai/20 p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-[10px] text-info-ai font-bold uppercase tracking-wider mb-1">AI Match Score</p>
                  <p className="text-xs text-text-secondary">
                    Match Confidence is <strong>{claim.confidence}%</strong>. Proceed with verification questions to ensure correct ownership.
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-center text-text-secondary text-xs">Loading messages...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-text-secondary mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-text-secondary">No messages yet</p>
                <p className="text-xs text-text-secondary mt-1">Coordinate a safe campus meetup location to resolve the return.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
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
                  const senderPic = msg.sender?.profilePic || partnerPic;
                  const senderName = msg.sender?.name || partnerName;
                  
                  return (
                    <div key={msg._id || index} className="flex gap-3 max-w-[85%] md:max-w-2xl">
                      <img 
                        src={senderPic} 
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

            {/* Partner Typing Indicator */}
            {partnerTyping && (
              <div className="flex gap-3 items-center">
                <img 
                  src={partnerPic} 
                  alt={partnerName} 
                  className="w-8 h-8 rounded-full object-cover bg-surface-container-low"
                />
                <div className="bg-surface-container p-3 rounded-2xl rounded-bl-none border border-border-default flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Claimant QR Display when resolved */}
          {isPeerResolved && isClaimant && claim.qrCodeUrl && (
            <div className="bg-surface-container-lowest dark:bg-surface-container p-6 border-t border-border-default flex flex-col items-center justify-center">
              <QrCode className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-bold text-text-primary text-sm">Secure Handover QR Code</h4>
              <p className="text-xs text-text-secondary text-center mb-4 max-w-sm">
                Show this QR Code to the Finder to complete the verification handover. Expires on {new Date(claim.qrExpiresAt).toLocaleString()}.
              </p>
              <div className="w-48 h-48 border border-border-default rounded-2xl overflow-hidden p-2 bg-white shadow-sm flex items-center justify-center">
                <img src={claim.qrCodeUrl} alt="Handover QR Code" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Message Input Area / Mobile QR Scan Area */}
          {!isResolved && !isPendingMediation && !chatFrozen.frozen ? (
            <form onSubmit={handleSendMessage} className="bg-surface-container-lowest dark:bg-surface-container p-3 md:p-4 border-t border-border-default z-30">
              <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container p-1 md:p-1.5 rounded-full border border-border-default focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-2 outline-none text-text-primary" 
                  placeholder="Send a message..." 
                  type="text" 
                  value={inputText}
                  onChange={handleInputChange}
                />
                <button type="submit" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:brightness-110 active:scale-90 transition-transform flex-shrink-0">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          ) : isPeerResolved && isFinder ? (
            <div className="lg:hidden bg-surface-container-lowest dark:bg-surface-container p-4 border-t border-border-default z-30">
              <button
                onClick={() => navigate(`/handover/scan/${claim._id}`)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <QrCode className="w-5 h-5" /> Scan Claimant QR
              </button>
            </div>
          ) : chatFrozen.frozen || isResolved || isPendingMediation ? (
            <div className="px-4 py-3 border-t border-border-default bg-surface-container-lowest z-30">
              <div className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-2xl border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <p className="text-sm text-text-secondary">Chat is closed — {chatFrozen.reason || 'claim resolved or mediated.'}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar Info Section (Hidden on Mobile) */}
        <aside className="hidden lg:flex flex-col w-80 bg-surface-container-lowest dark:bg-surface-container border-l border-border-default p-6 space-y-6">
          <div className="bg-card-bg p-5 rounded-2xl border border-border-default shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-xs text-info-ai uppercase tracking-wider mb-3">AI Matching Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Item Name</span>
                <span className="text-xs font-bold text-text-primary">{foundItem.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Category</span>
                <span className="text-xs font-bold text-text-primary">{foundItem.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Discovery</span>
                <span className="text-xs font-bold text-text-primary">{foundItem.locationFound || foundItem.lastSeen}</span>
              </div>
            </div>
          </div>

          {!isAdminApproved && (
            <div className="bg-card-bg p-5 rounded-2xl border border-border-default shadow-sm">
              <h3 className="font-bold text-xs text-text-primary mb-3">Handover Rules</h3>
              <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
                <li>Agree on a secure public location.</li>
                <li>Ask verification questions regarding unique marks.</li>
                <li>Scan/Verify the QR token to release the item state.</li>
              </ul>
            </div>
          )}

          {/* Admin Approved State Flow */}
          {isAdminApproved && (
            <div className="bg-surface-container-lowest border border-border-default rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-xs text-primary uppercase tracking-wider">Admin Handover</h3>
              
              {isFinder ? (
                <>
                  {claim.finderHandoverChoice === 'none' ? (
                    <div className="space-y-3">
                      <p className="text-xs text-text-secondary font-bold">Where is the product?</p>
                      <select 
                        value={handoverChoice}
                        onChange={(e: any) => setHandoverChoice(e.target.value)}
                        className="w-full bg-surface border border-border-default rounded-xl p-2.5 text-sm outline-none text-text-primary"
                      >
                        <option value="me">With Me</option>
                        <option value="other">Left at other location</option>
                      </select>
                      
                      {handoverChoice === 'other' && (
                        <input 
                          type="text"
                          placeholder="Enter location..."
                          value={handoverLocation}
                          onChange={(e) => setHandoverLocation(e.target.value)}
                          className="w-full bg-surface border border-border-default rounded-xl p-2.5 text-sm outline-none text-text-primary"
                        />
                      )}
                      
                      <button
                        onClick={handleHandoverSubmit}
                        disabled={submittingHandover || (handoverChoice === 'other' && !handoverLocation)}
                        className="w-full bg-primary text-white py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:brightness-110"
                      >
                        {submittingHandover ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  ) : claim.finderHandoverChoice === 'me' ? (
                    <div className="bg-success/10 border border-success/20 p-4 rounded-xl space-y-3">
                      <p className="text-xs text-success font-bold">Please come to the Lost and Found office location to submit this product.</p>
                      <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                        <span className="text-xl tracking-widest font-mono font-bold text-black">{claim.finderDropoffCode}</span>
                      </div>
                      <div className="bg-surface p-2 rounded-lg text-center border border-success/20">
                        <p className="text-[10px] text-text-secondary uppercase">Claim ID</p>
                        <p className="text-xs font-bold text-text-primary">{claim.claimId}</p>
                      </div>
                      <p className="text-[10px] text-text-secondary text-center">Show this code and Claim ID to the admin.</p>
                    </div>
                  ) : (
                    <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl">
                      <p className="text-xs text-warning font-bold">You left the item at: {claim.finderHandoverLocation}</p>
                      <p className="text-[10px] text-text-secondary mt-1">Ok waiting for the claimant to recieve the product.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {claim.finderHandoverChoice === 'other' ? (
                    claim.locationNotifiedToClaimant ? (
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-bold text-primary">Your product is in the location:</p>
                        <p className="text-sm text-text-primary font-bold bg-surface p-3 rounded-lg border border-border-default">{claim.finderHandoverLocation}</p>
                        <p className="text-xs text-text-secondary">Please check this location and confirm if you found your item.</p>
                        <div className="flex gap-3 mt-2">
                          <button 
                            onClick={async () => {
                              try {
                                await axios.post(`${API_BASE}/api/claims/${claim._id}/claimant-verify-location`, { found: true }, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                });
                              } catch (e) { console.error(e); }
                            }}
                            className="flex-1 py-2.5 bg-success text-white font-bold rounded-xl text-sm hover:bg-success/90 transition-colors shadow-sm"
                          >
                            Found
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                await axios.post(`${API_BASE}/api/claims/${claim._id}/claimant-verify-location`, { found: false }, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                });
                              } catch (e) { console.error(e); }
                            }}
                            className="flex-1 py-2.5 bg-danger text-white font-bold rounded-xl text-sm hover:bg-danger/90 transition-colors shadow-sm"
                          >
                            Not Found
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-container-low p-4 rounded-xl border border-border-default">
                        <p className="text-xs text-text-secondary font-bold text-center">Waiting for admin to provide collection instructions...</p>
                      </div>
                    )
                  ) : (
                    <>
                      <h4 className="font-bold text-sm text-text-primary">Collect from Admin office</h4>
                      <p className="text-xs text-text-secondary">Location: Main Campus, Room 101</p>
                      <div className="bg-surface p-3 rounded-xl border border-border-default">
                        <p className="text-[10px] text-text-secondary uppercase">Your Claim ID</p>
                        <p className="font-bold text-text-primary">{claim.claimId}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Peer-to-Peer Flow */}
          {isPeerResolved && (
            <>
              {isFinder ? (
                /* FINDER: button to set collection point */
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-xs text-primary uppercase tracking-wider">Collection Point</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Decide where and how the owner should collect their item from you.
                  </p>
                  <button
                    onClick={() => navigate(`/collect-item/${claim._id}`)}
                    className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                  >
                    📍 Set Collection Point
                  </button>
                </div>
              ) : (
                /* CLAIMANT: show who to collect from (defaults to finder) */
                <div className="bg-surface-container-low border border-border-default rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-xs text-text-primary uppercase tracking-wider">Collect From</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={finder?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={finder?.name || 'Finder'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <p className="font-bold text-sm text-text-primary">{finder?.name || 'Item Finder'}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">📍 Default collection contact</p>
                      {finder?.email && (
                        <p className="text-[11px] text-primary mt-0.5 truncate">{finder.email}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-text-secondary bg-warning/5 border border-warning/20 rounded-lg px-3 py-2 leading-relaxed">
                    The finder will confirm the collection point. Check back here for updates.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Scan QR button for finder */}
          {isPeerResolved && isFinder && (
            <button
              onClick={() => navigate(`/handover/scan/${claim._id}`)}
              className="w-full bg-surface-container border border-border-default text-text-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-95 transition-all"
            >
              <QrCode className="w-5 h-5" /> Scan Claimant QR
            </button>
          )}
        </aside>
      </div>

      {/* Resolve Handover Modal (Finder Only) */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-3xl max-w-sm w-full border border-border-default shadow-xl">
            <h3 className="font-bold text-text-primary text-lg mb-2">Confirm & Resolve Claim</h3>
            <p className="text-xs text-text-secondary mb-4">
              Setting ownership resolves this claim and generates a secure one-time QR Code for handover. Set QR expiration duration:
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="text-xs text-text-secondary font-semibold">QR Expiry Duration</label>
              <select 
                value={qrExpiresHours} 
                onChange={e => setQrExpiresHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border-default bg-surface text-text-primary text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours (Recommended)</option>
                <option value={36}>36 Hours</option>
                <option value={48}>48 Hours (Maximum)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowResolveModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-border-default font-bold text-text-secondary text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={resolving}
                onClick={handleConfirmResolve}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 transition-colors flex items-center justify-center gap-1.5"
              >
                {resolving ? 'Resolving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest dark:bg-surface-container p-6 md:p-8 rounded-3xl max-w-md w-full border border-border-default shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-text-primary text-xl md:text-2xl">
                {claim.status === 'resolved' 
                  ? 'Handover Complete! 🎊' 
                  : claim.mediationStatus === 'approved' 
                    ? '✅ Admin Approved!' 
                    : 'Ownership Confirmed! 🎉'}
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                {claim.status === 'resolved'
                  ? (claim.remarks 
                      ? `Thank you for participating in this process! The claim has been successfully resolved. Details: ${claim.remarks}`
                      : 'Thank you for being an amazing part of our community! The item has been successfully returned to its rightful owner. We appreciate your integrity and help.')
                  : claim.mediationStatus === 'approved'
                    ? isFinder
                      ? 'Admin has approved! Please come and deposit the item to the Lost and Found desk.'
                      : 'Admin has approved! Please come to the Lost and Found desk to collect your product.'
                    : (isFinder 
                        ? 'You have successfully confirmed ownership. Please navigate to the scanner tool to verify and finalize the return handover.'
                        : 'Great news! The finder has verified your answers and confirmed your ownership. Show your secure QR code to finalize the return.')}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Only show the action button if the handover is not fully complete */}
              {claim.status !== 'resolved' && claim.mediationStatus !== 'approved' && (
                isFinder ? (
                  <button 
                    onClick={() => {
                      setShowSuccessPopup(false);
                      navigate(`/handover/scan/${claim._id}`);
                    }}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
                  >
                    Open Scanner Tool
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setShowSuccessPopup(false);
                      if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                      }
                    }}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
                  >
                    View Handover QR Code
                  </button>
                )
              )}
              <button 
                onClick={() => setShowSuccessPopup(false)}
                className="w-full py-3 bg-transparent text-text-secondary hover:bg-surface-container rounded-xl font-bold text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinderChat;
