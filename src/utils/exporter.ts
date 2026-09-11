import * as XLSX from 'xlsx';
import type { ProjectionRow } from '../types/finance';

export function exportToCSV(rows: ProjectionRow[], filename: string = 'financial_projection.csv'): void {
  const headers = [
    'Date',
    'Month',
    'Concept / Description',
    'Type',
    'Payment Method',
    'Amount',
    'Cash Balance',
    'Total Credit Card Debt',
    'Net Financial Balance',
  ];

  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const formattedType =
      row.type === 'income'
        ? 'Income (+)'
        : row.type === 'expense'
        ? 'Expense (-)'
        : row.type === 'card_payment'
        ? 'Card Payment'
        : 'Balance';

    const line = [
      `"${row.date}"`,
      `"${row.monthLabel}"`,
      `"${row.concept.replace(/"/g, '""')}"`,
      `"${formattedType}"`,
      `"${row.paymentMethod.replace(/"/g, '""')}"`,
      row.amount.toFixed(2),
      row.cashBalance.toFixed(2),
      row.totalCreditCardDebt.toFixed(2),
      row.netFinancialBalance.toFixed(2),
    ];
    csvRows.push(line.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(rows: ProjectionRow[], filename: string = 'financial_projection.xlsx'): void {
  const data = rows.map((row) => ({
    Date: row.date,
    Month: row.monthLabel,
    'Concept / Description': row.concept,
    Type:
      row.type === 'income'
        ? 'Income (+)'
        : row.type === 'expense'
        ? 'Expense (-)'
        : row.type === 'card_payment'
        ? 'Card Payment'
        : 'Balance',
    'Payment Method': row.paymentMethod,
    'Amount ($)': row.amount,
    'Cash Balance ($)': row.cashBalance,
    'Total Credit Card Debt ($)': row.totalCreditCardDebt,
    'Net Financial Balance ($)': row.netFinancialBalance,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projection');

  // Format header row width
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 12 }, // Month
    { wch: 30 }, // Concept
    { wch: 15 }, // Type
    { wch: 22 }, // Payment Method
    { wch: 12 }, // Amount
    { wch: 15 }, // Cash Balance
    { wch: 22 }, // Card Debt
    { wch: 22 }, // Net Balance
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
}
