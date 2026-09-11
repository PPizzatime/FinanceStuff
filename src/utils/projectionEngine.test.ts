import { describe, it, expect } from 'vitest';
import { generateProjection, isItemActiveOnDate } from './projectionEngine';
import type { FinancialState, FinancialItem } from '../types/finance';

describe('projectionEngine', () => {
  it('correctly calculates monthly recurring salary income', () => {
    const item: FinancialItem = {
      id: '1',
      name: 'Salary',
      amount: 2000,
      type: 'income',
      paymentMethodType: 'cash_account',
      periodicity: 'monthly',
      startDate: '2025-01-01',
      dayOfMonth: 1,
    };

    expect(isItemActiveOnDate(item, new Date('2025-01-01T00:00:00'))).toBe(true);
    expect(isItemActiveOnDate(item, new Date('2025-01-02T00:00:00'))).toBe(false);
    expect(isItemActiveOnDate(item, new Date('2025-02-01T00:00:00'))).toBe(true);
  });

  it('correctly calculates 6-month semi-annual savings bonus', () => {
    const item: FinancialItem = {
      id: '2',
      name: 'Savings Bonus',
      amount: 1000,
      type: 'income',
      paymentMethodType: 'cash_account',
      periodicity: 'semi_annually',
      startDate: '2025-01-15',
      dayOfMonth: 15,
    };

    expect(isItemActiveOnDate(item, new Date('2025-01-15T00:00:00'))).toBe(true);
    expect(isItemActiveOnDate(item, new Date('2025-02-15T00:00:00'))).toBe(false);
    expect(isItemActiveOnDate(item, new Date('2025-07-15T00:00:00'))).toBe(true);
  });

  it('generates 1 year projection and updates credit card balance and payments', () => {
    const mockState: FinancialState = {
      initialCashBalance: 1000,
      creditCards: [
        {
          id: 'card-1',
          name: 'Visa',
          cutoffDay: 15,
          paymentDueDay: 20,
          creditLimit: 2000,
          currentBalance: 0,
          color: 'blue',
        },
      ],
      financialItems: [
        {
          id: 'salary',
          name: 'Salary',
          amount: 3000,
          type: 'income',
          paymentMethodType: 'cash_account',
          periodicity: 'monthly',
          startDate: '2025-01-01',
          dayOfMonth: 1,
        },
        {
          id: 'internet',
          name: 'Internet',
          amount: 100,
          type: 'expense',
          paymentMethodType: 'credit_card',
          creditCardId: 'card-1',
          periodicity: 'monthly',
          startDate: '2025-01-05',
          dayOfMonth: 5,
        },
      ],
    };

    const startDate = new Date('2025-01-01T00:00:00');
    const rows = generateProjection(mockState, 1, startDate);

    expect(rows.length).toBeGreaterThan(0);
    // Salary on Jan 1
    expect(rows[0].concept).toBe('Salary');
    expect(rows[0].cashBalance).toBe(4000);

    // Internet on Jan 5 charged to card
    const internetRow = rows.find((r) => r.concept === 'Internet' && r.date === '2025-01-05');
    expect(internetRow).toBeDefined();
    expect(internetRow?.totalCreditCardDebt).toBe(100);

    // Payment on Jan 20
    const paymentRow = rows.find((r) => r.concept === 'Payment: Visa' && r.date === '2025-01-20');
    expect(paymentRow).toBeDefined();
    expect(paymentRow?.amount).toBe(100);
    expect(paymentRow?.totalCreditCardDebt).toBe(0);
  });
});
