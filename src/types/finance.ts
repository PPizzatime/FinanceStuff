export type Periodicity = 
  | 'one_time'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annually' // E.g., every 6 months (savings bonus at work)
  | 'annually';

export type TransactionType = 'income' | 'expense';

export type PaymentMethodType = 'cash_account' | 'credit_card';

export interface CreditCard {
  id: string;
  name: string;
  bank?: string;
  color: string; // Tailwind color class or hex
  cutoffDay: number; // Day of month (1-31) when billing statement closes
  paymentDueDay: number; // Day of month (1-31) when credit card payment is due
  creditLimit: number;
  currentBalance: number; // Initial/current starting balance on card
}

export interface CashAccount {
  id: string;
  name: string;
  initialBalance: number;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  paymentMethodType: PaymentMethodType;
  creditCardId?: string; // If charged to a specific credit card
  periodicity: Periodicity;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional cutoff)
  dayOfMonth?: number; // E.g., paid on the 15th of month
  notes?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  useLocalStorage: boolean;
  createdTime: string;
}

export interface ProjectionRow {
  date: string; // YYYY-MM-DD
  monthLabel: string; // e.g., "Jan 2025"
  concept: string;
  type: 'income' | 'expense' | 'card_payment' | 'initial_balance';
  amount: number;
  paymentMethod: string;
  creditCardId?: string;
  cashBalance: number;
  creditCardBalances: Record<string, number>; // cardId -> balance
  totalCreditCardDebt: number;
  netFinancialBalance: number; // Cash balance - Credit Card Debt
}

export interface FinancialState {
  initialCashBalance: number;
  creditCards: CreditCard[];
  financialItems: FinancialItem[];
}
