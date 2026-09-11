import type { FinancialState, UserAccount } from '../types/finance';

const STORAGE_KEYS = {
  STATE: 'finprojector_state_v1',
  USER: 'finprojector_user_v1',
};

const DEFAULT_INITIAL_STATE: FinancialState = {
  initialCashBalance: 3500,
  creditCards: [
    {
      id: 'card-1',
      name: 'Platinum Cash Back',
      bank: 'Chase',
      color: 'bg-gradient-to-r from-blue-600 to-indigo-700',
      cutoffDay: 15,
      paymentDueDay: 5,
      creditLimit: 5000,
      currentBalance: 450,
    },
    {
      id: 'card-2',
      name: 'Gold Rewards',
      bank: 'Amex',
      color: 'bg-gradient-to-r from-amber-500 to-yellow-600',
      cutoffDay: 28,
      paymentDueDay: 18,
      creditLimit: 8000,
      currentBalance: 1200,
    },
  ],
  financialItems: [
    {
      id: 'item-1',
      name: 'Monthly Salary',
      amount: 4200,
      type: 'income',
      paymentMethodType: 'cash_account',
      periodicity: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: 1,
      notes: 'Main employment salary',
    },
    {
      id: 'item-2',
      name: 'Work Savings Return (6-Month)',
      amount: 1500,
      type: 'income',
      paymentMethodType: 'cash_account',
      periodicity: 'semi_annually',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: 15,
      notes: 'Company savings fund payout every 6 months',
    },
    {
      id: 'item-3',
      name: 'Internet & Home Services',
      amount: 85,
      type: 'expense',
      paymentMethodType: 'credit_card',
      creditCardId: 'card-1',
      periodicity: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: 10,
      notes: 'Recurring home fiber internet',
    },
    {
      id: 'item-4',
      name: 'Streaming Subscriptions',
      amount: 35,
      type: 'expense',
      paymentMethodType: 'credit_card',
      creditCardId: 'card-2',
      periodicity: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: 22,
      notes: 'Netflix, Spotify & Cloud storage',
    },
    {
      id: 'item-5',
      name: 'Groceries & Household',
      amount: 450,
      type: 'expense',
      paymentMethodType: 'cash_account',
      periodicity: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: 5,
      notes: 'Monthly essential food and consumables',
    },
  ],
};

export function loadFinancialState(): FinancialState {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATE);
    if (!data) return DEFAULT_INITIAL_STATE;
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load local state:', err);
    return DEFAULT_INITIAL_STATE;
  }
}

export function saveFinancialState(state: FinancialState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function loadUserAccount(): UserAccount {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      return {
        id: 'guest-1',
        email: 'guest@local.app',
        name: 'Guest User',
        isLoggedIn: false,
        useLocalStorage: true,
        createdTime: new Date().toISOString(),
      };
    }
    return JSON.parse(data);
  } catch (err) {
    return {
      id: 'guest-1',
      email: 'guest@local.app',
      name: 'Guest User',
      isLoggedIn: false,
      useLocalStorage: true,
      createdTime: new Date().toISOString(),
    };
  }
}

export function saveUserAccount(user: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user account:', err);
  }
}
