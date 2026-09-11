import React from 'react';
import { Sparkles, Megaphone, Info } from 'lucide-react';

interface AdBannerProps {
  slotLocation?: 'header' | 'footer' | 'sidebar';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotLocation = 'header' }) => {
  return (
    <div className="w-full my-4 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden relative">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white shadow-xs rounded-xl border border-slate-100 shrink-0 text-amber-600">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded-sm">
              Sponsor Ad
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Smart Financial Rewards & Card Offers <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {slotLocation === 'header'
              ? 'Earn 2% to 5% cash back on all monthly card spending with zero annual fee.'
              : 'Compare top balance transfer cards to optimize your projected credit card interest.'}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
        <a
          href="#ad-sponsor"
          onClick={(e) => {
            e.preventDefault();
            alert('Monetization Ad Space: Connected with Google AdSense / Mobile Ad Network');
          }}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs text-center"
        >
          Explore Deal
        </a>
        <div className="text-[10px] text-slate-400 flex items-center gap-0.5" title="Monetized revenue banner for free app access">
          <Info className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
