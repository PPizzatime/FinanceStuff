import React, { useState } from 'react';
import { CreditCard as CardIcon, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import type { CreditCard } from '../types/finance';

interface CreditCardManagerProps {
  cards: CreditCard[];
  onAddCard: (card: Omit<CreditCard, 'id'>) => void;
  onUpdateCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
}

const COLOR_OPTIONS = [
  { label: 'Blue Indigo', class: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
  { label: 'Emerald Teal', class: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
  { label: 'Amber Gold', class: 'bg-gradient-to-r from-amber-500 to-yellow-600' },
  { label: 'Purple Rose', class: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { label: 'Dark Slate', class: 'bg-gradient-to-r from-slate-800 to-slate-900' },
];

export const CreditCardManager: React.FC<CreditCardManagerProps> = ({
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    bank: string;
    cutoffDay: number;
    paymentDueDay: number;
    creditLimit: number;
    currentBalance: number;
    color: string;
  }>({
    name: '',
    bank: '',
    cutoffDay: 15,
    paymentDueDay: 5,
    creditLimit: 3000,
    currentBalance: 0,
    color: COLOR_OPTIONS[0].class,
  });

  const handleOpenAdd = () => {
    setEditingCard(null);
    setFormData({
      name: '',
      bank: '',
      cutoffDay: 15,
      paymentDueDay: 5,
      creditLimit: 3000,
      currentBalance: 0,
      color: COLOR_OPTIONS[0].class,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      bank: card.bank || '',
      cutoffDay: card.cutoffDay,
      paymentDueDay: card.paymentDueDay,
      creditLimit: card.creditLimit,
      currentBalance: card.currentBalance,
      color: card.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCard) {
      onUpdateCard({
        ...editingCard,
        ...formData,
      });
    } else {
      onAddCard(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CardIcon className="w-6 h-6 text-indigo-600" /> Credit Cards & Accounts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your cards, statement cut-off days, and scheduled payment due dates.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Credit Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
          <CardIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Credit Cards Configured</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Add a credit card to assign recurring services or 1-time purchases and track payment deadlines.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-medium text-sm rounded-xl hover:bg-indigo-100 transition"
          >
            Add First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const utilizationPercent = Math.min(
              100,
              Math.round(((card.currentBalance || 0) / (card.creditLimit || 1)) * 100)
            );

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md"
              >
                {/* Visual Card Banner */}
                <div className={`p-5 text-white ${card.color} relative`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                        {card.bank || 'Credit Card'}
                      </p>
                      <h3 className="text-lg font-bold mt-0.5">{card.name}</h3>
                    </div>
                    <CardIcon className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider opacity-75">Current Balance</p>
                      <p className="text-2xl font-extrabold">${(card.currentBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider opacity-75">Credit Limit</p>
                      <p className="text-sm font-semibold">${(card.creditLimit || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Card Details & Cycle */}
                <div className="p-5 space-y-4">
                  {/* Utilization bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                      <span>Card Utilization</span>
                      <span>{utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          utilizationPercent > 80
                            ? 'bg-rose-500'
                            : utilizationPercent > 50
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${utilizationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Cut-off Day</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Day {card.cutoffDay}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Payment Due Day</span>
                      <span className="font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Day {card.paymentDueDay}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(card)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                      title="Edit Card"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">
                {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Card Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sapphire Preferred, Amazon Rewards"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Bank / Issuer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chase, Citi"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Credit Limit ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Statement Cut-Off Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.cutoffDay}
                    onChange={(e) => setFormData({ ...formData, cutoffDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Day of month bill closes</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Due Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDueDay}
                    onChange={(e) => setFormData({ ...formData, paymentDueDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Day card bill is paid</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Starting / Current Balance ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Card Design Color
                </label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.label}
                      onClick={() => setFormData({ ...formData, color: c.class })}
                      className={`h-8 rounded-lg ${c.class} transition ${
                        formData.color === c.class
                          ? 'ring-2 ring-offset-2 ring-indigo-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
                >
                  {editingCard ? 'Save Changes' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
