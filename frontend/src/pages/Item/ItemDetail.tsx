import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Maximize2, Tag, 
  MapPin, Calendar, User, Sparkles, Verified, MessageSquare, ChevronRight
} from 'lucide-react';

export const ItemDetail: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  
  const [activeImage, setActiveImage] = useState(0);
  
  const images = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBQsLEJ7s-27OG_P4IgsYTKbHn-OohaCBAl9i3GGzXII252l9FDeJxmN5aJqwS_dE_i-TfJLTTZZ0z7fDQ_lu8pGZZg8BN_7EzOc6LJpBYjuDIa5AxU7-n1at8ibTva7DSe1nhScq0bhKxrwoVYQ1U0kReeE8Op1zrPu_2VCMf3Dkua34B0KfIBT7zrSpBbuZcx7xNktA0m8c8MK5hIC5Af7_rsi0yRAWKXy3NOHEdjnZTwtaG8SLBjRCXgH1flZN5TF47gxgSBPLc",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCzwZd9DKQsFjwKe_D8ET21eHxYDL6yg9jcHmHVX9kbZBWOiITQ7RYCR6SmuTUB9XwLZzSPT_Qvu_Q6GRaLW_TR5zWlR7I5gpfrJA1UxCFIA42t1rINombVI6Pm1D5p5C177aIa3iKIMXUft_MwZ3naEccQuwK6Zk_ddid1hbBl1MBOYNoAWGK82cAi5rrpW8FwbW7bHkechRiEXhGuKDnh1Wm2iBxtdWPjEexOjqZbjv7sJJYtH4CwD277IHDj3SRJjcG1Cp8jk3Y",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBFVTabWd0ZDps3Ub4PG57K5n6Yr9ihJ94asNNkp9Eors7MVYYab3U_EcV3Lm91b9F5bFhFvkPG3cTsacU34rB6O6xcx4Dotxvx4TiDD_G8jCzBGp0z-oLrO_jz4ww0GqnbDa0quLvyp66aqaQpdH1wh_1_QPAHt_ImtjOXGlLmHuI6VffqWcKKhfmLDKlTVa2CsexHJV2WAUeMGBGVUTOMRnsNr6vuXKAxREhagsyIFddg_t_lAMy8LeyAinTGVDxChKouR0ZgVaE",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBUC2fX6-uME6ltcbjUFqzBg0d_64L1ngbxIk8ypbTyeQLL8hrJDVDfNiVcOUXBQXIt_-v2D2BWmwGU3q18XcjE1405qFqdshkrmxBCKP_g2wtc2GBzjbIpZSRVFXRR96e7AFpJtFjREpti5eI5_hIwLVPSUhuHA9XwPLD-I4DzUU_9gPgHKCinpZ9r6Bb1jLHTcfzaTF4tvZYG9bHCFMc-i2qdwEAYDF74xo9B3AEUCu4nRjlvd9wM84kdjza88pdZHMOS9Lns39A"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface -mt-6 -mx-6 md:m-0 pb-24 md:pb-0">
      
      {/* Mobile Header (Hidden on Desktop since AppLayout handles it) */}
      <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 py-3 shadow-sm border-b border-border-default">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h1 className="font-bold text-lg text-primary">Item Details</h1>
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <Share2 className="w-5 h-5 text-text-secondary" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumbs (Desktop) */}
        <nav className="hidden md:flex mb-6 items-center gap-2 text-sm text-text-secondary font-semibold">
          <button onClick={() => navigate('/community')} className="hover:text-primary transition-colors">Community</button>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-primary cursor-pointer transition-colors">Electronics</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text-primary">Item #{itemId || 'LF-8821'}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Left Column: Image Gallery & Description */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Image Gallery */}
            <div className="flex flex-col gap-3 md:gap-4 px-4 md:px-0 pt-4 md:pt-0">
              {/* Main Image */}
              <div className="relative group aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-sm bg-surface-container">
                <img 
                  src={images[activeImage]} 
                  alt="Found Item" 
                  className="w-full h-full object-cover transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-success/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Status: Found
                  </span>
                  <span className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Electronics
                  </span>
                </div>
                <button className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-all text-white">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-xl md:rounded-2xl overflow-hidden transition-all ${activeImage === idx ? 'ring-4 ring-primary/30 border-2 border-primary' : 'hover:opacity-80'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-default mx-4 md:mx-0">
              <h2 className="text-xl font-bold text-text-primary mb-4">Description</h2>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6">
                "Found this MacBook Pro on the 3rd floor of the Main Library, near the quiet study pods. It was left on a desk around 4:30 PM. It has a distinctive 'Computer Science Society' sticker on the bottom left corner and some minor scratches near the charging port. No charger was present."
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-border-default">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-text-secondary">Silver, Metal, 13-inch</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-border-default">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-text-secondary">Sticker present</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Details, Map & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6 px-4 md:px-0">
            
            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-default">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Item Name</span>
                  <h1 className="text-2xl font-bold text-text-primary mt-1">Silver MacBook Pro</h1>
                </div>
                <button className="hidden md:flex p-2 rounded-full hover:bg-surface-container transition-colors">
                  <Share2 className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold">Found Location</p>
                    <p className="text-sm font-bold text-text-primary">Main Library, 3rd Floor</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold">Date Reported</p>
                    <p className="text-sm font-bold text-text-primary">October 24, 2023 • 4:45 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold">Found By</p>
                    <p className="text-sm font-bold text-text-primary">Senior Student #4421</p>
                  </div>
                </div>
              </div>

              {/* AI Confidence Score */}
              <div className="bg-info-ai/10 rounded-2xl p-4 mb-8 border border-info-ai/20">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-info-ai fill-current" />
                    <span className="text-sm font-bold text-info-ai">AI Match Confidence</span>
                  </div>
                  <span className="text-sm font-bold text-info-ai">98%</span>
                </div>
                <div className="w-full bg-info-ai/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-info-ai h-full rounded-full w-[98%]"></div>
                </div>
                <p className="text-xs text-info-ai/80 mt-2 font-medium">Based on your report "Lost Silver Laptop", this is an extremely high match.</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate(`/claim/${itemId || '123'}`)}
                  className="w-full bg-gradient-to-r from-primary to-[#6b38d4] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Verified className="w-5 h-5" />
                  Claim Item
                </button>
                <button 
                  onClick={() => navigate(`/chat/finder/${itemId || '123'}`)}
                  className="w-full bg-transparent border-2 border-border-default text-text-primary py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" />
                  Contact Finder
                </button>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border-default hidden md:block">
              <div className="p-4 border-b border-border-default flex items-center justify-between">
                <span className="font-bold text-sm">Precise Location</span>
                <span className="text-xs font-bold text-primary cursor-pointer hover:underline">Get Directions</span>
              </div>
              <div className="h-64 relative bg-surface-container flex items-center justify-center overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnqLXe25m9QGSV7P6ZntAD_xKaXFmh1W3D8sqh7TszsFeLjvj2AKNSHGdpGMdq83UPPzN1uls9I0X1ftXvd0btJ5O8iXTkx9Wck9Xw_CpgChwuhWMcq_7zvvL9c-OpERyLA2Cmwz2y-IZN1pVRDLsW39OOYt23k0Y31iSjyFzX2O0xCw868IzSkePlMdn5xahd9Qa2Wde-Z55zAGn-omv_tWSD464s5t2g_uj-TfvbD2WObP1SU0MNs7ET7-j4_13HRD4Acr91qFk')"}}
                ></div>
                
                {/* Map Pin */}
                <div className="relative z-10">
                  <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                  <MapPin className="text-primary w-10 h-10 relative drop-shadow-md fill-white" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Map (Bottom of content) */}
      <div className="md:hidden mx-4 mb-6 mt-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-border-default">
        <div className="p-4 border-b border-border-default flex items-center justify-between">
          <span className="font-bold text-sm">Precise Location</span>
          <span className="text-xs font-bold text-primary cursor-pointer hover:underline">Get Directions</span>
        </div>
        <div className="h-48 relative bg-surface-container flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnqLXe25m9QGSV7P6ZntAD_xKaXFmh1W3D8sqh7TszsFeLjvj2AKNSHGdpGMdq83UPPzN1uls9I0X1ftXvd0btJ5O8iXTkx9Wck9Xw_CpgChwuhWMcq_7zvvL9c-OpERyLA2Cmwz2y-IZN1pVRDLsW39OOYt23k0Y31iSjyFzX2O0xCw868IzSkePlMdn5xahd9Qa2Wde-Z55zAGn-omv_tWSD464s5t2g_uj-TfvbD2WObP1SU0MNs7ET7-j4_13HRD4Acr91qFk')"}}
          ></div>
          <div className="relative z-10">
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
            <MapPin className="text-primary w-8 h-8 relative drop-shadow-md fill-white" />
          </div>
        </div>
      </div>

    </div>
  );
};
