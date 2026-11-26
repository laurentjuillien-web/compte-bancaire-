import React from 'react';
import { Pencil, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatEuro } from '../types/budget';

interface BalanceHeaderProps {
  currentBalance: number;
  initialBalance: number;
  totalCredits: number;
  totalDebits: number;
  onEditInitial: () => void;
}

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  currentBalance,
  initialBalance,
  totalCredits,
  totalDebits,
  onEditInitial,
}) => {
  const isNegative = currentBalance < 0;

  return (
    <section
      aria-label="Solde actuel"
      className="rounded-3xl border border-white/[0.08] bg-[#101014] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-400">
            {isNegative ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                <span className="text-rose-300">Solde à découvert</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Solde disponible</span>
              </>
            )}
          </div>

          <p
            className={`font-num mt-2 text-4xl sm:text-5xl font-bold tracking-tight break-all ${
              isNegative ? 'text-rose-400' : 'text-white'
            }`}
          >
            {formatEuro(currentBalance)}
          </p>
        </div>

        <button
          type="button"
          onClick={onEditInitial}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-zinc-100 transition-colors hover:bg-white/[0.1] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 whitespace-nowrap shrink-0"
        >
          <Pencil className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Définir salaire / solde</span>
          <span className="sm:hidden">Salaire / solde</span>
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/[0.07] pt-4 text-xs sm:text-sm text-zinc-400">
        <span>
          Départ :{' '}
          <strong className="font-num font-semibold text-zinc-200">
            {formatEuro(initialBalance)}
          </strong>
        </span>
        <span aria-hidden="true" className="text-zinc-600">·</span>
        <span>
          Entrées :{' '}
          <strong className="font-num font-semibold text-emerald-400">
            +{formatEuro(totalCredits)}
          </strong>
        </span>
        <span aria-hidden="true" className="text-zinc-600">·</span>
        <span>
          Dépenses :{' '}
          <strong className="font-num font-semibold text-rose-400">
            -{formatEuro(totalDebits)}
          </strong>
        </span>
      </div>
    </section>
  );
};
