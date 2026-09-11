import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  PlusCircle,
  Calendar,
  Filter,
  TrendingUp,
  CreditCard,
  Search,
} from 'lucide-react';
import type { FinancialState } from '../types/finance';
import { generateProjection } from '../utils/projectionEngine';
import { exportToCSV, exportToExcel } from '../utils/exporter';

interface ProjectionTableProps {
  state: FinancialState;
}

export const ProjectionTable: React.FC<ProjectionTableProps> = ({ state }) => {
  const [yearsToProject, setYearsToProject] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const allRows = useMemo(() => {
    return generateProjection(state, yearsToProject);
  }, [state, yearsToProject]);

  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    allRows.forEach((r) => set.add(r.monthLabel));
    return Array.from(set);
  }, [allRows]);

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const matchesSearch =
        row.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth = selectedMonthFilter === 'all' || row.monthLabel === selectedMonthFilter;

      const matchesType =
        selectedTypeFilter === 'all' ||
        (selectedTypeFilter === 'income' && row.type === 'income') ||
        (selectedTypeFilter === 'expense' && row.type === 'expense') ||
        (selectedTypeFilter === 'card_payment' && row.type === 'card_payment');

      return matchesSearch && matchesMonth && matchesType;
    });
  }, [allRows, searchTerm, selectedMonthFilter, selectedTypeFilter]);

  const endNetBalance = allRows[allRows.length - 1]?.netFinancialBalance || 0;
  const endCashBalance = allRows[allRows.length - 1]?.cashBalance || 0;
  const endCreditDebt = allRows[allRows.length - 1]?.totalCreditCardDebt || 0;

  return (
    <div className="space-y-6">
      {/* Projection Header & Summary Cards */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" /> Multi-Year Financial Status & Projection Table
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Simulates timeline cash balance, upcoming credit card payments, and net financial worth from today onwards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setYearsToProject((y) => y + 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl transition border border-indigo-200/60 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Show 1 More Year ({yearsToProject + 1} Yrs)
          </button>

          <button
            onClick={() => exportToExcel(allRows, `financial_projection_${yearsToProject}_yr.xlsx`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>

          <button
            onClick={() => exportToCSV(allRows, `financial_projection_${yearsToProject}_yr.csv`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm rounded-xl transition shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Projection Overview Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Projected Cash Balance (In {yearsToProject} Yr)
          </span>
          <p className={`text-2xl font-black mt-1 ${endCashBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ${endCashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Projected Credit Card Debt
          </span>
          <p className="text-2xl font-black mt-1 text-slate-800">
            ${endCreditDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Projected Net Financial Worth
          </span>
          <p className="text-2xl font-black mt-1">
            ${endNetBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Table Controls / Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search concept or card..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Month:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Months ({uniqueMonths.length})</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Type:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types</option>
              <option value="income">Income (+)</option>
              <option value="expense">Expense (-)</option>
              <option value="card_payment">Card Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projection Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Concept / Description</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Cash Balance</th>
                <th className="py-3.5 px-4 text-right">Credit Card Debt</th>
                <th className="py-3.5 px-4 text-right">Net Financial Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-normal">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const isIncome = row.type === 'income';
                  const isCardPayment = row.type === 'card_payment';

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition ${
                        isCardPayment ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.concept}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCardPayment
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isIncome ? 'Income' : isCardPayment ? 'Card Payment' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          {row.paymentMethod.includes('Cash') ? (
                            <span className="text-slate-600">{row.paymentMethod}</span>
                          ) : (
                            <span className="text-indigo-600 font-semibold flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              {row.paymentMethod}
                            </span>
                          )}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          row.cashBalance < 0 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        ${row.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-600 whitespace-nowrap">
                        ${row.totalCreditCardDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-indigo-900 whitespace-nowrap bg-indigo-50/20">
                        ${row.netFinancialBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
