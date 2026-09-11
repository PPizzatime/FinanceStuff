import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Edit2, Trash2, Repeat, CreditCard, DollarSign } from 'lucide-react';
import type { FinancialItem, CreditCard as CreditCardType, Periodicity, PaymentMethodType, TransactionType } from '../types/finance';

interface TransactionManagerProps {
  items: FinancialItem[];
  creditCards: CreditCardType[];
  initialCashBalance: number;
  onUpdateCashBalance: (balance: number) => void;
  onAddItem: (item: Omit<FinancialItem, 'id'>) => void;
  onUpdateItem: (item: FinancialItem) => void;
  onDeleteItem: (id: string) => void;
}

const PERIODICITY_OPTIONS: { label: string; value: Periodicity }[] = [
  { label: 'One Time (Single Occurrence)', value: 'one_time' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Biweekly (Every 2 weeks)', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly (Every 3 months)', value: 'quarterly' },
  { label: 'Semi-Annually (Every 6 months e.g., work savings bonus)', value: 'semi_annually' },
  { label: 'Annually (Once a year)', value: 'annually' },
  { label: 'Each X Days (Custom Interval)', value: 'each_x_days' },
  { label: 'Times Per Period (Frequency)', value: 'times_per_period' },
];

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  items,
  creditCards,
  initialCashBalance,
  onUpdateCashBalance,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const [formData, setFormData] = useState<{
    name: string;
    amount: number;
    type: TransactionType;
    paymentMethodType: PaymentMethodType;
    creditCardId: string;
    periodicity: Periodicity;
    intervalDays: number;
    timesPerPeriodCount: number;
    timesPerPeriodUnit: 'day' | 'week' | 'month' | 'year';
    roundingMode: 'round' | 'floor' | 'ceil';
    startDate: string;
    dayOfMonth: number;
    notes: string;
  }>({
    name: '',
    amount: 0,
    type: 'income',
    paymentMethodType: 'cash_account',
    creditCardId: creditCards[0]?.id || '',
    periodicity: 'monthly',
    intervalDays: 10,
    timesPerPeriodCount: 3,
    timesPerPeriodUnit: 'month',
    roundingMode: 'round',
    startDate: new Date().toISOString().split('T')[0],
    dayOfMonth: 1,
    notes: '',
  });

  const handleOpenAdd = (type: TransactionType) => {
    setEditingItem(null);
    setFormData({
      name: '',
      amount: 0,
      type,
      paymentMethodType: 'cash_account',
      creditCardId: creditCards[0]?.id || '',
      periodicity: 'monthly',
      intervalDays: 10,
      timesPerPeriodCount: 3,
      timesPerPeriodUnit: 'month',
      roundingMode: 'round',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: new Date().getDate(),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FinancialItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount,
      type: item.type,
      paymentMethodType: item.paymentMethodType,
      creditCardId: item.creditCardId || creditCards[0]?.id || '',
      periodicity: item.periodicity,
      intervalDays: item.intervalDays || 10,
      timesPerPeriodCount: item.timesPerPeriodCount || 3,
      timesPerPeriodUnit: item.timesPerPeriodUnit || 'month',
      roundingMode: item.roundingMode || 'round',
      startDate: item.startDate,
      dayOfMonth: item.dayOfMonth || 1,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.amount <= 0) return;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        ...formData,
      });
    } else {
      onAddItem(formData);
    }
    setIsModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getPeriodicityText = (item: FinancialItem) => {
    if (item.periodicity === 'each_x_days') {
      return `Every ${item.intervalDays || 1} Days`;
    }
    if (item.periodicity === 'times_per_period') {
      const unit = item.timesPerPeriodUnit || 'month';
      const count = item.timesPerPeriodCount || 1;
      const rounding = item.roundingMode ? ` (${item.roundingMode})` : '';
      return `${count} times per ${unit}${rounding}`;
    }
    return PERIODICITY_OPTIONS.find((p) => p.value === item.periodicity)?.label || item.periodicity;
  };

  return (
    <div className="space-y-6">
      {/* Starting Cash Balance Setting & Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" /> Income, Expenses & Recurring Charges
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure your salary, 6-month job savings returns, recurring subscription services, and custom recurring schedules.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => handleOpenAdd('income')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Income / Ingress
            </button>
            <button
              onClick={() => handleOpenAdd('expense')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Expense / Charge
            </button>
          </div>
        </div>

        {/* Initial Cash Balance Box */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
              Current Cash / Bank Balance
            </span>
            <p className="text-xs text-slate-300 mt-0.5">Starting liquid cash available</p>
          </div>
          <div className="mt-4">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={initialCashBalance}
                onChange={(e) => onUpdateCashBalance(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 text-white pl-8 pr-3 py-2 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              filterType === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ingresses / Salary ({items.filter((i) => i.type === 'income').length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              filterType === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Expenses & Charges ({items.filter((i) => i.type === 'expense').length})
          </button>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">No income or expense entries found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredItems.map((item) => {
            const card = creditCards.find((c) => c.id === item.creditCardId);
            const periodicityLabel = getPeriodicityText(item);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                      item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {item.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Repeat className="w-3.5 h-3.5 text-slate-400" />
                        {periodicityLabel}
                      </span>

                      {item.paymentMethodType === 'credit_card' ? (
                        <span className="flex items-center gap-1 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          <CreditCard className="w-3.5 h-3.5" />
                          {card ? card.name : 'Credit Card'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Cash Account
                        </span>
                      )}

                      {item.notes && <span className="text-slate-400 italic">• "{item.notes}"</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-lg font-extrabold ${
                        item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      From {item.startDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Item"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Edit Transaction Item' : `Add New ${formData.type === 'income' ? 'Income' : 'Expense'}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="income">Income / Ingress (+)</option>
                    <option value="expense">Expense / Spending (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Concept / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Work Salary, Home Fiber Internet, Work Savings Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment / Ingress Method
                  </label>
                  <select
                    value={formData.paymentMethodType}
                    onChange={(e) => setFormData({ ...formData, paymentMethodType: e.target.value as PaymentMethodType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="cash_account">Cash / Bank Account</option>
                    <option value="credit_card">Credit Card Charge</option>
                  </select>
                </div>

                {formData.paymentMethodType === 'credit_card' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Select Credit Card
                    </label>
                    <select
                      value={formData.creditCardId}
                      onChange={(e) => setFormData({ ...formData, creditCardId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {creditCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Periodicity / Frequency
                  </label>
                  <select
                    value={formData.periodicity}
                    onChange={(e) => setFormData({ ...formData, periodicity: e.target.value as Periodicity })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {PERIODICITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Conditional fields for Each X Days */}
              {formData.periodicity === 'each_x_days' && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <label className="block text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">
                    Repeat Every (X) Days
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-700 font-medium">Occurs every</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.intervalDays}
                      onChange={(e) => setFormData({ ...formData, intervalDays: Math.max(1, Number(e.target.value)) })}
                      className="w-24 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-xs text-indigo-700 font-medium">days</span>
                  </div>
                </div>
              )}

              {/* Conditional fields for Times Per Period */}
              {formData.periodicity === 'times_per_period' && (
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">
                        Frequency Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.timesPerPeriodCount}
                        onChange={(e) =>
                          setFormData({ ...formData, timesPerPeriodCount: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">
                        Per Unit
                      </label>
                      <select
                        value={formData.timesPerPeriodUnit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timesPerPeriodUnit: e.target.value as 'day' | 'week' | 'month' | 'year',
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-1">
                      Date Interval Rounding Strategy
                    </label>
                    <select
                      value={formData.roundingMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roundingMode: e.target.value as 'round' | 'floor' | 'ceil',
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="round">Round Nearest Day (Standard)</option>
                      <option value="floor">Round Down (Floor)</option>
                      <option value="ceil">Round Up (Ceil)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional context or notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
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
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
