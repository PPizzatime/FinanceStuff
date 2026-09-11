import React from 'react';
import {
  TrendingUp,
  CreditCard as CardIcon,
  DollarSign,
  User,
  ShieldCheck,
  CloudCheck,
  HardDrive,
} from 'lucide-react';
import type { UserAccount } from '../types/finance';

interface NavbarProps {
  activeTab: 'projection' | 'cards' | 'transactions';
  setActiveTab: (tab: 'projection' | 'cards' | 'transactions') => void;
  user: UserAccount;
  onOpenAuth: () => void;
  onOpenLegal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onOpenLegal,
}) => {
  return (
    <>
      {/* Top Header Navigation for Desktop / Web */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('projection')}>
            <div className="p-2 bg-indigo-600 rounded-xl shadow-inner">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                CashBalance.Online
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full ml-2 font-medium">
                Global Free Edition
              </span>
            </div>
          </div>

          {/* Nav Tabs for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('projection')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'projection'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> 1+ Year Projection
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Ingress & Expenses
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CardIcon className="w-4 h-4" /> Credit Cards
            </button>
          </nav>

          {/* Right side controls: Storage Sync & Legal Notice */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLegal}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Legal Disclaimer & Terms"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-xl transition text-slate-200"
            >
              {user.isLoggedIn ? (
                <>
                  <CloudCheck className="w-4 h-4 text-emerald-400" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>HTML5 Local / Sync</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Floating Navigation Bar (Phone Friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 flex justify-around items-center text-white">
        <button
          onClick={() => setActiveTab('projection')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'projection' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Projection</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'transactions' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px]">Ingress & Expense</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'cards' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CardIcon className="w-5 h-5" />
          <span className="text-[10px]">Cards</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Account</span>
        </button>
      </div>
    </>
  );
};
