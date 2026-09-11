import { describe, it, expect } from 'vitest';
import { generateProjection, isItemActiveOnDate, calculatePeriodIntervalDays } from './projectionEngine';
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

  it('handles each X days custom interval', () => {
    const item: FinancialItem = {
      id: '3',
      name: 'Freelance Payout Every 10 Days',
      amount: 500,
      type: 'income',
      paymentMethodType: 'cash_account',
      periodicity: 'each_x_days',
      intervalDays: 10,
      startDate: '2025-01-01',
    };

    expect(isItemActiveOnDate(item, new Date('2025-01-01T00:00:00'))).toBe(true);
    expect(isItemActiveOnDate(item, new Date('2025-01-05T00:00:00'))).toBe(false);
    expect(isItemActiveOnDate(item, new Date('2025-01-11T00:00:00'))).toBe(true);
    expect(isItemActiveOnDate(item, new Date('2025-01-21T00:00:00'))).toBe(true);
  });

  it('handles times_per_period interval calculations and rounding modes', () => {
    // 3 times per week (7 / 3 = 2.333)
    expect(calculatePeriodIntervalDays(3, 'week', 'round')).toBe(2);
    expect(calculatePeriodIntervalDays(3, 'week', 'floor')).toBe(2);
    expect(calculatePeriodIntervalDays(3, 'week', 'ceil')).toBe(3);

    // 3 times per month (30 / 3 = 10)
    expect(calculatePeriodIntervalDays(3, 'month', 'round')).toBe(10);

    // 7 times per month (30 / 7 = 4.285)
    expect(calculatePeriodIntervalDays(7, 'month', 'floor')).toBe(4);
    expect(calculatePeriodIntervalDays(7, 'month', 'ceil')).toBe(5);

    const item: FinancialItem = {
      id: '4',
      name: 'Gym Workout Coach',
      amount: 30,
      type: 'expense',
      paymentMethodType: 'cash_account',
      periodicity: 'times_per_period',
      timesPerPeriodCount: 3,
      timesPerPeriodUnit: 'week',
      roundingMode: 'round', // 7/3 => 2 days
      startDate: '2025-01-01',
    };

    expect(isItemActiveOnDate(item, new Date('2025-01-01T00:00:00'))).toBe(true);
    expect(isItemActiveOnDate(item, new Date('2025-01-03T00:00:00'))).toBe(true);
    expect(isItemActiveOnDate(item, new Date('2025-01-05T00:00:00'))).toBe(true);
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

  it('correctly applies dateOverrides to shift transaction dates and recalculate balances', () => {
    const mockState: FinancialState = {
      initialCashBalance: 1000,
      creditCards: [],
      financialItems: [
        {
          id: 'bonus',
          name: 'One Time Bonus',
          amount: 500,
          type: 'income',
          paymentMethodType: 'cash_account',
          periodicity: 'one_time',
          startDate: '2025-01-10',
        },
      ],
      dateOverrides: {
        'bonus_2025-01-10': '2025-01-02', // Move bonus from Jan 10 to Jan 2
      },
    };

    const startDate = new Date('2025-01-01T00:00:00');
    const rows = generateProjection(mockState, 1, startDate);

    expect(rows.length).toBe(1);
    expect(rows[0].date).toBe('2025-01-02');
    expect(rows[0].originalDate).toBe('2025-01-10');
    expect(rows[0].isDateOverridden).toBe(true);
    expect(rows[0].cashBalance).toBe(1500);
  });
});
