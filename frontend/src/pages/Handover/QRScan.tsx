import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Laptop, Camera, QrCode, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const QRScan: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Align QR code within the frame');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/found-items/${itemId}`);
        if (res.data && res.data.item) {
          setItem(res.data.item);
        }
      } catch (err) {
        console.error('Failed to load item details', err);
      }
    };
    fetchItemDetails();
  }, [itemId]);

  const handleSimulateScan = async () => {
    try {
      setError(null);
      setStatusText('Retrieving claim token...');
      
      // 1. Fetch QR token
      const qrRes = await axios.get(`${API_BASE}/api/handover/${itemId}/qr`);
      if (!qrRes.data || !qrRes.data.qrToken) {
        throw new Error('No active approved claim QR token found for this item.');
      }
      
      const { qrToken } = qrRes.data;
      setStatusText('Simulating scanner handshake...');
      
      // 2. Scan verification
      await axios.post(`${API_BASE}/api/handover/${itemId}/scan`, { qrToken });
      setStatusText('Confirming secure handover...');
      
      // 3. Confirm return
      const confirmRes = await axios.post(`${API_BASE}/api/handover/${itemId}/confirm`, { qrToken });
      
      if (confirmRes.data && confirmRes.data.success) {
        setStatusText('Item successfully returned!');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to complete handover. Ensure you have logged in as Admin to authorize scans.');
      setStatusText('Verification failed');
    }
  };

  const itemName = item?.itemName || 'MacBook Pro';
  const itemLocation = item?.locationFound || 'Campus Library';

  return (
    <div className="flex flex-col min-h-screen bg-surface -mt-6 -mx-6 md:m-0">
      {/* Top Navigation */}
      <header className="bg-surface-container-lowest dark:bg-surface-container/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg md:text-2xl text-primary">Confirm Recovery</h1>
            <p className="text-text-secondary text-xs">Case #{itemId?.substring(0, 8) || 'LF-89021'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex bg-success/10 text-success px-4 py-1.5 rounded-full text-xs font-bold items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Scan to Finalize
          </span>
        </div>
      </header>

      {/* Content Canvas */}
      <section className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start md:justify-center max-w-5xl mx-auto w-full pb-24 md:pb-8">
        
        {/* Summary Header Card */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest dark:bg-surface-container p-4 md:p-6 rounded-2xl shadow-sm border-l-4 border-primary flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <Laptop className="text-primary w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-text-primary">{itemName}</h2>
              <p className="text-text-secondary text-xs md:text-sm">Located at {itemLocation}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-surface-container p-4 md:p-6 rounded-2xl shadow-sm border-l-4 border-[#6b38d4] flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#6b38d4]/20 flex items-center justify-center bg-primary/10 text-primary font-bold">
              User
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-text-primary">Verified Claimant</h2>
              <p className="text-text-secondary text-xs md:text-sm">Pending secure handover scan</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold text-center border border-danger/20">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="w-full max-w-2xl bg-success/10 border border-success/30 rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <CheckCircle className="w-20 h-20 text-success animate-bounce" />
            <h3 className="text-2xl font-black text-success">Recovery Finalized!</h3>
            <p className="text-text-secondary">The item has been successfully resolved and XP points have been awarded. Redirecting back to dashboard...</p>
          </div>
        ) : (
          /* Scanner Interface */
          <div className="w-full max-w-2xl bg-text-primary rounded-[32px] overflow-hidden relative shadow-xl border-4 md:border-8 border-white/10 aspect-[3/4] md:aspect-video flex items-center justify-center">
            
            {/* Viewfinder background */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
                alt="Camera Viewfinder" 
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              />
            </div>

            {/* QR Target Frame */}
            <div className="relative z-20 w-56 h-56 md:w-80 md:h-80 border-2 border-white/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] border-success">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 md:w-12 h-8 md:h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-8 md:w-12 h-8 md:h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-8 md:w-12 h-8 md:h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-8 md:w-12 h-8 md:h-12 border-b-4 border-r-4 border-primary rounded-br-3xl"></div>
              
              <QrCode className="text-white/30 w-24 h-24 md:w-32 md:h-32" />
              
              {/* Scanning Laser Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-success rounded-full opacity-70 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            </div>

            {/* Scanning Overlay UI */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-surface-container-lowest dark:bg-surface-container/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2 md:gap-3 shadow-lg border border-white/30 w-max">
              <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-white animate-pulse">
                <Camera className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <p className="text-white text-xs md:text-sm font-semibold">{statusText}</p>
            </div>
          </div>
        )}

        {/* Instructions & Help */}
        {!isSuccess && (
          <div className="mt-8 text-center max-w-lg">
            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2">Scan to confirm</h3>
            <p className="text-text-secondary text-sm md:text-base mb-6">
              Verify the QR code shown by the user. Note: Admin privileges are required to perform and verify return handovers.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={handleSimulateScan}
                className="bg-primary hover:scale-[1.03] transition-all text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <QrCode className="w-5 h-5" />
                Simulate Scan & Finalize Return
              </button>
            </div>
          </div>
        )}

      </section>

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
export default QRScan;
