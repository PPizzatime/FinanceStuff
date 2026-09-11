import React, { useState } from 'react';
import { User, HardDrive, Cloud, CheckCircle } from 'lucide-react';
import type { UserAccount } from '../types/finance';

interface AuthModalProps {
  user: UserAccount;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
}) => {
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || '');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    onUpdateUser({
      ...user,
      id: `usr_${Date.now()}`,
      email,
      name: name.trim() || email.split('@')[0],
      isLoggedIn: true,
      useLocalStorage: false,
    });
    onClose();
  };

  const handleUseLocalStorage = () => {
    onUpdateUser({
      ...user,
      isLoggedIn: false,
      useLocalStorage: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 border border-slate-100">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
          <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-300">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">
            {user.isLoggedIn ? 'Account Profile & Sync' : mode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Access your credit cards and projections across phone & web browsers
          </p>
        </div>

        <div className="p-6 space-y-6">
          {user.isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">Account Active & Synced</h4>
                  <p className="text-xs text-emerald-700">{user.email}</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>User Name:</strong> {user.name}</p>
                <p><strong>Cloud Sync Status:</strong> Active across Web & Mobile App</p>
              </div>

              <button
                onClick={handleUseLocalStorage}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Switch to Offline HTML5 LocalStorage Mode
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4" />
                  {mode === 'login' ? 'Sign In & Sync' : 'Register & Sync'}
                </button>
              </form>

              <div className="flex justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="hover:underline font-semibold text-indigo-600"
                >
                  {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>

              <div className="relative border-t border-slate-100 pt-4">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] uppercase font-bold text-slate-400">
                  Or
                </span>
                <button
                  onClick={handleUseLocalStorage}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  Use Local Storage (No Sign-In Required)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
