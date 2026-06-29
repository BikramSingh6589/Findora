import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Verified, MessageCircle, Info, Printer, XCircle, Shield } from 'lucide-react';

export const QRHandover: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-surface -mt-6 -mx-6 md:m-0">
      {/* Top App Bar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="font-bold text-lg md:text-2xl text-primary">Resolve Handover</h1>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Item & Owner Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-default space-y-6">
              
              <div className="relative group">
                <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-inner bg-surface-container">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeR7npTgcAhtZgJiyllkd34-FgBZavlFaW3cQ5feooFbPMxFDRmnGMQTlgmiwrHlmOHgbz-RWJLOzbo0_SxE6UP8Qn1xiE2Zn4wWFsMYgHZ1ugGqIuN3SLsIrsIwPLF_VT3pIEqoEfBjNgLyulXD5Xfzx5-4ncV_FZniuKv9qa2gYdpD5EODVilGSL14LA7j_90APPC-0omwuBMGCSLpZz_hXEXN4HyEkjF8dI8E2g1nuBtSh4-C_Y7_fsi-JoTE6m7IuJZPunbf8"
                    alt="Black Leather Wallet"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-success text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Verified className="w-4 h-4" /> Verified Match
                </div>
              </div>

              <div>
                <h2 className="font-bold text-xl mb-1 text-text-primary">Black Leather Wallet</h2>
                <p className="text-text-secondary text-sm">Found at Student Union Lounge</p>
              </div>

              <div className="pt-4 border-t border-border-default">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh9n0o7EzjknF3A4fZLe7yZn0GrJCMSTEvZ9kFHNLhrGXcOmSeA6OPhHHRIlZAZLjQ5fY88CWvqYODXd4eBDDtcnpKoA8BXJgliyCGpZ6Dho23owUAAjcqdiyCkULzpqIXBV3N4tkH5r1BPj-nCvhnGHT2uUJ1sEGotJGuWW7aPt6vw3sINaDbIxqu0cKhUD8ly-rB_0Fsa9ujToXxFSh04WiHIQHUpNWLat79SEGUP9yadgaGEG9wD7jyX_2Cg_88Lt1NU_Fcuzo"
                      alt="Alex Rivera"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Owner</span>
                    <span className="font-bold text-sm text-text-primary">Alex Rivera</span>
                  </div>
                  <button className="ml-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3 items-start">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-primary">Handover Tip</h4>
                <p className="text-xs text-primary/80 leading-relaxed">Meet in a public, well-lit campus location. The handover is complete once Alex scans your unique QR code.</p>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Actions */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border-default flex flex-col items-center text-center">
              
              <div className="mb-6 space-y-2">
                <h3 className="text-2xl font-bold text-text-primary">Unique Handover QR</h3>
                <p className="text-text-secondary text-sm max-w-sm mx-auto">Show this code to the owner to complete the handover securely.</p>
              </div>

              {/* QR Code Container */}
              <div className="relative p-8 bg-surface-container-low rounded-[32px] mb-8">
                <div className="w-64 h-64 bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                  <div 
                    className="w-full h-full bg-no-repeat bg-contain bg-center opacity-90" 
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsekwCCgC4STBmWLjt4LIcDlOuWx-D0XuguTvP_E_2vq_vZTH3FjIyhK3HlJ9yeL_VClPNmy-ll3UcZ5Q35dRf3u2bmpmYpwMVfIfJBbnNXNsjoM2cyoXj4CXhEdozBsBa0kreOyxRIhdaVe_1nc0nw0jvWbaPwhE_ZPxNr_FliJbMIW5OxOlQ3V4-N9B3CsOwPOFsGhojY9EBKDwpu1XdxWzz7sPVSL_DeF-aYmzkWOC9OImBUeewkJQ_e5RCzEpV3wdTpAiH-08')",
                      filter: "contrast(1.2)"
                    }}
                  ></div>
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
                <button className="w-full py-3.5 px-6 bg-transparent border-2 border-danger text-danger rounded-2xl font-bold hover:bg-danger/10 transition-colors flex items-center justify-center gap-2 active:scale-95">
                  <XCircle className="w-5 h-5" />
                  Cancel Handover
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 px-4 py-1.5 bg-surface rounded-full border border-border-default">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-xs text-text-secondary font-medium">End-to-end encrypted verification</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
