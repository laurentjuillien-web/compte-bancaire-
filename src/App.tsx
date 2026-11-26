import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { BalanceHeader } from './components/BalanceHeader';
import { InitialBalanceModal, ResetMonthModal } from './components/Modals';
import { OfflineIndicator, PWAInstallButton } from './components/PWAStatus';
import { QuickEntryPanel } from './components/QuickEntryPanel';
import { TransactionList } from './components/TransactionList';
import {
  BudgetState,
  Transaction,
  TransactionType,
  formatEuro,
  loadBudgetState,
  saveBudgetState,
} from './types/budget';

interface DeletedSnapshot {
  transaction: Transaction;
  index: number;
}

export default function App() {
  const [budget, setBudget] = useState<BudgetState>(() => loadBudgetState());
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<DeletedSnapshot | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    saveBudgetState(budget);
  }, [budget]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const { totalCredits, totalDebits, currentBalance } = useMemo(() => {
    let credits = 0;
    let debits = 0;
    for (const tx of budget.transactions) {
      if (tx.type === 'credit') {
        credits += tx.amount;
      } else {
        debits += tx.amount;
      }
    }
    const net =
      Math.round((budget.initialBalance + credits - debits) * 100) / 100;
    return {
      totalCredits: Math.round(credits * 100) / 100,
      totalDebits: Math.round(debits * 100) / 100,
      currentBalance: net,
    };
  }, [budget.initialBalance, budget.transactions]);

  const handleAddTransaction = (
    type: TransactionType,
    amount: number,
    label: string
  ) => {
    const newTx: Transaction = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      amount,
      label,
      createdAt: new Date().toISOString(),
    };

    setBudget((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setBudget((prev) => {
      const idx = prev.transactions.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const removed = prev.transactions[idx];

      setLastDeleted({ transaction: removed, index: idx });
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
      undoTimerRef.current = window.setTimeout(() => {
        setLastDeleted(null);
      }, 5000);

      const nextList = prev.transactions.filter((t) => t.id !== id);
      return {
        ...prev,
        transactions: nextList,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    const { transaction, index } = lastDeleted;
    setBudget((prev) => {
      if (prev.transactions.some((t) => t.id === transaction.id)) {
        return prev;
      }
      const nextList = [...prev.transactions];
      const insertAt = Math.min(index, nextList.length);
      nextList.splice(insertAt, 0, transaction);
      return {
        ...prev,
        transactions: nextList,
        updatedAt: new Date().toISOString(),
      };
    });
    setLastDeleted(null);
  };

  const handleSaveInitialBalance = (newInitial: number) => {
    setBudget((prev) => ({
      ...prev,
      initialBalance: newInitial,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleConfirmResetMonth = (newStartingBalance: number) => {
    setLastDeleted(null);
    setBudget({
      initialBalance: newStartingBalance,
      transactions: [],
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#050507] text-zinc-100">
      {/* Compact sticky top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#050507]/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Mon Solde
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Nouveau mois</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="sr-only">Suivi de compte bancaire</h1>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 sm:space-y-6 lg:col-span-5">
            <BalanceHeader
              currentBalance={currentBalance}
              initialBalance={budget.initialBalance}
              totalCredits={totalCredits}
              totalDebits={totalDebits}
              onEditInitial={() => setIsInitialModalOpen(true)}
            />

            <QuickEntryPanel onAddTransaction={handleAddTransaction} />
          </div>

          <div className="lg:col-span-7">
            <TransactionList
              transactions={budget.transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        </div>
      </main>

      {/* Discreet footer */}
      <footer className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 text-center">
        <p className="text-xs text-zinc-500">Créé par Laurent Juillien</p>
      </footer>

      {/* Undo toast after deletion */}
      {lastDeleted && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-[#16161c] px-4 py-3 text-sm text-zinc-100 shadow-2xl sm:min-w-[320px]"
        >
          <span className="truncate text-xs sm:text-sm">
            Supprimé : <strong className="font-medium">{lastDeleted.transaction.label}</strong> (
            {formatEuro(lastDeleted.transaction.amount)})
          </span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 whitespace-nowrap shrink-0"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Annuler</span>
          </button>
        </div>
      )}

      <OfflineIndicator />

      <InitialBalanceModal
        isOpen={isInitialModalOpen}
        currentInitial={budget.initialBalance}
        onClose={() => setIsInitialModalOpen(false)}
        onSave={handleSaveInitialBalance}
      />

      <ResetMonthModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmResetMonth}
      />
    </div>
  );
}
