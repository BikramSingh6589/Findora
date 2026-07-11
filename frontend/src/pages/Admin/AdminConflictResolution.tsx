import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, AlertTriangle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export const AdminConflictResolution = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Modal States
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [successModal, setSuccessModal] = useState<{isOpen: boolean, code?: string}>({ isOpen: false });

  const fetchConflicts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/claims/conflict/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setClaims(res.data.claims || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load conflicts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) fetchConflicts();
  }, [itemId]);

  const handleInitiateHandover = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Initiate Handover',
      message: 'Are you sure you want to initiate an in-person handover? This will notify all claimants to come to the admin office.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setResolving(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`http://localhost:5000/api/claims/conflict/${itemId}/initiate-handover`, 
            {},
            { headers: { Authorization: `Bearer ${token}` }}
          );
          if (res.data.success) {
            const conflictCode = res.data.data?.conflictCode || res.data.conflictCode;
            setSuccessModal({ isOpen: true, code: conflictCode });
            fetchConflicts();
          }
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to initiate handover');
        } finally {
          setResolving(false);
        }
      }
    });
  };

  const handleResolve = async (winningClaimId: string | null) => {
    setConfirmModal({
      isOpen: true,
      title: winningClaimId ? 'Finalize Handover' : 'Reject Claims',
      message: winningClaimId 
        ? 'Are you sure you want to finalize this handover? This action cannot be undone.' 
        : 'Are you sure you want to reject all claims? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setResolving(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`http://localhost:5000/api/claims/conflict/${itemId}/resolve`, {
            winningClaimId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.success) {
            navigate('/admin/claims');
          }
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to resolve conflict');
          setResolving(false);
        }
      }
    });
  };

  if (loading) return <div className="p-8 text-white">Loading conflicts...</div>;
  if (error) return <div className="p-8 text-danger">{error}</div>;
  if (claims.length === 0) return <div className="p-8 text-white">No active conflicts found for this item.</div>;

  const itemInfo = claims[0]?.foundItemId || {};

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-warning w-8 h-8" />
            Conflict Resolution
          </h1>
          <p className="text-text-secondary mt-1">Item: {itemInfo.itemName} (ID: {itemInfo._id})</p>
        </div>
        <button 
          onClick={() => navigate('/admin/claims')}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Claims
        </button>
      </header>

      <div className="bg-surface-container/50 border border-warning/20 rounded-2xl p-4 mb-8 flex items-start gap-4">
        <AlertTriangle className="text-warning mt-1" />
        <div>
          <h3 className="text-warning font-bold mb-1">Mediation Required</h3>
          <p className="text-text-secondary text-sm">
            Multiple users have claimed ownership of this item. Review the evidence provided by each claimant below and determine the rightful owner, or reject all claims if proof is insufficient.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {claims.map((claim, idx) => (
          <div key={claim._id} className="bg-surface-container rounded-2xl border border-white/10 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
              <div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-1 block">
                  Claimant {idx + 1}
                </span>
                <h2 className="text-xl font-bold text-white">{claim.claimant?.name || 'Unknown User'}</h2>
                <p className="text-text-secondary text-sm">{claim.claimant?.email}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-text-tertiary tracking-widest uppercase mb-1 block">
                  Match Confidence
                </span>
                <span className="text-2xl font-bold text-success">{claim.confidence}%</span>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Submitted Answers</h4>
                <div className="bg-black/20 rounded-xl p-4 space-y-3">
                  {claim.answers ? (
                    Object.entries(claim.answers).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-text-tertiary uppercase">{key}</span>
                        <p className="text-white text-sm mt-0.5">{String(value) || 'Not provided'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">No answers provided.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Proof Uploads</h4>
                {claim.proofUrls && claim.proofUrls.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {claim.proofUrls.map((url: string, i: number) => (
                      <a href={url} target="_blank" rel="noreferrer" key={i}>
                        <img src={url} alt="Proof" className="w-32 h-32 object-cover rounded-xl border border-white/10 hover:border-primary transition-colors cursor-pointer" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm italic">No proof uploaded.</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
              {claims[0]?.mediationStatus === 'pending_handover' ? (
                <button
                  onClick={() => handleResolve(claim._id)}
                  disabled={resolving}
                  className="w-full py-3 rounded-xl bg-success/20 text-success border border-success/30 hover:bg-success hover:text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Finalize Handover to {claim.claimant?.name?.split(' ')[0] || 'User'}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center gap-6">
        {claims[0]?.mediationStatus !== 'pending_handover' && (
          <button
            onClick={handleInitiateHandover}
            disabled={resolving}
            className="px-8 py-3 rounded-xl bg-primary text-white border border-primary hover:bg-primary/90 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Shield className="w-5 h-5" />
            Initiate In-Person Handover
          </button>
        )}
        
        <button
          onClick={() => {
            setConfirmModal({
              isOpen: true,
              title: 'Deny Conflict',
              message: 'Are you sure you want to deny this conflict? The newest claim will be rejected and the original claim will be restored to approved status.',
              onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setResolving(true);
                try {
                  const token = localStorage.getItem('token');
                  await axios.post(`http://localhost:5000/api/claims/conflict/${itemId}/resolve`, {
                    denyConflict: true
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  alert('Conflict denied successfully!');
                  navigate('/admin/conflicts');
                } catch (err: any) {
                  setError(err.response?.data?.error || 'Failed to deny conflict');
                } finally {
                  setResolving(false);
                }
              }
            });
          }}
          disabled={resolving}
          className="px-8 py-3 rounded-xl bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <XCircle className="w-5 h-5" />
          Deny Conflict Claim
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
            <p className="text-text-secondary mb-8">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 bg-surface-container-low text-white rounded-xl hover:bg-surface-container-lowest font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-bold transition-colors shadow-lg shadow-primary/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal (CFL Code) */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl border border-success/30 shadow-2xl shadow-success/10 p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Handover Initiated!</h3>
            <p className="text-text-secondary mb-6">Users have been notified to come to the admin office.</p>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 w-full mb-8">
              <span className="text-xs font-bold tracking-widest text-text-tertiary uppercase block mb-1">Conflict Code</span>
              <span className="text-3xl font-black text-primary tracking-wider">{successModal.code}</span>
            </div>

            <button
              onClick={() => setSuccessModal({ isOpen: false })}
              className="w-full py-4 bg-success text-white rounded-xl hover:bg-success/90 font-bold transition-colors shadow-lg shadow-success/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
