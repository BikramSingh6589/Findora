import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Laptop, Camera, QrCode, Flashlight, 
  Headset, Bell, BarChart2 
} from 'lucide-react';

export const QRScan: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-surface -mt-6 -mx-6 md:m-0">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 shadow-sm border-b border-border-default">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg md:text-2xl text-primary">Confirm Recovery</h1>
            <p className="text-text-secondary text-xs">Case #LF-89021</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex bg-success/10 text-success px-4 py-1.5 rounded-full text-xs font-bold items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Scan to Finalize
          </span>
          <div className="flex items-center gap-1 md:gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <Bell className="w-5 h-5 text-text-secondary" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <BarChart2 className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Content Canvas */}
      <section className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start md:justify-center max-w-5xl mx-auto w-full pb-24 md:pb-8">
        
        {/* Summary Header Card */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-l-4 border-primary flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <Laptop className="text-primary w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-text-primary">MacBook Pro</h2>
              <p className="text-text-secondary text-xs md:text-sm">Your lost item has been located</p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-l-4 border-[#6b38d4] flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#6b38d4]/20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtTabE8eGivJvfIQxao_keeJyXf9UqpQaUwWLrzd2YjsedzJmAyLStwD_xKG7xh3bIllzZURMkl61q_dK_5yDteJ2GneCDU2p0FaZz02WiQtoZAlW3OiaJ5VTZRInU3ov7swEEGalv3m4eyzaPbaAYqd-TxPXvY4TEmn2v5HjlURZ3sHbKthwegle9l5yGedz9B4ROsc-ohEljgcdbDvZ3Ni3MgxRPyuBKkxB6ETGc8vw4XTDix1uQPr8EBR2mUm6RzBBvEf_NEhU" 
                alt="Jordan Smith" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-text-primary">Jordan Smith</h2>
              <p className="text-text-secondary text-xs md:text-sm">Verified Finder</p>
            </div>
          </div>
        </div>

        {/* Scanner Interface */}
        <div className="w-full max-w-2xl bg-text-primary rounded-[32px] overflow-hidden relative shadow-xl border-4 md:border-8 border-white/10 aspect-[3/4] md:aspect-video flex items-center justify-center">
          
          {/* Viewfinder background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdxYJjL7E6325eIwiSpa4q9QUmKgRizFoXTok_dqcka3rPN7InM6YCjOVcxldEHM690ZU-cxYOkum6Llu47N_sX6Sau6XrkKwIGfwf9o19musvEWsCKljS7Ur0eey1l4DsZ3jgkhEH3RxWzYGW2aCjAXWa0048W-dRQHA62doGSuIpm0v0KA9aoHv24hG7mOsFj9eqznUTCSdfApcGVWYns6Ywgx4VXKs1rrJiRsbP8rRRYRZVouDvM1ueOW6AWW_09JMkV92__6I" 
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2 md:gap-3 shadow-lg border border-white/30 w-max">
            <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-white animate-pulse">
              <Camera className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <p className="text-white text-xs md:text-sm font-semibold">Align QR code within the frame</p>
          </div>
        </div>

        {/* Instructions & Help */}
        <div className="mt-8 text-center max-w-lg">
          <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2">Scan to confirm</h3>
          <p className="text-text-secondary text-sm md:text-base">
            Scan the finder's QR code to confirm you have received your item. This will securely close the case and award 50 XP to Jordan Smith.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button className="bg-primary hover:scale-[1.03] transition-all text-white px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
              <Flashlight className="w-5 h-5" />
              Toggle Flash
            </button>
            <button className="bg-transparent border-2 border-primary text-primary hover:bg-primary/5 transition-colors px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Headset className="w-5 h-5" />
              Need Help?
            </button>
          </div>
        </div>

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
