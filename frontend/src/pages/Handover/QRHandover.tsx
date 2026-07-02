import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Verified, Info, Printer, XCircle, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const QRHandover: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  
  const [item, setItem] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandoverDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch item details
        const itemRes = await axios.get(`${API_BASE}/api/found-items/${itemId}`);
        if (itemRes.data && itemRes.data.item) {
          setItem(itemRes.data.item);
        }

        // Fetch QR details
        const qrRes = await axios.get(`${API_BASE}/api/handover/${itemId}/qr`);
        if (qrRes.data && qrRes.data.success) {
          setQrData(qrRes.data);
        }
      } catch (err: any) {
        console.error('Failed to load handover details', err);
        setError(err.response?.data?.error || 'No approved claim found for this item. Handover QR cannot be generated.');
      } finally {
        setLoading(false);
      }
    };
    fetchHandoverDetails();
  }, [itemId]);

  const itemName = item?.itemName || 'Found Item';
  const itemLocation = item?.locationFound || 'Campus';
  const itemImg = item?.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="flex flex-col min-h-screen bg-surface -mt-6 -mx-6 md:m-0">
      {/* Top App Bar */}
      <header className="bg-surface-container-lowest dark:bg-surface-container/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="font-bold text-lg md:text-2xl text-primary">Resolve Handover</h1>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        {error ? (
          <div className="p-6 bg-danger/10 border border-danger/20 rounded-2xl text-center text-danger font-semibold max-w-xl mx-auto">
            {error}
          </div>
        ) : loading ? (
          <p className="text-center text-text-secondary">Loading handover QR details...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Item & Owner Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-6 shadow-sm border border-border-default space-y-6">
                
                <div className="relative group">
                  <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-inner bg-surface-container">
                    <img 
                      src={itemImg}
                      alt={itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-success text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Verified className="w-4 h-4" /> Approved Claim
                  </div>
                </div>

                <div>
                  <h2 className="font-bold text-xl mb-1 text-text-primary">{itemName}</h2>
                  <p className="text-text-secondary text-sm">Found at {itemLocation}</p>
                </div>

                <div className="pt-4 border-t border-border-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold">
                      Claim
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Verification Status</span>
                      <span className="font-bold text-sm text-text-primary">Approved & Pending Return</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-primary">Handover Tip</h4>
                  <p className="text-xs text-primary/80 leading-relaxed">Meet in a public, well-lit campus location. Show your QR code so staff or finder can verify and return the item.</p>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code & Actions */}
            <div className="lg:col-span-7">
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-3xl p-8 shadow-sm border border-border-default flex flex-col items-center text-center">
                
                <div className="mb-6 space-y-2">
                  <h3 className="text-2xl font-bold text-text-primary">Unique Handover QR</h3>
                  <p className="text-text-secondary text-sm max-w-sm mx-auto">Show this code to the staff to complete the handover securely.</p>
                </div>

                {/* QR Code Container */}
                <div className="relative p-8 bg-surface-container-low rounded-[32px] mb-8 flex flex-col items-center">
                  <div className="w-64 h-64 bg-surface-container-lowest dark:bg-surface-container p-4 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                    {qrData?.qrCodeUrl ? (
                      <img 
                        src={qrData.qrCodeUrl} 
                        alt="Handover QR" 
                        className="w-full h-full object-contain"
                        style={{ filter: "contrast(1.2)" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-text-secondary font-bold text-sm">
                        Generating QR Code...
                      </div>
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
                    </span>
                    <span className="font-bold text-sm text-warning tracking-wide">Waiting for Scan</span>
                  </div>
                </div>

                <div className="w-full space-y-4 mt-4 max-w-md">
                  <button className="w-full py-3.5 px-6 bg-gradient-to-r from-primary to-[#6b38d4] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-all shadow-md">
                    <Printer className="w-5 h-5" />
                    Save or Print Code
                  </button>
                  <button onClick={() => navigate(-1)} className="w-full py-3.5 px-6 bg-transparent border-2 border-danger text-danger rounded-2xl font-bold hover:bg-danger/10 transition-colors flex items-center justify-center gap-2 active:scale-95">
                    <XCircle className="w-5 h-5" />
                    Go Back
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-2 px-4 py-1.5 bg-surface rounded-full border border-border-default">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-xs text-text-secondary font-medium">End-to-end encrypted verification</span>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default QRHandover;
