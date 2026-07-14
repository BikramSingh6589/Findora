import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, UploadCloud, ArrowLeft, ShieldAlert } from 'lucide-react';

export const ConflictClaim = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [answers, setAnswers] = useState({
    serialNumber: '',
    specialMarks: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/found-items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setItem(response.data.item);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        alert('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };
    if (itemId) fetchItem();
  }, [itemId]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!proofFile) {
      setErrorMsg('Please upload proof of ownership');
      return;
    }
    if (!answers.serialNumber && !answers.specialMarks) {
      setErrorMsg('Please provide identifying details');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('foundItemId', itemId || '');
      formData.append('answers', JSON.stringify(answers));
      formData.append('proof', proofFile);

      const res = await axios.post(`http://localhost:5000/api/claims/${itemId}/conflict`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Failed to submit dispute');
      alert(error.response?.data?.error || 'Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-pulse">Loading...</div></div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-danger">Item not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Warning Banner */}
      <div className="w-full bg-danger/10 backdrop-blur-md border-b border-danger/20 py-3 px-4 md:px-8 flex items-center justify-center gap-3 sticky top-0 z-50">
        <ShieldAlert className="text-danger w-5 h-5 animate-pulse" />
        <p className="text-xs md:text-sm font-bold text-danger tracking-widest text-center">
          ATTENTION: THIS ITEM IS ALREADY CLAIMED. STRONG PROOF IS MANDATORY TO DISPUTE.
        </p>
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex-1">
        {/* Header Section */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dispute Claim
            </h1>
            <p className="text-text-secondary mt-2 text-lg">
              Case ID: <span className="text-primary font-mono">{itemId?.substring(0, 8).toUpperCase()}</span>
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-bold tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            CANCEL &amp; EXIT
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Item Summary Card */}
          <section className="col-span-1 md:col-span-5 bg-surface-container/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
            <div className="relative rounded-2xl overflow-hidden h-64 border border-white/10 bg-black/50 flex items-center justify-center">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-white/20" />
              )}
              <div className="absolute top-4 right-4">
                <span className="bg-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-lg backdrop-blur-md">
                  FOUND ITEM
                </span>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{item.itemName}</h2>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-auto">
              <div>
                <p className="text-text-tertiary text-xs font-bold tracking-wider uppercase mb-1">Date Reported</p>
                <p className="text-white font-medium">{new Date(item.dateFound).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-text-tertiary text-xs font-bold tracking-wider uppercase mb-1">Location</p>
                <p className="text-white font-medium">{item.locationFound}</p>
              </div>
            </div>
          </section>

          {/* Dispute Form */}
          <form onSubmit={handleSubmit} className="col-span-1 md:col-span-7 bg-surface-container/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 flex flex-col gap-8 shadow-2xl">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-primary">Verify Ownership</h3>
              
              {errorMsg && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-danger font-medium text-sm">{errorMsg}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-tertiary tracking-widest uppercase">
                  Serial Number / MAC Address
                </label>
                <input 
                  type="text"
                  value={answers.serialNumber}
                  onChange={(e) => setAnswers({...answers, serialNumber: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                  placeholder="e.g. X1234 or AA:BB:CC:DD"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-tertiary tracking-widest uppercase">
                  Distinguishing Marks / Details
                </label>
                <textarea 
                  value={answers.specialMarks}
                  onChange={(e) => setAnswers({...answers, specialMarks: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none min-h-[120px] resize-none"
                  placeholder="Describe scratches, specific stickers, or contents..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-tertiary tracking-widest uppercase">
                  Upload Proof (Mandatory)
                </label>
                <label className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${proofFile ? 'border-success/50 bg-success/5' : 'border-primary/30 bg-primary/5 hover:bg-primary/10'}`}>
                  {proofFile && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-success/30 shadow-md mb-4 bg-black/20">
                      <img 
                        src={URL.createObjectURL(proofFile)} 
                        alt="Proof Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  {!proofFile && (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-primary/20 text-primary">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                  )}
                  <p className={`text-lg font-bold mb-1 ${proofFile ? 'text-success' : 'text-white'}`}>
                    {proofFile ? proofFile.name : 'Drag & Drop or Click'}
                  </p>
                  <p className="text-text-secondary text-sm text-center">
                    {proofFile ? 'File selected. Ready to submit.' : 'Receipts, original box photos, or past photos with the item.'}
                  </p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProofFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 mt-auto">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl primary-gradient text-white font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? 'Submitting Dispute...' : 'Submit Dispute'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => navigate('/community')} />
          <div className="relative bg-surface-container-low border border-success/30 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Conflict Successfully Submitted!</h2>
            <p className="text-text-secondary mb-8">
              Your dispute has been securely logged. An Admin will review the evidence from both parties and make a final decision. You will be notified of the outcome.
            </p>
            <button 
              onClick={() => navigate('/community')}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Back to Community Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
