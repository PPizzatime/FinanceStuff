import { useState, useEffect } from 'react';
import type { FinancialState, UserAccount, CreditCard, FinancialItem } from './types/finance';
import { loadFinancialState, saveFinancialState, loadUserAccount, saveUserAccount } from './utils/storage';
import { Navbar } from './components/Navbar';
import { ProjectionTable } from './components/ProjectionTable';
import { CreditCardManager } from './components/CreditCardManager';
import { TransactionManager } from './components/TransactionManager';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';
import { AdBanner } from './components/AdBanner';

export function App() {
  const [financialState, setFinancialState] = useState<FinancialState>(loadFinancialState);
  const [userAccount, setUserAccount] = useState<UserAccount>(loadUserAccount);
  const [activeTab, setActiveTab] = useState<'projection' | 'cards' | 'transactions'>('projection');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Auto-save to LocalStorage whenever state changes
  useEffect(() => {
    saveFinancialState(financialState);
  }, [financialState]);

  useEffect(() => {
    saveUserAccount(userAccount);
  }, [userAccount]);

  // Date Override Handler
  const handleUpdateDateOverride = (rowId: string, newDate: string | null) => {
    setFinancialState((prev) => {
      const nextOverrides = { ...(prev.dateOverrides || {}) };
      if (newDate === null) {
        delete nextOverrides[rowId];
      } else {
        nextOverrides[rowId] = newDate;
      }
      return {
        ...prev,
        dateOverrides: nextOverrides,
      };
    });
  };

  // Credit Card handlers
  const handleAddCard = (cardData: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: `card_${Date.now()}`,
    };
    setFinancialState((prev) => ({
      ...prev,
      creditCards: [...prev.creditCards, newCard],
    }));
  };

  const handleUpdateCard = (updatedCard: CreditCard) => {
    setFinancialState((prev) => ({
      ...prev,
      creditCards: prev.creditCards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    setFinancialState((prev) => ({
      ...prev,
      creditCards: prev.creditCards.filter((c) => c.id !== cardId),
      // Clean up transactions assigned to this card
      financialItems: prev.financialItems.filter((i) => i.creditCardId !== cardId),
    }));
  };

  // Financial Items / Transactions Handlers
  const handleAddItem = (itemData: Omit<FinancialItem, 'id'>) => {
    const newItem: FinancialItem = {
      ...itemData,
      id: `item_${Date.now()}`,
    };
    setFinancialState((prev) => ({
      ...prev,
      financialItems: [...prev.financialItems, newItem],
    }));
  };

  const handleUpdateItem = (updatedItem: FinancialItem) => {
    setFinancialState((prev) => ({
      ...prev,
      financialItems: prev.financialItems.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setFinancialState((prev) => ({
      ...prev,
      financialItems: prev.financialItems.filter((i) => i.id !== itemId),
    }));
  };

  const handleUpdateCashBalance = (newCashBalance: number) => {
    setFinancialState((prev) => ({
      ...prev,
      initialCashBalance: newCashBalance,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12 flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={userAccount}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenLegal={() => setIsLegalOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Top Banner Advertisement for Revenue Generation */}
          <AdBanner slotLocation="header" />

          {activeTab === 'projection' && (
            <ProjectionTable state={financialState} onUpdateDateOverride={handleUpdateDateOverride} />
          )}

          {activeTab === 'transactions' && (
            <TransactionManager
              items={financialState.financialItems}
              creditCards={financialState.creditCards}
              initialCashBalance={financialState.initialCashBalance}
              onUpdateCashBalance={handleUpdateCashBalance}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {activeTab === 'cards' && (
            <CreditCardManager
              cards={financialState.creditCards}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
            />
          )}

          {/* Footer Banner Ad */}
          <AdBanner slotLocation="footer" />
        </main>
      </div>

      {/* Footer Legal & Copyright Notice */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 py-6 border-t border-slate-200 mt-12 w-full">
        <p>© {new Date().getFullYear()} CashBalance.Online. Free & accessible financial management.</p>
        <div className="flex justify-center gap-4 mt-2">
          <button onClick={() => setIsLegalOpen(true)} className="hover:underline text-slate-500 font-semibold">
            Legal Disclaimer & Terms
          </button>
          <span>•</span>
          <button onClick={() => setIsAuthOpen(true)} className="hover:underline text-slate-500 font-semibold">
            HTML5 Storage & Account Sync
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        user={userAccount}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUpdateUser={setUserAccount}
      />

      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
}

export default App;
