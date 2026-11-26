import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Receipt, Trash2 } from 'lucide-react';
import {
  Transaction,
  formatEuro,
  formatOperationDate,
} from '../types/budget';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

type FilterMode = 'all' | 'credit' | 'debit';

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  return (
    <section
      aria-label="Historique des opérations"
      className="rounded-3xl border border-white/[0.08] bg-[#101014] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-display text-base font-semibold text-zinc-100">
            Historique
          </h2>
          <span className="font-num text-xs text-zinc-400">
            {filteredTransactions.length}{' '}
            {filteredTransactions.length > 1 ? 'opérations' : 'opération'}
          </span>
        </div>

        {/* Segmented filter tabs */}
        <div
          role="tablist"
          aria-label="Filtrer les opérations"
          className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#070709] p-1"
        >
          {(
            [
              { id: 'all', label: 'Tout' },
              { id: 'credit', label: 'Entrées' },
              { id: 'debit', label: 'Dépenses' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="mt-8 mb-4 flex flex-col items-center justify-center text-center px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400">
            <Receipt className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-200">
            {transactions.length === 0
              ? 'Aucune opération enregistrée'
              : 'Aucune opération dans cette catégorie'}
          </p>
          <p className="mt-1 text-xs text-zinc-400 max-w-xs">
            {transactions.length === 0
              ? 'Saisissez un montant ci-dessus et appuyez sur Entrée ou Dépense pour suivre votre solde.'
              : 'Changez de filtre pour afficher vos autres opérations.'}
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-white/[0.06]">
          {filteredTransactions.map((tx) => {
            const isCredit = tx.type === 'credit';
            return (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-2 last:pb-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isCredit
                        ? 'border-emerald-500/25 bg-emerald-500/12 text-emerald-400'
                        : 'border-rose-500/25 bg-rose-500/12 text-rose-400'
                    }`}
                    aria-hidden="true"
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="h-4.5 w-4.5" />
                    ) : (
                      <ArrowUpRight className="h-4.5 w-4.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {tx.label}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {formatOperationDate(tx.createdAt)}
                      <span aria-hidden="true"> · </span>
                      <span>{isCredit ? 'Crédit' : 'Débit'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`font-num text-sm sm:text-base font-semibold ${
                      isCredit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatEuro(isCredit ? tx.amount : -tx.amount, true)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteTransaction(tx.id)}
                    aria-label={`Supprimer ${tx.label} (${formatEuro(tx.amount)})`}
                    title="Supprimer cette opération"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-rose-500/15 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
