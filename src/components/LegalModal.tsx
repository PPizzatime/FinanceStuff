import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Legal Notice & Privacy Terms</h3>
              <p className="text-xs text-slate-400">Financial status and projection app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium">
              <strong>Disclaimer:</strong> This application provides financial status estimations and projections for educational and budgeting planning purposes only. It does not constitute certified financial advisory.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">1. Free Access & Monetization</h4>
            <p>
              This web application and companion mobile interface are accessible free of charge. To support ongoing service hosting and global availability, non-intrusive advertisements may be shown.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">2. Local HTML5 & Account Sync Data Privacy</h4>
            <p>
              All user data (credit card limits, billing cycles, salaries, and custom expense entries) are stored either in your web/mobile browser's HTML5 local storage or linked to your account profile. Your financial entries are private to your device/account and are never sold to third parties.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">3. Credit Card & Multi-Year Projection Calculations</h4>
            <p>
              Projections are computed deterministically according to the cutoff days, due dates, and frequencies configured by you. You remain responsible for verifying official statement balances with your respective banking institutions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
