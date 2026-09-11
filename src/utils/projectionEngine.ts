import type { FinancialState, ProjectionRow, FinancialItem, Periodicity } from '../types/finance';

/**
 * Checks if a financial item occurs on a specific date based on its start date, end date, and periodicity.
 */
export function isItemActiveOnDate(item: FinancialItem, targetDate: Date): boolean {
  const startDate = new Date(item.startDate + 'T00:00:00');
  if (targetDate < startDate) return false;

  if (item.endDate) {
    const endDate = new Date(item.endDate + 'T00:00:00');
    if (targetDate > endDate) return false;
  }

  const dayOfMonth = item.dayOfMonth || startDate.getDate();
  const targetDay = targetDate.getDate();

  switch (item.periodicity as Periodicity) {
    case 'one_time':
      return (
        targetDate.getFullYear() === startDate.getFullYear() &&
        targetDate.getMonth() === startDate.getMonth() &&
        targetDay === startDate.getDate()
      );

    case 'weekly': {
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % 7 === 0;
    }

    case 'biweekly': {
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % 14 === 0;
    }

    case 'monthly': {
      // Matches the target day of month (e.g., 15th of every month)
      const maxDaysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      const effectiveDay = Math.min(dayOfMonth, maxDaysInMonth);
      return targetDay === effectiveDay;
    }

    case 'quarterly': {
      const monthDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + (targetDate.getMonth() - startDate.getMonth());
      if (monthDiff >= 0 && monthDiff % 3 === 0) {
        const maxDaysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        const effectiveDay = Math.min(dayOfMonth, maxDaysInMonth);
        return targetDay === effectiveDay;
      }
      return false;
    }

    case 'semi_annually': {
      // E.g., every 6 months (work savings bonus)
      const monthDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + (targetDate.getMonth() - startDate.getMonth());
      if (monthDiff >= 0 && monthDiff % 6 === 0) {
        const maxDaysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        const effectiveDay = Math.min(dayOfMonth, maxDaysInMonth);
        return targetDay === effectiveDay;
      }
      return false;
    }

    case 'annually': {
      if (targetDate.getMonth() === startDate.getMonth()) {
        const maxDaysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        const effectiveDay = Math.min(dayOfMonth, maxDaysInMonth);
        return targetDay === effectiveDay;
      }
      return false;
    }

    default:
      return false;
  }
}

/**
 * Calculates project financial timeline for N years.
 * Accounts for:
 * 1. Cash inflow (Salary, 6-month savings return, side income).
 * 2. Cash outflow (Cash expenses, rent, groceries).
 * 3. Credit Card charges (Home services, subscriptions, 1-time purchases).
 * 4. Credit Card automated/scheduled payment on paymentDueDay from cash account.
 */
export function generateProjection(
  state: FinancialState,
  yearsToProject: number = 1,
  startDateInput?: Date
): ProjectionRow[] {
  const rows: ProjectionRow[] = [];

  const startDate = startDateInput ? new Date(startDateInput) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const totalDays = yearsToProject * 365;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays);

  let currentCash = state.initialCashBalance;

  // Initialize credit card balances
  const cardBalances: Record<string, number> = {};
  state.creditCards.forEach((card) => {
    cardBalances[card.id] = card.currentBalance || 0;
  });

  // Track accrued statement balances that are pending payment on due dates
  const pendingStatementPayments: Record<string, number> = {};
  state.creditCards.forEach((card) => {
    pendingStatementPayments[card.id] = card.currentBalance || 0;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const dateStr = currentDate.toISOString().split('T')[0];
    const monthLabel = `${monthNames[month]} ${year}`;

    // 1. Process recurring and 1-time financial items
    for (const item of state.financialItems) {
      if (isItemActiveOnDate(item, currentDate)) {
        if (item.paymentMethodType === 'cash_account') {
          if (item.type === 'income') {
            currentCash += item.amount;
          } else {
            currentCash -= item.amount;
          }

          rows.push({
            date: dateStr,
            monthLabel,
            concept: item.name,
            type: item.type,
            amount: item.amount,
            paymentMethod: 'Cash Account',
            cashBalance: currentCash,
            creditCardBalances: { ...cardBalances },
            totalCreditCardDebt: Object.values(cardBalances).reduce((a, b) => a + b, 0),
            netFinancialBalance: currentCash - Object.values(cardBalances).reduce((a, b) => a + b, 0),
          });
        } else if (item.paymentMethodType === 'credit_card' && item.creditCardId) {
          const card = state.creditCards.find((c) => c.id === item.creditCardId);
          const cardName = card ? card.name : 'Credit Card';

          if (item.type === 'expense') {
            cardBalances[item.creditCardId] = (cardBalances[item.creditCardId] || 0) + item.amount;
            pendingStatementPayments[item.creditCardId] = (pendingStatementPayments[item.creditCardId] || 0) + item.amount;
          } else {
            // Refund to credit card
            cardBalances[item.creditCardId] = Math.max(0, (cardBalances[item.creditCardId] || 0) - item.amount);
            pendingStatementPayments[item.creditCardId] = Math.max(0, (pendingStatementPayments[item.creditCardId] || 0) - item.amount);
          }

          rows.push({
            date: dateStr,
            monthLabel,
            concept: item.name,
            type: item.type,
            amount: item.amount,
            paymentMethod: cardName,
            creditCardId: item.creditCardId,
            cashBalance: currentCash,
            creditCardBalances: { ...cardBalances },
            totalCreditCardDebt: Object.values(cardBalances).reduce((a, b) => a + b, 0),
            netFinancialBalance: currentCash - Object.values(cardBalances).reduce((a, b) => a + b, 0),
          });
        }
      }
    }

    // 2. Check Credit Card Payment Due Days
    for (const card of state.creditCards) {
      if (day === card.paymentDueDay) {
        const paymentAmount = pendingStatementPayments[card.id] || 0;
        if (paymentAmount > 0) {
          // Pay card from Cash Account
          currentCash -= paymentAmount;
          cardBalances[card.id] = Math.max(0, (cardBalances[card.id] || 0) - paymentAmount);
          pendingStatementPayments[card.id] = 0;

          rows.push({
            date: dateStr,
            monthLabel,
            concept: `Payment: ${card.name}`,
            type: 'card_payment',
            amount: paymentAmount,
            paymentMethod: 'Cash -> ' + card.name,
            creditCardId: card.id,
            cashBalance: currentCash,
            creditCardBalances: { ...cardBalances },
            totalCreditCardDebt: Object.values(cardBalances).reduce((a, b) => a + b, 0),
            netFinancialBalance: currentCash - Object.values(cardBalances).reduce((a, b) => a + b, 0),
          });
        }
      }
    }

    // Advance 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return rows;
}
