import type { FinancialState, ProjectionRow, FinancialItem, Periodicity } from '../types/finance';

/**
 * Calculates the day interval for 'times_per_period' periodicity based on count, unit, and rounding mode.
 */
export function calculatePeriodIntervalDays(
  count: number,
  unit: 'day' | 'week' | 'month' | 'year',
  roundingMode: 'round' | 'floor' | 'ceil' = 'round'
): number {
  const safeCount = Math.max(1, count || 1);
  let periodDays = 30; // Standard month
  if (unit === 'day') periodDays = 1;
  else if (unit === 'week') periodDays = 7;
  else if (unit === 'month') periodDays = 30;
  else if (unit === 'year') periodDays = 365;

  const rawInterval = periodDays / safeCount;

  let intervalDays: number;
  if (roundingMode === 'floor') {
    intervalDays = Math.floor(rawInterval);
  } else if (roundingMode === 'ceil') {
    intervalDays = Math.ceil(rawInterval);
  } else {
    intervalDays = Math.round(rawInterval);
  }

  return Math.max(1, intervalDays);
}

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

    case 'each_x_days': {
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const interval = Math.max(1, item.intervalDays || 1);
      return diffDays >= 0 && diffDays % interval === 0;
    }

    case 'times_per_period': {
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return false;

      const unit = item.timesPerPeriodUnit || 'month';
      const count = item.timesPerPeriodCount || 1;

      if (unit === 'day' && count > 1) {
        return true;
      }

      const intervalDays = calculatePeriodIntervalDays(count, unit, item.roundingMode || 'round');
      return diffDays % intervalDays === 0;
    }

    default:
      return false;
  }
}

/**
 * Returns how many times an item occurs on targetDate.
 */
export function getItemOccurrencesCountOnDate(item: FinancialItem, targetDate: Date): number {
  if (!isItemActiveOnDate(item, targetDate)) return 0;
  if (item.periodicity === 'times_per_period' && item.timesPerPeriodUnit === 'day' && (item.timesPerPeriodCount || 1) > 1) {
    return Math.max(1, item.timesPerPeriodCount || 1);
  }
  return 1;
}

/**
 * Calculates project financial timeline for N years.
 * Accounts for:
 * 1. Cash inflow/outflow items & credit card transactions.
 * 2. Custom periodicity (each X days, times per week/month/day/year with rounding).
 * 3. User date overrides per occurrence row.
 * 4. Credit Card automated payment on paymentDueDay from cash account.
 */
export function generateProjection(
  state: FinancialState,
  yearsToProject: number = 1,
  startDateInput?: Date
): ProjectionRow[] {
  const startDate = startDateInput ? new Date(startDateInput) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const totalDays = yearsToProject * 365;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalDays);

  const dateOverrides = state.dateOverrides || {};

  interface TimelineEvent {
    rowId: string;
    itemId?: string;
    originalDate: string;
    effectiveDate: string;
    isDateOverridden: boolean;
    eventType: 'item' | 'card_payment';
    item?: FinancialItem;
    cardId?: string;
  }

  const rawEvents: TimelineEvent[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const originalDateStr = currentDate.toISOString().split('T')[0];
    const day = currentDate.getDate();

    // 1. Process recurring and 1-time financial items
    for (const item of state.financialItems) {
      const occurrenceCount = getItemOccurrencesCountOnDate(item, currentDate);
      for (let i = 0; i < occurrenceCount; i++) {
        const rowId = occurrenceCount > 1 ? `${item.id}_${originalDateStr}_${i}` : `${item.id}_${originalDateStr}`;
        const effectiveDate = dateOverrides[rowId] || originalDateStr;
        rawEvents.push({
          rowId,
          itemId: item.id,
          originalDate: originalDateStr,
          effectiveDate,
          isDateOverridden: !!dateOverrides[rowId],
          eventType: 'item',
          item,
        });
      }
    }

    // 2. Check Credit Card Payment Due Days
    for (const card of state.creditCards) {
      if (day === card.paymentDueDay) {
        const rowId = `cc_payment_${card.id}_${originalDateStr}`;
        const effectiveDate = dateOverrides[rowId] || originalDateStr;
        rawEvents.push({
          rowId,
          originalDate: originalDateStr,
          effectiveDate,
          isDateOverridden: !!dateOverrides[rowId],
          eventType: 'card_payment',
          cardId: card.id,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort rawEvents chronologically by effectiveDate
  rawEvents.sort((a, b) => {
    if (a.effectiveDate !== b.effectiveDate) {
      return a.effectiveDate.localeCompare(b.effectiveDate);
    }
    // Secondary sort: income before expense or card_payment
    const typeOrder = (ev: TimelineEvent) => {
      if (ev.eventType === 'item' && ev.item) {
        return ev.item.type === 'income' ? 1 : 2;
      }
      return 3;
    };
    return typeOrder(a) - typeOrder(b);
  });

  // Calculate balances sequentially over sorted events
  let currentCash = state.initialCashBalance;

  const cardBalances: Record<string, number> = {};
  state.creditCards.forEach((card) => {
    cardBalances[card.id] = card.currentBalance || 0;
  });

  const pendingStatementPayments: Record<string, number> = {};
  state.creditCards.forEach((card) => {
    pendingStatementPayments[card.id] = card.currentBalance || 0;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rows: ProjectionRow[] = [];

  for (const event of rawEvents) {
    const [yearStr, monthStr] = event.effectiveDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const monthLabel = `${monthNames[month] || ''} ${year}`;

    if (event.eventType === 'item' && event.item) {
      const item = event.item;
      if (item.paymentMethodType === 'cash_account') {
        if (item.type === 'income') {
          currentCash += item.amount;
        } else {
          currentCash -= item.amount;
        }

        rows.push({
          rowId: event.rowId,
          itemId: item.id,
          date: event.effectiveDate,
          originalDate: event.originalDate,
          isDateOverridden: event.isDateOverridden,
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
          cardBalances[item.creditCardId] = Math.max(0, (cardBalances[item.creditCardId] || 0) - item.amount);
          pendingStatementPayments[item.creditCardId] = Math.max(0, (pendingStatementPayments[item.creditCardId] || 0) - item.amount);
        }

        rows.push({
          rowId: event.rowId,
          itemId: item.id,
          date: event.effectiveDate,
          originalDate: event.originalDate,
          isDateOverridden: event.isDateOverridden,
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
    } else if (event.eventType === 'card_payment' && event.cardId) {
      const card = state.creditCards.find((c) => c.id === event.cardId);
      if (card) {
        const paymentAmount = pendingStatementPayments[card.id] || 0;
        if (paymentAmount > 0) {
          currentCash -= paymentAmount;
          cardBalances[card.id] = Math.max(0, (cardBalances[card.id] || 0) - paymentAmount);
          pendingStatementPayments[card.id] = 0;

          rows.push({
            rowId: event.rowId,
            date: event.effectiveDate,
            originalDate: event.originalDate,
            isDateOverridden: event.isDateOverridden,
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
  }

  return rows;
}
